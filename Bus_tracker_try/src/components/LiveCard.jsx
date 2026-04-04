import { useState } from "react";

export default function LiveCard({ position, selectedBus }) {
  const [loading, setLoading] = useState(false);

  const sendSOS = () => {
    if (!position) return;

    setLoading(true);

    fetch(
      `https://unwadeable-isis-unexclaiming.ngrok-free.dev/sos?bus_id=${selectedBus}&lat=${position[0]}&lng=${position[1]}`,
      {
        method: "POST",
      }
    )
      .then(() => {
        alert("🚨 SOS sent!");
      })
      .catch(() => {
        alert("❌ Failed to send SOS");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="bg-[#020617] border border-gray-800 p-4 rounded-2xl shadow-xl space-y-3">

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">Next Stop</div>

        <div className="flex items-center text-xs bg-red-500 px-2 py-1 rounded-full">
          <div className="w-2 h-2 bg-red-700 rounded-full mr-2 animate-pulse"></div>
          Live
        </div>
      </div>

      <div className="text-lg font-semibold">Engineering Block</div>

      <div className="text-sm text-gray-400">
        Arriving in <span className="text-white font-medium">5 mins</span>
      </div>

      {/* 🚨 SOS BUTTON */}
      <button
        onClick={sendSOS}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 transition p-3 rounded-xl font-semibold"
      >
        {loading ? "Sending..." : "🚨 SOS"}
      </button>

    </div>
  );
}