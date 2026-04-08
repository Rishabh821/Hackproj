import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTrackerState,
  calculateDistance,
  calculateETA,
  getClosestStopIndex,
} from "../src/utils/routeUtils.js";

const route = {
  id: "campus-loop",
  averageSpeedKph: 24,
  stops: [
    { id: "hostel-gate", name: "Hostel Gate", lat: 28.38781797580734, lng: 79.42052491078208 },
    { id: "library-square", name: "Library Square", lat: 28.369797985579577, lng: 79.4159222405915 },
    { id: "science-block", name: "Science Block", lat: 28.348441891909577, lng: 79.42009575822425 },
  ],
};

test("calculateDistance returns zero for identical coordinates", () => {
  assert.equal(calculateDistance(28.3, 79.4, 28.3, 79.4), 0);
});

test("calculateETA rounds up to at least one minute for non-zero distance", () => {
  assert.equal(calculateETA(0.2, 24), 1);
});

test("getClosestStopIndex picks the nearest stop", () => {
  const index = getClosestStopIndex(
    { lat: 28.37, lng: 79.416 },
    route.stops
  );

  assert.equal(index, 1);
});

test("buildTrackerState marks the current and next stops", () => {
  const trackerState = buildTrackerState(
    {
      lat: route.stops[1].lat,
      lng: route.stops[1].lng,
    },
    route
  );

  assert.equal(trackerState.currentStop.id, "library-square");
  assert.equal(trackerState.nextStop.id, "science-block");
  assert.equal(trackerState.timelineStops[0].status, "done");
  assert.equal(trackerState.timelineStops[1].status, "current");
  assert.equal(trackerState.timelineStops[2].status, "next");
});

test("buildTrackerState handles buses with no live position", () => {
  const trackerState = buildTrackerState(
    {
      lat: null,
      lng: null,
    },
    route
  );

  assert.equal(trackerState.currentStop, null);
  assert.equal(trackerState.nextStop.id, "hostel-gate");
  assert.equal(
    trackerState.timelineStops.every((stop) => stop.status === "pending"),
    true
  );
});
