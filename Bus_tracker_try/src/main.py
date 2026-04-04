from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🚌 Bus storage
buses = {
    "BUS101": {
        "lat": 28.3399,
        "lng": 79.3895,
        "last_updated": time.time()
    }
}

# 🚨 SOS storage
sos_alerts = []


@app.get("/")
def home():
    return {"message": "Bus Tracker Running"}


# 📍 Get location
@app.get("/location")
def get_location(bus_id: str = "BUS101"):
    return buses.get(bus_id, {"error": "Bus not found"})


# 📡 Update location (driver)
@app.post("/update")
def update_location(bus_id: str, lat: float, lng: float):
    if bus_id not in buses:
        buses[bus_id] = {}

    bus = buses[bus_id]

    prev_lat = bus.get("lat")
    prev_lng = bus.get("lng")

    bus["lat"] = lat
    bus["lng"] = lng
    bus["last_updated"] = time.time()

    # 🧠 movement detection
    if prev_lat != lat or prev_lng != lng:
        bus["last_moved"] = time.time()

    # initialize if not present
    if "last_moved" not in bus:
        bus["last_moved"] = time.time()

    return {"status": "updated"}


# 📋 Get all buses
@app.get("/buses")
def get_all_buses():
    return buses


# 🚨 SOS trigger (manual)
@app.post("/sos")
def sos(bus_id: str, lat: float, lng: float):
    alert = {
        "bus_id": bus_id,
        "lat": lat,
        "lng": lng,
        "time": time.time()
    }

    sos_alerts.append(alert)

    return {"status": "SOS received"}


# 🚨 Get SOS alerts
@app.get("/sos")
def get_sos():
    return sos_alerts


# ⚠️ Auto delay detection
@app.get("/bus-status")
def bus_status():
    result = {}

    for bus_id, data in buses.items():
        last_moved = data.get("last_moved", time.time())
        diff = time.time() - last_moved

        if diff > 60:
            status = "emergency"
        elif diff > 30:
            status = "warning"
        else:
            status = "normal"

        result[bus_id] = {
            "status": status,
            "stopped_seconds": int(diff)
        }

    return result


# 🧑‍✈️ Driver UI
@app.get("/driver")
def driver():
    return FileResponse("driver.html")