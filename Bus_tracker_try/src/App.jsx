import L from "leaflet";
import busIcon from "./assets/images.png";

import Header from "./components/Header";
import MapView from "./components/Mapview.jsx";
import useBusLocation from "./hooks/useBusLocation";

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
    iconSize: [45, 50],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76]
  });

  return (
   <div className="h-screen flex flex-col">
  <Header />
  
  <div className="flex-1">
    <MapView position={position} stops={stops} icon={myBus} />
  </div>
</div>
  );
}

export default App;