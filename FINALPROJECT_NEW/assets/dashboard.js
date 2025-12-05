/* dashboard.js — builds Chart.js and summary from reports */

(function () {
    // ensure on dashboard
    if (!document.getElementById('reportsChart')) return;

    function loadReports() {
        const raw = Storage.loadReports() || [];
        // map to Report objects
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

    function render() {
        const reports = loadReports();
        document.getElementById('totalReports').textContent = reports.length;
        const alerts = Storage.loadAlerts();
        const alertsList = document.getElementById('alertsList');
        if (alerts && alerts.length) {
            alertsList.innerHTML = alerts.map(a => `<li>${a.message} <small class="muted"> — ${new Date(a.createdAt).toLocaleString()}</small></li>`).join('');
        } else {
            alertsList.innerHTML = '<li class="muted">No alerts</li>';
        }

        // Chart
        const grouped = groupLast7Days(reports);
        const ctx = document.getElementById('reportsChart').getContext('2d');
        new Chart(ctx, {
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
