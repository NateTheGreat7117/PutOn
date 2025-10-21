import { showDropdown } from "./dropdown.js"
import { hideDropdownWithDelay } from "./dropdown.js"

const params = new URLSearchParams(window.location.search);
const msg = params.get('msg');
const messageElement = document.querySelector(".message");

if (messageElement) {
if (msg === 'registered') messageElement.textContent = "✅ Account created! You can log in now.";
else if (msg === 'userexists') messageElement.textContent = "⚠️ That username already exists.";
else if (msg === 'invalid') messageElement.textContent = "❌ Invalid username or password.";
}

// --- Check if user is logged in ---
document.addEventListener("base:ready", async() => {
    fetch("/check-login", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
        if (data.loggedIn) {
            // Prevent dropdown from appearing on hover
            console.log("Logged in");
            const userButton = document.getElementById('header-user-button');
            userButton.removeEventListener("mouseenter", showDropdown);
            userButton.removeEventListener("mouseleave", hideDropdownWithDelay);
            userButton.addEventListener("click", function() {
                window.location.href = "/pages/account-settings.html";
            });
            userButton.addEventListener("mouseenter", () => {
                userButton.style.transform = 'scale(1.3)';
                userButton.style.paddingTop = '0';
                userButton.style.paddingBottom = '0';
            })
            userButton.addEventListener("mouseleave", () => {
                userButton.style.transform = 'scale(1)';
            })
        } else {
            console.log("Don't welcome back");
        }
    })
    .catch(err => console.error("check-login failed:", err));
})