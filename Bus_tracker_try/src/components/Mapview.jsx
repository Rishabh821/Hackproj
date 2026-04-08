import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import BusMarker from "./BusMarker";
import Stops from "./Stops";
import { useEffect } from "react";

function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom(), {
        animate: true,
        duration: 1.5,
      });
    }
  }, [position, map]);

  return null;
}

function getInitialCenter(position, stops) {
  if (position) {
    return [position.lat, position.lng];
  }

  if (stops.length) {
    return [stops[0].lat, stops[0].lng];
  }

  return [28.35, 79.4];
}

export default function MapView({ position, stops, icon, busLabel, status }) {
  const polyline = stops.map((stop) => [stop.lat, stop.lng]);

  return (
    <MapContainer
      center={getInitialCenter(position, stops)}
      zoom={14}
      className="h-full w-full rounded-3xl"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap position={position} />
      {polyline.length > 1 && (
        <Polyline
          positions={polyline}
          pathOptions={{ color: "#38bdf8", weight: 4, opacity: 0.9 }}
        />
      )}

      <BusMarker position={position} icon={icon} label={busLabel} status={status} />
      <Stops stops={stops} />
    </MapContainer>
  );
}
