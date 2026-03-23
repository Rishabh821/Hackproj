import { useState,useEffect } from 'react';
import L from 'leaflet';
import {MapContainer, Popup, TileLayer, Marker } from 'react-leaflet';
import busIcon from './assets/images.png';
function App() {
  let myBus=L.icon({
    iconUrl: busIcon,
    iconSize: [45,50],
    iconAnchor:[22,94],
    popupAnchor:[-3,-76],
    shadowSize:[68,95],
    shadowAnchor:[22,94]
  });
  const [position, setPosition] = useState([28.3399,79.3895]);
  useEffect(() => {
  const interval = setInterval(() => {
    fetch("https://unwadeable-isis-unexclaiming.ngrok-free.dev/location", {
  headers: {
    "ngrok-skip-browser-warning": "true"
  }
})
  .then(res => res.json())
  .then(data => {
    console.log("DATA:", data);
    setPosition([data.lat, data.lng]);
  })
  .catch(err => console.error(err));
  }, 2000);

  return () => clearInterval(interval);
}, []);

  const stops =[
  [28.38781797580734, 79.42052491078208],
  [28.369797985579577, 79.4159222405915],
  [28.348441891909577, 79.42009575822425],
  [28.31448233789336, 79.41885121338126],
  [28.299557857248416, 79.40464623437381]
];
  return (
    <div style={{height:"100vh"}}>
      <h2 style={{ textAlign: "center" }}>College Bus Tracker</h2>
      <MapContainer center={position} zoom={12} style={{height:"100%"}}>
      <TileLayer
        attribution='&copy;OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
<Marker position={position} icon={myBus}>
  <Popup>Bus Moving</Popup>
</Marker>
{stops.map((stop, index) => (
  <Marker key={index} position={stop}>
    <Popup>Stop {index + 1}</Popup>
  </Marker>
))}
      </MapContainer>
      </div>


);
}

export default App