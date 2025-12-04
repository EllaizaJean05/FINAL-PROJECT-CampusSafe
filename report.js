function loadReportsTable() {
  const reports = JSON.parse(localStorage.getItem("reports") || "[]");
  const table = document.getElementById("reportsTable");

  table.innerHTML = `
    <tr><th>Type</th><th>Description</th><th>Date</th><th>Actions</th></tr>
    ${reports.map((r,i)=>`
      <tr>
        <td>${r.type}</td>
        <td>${r.desc}</td>
        <td>${r.date}</td>
        <td><button onclick="deleteReport(${i})">Delete</button></td>
      </tr>
    `).join("")}
  `;
}

document.getElementById("addReportBtn").addEventListener("click", () => {
  const type = document.getElementById("reportType").value;
  const desc = document.getElementById("reportDesc").value;

  addReport(type, desc);
});

function addReport(type, desc, lat=null, lng=null) {
  if (!type || !desc) return alert("Fill all fields");

  const reports = JSON.parse(localStorage.getItem("reports") || "[]");

  reports.push({
    type,
    desc,
    date: new Date().toLocaleString(),
    lat,
    lng
  });

  localStorage.setItem("reports", JSON.stringify(reports));

  loadReportsTable();
  loadDashboard();
}

function deleteReport(index) {
  const reports = JSON.parse(localStorage.getItem("reports") || "[]");
  reports.splice(index,1);
  localStorage.setItem("reports", JSON.stringify(reports));
  loadReportsTable();
  loadDashboard();
}
