export default function Header({ bus, route, lastUpdatedText }) {
  return (
    <header className="rounded-3xl border border-slate-800/80 bg-slate-950/70 px-5 py-6 shadow-2xl shadow-slate-950/30">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">
            Live tracker
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-50">
            College Bus Tracker
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            {route?.description ||
              "Track the active campus bus, watch each stop update, and switch into admin mode when dispatch needs a wider view."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
          <p className="font-medium text-slate-100">{bus?.label || bus?.bus_id || "No bus selected"}</p>
          <p className="mt-1">{lastUpdatedText}</p>
        </div>
      </div>
    </header>
  );
}
