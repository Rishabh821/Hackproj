import { useState, useEffect } from "react";

export default function useBusLocation() {
  const [position, setPosition] = useState([28.3399, 79.3895]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://unwadeable-isis-unexclaiming.ngrok-free.dev/location", {
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
  }, []);

  return position;
}