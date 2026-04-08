const DEFAULT_AVERAGE_SPEED_KPH = 24;
const CURRENT_STOP_RADIUS_KM = 0.12;

export function calculateDistance(lat1, lng1, lat2, lng2) {
  const radiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radiusKm * c;
}

export function calculateETA(distanceKm, averageSpeedKph = DEFAULT_AVERAGE_SPEED_KPH) {
  if (!Number.isFinite(distanceKm)) {
    return null;
  }

  if (distanceKm <= 0) {
    return 0;
  }

  const boundedSpeed = Math.max(averageSpeedKph, 1);
  return Math.max(1, Math.round((distanceKm / boundedSpeed) * 60));
}

export function hasLivePosition(bus) {
  return Number.isFinite(bus?.lat) && Number.isFinite(bus?.lng);
}

export function getClosestStopIndex(position, stops) {
  if (!position || !stops?.length) {
    return -1;
  }

  let closestIndex = -1;
  let minDistance = Infinity;

  stops.forEach((stop, index) => {
    const distanceKm = calculateDistance(
      position.lat,
      position.lng,
      stop.lat,
      stop.lng
    );

    if (distanceKm < minDistance) {
      minDistance = distanceKm;
      closestIndex = index;
    }
  });

  return closestIndex;
}

function getCurrentStopIndex(position, stops) {
  const closestIndex = getClosestStopIndex(position, stops);

  if (closestIndex < 0) {
    return -1;
  }

  const stop = stops[closestIndex];
  const distanceKm = calculateDistance(
    position.lat,
    position.lng,
    stop.lat,
    stop.lng
  );

  return distanceKm <= CURRENT_STOP_RADIUS_KM ? closestIndex : -1;
}

export function buildTrackerState(bus, route) {
  const stops = route?.stops ?? [];
  const position = hasLivePosition(bus) ? { lat: bus.lat, lng: bus.lng } : null;
  const averageSpeedKph = route?.averageSpeedKph ?? DEFAULT_AVERAGE_SPEED_KPH;

  if (!stops.length) {
    return {
      position,
      currentStop: null,
      nextStop: null,
      timelineStops: [],
      destination: null,
    };
  }

  const closestStopIndex = getClosestStopIndex(position, stops);
  const currentStopIndex = position ? getCurrentStopIndex(position, stops) : -1;
  let nextStopIndex = 0;

  if (currentStopIndex >= 0) {
    nextStopIndex =
      currentStopIndex + 1 < stops.length ? currentStopIndex + 1 : -1;
  } else if (closestStopIndex >= 0 && closestStopIndex < stops.length - 1) {
    nextStopIndex = closestStopIndex + 1;
  } else if (closestStopIndex === stops.length - 1) {
    nextStopIndex = -1;
  }

  const timelineStops = stops.map((stop, index) => {
    const distanceKm = position
      ? calculateDistance(position.lat, position.lng, stop.lat, stop.lng)
      : null;
    const etaMinutes = calculateETA(distanceKm, averageSpeedKph);

    let status = "pending";
    if (currentStopIndex >= 0) {
      if (index < currentStopIndex) {
        status = "done";
      } else if (index === currentStopIndex) {
        status = "current";
      } else if (index === nextStopIndex) {
        status = "next";
      }
    } else if (closestStopIndex >= 0) {
      if (index < closestStopIndex) {
        status = "done";
      } else if (index === closestStopIndex) {
        status = "current";
      } else if (index === nextStopIndex) {
        status = "next";
      }
    }

    return {
      ...stop,
      distanceKm,
      etaMinutes,
      status,
    };
  });

  const currentStop =
    currentStopIndex >= 0
      ? timelineStops[currentStopIndex]
      : closestStopIndex >= 0
      ? timelineStops[closestStopIndex]
      : null;

  return {
    position,
    currentStop,
    nextStop: nextStopIndex >= 0 ? timelineStops[nextStopIndex] : null,
    timelineStops,
    destination: timelineStops[timelineStops.length - 1] ?? null,
  };
}

export function formatRelativeUpdate(timestamp) {
  if (!Number.isFinite(timestamp)) {
    return "Waiting for first update";
  }

  const secondsAgo = Math.max(Math.round(Date.now() / 1000 - timestamp), 0);

  if (secondsAgo < 10) {
    return "Updated just now";
  }

  if (secondsAgo < 60) {
    return `Updated ${secondsAgo}s ago`;
  }

  const minutesAgo = Math.round(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `Updated ${minutesAgo}m ago`;
  }

  const hoursAgo = Math.round(minutesAgo / 60);
  return `Updated ${hoursAgo}h ago`;
}

export function formatEta(etaMinutes) {
  if (!Number.isFinite(etaMinutes)) {
    return "ETA unavailable";
  }

  if (etaMinutes <= 0) {
    return "Arriving now";
  }

  return etaMinutes === 1 ? "1 min" : `${etaMinutes} mins`;
}

export function getStatusCopy(status) {
  switch (status) {
    case "warning":
      return "This bus has been stopped longer than expected.";
    case "emergency":
      return "This bus has been stationary for too long. Please check on the driver.";
    case "no_data":
      return "No live GPS updates yet. Open the driver console to start tracking.";
    default:
      return "Live tracking is healthy.";
  }
}
