const NBSC_COORDS = [8.360191, 124.868320]; // Define coordinates here for map

(function () {

    if (!document.getElementById('reportsChart')) return;

    function loadReports() {
        // Assume Storage.loadReports() is available from classes.js
        const raw = Storage.loadReports() || [];
        return raw.map(r => new Report(r));
    }

    function groupLast7Days(reports) {
        const labels = [];
        const counts = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            labels.push(key);
            const count = reports.filter(r => r.createdAt.slice(0, 10) === key).length;
            counts.push(count);
        }
        return { labels, counts };
    }
    
    // --- MAP AND STATS LOGIC ---
    const mapContainer = document.getElementById('dashboardMap');
    let map = null;

    if (mapContainer && typeof L !== 'undefined') {
        // Initialize map
        map = L.map('dashboardMap').setView(NBSC_COORDS, 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }
    
    function renderReportMarkers(reports) {
        // Clear existing markers if map is present
        if (map) {
            map.eachLayer(layer => {
                if (layer instanceof L.Circle) { map.removeLayer(layer); }
            });
            
            reports.forEach(r => {
                if (r.lat && r.lng) {
                    L.circle([r.lat, r.lng], {
                        radius: 20,
                        // color if done
                        color: r.status === 'Done' ? '#585D71' : '#ff6b6b', 
                        fillOpacity: 0.6
                    }).addTo(map)
                    .bindPopup(`
                        <strong>${r.title}</strong>
                        <div class="muted">Status: ${r.status}</div>
                        <small>${new Date(r.createdAt).toLocaleString()}</small>
                    `);
                }
            });
        }
    }
    
    function renderStatistics(reports) {
        const totalReports = reports.length;
        const pendingReports = reports.filter(r => r.status === 'Pending').length;
        const doneReports = reports.filter(r => r.status === 'Done').length;
        
        const statsTable = document.getElementById('statsTable');
        if (statsTable) {
            statsTable.innerHTML = `
                <thead><tr><th>Metric</th><th>Count</th></tr></thead>
                <tbody>
                    <tr><td>Total Reports</td><td>${totalReports}</td></tr>
                    <tr><td>Pending Hazards</td><td>${pendingReports}</td></tr>
                    <tr><td>Completed Reports</td><td>${doneReports}</td></tr>
                    <tr><td>Alerts (Type: Alert)</td><td>${reports.filter(r => r.type === 'alert').length}</td></tr>
                </tbody>
            `;
        }
    }
    // --- END MAP AND STATS LOGIC ---
    function render() {
        const reports = loadReports();
        
        // Render basic summary and alerts
        document.getElementById('totalReports').textContent = reports.length;
        const alerts = Storage.loadAlerts(); // Assuming loadAlerts exists
        const alertsList = document.getElementById('alertsList');
        if (alerts && alerts.length) {
            alertsList.innerHTML = alerts.map(a => `<li>${a.message} <small class="muted"> — ${new Date(a.createdAt).toLocaleString()}</small></li>`).join('');
        } else {
            alertsList.innerHTML = '<li class="muted">No alerts</li>';
        }

        // Render Map and Stats
        renderReportMarkers(reports);
        renderStatistics(reports);
        
        // Chart
        const grouped = groupLast7Days(reports);
        const ctx = document.getElementById('reportsChart').getContext('2d');
        
        // Ensure only one chart instance is created
        if (window.reportsChartInstance) {
            window.reportsChartInstance.destroy();
        }

        window.reportsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: grouped.labels.map(l => (new Date(l)).toLocaleDateString()),
                datasets: [{
                    label: 'Reports',
                    data: grouped.counts,
                    backgroundColor: 'rgba(122,162,255,0.85)',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    }

    render();
})();