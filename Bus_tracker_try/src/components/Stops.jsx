import { Marker, Popup } from "react-leaflet";

export default function Stops({ stops }) {
  return (
    <>
      {stops.map((stop, index) => (
        <Marker key={index} position={stop}>
          <Popup>Stop {index + 1}</Popup>
        </Marker>
      ))}
    </>
  );
}