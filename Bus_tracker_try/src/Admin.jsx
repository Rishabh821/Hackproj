import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function Admin() {
  const [status, setStatus] = useState({});
  const [buses, setBuses] = useState({});

  const API = "https://unwadeable-isis-unexclaiming.ngrok-free.dev";

  useEffect(() => {
    const fetchData = () => {
      // 🟡 Fetch bus status
      fetch(`${API}/bus-status`, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      })
        .then((res) => res.json())
        .then(setStatus)
        .catch((err) => console.error("Status error:", err));

      // 🟢 Fetch bus locations
      fetch(`${API}/buses`, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      })
        .then((res) => res.json())
        .then(setBuses)
        .catch((err) => console.error("Bus error:", err));
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-white">

      {/* HEADER */}
      <div className="p-4 text-xl font-semibold">
        🧑‍💼 Admin Dashboard
      </div>

      {/* 🗺️ MAP */}
      <div className="flex-1">
        <MapContainer
          center={[28.35, 79.40]}
          zoom={12}
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* 🚌 BUS MARKERS */}
          {Object.entries(buses).map(([busId, data]) => {
            const busStatus = status[busId]?.status || "normal";
            const stopped = status[busId]?.stopped_seconds || 0;

            let emoji = "🟢";
            if (busStatus === "warning") emoji = "🟡";
            if (busStatus === "emergency") emoji = "🔴";

            // prevent crash if lat/lng missing
            if (!data.lat || !data.lng) return null;

            return (
              <Marker
                key={busId}
                position={[data.lat, data.lng]}
              >
                <Popup>
                  <div>
                    <strong>{busId}</strong> <br />
                    Status: {emoji} {busStatus} <br />
                    Stopped: {stopped}s
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* 📋 STATUS CARDS */}
      <div className="p-4 max-h-[30%] overflow-y-auto space-y-2">

        {Object.keys(status).length === 0 && (
          <div className="text-gray-400">No data yet...</div>
        )}

        {Object.entries(status).map(([bus, data]) => {
          let bg = "bg-green-600";
          if (data.status === "warning") bg = "bg-yellow-500 text-black";
          if (data.status === "emergency") bg = "bg-red-600";

          return (
            <div
              key={bus}
              className={`p-3 rounded-lg ${bg}`}
            >
              <div className="font-semibold">{bus}</div>
              <div className="text-sm">
                Status: {data.status}
              </div>
              <div className="text-sm">
                Stopped: {data.stopped_seconds}s
              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
}