import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import { acknowledgeAlert, getAdminOverview } from "./api/trackerApi";
import { formatRelativeUpdate } from "./utils/routeUtils";

const defaultCenter = [28.35, 79.4];

function createBusIcon(status) {
  let color = "#22c55e";
  if (status === "warning") color = "#f59e0b";
  if (status === "emergency") color = "#ef4444";
  if (status === "no_data") color = "#94a3b8";

  return L.divIcon({
    html: `
      <div style="
        background:${color};
        width:18px;
        height:18px;
        border-radius:999px;
        border:3px solid white;
        box-shadow:0 0 14px ${color};
      "></div>
    `,
    className: "",
  });
}

export default function Admin() {
  const [adminToken, setAdminToken] = useState("");
  const [draftToken, setDraftToken] = useState("");
  const [overview, setOverview] = useState({ routes: [], buses: [], alerts: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyAlertId, setBusyAlertId] = useState(null);

  useEffect(() => {
    const storedToken = window.sessionStorage.getItem("bus-tracker-admin-token");
    if (storedToken) {
      setAdminToken(storedToken);
      setDraftToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!adminToken) {
      return undefined;
    }

    let cancelled = false;

    const loadOverview = async () => {
      try {
        setLoading(true);
        const data = await getAdminOverview(adminToken);
        if (cancelled) {
          return;
        }

        setOverview(data);
        setError("");
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(requestError.message || "Failed to load admin overview");
        if (requestError.status === 401) {
          window.sessionStorage.removeItem("bus-tracker-admin-token");
          setAdminToken("");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOverview();
    const intervalId = window.setInterval(loadOverview, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [adminToken]);

  const primaryRoute = overview.routes?.[0] || null;
  const routePolyline = primaryRoute?.stops?.map((stop) => [stop.lat, stop.lng]) || [];
  const firstLiveBus = overview.buses.find(
    (bus) => Number.isFinite(bus.lat) && Number.isFinite(bus.lng)
  );
  const mapCenter = firstLiveBus
    ? [firstLiveBus.lat, firstLiveBus.lng]
    : routePolyline[0] || defaultCenter;

  const handleUnlock = (event) => {
    event.preventDefault();
    const token = draftToken.trim();
    if (!token) {
      setError("Enter the admin token to unlock this view.");
      return;
    }

    window.sessionStorage.setItem("bus-tracker-admin-token", token);
    setAdminToken(token);
    setError("");
  };

  const handleAcknowledge = async (alertId) => {
    try {
      setBusyAlertId(alertId);
      const response = await acknowledgeAlert(alertId, adminToken);
      setOverview((currentOverview) => ({
        ...currentOverview,
        alerts: currentOverview.alerts.map((alert) =>
          alert.id === alertId ? response.alert : alert
        ),
      }));
    } catch (requestError) {
      setError(requestError.message || "Failed to acknowledge alert");
    } finally {
      setBusyAlertId(null);
    }
  };

  if (!adminToken) {
    return (
      <div className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/30">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Admin</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-50">Dispatch dashboard</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Enter the admin token to unlock bus status, route health, and SOS alerts.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleUnlock}>
            <label className="block text-sm text-slate-300">
              Admin token
              <input
                type="password"
                value={draftToken}
                onChange={(event) => setDraftToken(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
                placeholder="demo-admin-token"
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-sky-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-sky-400"
            >
              Unlock dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 px-5 py-6 shadow-2xl shadow-slate-950/30">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Admin</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-50">Dispatch dashboard</h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Monitor route health, view SOS alerts, and clear incidents after they are acknowledged.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                window.sessionStorage.removeItem("bus-tracker-admin-token");
                setAdminToken("");
              }}
              className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-500"
            >
              Lock dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_360px]">
          <div className="min-h-[480px] rounded-3xl border border-slate-800/80 bg-slate-950/70 p-3 shadow-2xl shadow-slate-950/30">
            <MapContainer center={mapCenter} zoom={13} className="h-full w-full rounded-3xl">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {routePolyline.length > 1 && (
                <Polyline
                  positions={routePolyline}
                  pathOptions={{ color: "#38bdf8", weight: 4, opacity: 0.85 }}
                />
              )}

              {primaryRoute?.stops?.map((stop) => (
                <CircleMarker
                  key={stop.id}
                  center={[stop.lat, stop.lng]}
                  radius={6}
                  pathOptions={{ color: "#94a3b8", fillColor: "#94a3b8", fillOpacity: 0.9 }}
                >
                  <Popup>{stop.name}</Popup>
                </CircleMarker>
              ))}

              {overview.buses.map((bus) => {
                if (!Number.isFinite(bus.lat) || !Number.isFinite(bus.lng)) {
                  return null;
                }

                return (
                  <Marker
                    key={bus.bus_id}
                    position={[bus.lat, bus.lng]}
                    icon={createBusIcon(bus.status)}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <strong>{bus.label}</strong>
                        <div>Status: {bus.status}</div>
                        <div>Stopped: {bus.stopped_seconds ?? 0}s</div>
                        <div>{formatRelativeUpdate(bus.last_heartbeat_at)}</div>
                      </div>
                    </Popup>
                    <Tooltip permanent direction="top">
                      {bus.bus_id}
                    </Tooltip>
                  </Marker>
                );
              })}

              {overview.alerts.map((alert) => (
                <Marker
                  key={alert.id}
                  position={[alert.lat, alert.lng]}
                  icon={createBusIcon(alert.acknowledged_at ? "warning" : "emergency")}
                >
                  <Popup>
                    <div className="space-y-1">
                      <strong>{alert.bus_id}</strong>
                      <div>{alert.message || "No extra note"}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-2xl shadow-slate-950/30">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-50">Fleet status</h2>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {loading ? "Refreshing" : "Live"}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {overview.buses.map((bus) => (
                  <div
                    key={bus.bus_id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-100">{bus.label}</p>
                        <p className="text-sm text-slate-400">{bus.bus_id}</p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium uppercase text-slate-200">
                        {bus.status}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-1 text-sm text-slate-300">
                      <div>{formatRelativeUpdate(bus.last_heartbeat_at)}</div>
                      <div>
                        {bus.stopped_seconds == null
                          ? "No movement data yet"
                          : `Stopped for ${bus.stopped_seconds}s`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-2xl shadow-slate-950/30">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-50">SOS alerts</h2>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {overview.alerts.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {overview.alerts.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-4 py-5 text-sm text-slate-400">
                    No SOS alerts yet.
                  </div>
                )}

                {overview.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-100">{alert.bus_id}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {alert.message || "No extra note from the driver."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAcknowledge(alert.id)}
                        disabled={Boolean(alert.acknowledged_at) || busyAlertId === alert.id}
                        className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {alert.acknowledged_at ? "Acknowledged" : busyAlertId === alert.id ? "Saving..." : "Acknowledge"}
                      </button>
                    </div>

                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                      {formatRelativeUpdate(alert.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
