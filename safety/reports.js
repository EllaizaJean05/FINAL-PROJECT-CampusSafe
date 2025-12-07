const user = localStorage.getItem("activeUser");
if (!user) { alert("Please login first."); window.location.href = "index.html"; }

document.addEventListener("DOMContentLoaded", () => {
    loadReportsTable();

    document.getElementById("addReportBtn")?.addEventListener("click", () => {
        const type = document.getElementById("reportType").value.trim();
        const desc = document.getElementById("reportDesc").value.trim();
        if (!type || !desc) return alert("Fill all fields");
        addReport(type, desc);
        document.getElementById("reportType").value = "";
        document.getElementById("reportDesc").value = "";
    });
});

function loadReportsTable() {
    const reports = JSON.parse(localStorage.getItem("reports_" + user) || "[]");
    const table = document.getElementById("reportsTable");
    table.innerHTML = `<tr><th>Type</th><th>Description</th><th>Date</th><th>Actions</th></tr>` +
        reports.map((r, i) => `
      <tr>
        <td>${r.type}</td>
        <td>${r.desc}</td>
        <td>${r.date}</td>
        <td><button onclick="deleteReport(${i})">Delete</button></td>
      </tr>`).join("");
}

function addReport(type, desc, lat = null, lng = null) {
    const reports = JSON.parse(localStorage.getItem("reports_" + user) || "[]");
    reports.push({ type, desc, date: new Date().toLocaleString(), lat, lng });
    localStorage.setItem("reports_" + user, JSON.stringify(reports));
    loadReportsTable();
    try { loadDashboard(); } catch (e) { }
}

function deleteReport(index) {
    const reports = JSON.parse(localStorage.getItem("reports_" + user) || "[]");
    localStorage.setItem("reports_" + user, JSON.stringify(reports));
    localStorage.setItem("reports_" + user, JSON.stringify(reports));
    loadReportsTable();
}

