var map = L.map('map').setView([8.157, 125.127], 16);

// Map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
}).addTo(map);

// Example markers
L.marker([8.157, 125.127]).addTo(map)
  .bindPopup("🏥 Campus Clinic");

L.marker([8.158, 125.126]).addTo(map)
  .bindPopup("🛡 Guard Post");

L.marker([8.156, 125.128]).addTo(map)
  .bindPopup("⚠ Construction Area – Avoid");
