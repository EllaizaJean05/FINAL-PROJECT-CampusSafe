// --- main.js (Place this file in your root directory) ---

// Function to handle responsive menu toggle
function initializeMenuToggle() {
    // We use the IDs 'menuToggle' (the button) and 'navControls' (the menu container)
    const menuToggle = document.getElementById('menuToggle');
    const navControls = document.getElementById('navControls');

    if (menuToggle && navControls) {
        // 1. Toggle the 'open' class when the hamburger button is clicked
        menuToggle.addEventListener('click', function() {
            navControls.classList.toggle('open');
        });

        // 2. Close the menu if a navigation button is clicked on mobile
        const navButtons = navControls.querySelectorAll('button');
        navButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Check if the screen is small (less than 768px, matching your CSS breakpoint)
                if (window.innerWidth <= 768) {
                    navControls.classList.remove('open');
                }
            });
        });
    }
}

// Global function placeholder for logout (ensures the HTML onclick works)
function logout() {
    console.log("User logged out. Redirecting to index.html...");
    localStorage.removeItem("activeUser");
    window.location.href = "index.html";
    
    // Close menu after action (optional)
    const navControls = document.getElementById('navControls');
    if (navControls && window.innerWidth <= 768) {
        navControls.classList.remove('open');
    }
}

// Wait for the entire page to load before running the script
document.addEventListener('DOMContentLoaded', initializeMenuToggle);