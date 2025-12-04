// ===== REGISTER =====
document.getElementById("regBtn").addEventListener("click", () => {
  const user = document.getElementById("regUser").value;
  const pass = document.getElementById("regPass").value;

  if (!user || !pass) return alert("Fill all fields");
  if (localStorage.getItem("user_" + user)) return alert("User already exists!");

  localStorage.setItem("user_" + user, JSON.stringify({
    username: user,
    password: pass,
    created: new Date().toLocaleString()
  }));

  alert("Account created! You may now login.");
  showSection("loginPage");
});

// ===== LOGIN =====
document.getElementById("loginBtn").addEventListener("click", () => {
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;

  const account = localStorage.getItem("user_" + user);
  if (!account) return alert("You need to register first before logging in.");

  const data = JSON.parse(account);
  if (data.password !== pass) return alert("Incorrect password!");

  localStorage.setItem("activeUser", user);

  showSection("dashboardPage");
  loadProfile();
  loadDashboard();
});