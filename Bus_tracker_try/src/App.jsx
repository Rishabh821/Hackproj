import L from "leaflet";
import busIcon from "./assets/images.png";
import { useState, useEffect } from "react";

import LiveCard from "./components/LiveCard";
import Header from "./components/Header";
import MapView from "./components/Mapview.jsx";
import useBusLocation from "./hooks/useBusLocation";
import { Timeline } from "./components/Timeline.jsx";

import { calculateDistance, calculateETA } from "./utils/calculateETA";

function App() {
  const [selectedBus, setSelectedBus] = useState("BUS101");
  const [buses, setBuses] = useState([]);
  const [busStatus, setBusStatus] = useState({});

  const position = useBusLocation(selectedBus);

  const stops = [
    [28.38781797580734, 79.42052491078208],
    [28.369797985579577, 79.4159222405915],
    [28.348441891909577, 79.42009575822425],
    [28.31448233789336, 79.41885121338126],
    [28.299557857248416, 79.40464623437381],
  ];

  // fetch buses
  useEffect(() => {
    fetch("https://unwadeable-isis-unexclaiming.ngrok-free.dev/buses", {
      headers: { "ngrok-skip-browser-warning": "true" },
    })
      .then((res) => res.json())
      .then((data) => setBuses(Object.keys(data)))
      .catch(console.error);
  }, []);

  // fetch status
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://unwadeable-isis-unexclaiming.ngrok-free.dev/bus-status", {
  headers: {
    "ngrok-skip-browser-warning": "true"
  }
})
        .then((res) => res.json())
        .then(setBusStatus)
        .catch(console.error);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const stopsWithETA = position
    ? stops.map((stop) => {
        const distance = calculateDistance(
          position[0],
          position[1],
          stop[0],
          stop[1]
        );
        return {
          coords: stop,
          eta: calculateETA(distance),
        };
      })
    : [];

  const myBus = L.icon({
    iconUrl: busIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const status = busStatus[selectedBus]?.status;

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-white">

      <Header />

      {/* BUS SELECT */}
      <div className="flex gap-2 p-2 overflow-x-auto">
        {buses.map((bus) => (
          <button
            key={bus}
            onClick={() => setSelectedBus(bus)}
            className={`px-3 py-1 rounded-lg text-sm ${
              selectedBus === bus
                ? "bg-blue-500"
                : "bg-gray-800"
            }`}
          >
            {bus}
          </button>
        ))}
      </div>

      {/* ⚠️ STATUS MESSAGE */}
      {status === "warning" && (
        <div className="bg-yellow-500 text-black p-2 text-sm text-center">
          ⚠️ This bus may be experiencing an unexpected delay
        </div>
      )}

      {status === "emergency" && (
        <div className="bg-red-600 p-2 text-sm text-center">
          🚨 This bus is not responding. Admin has been notified.
        </div>
      )}

      <div className="p-3">
        <LiveCard position={position} selectedBus={selectedBus} />
      </div>

      <div className="flex-1">
        {position && position[0] && position[1] && (
          <MapView position={position} stops={stops} icon={myBus} />
        )}
      </div>

      <div className="p-4 max-h-[35%] overflow-y-auto">
        <Timeline stops={stopsWithETA} />
      </div>

    </div>
  );
}

export default App;