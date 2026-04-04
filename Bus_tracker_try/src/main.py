from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

buses = {
    "BUS101": {
        "lat": 28.3399,
        "lng": 79.3895
    }
}

@app.get("/")
def home():
    return {"message": "NEW VERSION OF BUS TRACKER IS LIVE! CHECK OUT THE NEW FEATURES!"}

@app.get("/location")
def get_location(bus_id: str = "BUS101"):
    return buses.get(bus_id, {"error": "Bus not found"})

@app.post("/update")
def update_location(bus_id: str, lat: float, lng: float):
    if bus_id not in buses:
        buses[bus_id] = {}

    buses[bus_id]["lat"] = lat
    buses[bus_id]["lng"] = lng

    return {"status": "updated", "bus_id": bus_id}

@app.get("/buses")
def get_all_buses():
    return buses

@app.get("/driver")
def driver():
    return FileResponse("driver.html")