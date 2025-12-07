let reportsChart, timelineChart;

document.addEventListener("DOMContentLoaded", () => {
    // Start the loading process once the HTML is ready
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

    // Initialize all components
    // 1. Safety Alert
    updateSafetyAlert('none', 'All systems normal.'); 

    // 2. Mini Weather 
    fetchWeatherSnapshot();

    // 3. Recent Reports List
    const list = document.getElementById("recentReports");
    list.innerHTML = reports.slice(-5).reverse().map(r => `<li>${r.type} – ${r.desc} (${r.date})</li>`).join("");

    // 4. Chart Data Preparation (FIXED LOGIC)
    const typeCount = {};
    const reportDates = {};
    
    // Process all reports to aggregate data
    reports.forEach(r => { 
        // Data for Reports by Type chart
        typeCount[r.type] = (typeCount[r.type] || 0) + 1;
        
        // Data for Timeline chart (Count reports per day)
        const dateKey = r.date; 
        reportDates[dateKey] = (reportDates[dateKey] || 0) + 1;
    });
    
    // Prepare timeline data for Chart.js
    const timelineLabels = Object.keys(reportDates).slice(-10); // Last 10 unique dates
    const timelineData = timelineLabels.map(date => reportDates[date]); // Counts for those dates

    // 5. Reports by Type Chart (Doughnut - BEST TYPE FOR CATEGORIES)
    const ctx1 = document.getElementById("reportsChart");
    reportsChart?.destroy();
    reportsChart = new Chart(ctx1, {
        type: "doughnut",
        data: { 
            labels: Object.keys(typeCount), 
            datasets: [{
                data: Object.values(typeCount),
                backgroundColor: [ 
                    '#00796B', // Deep Teal
                    '#004D40', // Darker Teal
                    '#FF9800', // Warning Orange
                    '#F44336', // Danger Red
                    '#666666'  // Grey
                ],
            }] 
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { position: 'right' },
                title: { display: true, text: 'Reports by Type' }
            }
        }
    });

    // 6. Timeline Chart (Bar - BEST TYPE FOR COUNTS OVER TIME)
    const ctx2 = document.getElementById("timelineChart");
    timelineChart?.destroy();
    timelineChart = new Chart(ctx2, {
        type: "bar",
        data: { 
            labels: timelineLabels, 
            datasets: [{
                label: "Reports Filed",
                data: timelineData, 
                backgroundColor: '#00796B',
            }] 
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { 
                y: { beginAtZero: true, title: { display: true, text: 'Number of Reports' } },
                x: { title: { display: true, text: 'Date' } }
            },
            plugins: {
                 title: { display: true, text: 'Reports Timeline (Last 10 Days)' }
            }
        }
    });

    // 7. Dashboard Map - Added delay for Leaflet loading
    setTimeout(loadDashboardMap, 100); 
}

// --- Dashboard Map Initialization (FIXED POPUPS AND MARKERS) ---
function loadDashboardMap() {
    const container = document.getElementById("dashboardMap");
    if (!container || typeof L === 'undefined') {
        console.error("Map container not found or Leaflet not loaded.");
        return;
    }

    // Leaflet map setup
    const map = L.map(container).setView([8.360179, 124.868653], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors" }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    const user = localStorage.getItem("activeUser");
    const reports = JSON.parse(localStorage.getItem("reports_" + user) || "[]");

    // Function to create a marker and bind a professional-looking popup
    function createMarker(spot) {
        // Professional popup content
        const popup = `
            <div style="font-family: 'Segoe UI', sans-serif; padding: 5px;">
                <h4 style="margin: 0 0 5px 0; color: #00796B; font-size: 1.1em;">${spot.name}</h4>
                <p style="margin: 0 0 5px 0; font-size: 0.9em;">${spot.desc}</p>
                <p style="margin: 0; font-weight: bold; color: #004D40;">Type: ${spot.type}</p>
            </div>
        `;
        L.marker([spot.lat, spot.lng]).addTo(markersLayer).bindPopup(popup);
    }

    // Fetch default data and user reports
    fetch("data.json")
        .then(r => r.json())
        .then(defaultData => {
            
            // 1. Add default markers (e.g., Clinic, Admin Building)
            defaultData.forEach(createMarker);

            // 2. Add user report markers
            reports.forEach(r => {
                if (r.lat && r.lng) {
                    createMarker({ 
                        name: r.type, 
                        desc: r.desc, 
                        type: `User Report - ${r.date}`,
                        lat: r.lat, 
                        lng: r.lng 
                    });
                }
            });

        }).catch(err => console.error("Error loading map data:", err));
}

// --- Safety Alert Implementation ---
function updateSafetyAlert(alertStatus, message) {
    const alertElement = document.getElementById('safetyAlert');
    const alertBox = alertElement ? alertElement.closest('.box') : null;

    if (!alertElement || !alertBox) return;

    // Clear previous classes
    alertBox.classList.remove('alert-low', 'alert-medium', 'alert-high');

    alertElement.textContent = message;

    // Logic to update the appearance based on the status
    if (alertStatus === 'active') {
        alertBox.classList.add('alert-high');
        alertElement.textContent = `🔴 ALERT ACTIVE: ${message}`;
    } else if (alertStatus === 'medium') {
        alertBox.classList.add('alert-medium');
        alertElement.textContent = `🟠 ADVISORY: ${message}`;
    } else {
        alertBox.classList.add('alert-low');
        alertElement.textContent = '🟢 No active alerts.';
    }
}

// --- Weather Snapshot Implementation ---
async function fetchWeatherSnapshot() {
    
    const API_KEY = '9d9f6f36546d0442f55deeb57e8b9553'; 
    const LAT = '8.360179'; 
    const LON = '124.868653';
    const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`;

    try {
        const response = await fetch(URL);
        if (!response.ok) {
            throw new Error('Weather API failed to fetch data.');
        }
        const data = await response.json();
        
        // Store weather in localStorage
        localStorage.setItem("lastWeather", `${Math.round(data.main.temp)}°C | ${data.weather[0].description}`);

        displayWeatherSnapshot(data);
    } catch (error) {
        console.error("Error fetching weather:", error);
        document.getElementById('miniWeather').innerHTML = `
            <p>Could not load weather.</p>
            <p style="font-size: 0.8em;">Check API Key/URL in dashboard.js</p>`;
    }
}

function displayWeatherSnapshot(data) {
    const tempCelsius = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const location = data.name;

    const weatherHtml = `
        <div class="weather-content">
            <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}" class="weather-icon">
            <div class="weather-details">
                <h3>${location}</h3>
                <p class="temperature">${tempCelsius}°C</p>
                <p>${description.charAt(0).toUpperCase() + description.slice(1)}</p>
                <p class="detail-line">Humidity: ${data.main.humidity}%</p>
            </div>
        </div>
    `;

    document.getElementById('miniWeather').innerHTML = weatherHtml;
}