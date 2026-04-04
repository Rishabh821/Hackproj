export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // earth radius km

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function calculateETA(distanceKm) {
  const avgSpeed = 30; // km/h (adjust later)
  const timeHours = distanceKm / avgSpeed;

  return Math.round(timeHours * 60); // minutes
}