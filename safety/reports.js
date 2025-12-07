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

// --- CORE FUNCTIONS ---

// Function to load and render the reports table
function loadReportsTable() {
    const reports = JSON.parse(localStorage.getItem("reports_" + user) || "[]");
    const table = document.getElementById("reportsTable");
    
    // FIX: Added Status column header
    table.innerHTML = `<tr><th>Type</th><th>Description</th><th>Date</th><th>Status</th><th>Actions</th></tr>` +
        reports.map((r, i) => {
            // FIX: Retrieve or default the status
            const status = r.status || 'Pending';
            let statusClass = (status === 'Pending') ? 'status-pending' : 'status-completed';
            
            // FIX: ADDED DONE button logic (disabled if completed)
            const actionButtons = status === 'Completed'
                ? `<button class="btn-done" disabled>DONE</button>`
                : `<button onclick="markReportDone(${i})" class="btn-done">DONE</button>`;
                
            return `
            <tr>
                <td>${r.type}</td>
                <td>${r.desc}</td>
                <td>${r.date}</td>
                <td class="${statusClass}"><strong>${status}</strong></td>
                <td>
                    ${actionButtons}
                    <button onclick="confirmDeleteReport(${i})" class="btn-delete">DELETE</button>
                </td>
            </tr>`;
        }).join("");
}

function addReport(type, desc, lat = null, lng = null) {
    const reports = JSON.parse(localStorage.getItem("reports_" + user) || "[]");
    // FIX: ADDED Initial status of "Pending"
    reports.push({ type, desc, date: new Date().toLocaleString(), lat, lng, status: "Pending" }); 
    localStorage.setItem("reports_" + user, JSON.stringify(reports));
    loadReportsTable();
    try { loadDashboard(); } catch (e) { }
}

// FIX: DELETE Button Logic with Confirmation
function confirmDeleteReport(index) {
    if (confirm("Are you sure you want to permanently delete this report? This action cannot be undone.")) {
        deleteReport(index);
    }
}

// FIX: The actual delete logic
function deleteReport(index) {
    let reports = JSON.parse(localStorage.getItem("reports_" + user) || "[]");
    reports.splice(index, 1); // Remove report at specific index
    localStorage.setItem("reports_" + user, JSON.stringify(reports));
    loadReportsTable();
    try { loadDashboard(); } catch (e) { } // Update dashboard
}

// FIX: ADDED DONE Button Logic
function markReportDone(index) {
    let reports = JSON.parse(localStorage.getItem("reports_" + user) || "[]");
    reports[index].status = "Completed"; // Update status property
    localStorage.setItem("reports_" + user, JSON.stringify(reports));
    loadReportsTable();
    try { loadDashboard(); } catch (e) { } // Update dashboard
}