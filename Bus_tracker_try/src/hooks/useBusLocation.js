import { useState, useEffect } from "react";

export default function useBusLocation(busId) {
  const [position, setPosition] = useState([28.3399, 79.3895]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`https://unwadeable-isis-unexclaiming.ngrok-free.dev/location?bus_id=${busId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      })
        .then(res => res.json())
        .then(data => {
          setPosition([data.lat, data.lng]);
        })
        .catch(err => console.error(err));
    }, 2000);

    return () => clearInterval(interval);
  }, [busId]);

  return position;
}