function loadProfile() {
  const user = localStorage.getItem("activeUser");
  const data = JSON.parse(localStorage.getItem("user_" + user));

  document.getElementById("profileUser").innerText = data.username;
  document.getElementById("profileSince").innerText = data.created;
}

// Export JSON
function exportReports() {
  const data = localStorage.getItem("reports") || "[]";
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "reports.json";
  a.click();
}

// Load sample data
function importSample() {
  localStorage.setItem("reports", JSON.stringify([
    { type: "Fire", desc: "Small fire near library", date: "2025-01-01" }
  ]));

  loadReportsTable();
  loadDashboard();
}
