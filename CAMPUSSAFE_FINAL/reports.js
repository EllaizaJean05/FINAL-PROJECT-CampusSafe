let reports = JSON.parse(localStorage.getItem("reports") || "[]");
let editIndex = -1;

function displayReports() {
  let table = document.getElementById("reportTable");
  table.innerHTML = "";

  reports.forEach((r, i) => {
    table.innerHTML += `
      <tr>
        <td>${i+1}</td>
        <td>${r.type}</td>
        <td>${r.desc}</td>
        <td><button onclick="editReport(${i})">✎</button></td>
        <td><button onclick="deleteReport(${i})">🗑</button></td>
      </tr>
    `;
  });
}

function showForm() {
  document.getElementById("formBox").style.display = "block";
}

function saveReport() {
  let type = document.getElementById("type").value;
  let desc = document.getElementById("desc").value;

  if (editIndex === -1) {
    reports.push({ type, desc });
  } else {
    reports[editIndex] = { type, desc };
    editIndex = -1;
  }

  localStorage.setItem("reports", JSON.stringify(reports));
  displayReports();
  document.getElementById("formBox").style.display = "none";
}

function editReport(i) {
  editIndex = i;
  document.getElementById("type").value = reports[i].type;
  document.getElementById("desc").value = reports[i].desc;
  showForm();
}

function deleteReport(i) {
  reports.splice(i, 1);
  localStorage.setItem("reports", JSON.stringify(reports));
  displayReports();
}

displayReports();
