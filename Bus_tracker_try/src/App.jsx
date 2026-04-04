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

  const position = useBusLocation(selectedBus);

  // ✅ DEFINE STOPS FIRST
  const stops = [
    [28.38781797580734, 79.42052491078208],
    [28.369797985579577, 79.4159222405915],
    [28.348441891909577, 79.42009575822425],
    [28.31448233789336, 79.41885121338126],
    [28.299557857248416, 79.40464623437381],
  ];

  // ✅ FETCH BUSES
  useEffect(() => {
    fetch("https://unwadeable-isis-unexclaiming.ngrok-free.dev/buses", {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setBuses(Object.keys(data));
      })
      .catch((err) => console.error(err));
  }, []);

  // ✅ CALCULATE ETA SAFELY
  const stopsWithETA = position
    ? stops.map((stop) => {
        const distance = calculateDistance(
          position[0],
          position[1],
          stop[0],
          stop[1]
        );

        const eta = calculateETA(distance);

        return {
          coords: stop,
          eta,
        };
      })
    : [];

  const myBus = L.icon({
    iconUrl: busIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-white">

      {/* HEADER */}
      <Header />

      {/* 🟢 BUS SELECTOR */}
      <div className="flex gap-2 p-2 overflow-x-auto">
        {buses.map((bus) => (
          <button
            key={bus}
            onClick={() => setSelectedBus(bus)}
            className={`px-3 py-1 rounded-lg text-sm ${
              selectedBus === bus
                ? "bg-blue-500 text-white"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            {bus}
          </button>
        ))}
      </div>

      {/* LIVE CARD */}
      <div className="p-3">
        <LiveCard />
      </div>

      {/* MAP */}
      <div className="flex-1">
        {position && (
          <MapView position={position} stops={stops} icon={myBus} />
        )}
      </div>

      {/* 🟢 TIMELINE WITH ETA */}
      <div className="bg-[#020617] border-t border-gray-800 p-4 max-h-[35%] overflow-y-auto">
        <Timeline stops={stopsWithETA} />
      </div>

    </div>
  );
}

export default App;