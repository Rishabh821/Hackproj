import { formatEta } from "../utils/routeUtils";

const statusClasses = {
  done: "bg-emerald-500 text-emerald-50",
  current: "bg-sky-500 text-sky-50",
  next: "bg-amber-500 text-amber-50",
  pending: "bg-slate-700 text-slate-200",
};

export function Timeline({ stops }) {
  if (!stops.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-sm text-slate-400">
        Route data will appear here as soon as a bus and route are available.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-2xl shadow-slate-950/30">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-50">Stops and ETA</h2>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Live route
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {stops.map((stop) => (
          <div
            key={stop.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${statusClasses[stop.status]}`} />
              <div>
                <p className="font-medium text-slate-100">{stop.name}</p>
                <p className="text-sm text-slate-400">{stop.status}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-slate-100">
                {stop.status === "done" ? "Passed" : formatEta(stop.etaMinutes)}
              </p>
              <p className="text-xs text-slate-400">
                {Number.isFinite(stop.distanceKm)
                  ? `${stop.distanceKm.toFixed(2)} km away`
                  : "Waiting for GPS"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
