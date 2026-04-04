export function Timeline({ stops }) {
  return (
    <div className="space-y-4">
      {stops.map((stop, i) => (
        <div key={i} className="flex items-center space-x-3">

          {/* ETA */}
          <div className="text-xs text-gray-400 w-16">
            {stop.eta} min
          </div>

          {/* DOT */}
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>

          {/* STOP NAME */}
          <div className="text-sm">
            Stop {i + 1}
          </div>

        </div>
      ))}
    </div>
  );
}