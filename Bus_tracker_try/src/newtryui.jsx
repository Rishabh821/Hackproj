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

        if (
          !data ||
          data.lat === undefined ||
          data.lng === undefined
        ) {
          return; // 🚫 skip bad data
        }

        setPosition([data.lat, data.lng]);
      });
  }, 3000);

  return () => clearInterval(interval);
}, []);

const stops =[
  { coords: [28.38781797580734, 79.42052491078208], name: "Stop 1" },
  { coords: [28.369797985579577, 79.4159222405915], name: "Stop 2" },
  { coords: [28.348441891909577, 79.42009575822425], name: "Stop 3" },
  { coords: [28.31448233789336, 79.41885121338126], name: "Stop 4" },
  { coords: [28.299557857248416, 79.40464623437381], name: "Stop 5" }
];
function getClosestStop(position, stops) {
  if (!position || position.length < 2) return 0;

  let minDist = Infinity;
  let index = 0;

  stops.forEach((stop, i) => {
    if (!stop.coords) return;

    const dist = Math.sqrt(
      (position[0] - stop.coords[0]) ** 2 +
      (position[1] - stop.coords[1]) ** 2
    );

    if (dist < minDist) {
      minDist = dist;
      index = i;
    }
  });

  console.log("POSITION:", position);
  return index;
}

const currentStopIndex = getClosestStop(position, stops);
const [prevPos, setPrevPos] = useState(position);
const [isMoving, setIsMoving] = useState(false);

useEffect(() => {
  const dist = Math.sqrt(
    (position[0] - prevPos[0]) ** 2 +
    (position[1] - prevPos[1]) ** 2
  );

  setIsMoving(dist > 0.00005);
  setPrevPos(position);
}, [position]);

  return (
  <div className="app">
    <h2>🚌 College Bus Tracker</h2>
     <div className="header">
  <h2>🚌 College Bus</h2>
  <p>Hostel → Engineering Block</p>
</div> 
    <div className="next-card">
  <h3>Next Stop</h3>
  <p>
    {stops[currentStopIndex + 1]
      ? stops[currentStopIndex + 1].name
      : "Last Stop"}
  </p>
  <p>~1 km away</p>
  <p className="delay">Delayed by 2 mins</p>
</div>

    <div className="card">
      <h3>Next Stop</h3>
      <p>
        {stops[currentStopIndex + 1]
          ? stops[currentStopIndex + 1].name
          : "Last Stop"}
      </p>
      <p>ETA: ~5 min</p>
    </div>

    <div className="timeline">
  {stops.map((stop, i) => (
    <div key={i} className="timeline-row">
      
      {/* LEFT SIDE (time placeholder) */}
      <div className="time">
        {i === currentStopIndex ? "Now" : "--:--"}
      </div>

      {/* MIDDLE LINE */}
      <div className="line-container">
        <div className={`line ${i < currentStopIndex ? "done-line" : ""}`} />
        <div
          className={`circle ${
            i < currentStopIndex
              ? "done"
              : i === currentStopIndex
              ? "current"
              : "pending"
          }`}
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="stop-info">
        <p className="stop-name">{stop.name}</p>
        {i === currentStopIndex && (
          <span className="live-badge">LIVE</span>
        )}
      </div>
    </div>
  ))}
</div>
  </div>
);
}

export default App