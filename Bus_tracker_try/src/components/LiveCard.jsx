import { formatEta, getStatusCopy } from "../utils/routeUtils";

export default function LiveCard({ bus, route, nextStop, currentStop, lastUpdatedText }) {
  const destination = route?.stops?.[route.stops.length - 1];
  const badgeClass =
    bus?.status === "emergency"
      ? "bg-red-500/20 text-red-200"
      : bus?.status === "warning"
      ? "bg-amber-500/20 text-amber-200"
      : "bg-emerald-500/20 text-emerald-200";

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-2xl shadow-slate-950/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-sky-300">
            {bus?.bus_id || "Bus"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-50">
            {route?.name || "Campus route"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {route?.description || "Waiting for route metadata."}
          </p>
        </div>

        <div className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
          {bus?.status || "no_data"}
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl bg-slate-900/70 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Next stop</p>
          <p className="mt-2 text-lg font-semibold text-slate-100">
            {nextStop?.name || destination?.name || "Waiting for live location"}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {nextStop ? formatEta(nextStop.etaMinutes) : "No ETA until the first GPS update"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current position</p>
          <p className="mt-2 text-lg font-semibold text-slate-100">
            {currentStop?.name || "Between stops"}
          </p>
          <p className="mt-2 text-sm text-slate-400">{lastUpdatedText}</p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-300">
        {getStatusCopy(bus?.status)}
      </p>
    </div>
  );
}
