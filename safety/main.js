// main.js - common functions

// FIX: NEW function to toggle the mobile menu
function toggleMenu() {
    const controls = document.getElementById('navControls');
    controls.classList.toggle('open');
}

function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id)?.classList.remove("hidden");
}

function logout() {
  localStorage.removeItem("activeUser");
  window.location.href = "index.html";
}
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initCharts();
    populateRecentReports();
    
    // Call the alert function here:
    updateSafetyAlert('active', 'Shelter in place due to campus security incident near Building A.');
});
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initCharts();
    populateRecentReports();
    updateSafetyAlert('none', 'All systems normal.'); // Set initial state
    
    // Call the weather function:
    fetchWeatherSnapshot(); 
});