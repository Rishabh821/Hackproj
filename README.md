📌 Overview

  This app works in two parts:
  
  Driver Side (driver.html)
  Collects live GPS location
  Sends location data to backend
  Frontend (Map UI)
  Fetches location from backend
  Displays bus position on map in real-time
🧠 How It Works
  Driver opens a special link (driver.html)
  Browser asks for location permission
  Location is continuously sent to backend
  Frontend fetches updated coordinates
  Bus location is shown on map using Leaflet + OpenStreetMap
🏗️ Tech Stack
  Frontend
    React (Vite)
    Leaflet (OpenStreetMap)
  Backend
    Python (FastAPI / Flask — depending on your setup)
    Ngrok (for HTTPS & external access)
    
⚙️ Setup Instructions
  1️⃣ Clone the repository
  git clone <your-repo-link>
  cd <project-folder>
2️⃣ Backend Setup
  cd backend
  pip install -r requirements.txt
  python main.py

Backend will run on:

    http://localhost:8000
3️⃣ Start Ngrok (IMPORTANT ⚠️)

  Mobile devices require HTTPS for location access.
  
    ngrok http 8000
  
  You’ll get a URL like:
  
    https://abcd1234.ngrok-free.app
  
  👉 Use this URL everywhere instead of localhost.

4️⃣ Frontend Setup
  cd frontend
  npm install
  npm run dev

Frontend runs on:

  http://localhost:5173
  
🚗 Driver Mode (Location Sender)

  Open in mobile browser:
  
    https://<your-ngrok-url>/driver.html
  Allow location permission
  Keep page open
  Location will be sent automatically
  
🗺️ User Mode (Tracker)

  Open frontend:
  
    http://localhost:5173
  Map loads using OpenStreetMap
  Bus marker updates based on backend data
