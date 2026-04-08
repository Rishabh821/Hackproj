import { CircleMarker, Popup } from "react-leaflet";

const stopColors = {
  done: "#22c55e",
  current: "#38bdf8",
  next: "#f59e0b",
  pending: "#94a3b8",
};

export default function Stops({ stops }) {
  return (
    <>
      {stops.map((stop) => (
        <CircleMarker
          key={stop.id}
          center={[stop.lat, stop.lng]}
          radius={7}
          pathOptions={{
            color: stopColors[stop.status] || stopColors.pending,
            fillColor: stopColors[stop.status] || stopColors.pending,
            fillOpacity: 0.9,
          }}
        >
          <Popup>
            <div className="space-y-1">
              <div className="font-semibold">{stop.name}</div>
              <div>Status: {stop.status}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
