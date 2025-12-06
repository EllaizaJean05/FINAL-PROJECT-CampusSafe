const NBSC_COORDS = [8.360191, 124.868320];

(function () {
    if (!document.getElementById('map')) return;

    // 1. Initialize map
    const map = L.map('map').setView(NBSC_COORDS, 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 2. Static safety markers (optional)
    const safetyPoints = [
        { title: 'Guard Post - Main Gate', coords: [8.361278,124.867601 ], desc: '24/7 guard', icon: '📍' },
        { title: 'Clinic', coords: [8.359169, 124.868229], desc: 'Campus clinic', icon: '🏥' },
        { title: 'Evacuation Area (Field)', coords: [8.360119, 124.868267], desc: 'Open area for evacuation', icon: '🅿️' }
    ];

    safetyPoints.forEach(p => {
        L.marker(p.coords)
            .addTo(map)
            .bindPopup(`<strong>${p.title}</strong><div class="muted">${p.desc}</div>`);
    });

    // 3. Load JSON markers 
    fetch("markers.json")
        .then(res => res.json())
        .then(data => {
            data.markers.forEach(m => {
                L.marker([m.lat, m.lng]).addTo(map)
                    .bindPopup(`<h3>${m.title}</h3><p>${m.description}</p>`);
            });
        })
        .catch(err => console.error("JSON loading error:", err));

    // 4. Load & render report markers
    function loadReports() {
        return (Storage.loadReports() || []).map(r => new Report(r));
    }

    function renderReportMarkers() {
        loadReports().forEach(r => {
            if (r.lat && r.lng) {
                L.circle([r.lat, r.lng], {
                    radius: 20,
                    color: '#ff6b6b',
                    fillOpacity: 0.6
                }).addTo(map)
                .bindPopup(`
                    <strong>${r.title}</strong>
                    <div class="muted">${r.description}</div>
                    <small>${new Date(r.createdAt).toLocaleString()}</small>
                `);
            }
        });
    }

    renderReportMarkers();

    // 5. Reload on storage changes
    window.addEventListener('storage', () => location.reload());

})();
