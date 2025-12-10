let reportsChart, timelineChart;
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
});

// --- Main Dashboard Loading Function ---
function loadDashboard() {
    const user = localStorage.getItem("activeUser");
    if (!user) {
        alert("Please login first.");
        window.location.href = "index.html";
        return;
    }

    const reports = JSON.parse(localStorage.getItem("reports_" + user) || "[]");
    
    // FIX: Filter out reports marked as 'Completed' for dashboard stats/map
    const activeReports = reports.filter(r => r.status !== "Completed");
    
    updateSafetyAlert('none', 'All systems normal.');  // 1. Safety Alert

    fetchWeatherSnapshot(); // 2. Mini Weather

    // 3. Recent Reports (Show only the last 5 active reports)
    const list = document.getElementById("recentReports"); 
    list.innerHTML = activeReports.slice(-5).reverse()
        .map(r => `<li>${r.type} – ${r.desc} (${r.date})</li>`).join("");

    const typeCount = {}; // 4. Charts
    const reportDates = {};
    
    // Count stats based ONLY on active reports
    activeReports.forEach(r => {
        typeCount[r.type] = (typeCount[r.type] || 0) + 1;
        
        // Use only the date part for timeline grouping
        const reportDateKey = r.date.split(',')[0].trim();
        reportDates[reportDateKey] = (reportDates[reportDateKey] || 0) + 1;
    });

    // Reports by Type Chart (Doughnut)
    const ctx1 = document.getElementById("reportsChart");
    reportsChart?.destroy();
    reportsChart = new Chart(ctx1, {
        type: "doughnut",
        data: {
            labels: Object.keys(typeCount),
            datasets: [{
                data: Object.values(typeCount),
                // Colors should match your design, applied to active types
                backgroundColor: ['#00796B', '#004D40', '#FF9800', '#F44336', '#666666'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right' }, title: { display: true, text: 'Active Reports by Type' } }
        }
    });

    // Timeline Chart (Bar) - Sort dates and take the last 10
    const timelineLabels = Object.keys(reportDates).sort((a, b) => new Date(a) - new Date(b)).slice(-10);
    const timelineData = timelineLabels.map(d => reportDates[d]);
    const ctx2 = document.getElementById("timelineChart");
    timelineChart?.destroy();
    timelineChart = new Chart(ctx2, {
        type: "bar",
        data: { labels: timelineLabels, datasets: [{ label: "Active Reports Filed", data: timelineData, backgroundColor: '#00796B' }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Number of Reports' } }, x: { title: { display: true, text: 'Date' } } },
            plugins: { title: { display: true, text: 'Active Reports Timeline (Last 10 Days)' } }
        }
    });

    // 5. Load Dashboard Map
    setTimeout(loadDashboardMap, 100);
}

function loadDashboardMap() {
    const container = document.getElementById("dashboardMap");
    if (!container || typeof L === 'undefined') return;

    // Map Setup
    const map = L.map(container).setView([8.360179, 124.868653], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors" }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    const user = localStorage.getItem("activeUser");
    const reports = JSON.parse(localStorage.getItem("reports_" + user) || "[]");

    // Function to create a marker and bind a professional popup
    function createMarker(spot) {
        const popup = `
            <div style="font-family: 'Segoe UI', sans-serif; padding: 5px;">
                <h4 style="margin: 0 0 5px 0; color: #00796B; font-size: 1.1em;">${spot.name}</h4>
                <p style="margin: 0 0 5px 0; font-size: 0.9em;">${spot.desc}</p>
                <p style="margin: 0; font-weight: bold; color: #004D40;">Type: ${spot.type || 'N/A'}</p>
            </div>
        `;
        L.marker([spot.lat, spot.lng]).addTo(markersLayer).bindPopup(popup);
    }
    
    // Load Dynamic User Reports ONLY (Filter: Show Active Reports on Map)
    reports.forEach(r => {
        if (r.lat && r.lng && r.status !== "Completed") { // CHECK STATUS HERE
            createMarker({ 
                name: r.type, 
                desc: r.desc, 
                type: `User Report - ${r.date}`, 
                lat: r.lat, 
                lng: r.lng 
            });
        }
    });
    
    // Map click functionality for adding reports 
    map.on('click', function (e) {
        const type = prompt("Enter report type:");
        const desc = prompt("Enter report description:");
        if (!type || !desc) return alert("Report canceled.");

        const newReport = {
            type, desc,
            // Changed to toLocaleString for consistency with reports.js
            date: new Date().toLocaleString(), 
            lat: e.latlng.lat,
            lng: e.latlng.lng
        };
        reports.push(newReport);
        localStorage.setItem("reports_" + user, JSON.stringify(reports));
        createMarker(newReport);
        loadDashboard(); // refresh entire dashboard after report
    });
}
    
// --- Safety Alert Implementation ---
function updateSafetyAlert(alertStatus, message) {
    const alertElement = document.getElementById('safetyAlert');
    const alertBox = alertElement.closest('.box');
    if (!alertElement || !alertBox) return;

    alertBox.classList.remove('alert-low', 'alert-medium', 'alert-high');
    if (alertStatus === 'active') { alertBox.classList.add('alert-high'); alertElement.textContent = `🔴 ALERT ACTIVE: ${message}`; }
    else if (alertStatus === 'medium') { alertBox.classList.add('alert-medium'); alertElement.textContent = `🟠 ADVISORY: ${message}`; }
    else { alertBox.classList.add('alert-low'); alertElement.textContent = '🟢 No active alerts.'; }
}

// --- Weather Snapshot ---
async function fetchWeatherSnapshot() {
    const API_KEY = '9d9f6f36546d0442f55deeb57e8b9553';
    const LAT = '8.360179', LON = '124.868653';
    const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`;
    try {
        const data = await (await fetch(URL)).json();
        displayWeatherSnapshot(data);
    } catch (e) { console.error(e); document.getElementById('miniWeather').innerHTML = 'Weather load failed.'; }
}

function displayWeatherSnapshot(data) {
    const html = `<div class="weather-content">
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" class="weather-icon">
        <div class="weather-details">
            <h3>${data.name}</h3>
            <p class="temperature">${Math.round(data.main.temp)}°C</p>
            <p>${data.weather[0].description}</p>
            <p class="detail-line">Humidity: ${data.main.humidity}%</p>
        </div></div>`;
    document.getElementById('miniWeather').innerHTML = html;
}