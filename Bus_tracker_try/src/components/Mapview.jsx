import { MapContainer, TileLayer } from "react-leaflet";
import BusMarker from "./BusMarker";
import Stops from "./Stops";

export default function MapView({ position, stops, icon }) {
  return (
    <MapContainer center={position} zoom={12} style={{ height: "100%" }}>
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <BusMarker position={position} icon={icon} />
      <Stops stops={stops} />
    </MapContainer>
  );
}