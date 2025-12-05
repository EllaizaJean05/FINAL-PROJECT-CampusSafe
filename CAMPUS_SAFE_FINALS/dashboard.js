let reportsChart, timelineChart;

function loadDashboard() {
  const reports = JSON.parse(localStorage.getItem("reports") || "[]");

  // Mini weather box
  document.getElementById("miniWeather").innerText = 
    localStorage.getItem("lastWeather") || "No city searched yet.";

  // Recent reports
  const list = document.getElementById("recentReports");
  list.innerHTML = reports.slice(-5).reverse()
    .map(r => `<li>${r.type} – ${r.desc} (${r.date})</li>`)
    .join("");

  // Chart data
  const typeCount = {};
  const dates = [];

  reports.forEach(r => {
    typeCount[r.type] = (typeCount[r.type] || 0) + 1;
    dates.push(r.date);
  });

  // Reports by Type
  const ctx1 = document.getElementById("reportsChart");
  reportsChart?.destroy();
  reportsChart = new Chart(ctx1, {
    type: "bar",
    data: {
      labels: Object.keys(typeCount),
      datasets: [{ data: Object.values(typeCount) }]
    }
  });

  // Timeline Chart
  const ctx2 = document.getElementById("timelineChart");
  timelineChart?.destroy();
  timelineChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: dates.slice(-10),
      datasets: [{ data: dates.slice(-10).map((_,i)=>i+1) }]
    }
  });
}
