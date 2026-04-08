from __future__ import annotations

import json
import math
import os
import sqlite3
import time
from contextlib import closing
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, ConfigDict, Field

APP_DIR = Path(__file__).resolve().parent
CATALOG_PATH = APP_DIR / "shared" / "routes.json"
DRIVER_PAGE_PATH = APP_DIR / "driver.html"
DEFAULT_DB_PATH = APP_DIR / "bus_tracker.db"
DEFAULT_DRIVER_TOKEN = "demo-driver-token"
DEFAULT_ADMIN_TOKEN = "demo-admin-token"


class LocationUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    bus_id: str = Field(min_length=3, max_length=32)
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)


class SosReport(LocationUpdate):
    message: str | None = Field(default=None, max_length=200)


def load_catalog(catalog_path: Path = CATALOG_PATH) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    with catalog_path.open("r", encoding="utf-8") as handle:
        catalog = json.load(handle)

    return catalog["routes"], catalog["buses"]


def get_connection(db_path: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database(db_path: Path, buses: list[dict[str, Any]]) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)

    with closing(get_connection(db_path)) as connection, connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS buses (
                bus_id TEXT PRIMARY KEY,
                label TEXT NOT NULL,
                route_id TEXT NOT NULL,
                lat REAL,
                lng REAL,
                last_heartbeat_at REAL,
                last_moved_at REAL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS sos_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bus_id TEXT NOT NULL,
                lat REAL NOT NULL,
                lng REAL NOT NULL,
                message TEXT,
                created_at REAL NOT NULL,
                acknowledged_at REAL
            )
            """
        )

        for bus in buses:
            connection.execute(
                """
                INSERT INTO buses (bus_id, label, route_id, lat, lng, last_heartbeat_at, last_moved_at)
                VALUES (?, ?, ?, NULL, NULL, NULL, NULL)
                ON CONFLICT(bus_id) DO UPDATE SET
                    label = excluded.label,
                    route_id = excluded.route_id
                """,
                (bus["id"], bus["label"], bus["routeId"]),
            )


def calculate_distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    radius_km = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)

    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius_km * c


def fetch_buses(db_path: Path) -> list[dict[str, Any]]:
    with closing(get_connection(db_path)) as connection:
        rows = connection.execute(
            """
            SELECT bus_id, label, route_id, lat, lng, last_heartbeat_at, last_moved_at
            FROM buses
            ORDER BY bus_id
            """
        ).fetchall()

    return [dict(row) for row in rows]


def fetch_bus(db_path: Path, bus_id: str) -> dict[str, Any] | None:
    with closing(get_connection(db_path)) as connection:
        row = connection.execute(
            """
            SELECT bus_id, label, route_id, lat, lng, last_heartbeat_at, last_moved_at
            FROM buses
            WHERE bus_id = ?
            """,
            (bus_id,),
        ).fetchone()

    return dict(row) if row else None


def update_bus_record(
    db_path: Path,
    payload: LocationUpdate,
    movement_threshold_km: float,
) -> dict[str, Any]:
    current_time = time.time()

    with closing(get_connection(db_path)) as connection, connection:
        existing = connection.execute(
            """
            SELECT bus_id, label, route_id, lat, lng, last_heartbeat_at, last_moved_at
            FROM buses
            WHERE bus_id = ?
            """,
            (payload.bus_id,),
        ).fetchone()

        if existing is None:
            raise HTTPException(status_code=404, detail="Unknown bus_id")

        last_moved_at = existing["last_moved_at"]
        if existing["lat"] is None or existing["lng"] is None:
            last_moved_at = current_time
        else:
            moved_distance = calculate_distance_km(
                existing["lat"],
                existing["lng"],
                payload.lat,
                payload.lng,
            )
            if moved_distance >= movement_threshold_km:
                last_moved_at = current_time

        connection.execute(
            """
            UPDATE buses
            SET lat = ?, lng = ?, last_heartbeat_at = ?, last_moved_at = ?
            WHERE bus_id = ?
            """,
            (
                payload.lat,
                payload.lng,
                current_time,
                last_moved_at,
                payload.bus_id,
            ),
        )

    updated_bus = fetch_bus(db_path, payload.bus_id)
    if updated_bus is None:
        raise HTTPException(status_code=500, detail="Failed to persist bus update")
    return updated_bus


def create_sos_alert(db_path: Path, payload: SosReport) -> dict[str, Any]:
    current_time = time.time()

    if fetch_bus(db_path, payload.bus_id) is None:
        raise HTTPException(status_code=404, detail="Unknown bus_id")

    with closing(get_connection(db_path)) as connection, connection:
        cursor = connection.execute(
            """
            INSERT INTO sos_alerts (bus_id, lat, lng, message, created_at, acknowledged_at)
            VALUES (?, ?, ?, ?, ?, NULL)
            """,
            (payload.bus_id, payload.lat, payload.lng, payload.message, current_time),
        )
        alert_id = cursor.lastrowid

    return fetch_alert(db_path, alert_id)


def fetch_alerts(db_path: Path) -> list[dict[str, Any]]:
    with closing(get_connection(db_path)) as connection:
        rows = connection.execute(
            """
            SELECT id, bus_id, lat, lng, message, created_at, acknowledged_at
            FROM sos_alerts
            ORDER BY created_at DESC
            """
        ).fetchall()

    return [dict(row) for row in rows]


def fetch_alert(db_path: Path, alert_id: int) -> dict[str, Any]:
    with closing(get_connection(db_path)) as connection:
        row = connection.execute(
            """
            SELECT id, bus_id, lat, lng, message, created_at, acknowledged_at
            FROM sos_alerts
            WHERE id = ?
            """,
            (alert_id,),
        ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return dict(row)


def acknowledge_alert(db_path: Path, alert_id: int) -> dict[str, Any]:
    current_time = time.time()

    with closing(get_connection(db_path)) as connection, connection:
        cursor = connection.execute(
            """
            UPDATE sos_alerts
            SET acknowledged_at = ?
            WHERE id = ? AND acknowledged_at IS NULL
            """,
            (current_time, alert_id),
        )

    if cursor.rowcount == 0:
        return fetch_alert(db_path, alert_id)
    return fetch_alert(db_path, alert_id)


def build_status(bus: dict[str, Any], warning_after_seconds: float, emergency_after_seconds: float) -> dict[str, Any]:
    heartbeat = bus["last_heartbeat_at"]
    moved = bus["last_moved_at"]

    if heartbeat is None:
        return {
            "status": "no_data",
            "last_seen_seconds": None,
            "stopped_seconds": None,
        }

    now = time.time()
    last_seen_seconds_raw = max(now - heartbeat, 0)
    stopped_seconds_raw = max(now - moved, 0) if moved is not None else 0

    if stopped_seconds_raw >= emergency_after_seconds:
        status = "emergency"
    elif stopped_seconds_raw >= warning_after_seconds:
        status = "warning"
    else:
        status = "normal"

    return {
        "status": status,
        "last_seen_seconds": int(last_seen_seconds_raw),
        "stopped_seconds": int(stopped_seconds_raw),
    }


def serialize_bus(bus: dict[str, Any], warning_after_seconds: float, emergency_after_seconds: float) -> dict[str, Any]:
    return {
        **bus,
        **build_status(bus, warning_after_seconds, emergency_after_seconds),
    }


def build_overview_payload(
    db_path: Path,
    routes: list[dict[str, Any]],
    warning_after_seconds: float,
    emergency_after_seconds: float,
) -> dict[str, Any]:
    buses = [
        serialize_bus(bus, warning_after_seconds, emergency_after_seconds)
        for bus in fetch_buses(db_path)
    ]
    return {
        "generated_at": time.time(),
        "routes": routes,
        "buses": buses,
    }


def validate_driver_token(driver_token: str | None, expected_token: str) -> None:
    if driver_token != expected_token:
        raise HTTPException(status_code=401, detail="Invalid driver token")


def validate_admin_token(admin_token: str | None, expected_token: str) -> None:
    if admin_token != expected_token:
        raise HTTPException(status_code=401, detail="Invalid admin token")


def create_app(
    *,
    db_path: Path | None = None,
    driver_token: str | None = None,
    admin_token: str | None = None,
    warning_after_seconds: float | None = None,
    emergency_after_seconds: float | None = None,
    movement_threshold_km: float | None = None,
    catalog_path: Path = CATALOG_PATH,
) -> FastAPI:
    routes, buses = load_catalog(catalog_path)
    resolved_db_path = db_path or Path(os.getenv("BUS_TRACKER_DB_PATH", DEFAULT_DB_PATH))
    resolved_driver_token = driver_token or os.getenv("BUS_TRACKER_DRIVER_TOKEN", DEFAULT_DRIVER_TOKEN)
    resolved_admin_token = admin_token or os.getenv("BUS_TRACKER_ADMIN_TOKEN", DEFAULT_ADMIN_TOKEN)
    resolved_warning_after_seconds = (
        warning_after_seconds
        if warning_after_seconds is not None
        else float(os.getenv("BUS_TRACKER_WARNING_AFTER_SECONDS", "30"))
    )
    resolved_emergency_after_seconds = (
        emergency_after_seconds
        if emergency_after_seconds is not None
        else float(os.getenv("BUS_TRACKER_EMERGENCY_AFTER_SECONDS", "60"))
    )
    resolved_movement_threshold_km = (
        movement_threshold_km
        if movement_threshold_km is not None
        else float(os.getenv("BUS_TRACKER_MOVEMENT_THRESHOLD_KM", "0.025"))
    )

    initialize_database(resolved_db_path, buses)

    app = FastAPI(title="Bus Tracker API", version="1.0.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=False,
    )

    @app.get("/")
    def home() -> dict[str, Any]:
        return {
            "message": "Bus Tracker API is running",
            "driver_page": "/driver",
            "public_overview": "/api/public/overview",
            "admin_overview": "/api/admin/overview",
        }

    @app.get("/api/public/overview")
    def public_overview() -> dict[str, Any]:
        return build_overview_payload(
            resolved_db_path,
            routes,
            resolved_warning_after_seconds,
            resolved_emergency_after_seconds,
        )

    @app.get("/api/public/routes")
    def public_routes() -> dict[str, Any]:
        return {"routes": routes}

    @app.get("/api/public/location")
    def public_location(bus_id: str) -> dict[str, Any]:
        bus = fetch_bus(resolved_db_path, bus_id)
        if bus is None:
            raise HTTPException(status_code=404, detail="Bus not found")
        return serialize_bus(
            bus,
            resolved_warning_after_seconds,
            resolved_emergency_after_seconds,
        )

    @app.get("/api/driver/health")
    def driver_health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/api/driver/update")
    def driver_update(
        payload: LocationUpdate,
        x_driver_token: str | None = Header(default=None),
    ) -> dict[str, Any]:
        validate_driver_token(x_driver_token, resolved_driver_token)
        bus = update_bus_record(
            resolved_db_path,
            payload,
            resolved_movement_threshold_km,
        )
        return {
            "message": "Location updated",
            "bus": serialize_bus(
                bus,
                resolved_warning_after_seconds,
                resolved_emergency_after_seconds,
            ),
        }

    @app.post("/api/driver/sos")
    def driver_sos(
        payload: SosReport,
        x_driver_token: str | None = Header(default=None),
    ) -> dict[str, Any]:
        validate_driver_token(x_driver_token, resolved_driver_token)
        alert = create_sos_alert(resolved_db_path, payload)
        return {"message": "SOS received", "alert": alert}

    @app.get("/api/admin/overview")
    def admin_overview(
        x_admin_token: str | None = Header(default=None),
    ) -> dict[str, Any]:
        validate_admin_token(x_admin_token, resolved_admin_token)
        return {
            **build_overview_payload(
                resolved_db_path,
                routes,
                resolved_warning_after_seconds,
                resolved_emergency_after_seconds,
            ),
            "alerts": fetch_alerts(resolved_db_path),
        }

    @app.post("/api/admin/alerts/{alert_id}/acknowledge")
    def admin_acknowledge_alert(
        alert_id: int,
        x_admin_token: str | None = Header(default=None),
    ) -> dict[str, Any]:
        validate_admin_token(x_admin_token, resolved_admin_token)
        return {
            "message": "Alert acknowledged",
            "alert": acknowledge_alert(resolved_db_path, alert_id),
        }

    @app.get("/driver")
    def driver() -> FileResponse:
        return FileResponse(DRIVER_PAGE_PATH)

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("BUS_TRACKER_PORT", os.getenv("PORT", "8000"))),
    )
