function login() {
  let user = document.getElementById("username").value;
  let pass = document.getElementById("password").value;

  if (user === "" || pass === "") {
    alert("Please enter login details.");
    return;
  }

  localStorage.setItem("loggedInUser", user);
  window.location.href = "dashboard.html";
}
