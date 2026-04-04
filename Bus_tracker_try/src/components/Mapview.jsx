import { MapContainer, TileLayer, useMap } from "react-leaflet";
import BusMarker from "./BusMarker";
import Stops from "./Stops";
import { useEffect } from "react";

// 🔥 This component moves the map when position changes
function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), {
        animate: true,
        duration: 1.5,
      });
    }
  }, [position, map]);

  return null;
}

export default function MapView({ position, stops, icon }) {
  return (
    <MapContainer
      center={position}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 🔥 Auto-follow bus */}
      <RecenterMap position={position} />

      <BusMarker position={position} icon={icon} />
      <Stops stops={stops} />
    </MapContainer>
  );
}