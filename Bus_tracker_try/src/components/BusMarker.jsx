import { Marker, Popup } from "react-leaflet";

export default function BusMarker({ position, icon }) {
  return (
    <Marker position={position} icon={icon}>
      <Popup>Bus Moving</Popup>
    </Marker>
  );
}