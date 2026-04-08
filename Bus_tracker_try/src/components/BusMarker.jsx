import { Marker, Popup } from "react-leaflet";

export default function BusMarker({ position, icon, label, status }) {
  if (!position) {
    return null;
  }

  return (
    <Marker position={[position.lat, position.lng]} icon={icon}>
      <Popup>
        <div className="space-y-1">
          <div className="font-semibold">{label || "Tracked bus"}</div>
          <div>Status: {status || "normal"}</div>
        </div>
      </Popup>
    </Marker>
  );
}
