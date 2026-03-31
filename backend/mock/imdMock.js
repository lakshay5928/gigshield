// Mock IMD Alert Generator for testing
const MOCK_ALERTS = [
  { ward_id: 'MUM-W14', city: 'mumbai', alert_level: 'orange', source: 'imd', duration_hours: 3 },
  { ward_id: 'MUM-W07', city: 'mumbai', alert_level: 'red',    source: 'bmc', duration_hours: 5 },
  { ward_id: 'DEL-W22', city: 'delhi',  alert_level: 'yellow', source: 'imd', duration_hours: 2 },
  { ward_id: 'BLR-W09', city: 'bangalore', alert_level: 'orange', source: 'imd', duration_hours: 4 },
];

function getRandomMockAlert() {
  return MOCK_ALERTS[Math.floor(Math.random() * MOCK_ALERTS.length)];
}

module.exports = { MOCK_ALERTS, getRandomMockAlert };
