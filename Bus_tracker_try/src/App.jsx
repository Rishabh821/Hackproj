import L from "leaflet";
import busIcon from "./assets/images.png";

import LiveCard from "./components/LiveCard";
import Header from "./components/Header";
import MapView from "./components/Mapview.jsx";
import useBusLocation from "./hooks/useBusLocation";
import { Timeline } from "./components/Timeline.jsx";

function App() {
  const position = useBusLocation();

  const stops = [
    [28.38781797580734, 79.42052491078208],
    [28.369797985579577, 79.4159222405915],
    [28.348441891909577, 79.42009575822425],
    [28.31448233789336, 79.41885121338126],
    [28.299557857248416, 79.40464623437381]
  ];

  const myBus = L.icon({
    iconUrl: busIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-white">

      {/* HEADER */}
      <Header />

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

      {/* BOTTOM SECTION */}
      <div className="bg-[#020617] border-t border-gray-800 p-4 max-h-[35%] overflow-y-auto">
        <Timeline />
      </div>

    </div>
  );
}

export default App;