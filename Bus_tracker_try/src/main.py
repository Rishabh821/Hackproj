from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bus = {
    "lat": 28.3399,
    "lng": 79.3895
}

@app.get("/")
def home():
    return {"message": "NEW VERSION OF BUS TRACKER IS LIVE! CHECK OUT THE NEW FEATURES!"}

@app.get("/location")
def get_location():
    return bus

@app.post("/update")
def update_location(lat: float, lng: float):
    global bus
    bus = {"lat": lat, "lng": lng}
    return {"status": "updated"}

@app.get("/driver")
def driver():
    return FileResponse("driver.html")