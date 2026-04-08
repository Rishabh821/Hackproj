import L from "leaflet";
import busIcon from "./assets/images.png";
import { useEffect, useMemo, useState } from "react";

import LiveCard from "./components/LiveCard";
import Header from "./components/Header";
import MapView from "./components/Mapview.jsx";
import { Timeline } from "./components/Timeline.jsx";
import { getPublicOverview } from "./api/trackerApi";
import {
  buildTrackerState,
  formatRelativeUpdate,
} from "./utils/routeUtils";

const busMarkerIcon = L.icon({
  iconUrl: busIcon,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
});

function App() {
  const [overview, setOverview] = useState({ routes: [], buses: [] });
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadOverview = async () => {
      try {
        const data = await getPublicOverview();
        if (cancelled) {
          return;
        }

        setOverview(data);
        setError("");
        setSelectedBusId((currentBusId) => {
          const availableBusIds = data.buses.map((bus) => bus.bus_id);

          if (currentBusId && availableBusIds.includes(currentBusId)) {
            return currentBusId;
          }

          return availableBusIds[0] ?? null;
        });
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message || "Failed to load tracker data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOverview();
    const intervalId = window.setInterval(loadOverview, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const routesById = useMemo(
    () =>
      Object.fromEntries(
        (overview.routes ?? []).map((route) => [route.id, route])
      ),
    [overview.routes]
  );

  const buses = overview.buses ?? [];
  const selectedBus =
    buses.find((bus) => bus.bus_id === selectedBusId) ?? buses[0] ?? null;
  const selectedRoute = selectedBus ? routesById[selectedBus.route_id] : null;
  const trackerState = useMemo(
    () => buildTrackerState(selectedBus, selectedRoute),
    [selectedBus, selectedRoute]
  );
  const lastUpdatedText = formatRelativeUpdate(selectedBus?.last_heartbeat_at);

  const statusBannerClass =
    selectedBus?.status === "emergency"
      ? "border-red-500/30 bg-red-500/10 text-red-100"
      : selectedBus?.status === "warning"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
      : selectedBus?.status === "no_data"
      ? "border-slate-700 bg-slate-900/70 text-slate-200"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";

  return (
    <div className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <Header
          bus={selectedBus}
          route={selectedRoute}
          lastUpdatedText={lastUpdatedText}
        />

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {buses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {buses.map((bus) => (
              <button
                key={bus.bus_id}
                onClick={() => setSelectedBusId(bus.bus_id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  selectedBus?.bus_id === bus.bus_id
                    ? "border-sky-400 bg-sky-500/20 text-sky-100"
                    : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500"
                }`}
              >
                {bus.label}
              </button>
            ))}
          </div>
        )}

        {selectedBus && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${statusBannerClass}`}>
            {selectedBus.status === "warning" &&
              "The driver heartbeat is live, but this bus has been stationary longer than expected."}
            {selectedBus.status === "emergency" &&
              "The bus has remained stationary past the emergency threshold. Dispatch should check in now."}
            {selectedBus.status === "no_data" &&
              "No driver heartbeat yet. Open the driver console to begin publishing GPS updates."}
            {selectedBus.status === "normal" &&
              "This bus is reporting normally and the route is updating in real time."}
          </div>
        )}

        {!selectedBus && !loading && (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-10 text-center text-slate-300">
            No buses are configured yet. Add buses to <code>shared/routes.json</code> and restart the backend.
          </div>
        )}

        {selectedBus && (
          <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="space-y-5">
              <LiveCard
                bus={selectedBus}
                route={selectedRoute}
                nextStop={trackerState.nextStop}
                currentStop={trackerState.currentStop}
                lastUpdatedText={lastUpdatedText}
              />
              <Timeline stops={trackerState.timelineStops} />
            </div>

            <div className="min-h-[420px] rounded-3xl border border-slate-800/80 bg-slate-950/70 p-3 shadow-2xl shadow-slate-950/30">
              <MapView
                position={trackerState.position}
                stops={trackerState.timelineStops}
                icon={busMarkerIcon}
                busLabel={selectedBus.label}
                status={selectedBus.status}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
