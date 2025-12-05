/* auth.js — simplified working login/logout system */

(function () {

    // pages that require login
    const protectedPages = ['dashboard.html', 'weather.html', 'map.html', 'reports.html', 'about.html'];

    function getPath() {
        const path = location.pathname.split('/').pop();
        return path || 'index.html';
    }

    // Check if logged in
    function isAuthenticated() {
        return !!localStorage.getItem("campus_user");
    }

    // Redirect to login if not authenticated
    const current = getPath();
    if (protectedPages.includes(current) && !isAuthenticated()) {
        location.href = 'index.html';
    }

    // LOGIN — index.html
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (username === "" || password === "") {
                alert("Please enter both username and password.");
                return;
            }

            // Save user simple auth
            localStorage.setItem("campus_user", username);

            // Go to dashboard
            location.href = "dashboard.html";
        });
    }

    // LOGOUT — any page with #logoutBtn
    document.querySelectorAll('#logoutBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.removeItem("campus_user");
            location.href = 'index.html';
        });
    });

    // Show logged-in username if element exists
    const userLabel = document.getElementById('userLabel');
    if (userLabel) {
        userLabel.textContent = localStorage.getItem("campus_user") || "Student";
    }

    // CLOCK
    const clock = document.getElementById('clock');
    if (clock) {
        function updateClock() {
            const now = new Date();
            const hh = now.getHours().toString().padStart(2, '0');
            const mm = now.getMinutes().toString().padStart(2, '0');
            clock.textContent = `${hh}:${mm}`;
        }
        updateClock();
        setInterval(updateClock, 60000);
    }

})();
