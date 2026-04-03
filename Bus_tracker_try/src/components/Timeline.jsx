export function Timeline() {
  const stops = [
    { name: "Gate 1", time: "10:10", status: "done" },
    { name: "Library", time: "10:20", status: "current" },
    { name: "Hostel", time: "10:30", status: "pending" },
  ];

  return (
    <div className="space-y-4">
      {stops.map((stop, i) => (
        <div key={i} className="flex items-center space-x-3">

          <div className="text-xs text-gray-500 w-12">
            {stop.time}
          </div>

          <div className={`w-3 h-3 rounded-full 
            ${stop.status === "done" ? "bg-green-500" : ""}
            ${stop.status === "current" ? "bg-blue-500 animate-pulse" : ""}
            ${stop.status === "pending" ? "bg-gray-500" : ""}
          `}></div>

          <div className="text-sm">{stop.name}</div>

        </div>
      ))}
    </div>
  );
}