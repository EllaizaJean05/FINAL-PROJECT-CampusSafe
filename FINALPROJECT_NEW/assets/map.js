/* map.js — initialize main map and load markers from static + reports */

const NBSC_COORDS = [8.360191, 124.868320]; // NBSC setView

(function () {
    if (!document.getElementById('map')) return;

    // create map
    const map = L.map('map').setView(NBSC_COORDS, 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // static safety markers
    const safetyPoints = [
        { title: 'Guard Post - Main Gate', coords: [8.3606, 124.8679], desc: '24/7 guard', icon: '📍' },
        { title: 'Clinic', coords: [8.3598, 124.8691], desc: 'Campus clinic', icon: '🏥' },
        { title: 'Evacuation Area (Field)', coords: [8.3612, 124.8698], desc: 'Open area for evacuation', icon: '🅿️' }
    ];

    safetyPoints.forEach(p => {
        L.marker(p.coords).addTo(map).bindPopup(`<strong>${p.title}</strong><div class="muted">${p.desc}</div>`);
    });

    // load user reports and render as hazard markers
    function loadReports() {
        return (Storage.loadReports() || []).map(r => new Report(r));
    }

    function renderReportMarkers() {
        loadReports().forEach(r => {
            if (r.lat && r.lng) {
                L.circle([r.lat, r.lng], { radius: 20, color: '#ff6b6b', fillOpacity: 0.6 }).addTo(map)
                    .bindPopup(`<strong>${r.title}</strong><div class="muted">${r.description}</div><small>${new Date(r.createdAt).toLocaleString()}</small>`);
            }
        });
    }

    renderReportMarkers();

    // Optional: refresh markers when storage changes (not universally supported)
    window.addEventListener('storage', () => {
        // reload page or re-render markers
        location.reload();
    });

})();
