// --- main.js content ---

// Function to handle responsive menu toggle
function initializeMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const navControls = document.getElementById('navControls');

    if (menuToggle && navControls) {
        // Toggle the 'open' class when the hamburger button is clicked
        menuToggle.addEventListener('click', function() {
            navControls.classList.toggle('open');
        });

        // Close the menu if a navigation button is clicked on mobile
        const navButtons = navControls.querySelectorAll('button');
        navButtons.forEach(button => {
            button.addEventListener('click', function() {
                // We check window.innerWidth to ensure this only happens on mobile screens
                if (window.innerWidth <= 768) {
                    navControls.classList.remove('open');
                }
            });
        });
    }
}

// Global function placeholder for logout (to prevent errors in HTML)
function logout() {
    console.log("User logged out. Insert actual logout logic here.");
    
    // Close menu after action (optional)
    const navControls = document.getElementById('navControls');
    if (navControls && window.innerWidth <= 768) {
        navControls.classList.remove('open');
    }
}


// Wait for the entire page to load before running the script
document.addEventListener('DOMContentLoaded', initializeMenuToggle);