export function Timeline() {
  const hardstops = [
    { name: "Stop 1", time: "10:10", status: "done" },
    { name: "Stop 2", time: "10:20", status: "current" },
    { name: "Stop 3", time: "10:30", status: "pending" },
  ];

  return (
    <div className="space-y-4">
      {hardstops.map((stop, index) => {
        const isLast = index === hardstops.length - 1;

        return (
          <div
            key={index}
            className="flex items-center gap-4 p-3 rounded-2xl bg-gray-900/60 hover:bg-gray-800 transition"
          >
            {/* Time */}
            <div className="w-14 text-sm text-gray-400 font-mono">
              {stop.time}
            </div>

            {/* Line + Circle */}
            <div className="top-6 relative flex flex-col items-center h-16 w-8">
              
              {/* Line */}
              {!isLast && (
                <div
                  className={`absolute top-3 left-1/2 -translate-x-1/2 w-0.5 h-24
                  ${
                    stop.status === "done"
                      ? "bg-green-500"
                      : stop.status === "current"
                      ? "bg-blue-500"
                      : "bg-gray-700"
                  }`}
                />
              )}

              {/* Circle */}
              <div
                className={`z-10 flex items-center justify-center rounded-full
                ${
                  stop.status === "current"
                    ? "w-5 h-5 bg-blue-500 shadow-lg shadow-blue-500/50"
                    : stop.status === "done"
                    ? "w-4 h-4 bg-green-500"
                    : "w-4 h-4 bg-gray-500"
                }`}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Stop Info */}
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{stop.name}</span>

              {stop.status === "current" && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                  CURRENT
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}