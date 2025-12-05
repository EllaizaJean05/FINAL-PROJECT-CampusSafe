// ===== GLOBAL FUNCTIONS =====

// Show page/section
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  // Show top bar on all pages except login/register
  const topbar = document.getElementById("topbar");
  if (id === "loginPage" || id === "registerPage") {
    topbar.classList.add("hidden");
  } else {
    topbar.classList.remove("hidden");
  }
}

// Dark Mode
document.getElementById("darkToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

// Load dark mode preference
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}
