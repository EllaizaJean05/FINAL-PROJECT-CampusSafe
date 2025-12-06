(function () {
    // Utility to load/save user list
    function loadUsers() {
        return JSON.parse(localStorage.getItem("campus_users") || '[]');
    }
    function saveUsers(users) {
        localStorage.setItem("campus_users", JSON.stringify(users));
    }

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

    // --- LOGIN / REGISTER LOGIC — index.html ---
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    // Toggle forms
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });
    }
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        });
    }
    
    // REGISTER logic
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value.trim();

            if (username === "" || password === "") {
                alert("Please fill all fields.");
                return;
            }

            const users = loadUsers();
            if (users.some(u => u.username === username)) {
                alert("Username already exists. Please choose another.");
                return;
            }

            users.push({ username: username, password: password }); // Simple storage
            saveUsers(users);
            alert("Registration successful! You can now log in.");
            registerForm.reset();
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        });
    }

    // LOGIN logic
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            const users = loadUsers();
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                // Save user simple auth
                localStorage.setItem("campus_user", username);
                // Go to dashboard
                location.href = "dashboard.html";
            } else {
                alert("Login failed. Check username and password, or register first.");
            }
        });
    }

    // LOGOUT 
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