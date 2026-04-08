import tempfile
import time
import unittest
from pathlib import Path

from fastapi import HTTPException
from fastapi.routing import APIRoute

from main import DRIVER_PAGE_PATH, LocationUpdate, SosReport, create_app


def get_endpoint(app, path, method):
  for route in app.routes:
    if isinstance(route, APIRoute) and route.path == path and method in route.methods:
      return route.endpoint

  raise AssertionError(f"Route {method} {path} not found")


class BackendIntegrationTests(unittest.TestCase):
  def setUp(self):
    self.temp_dir = tempfile.TemporaryDirectory()
    self.db_path = Path(self.temp_dir.name) / "tracker.db"
    self.app = create_app(
      db_path=self.db_path,
      driver_token="driver-secret",
      admin_token="admin-secret",
      warning_after_seconds=0.05,
      emergency_after_seconds=0.1,
    )

  def tearDown(self):
    self.temp_dir.cleanup()

  def test_root_and_driver_pages_smoke(self):
    home = get_endpoint(self.app, "/", "GET")()
    driver_response = get_endpoint(self.app, "/driver", "GET")()

    self.assertEqual(home["message"], "Bus Tracker API is running")
    self.assertEqual(str(driver_response.path), str(DRIVER_PAGE_PATH))

  def test_public_overview_starts_with_seeded_buses_and_no_data(self):
    overview = get_endpoint(self.app, "/api/public/overview", "GET")()

    self.assertEqual(len(overview["buses"]), 2)
    self.assertTrue(all(bus["status"] == "no_data" for bus in overview["buses"]))

  def test_driver_update_requires_token(self):
    update = get_endpoint(self.app, "/api/driver/update", "POST")

    with self.assertRaises(HTTPException) as context:
      update(
        LocationUpdate(bus_id="BUS101", lat=28.3, lng=79.4),
        x_driver_token=None,
      )

    self.assertEqual(context.exception.status_code, 401)

  def test_status_transitions_normal_warning_emergency(self):
    update = get_endpoint(self.app, "/api/driver/update", "POST")
    location = get_endpoint(self.app, "/api/public/location", "GET")

    update(
      LocationUpdate(bus_id="BUS101", lat=28.3878, lng=79.4205),
      x_driver_token="driver-secret",
    )

    normal = location(bus_id="BUS101")
    self.assertEqual(normal["status"], "normal")

    time.sleep(0.06)
    warning = location(bus_id="BUS101")
    self.assertEqual(warning["status"], "warning")

    time.sleep(0.06)
    emergency = location(bus_id="BUS101")
    self.assertEqual(emergency["status"], "emergency")

  def test_admin_overview_and_alert_acknowledgement(self):
    update = get_endpoint(self.app, "/api/driver/update", "POST")
    sos = get_endpoint(self.app, "/api/driver/sos", "POST")
    admin_overview = get_endpoint(self.app, "/api/admin/overview", "GET")
    acknowledge = get_endpoint(self.app, "/api/admin/alerts/{alert_id}/acknowledge", "POST")

    update(
      LocationUpdate(bus_id="BUS101", lat=28.3878, lng=79.4205),
      x_driver_token="driver-secret",
    )
    sos_response = sos(
      SosReport(
        bus_id="BUS101",
        lat=28.3878,
        lng=79.4205,
        message="Driver requested assistance",
      ),
      x_driver_token="driver-secret",
    )
    self.assertEqual(sos_response["message"], "SOS received")

    with self.assertRaises(HTTPException) as context:
      admin_overview(x_admin_token=None)
    self.assertEqual(context.exception.status_code, 401)

    overview = admin_overview(x_admin_token="admin-secret")
    self.assertEqual(len(overview["alerts"]), 1)
    self.assertIsNone(overview["alerts"][0]["acknowledged_at"])

    alert_id = overview["alerts"][0]["id"]
    acknowledged = acknowledge(alert_id=alert_id, x_admin_token="admin-secret")
    self.assertIsNotNone(acknowledged["alert"]["acknowledged_at"])
