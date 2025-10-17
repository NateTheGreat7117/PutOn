// Switch setting
const setting_headers = document.querySelectorAll(".option-container");
const setting_pages = document.querySelectorAll(".setting-page");

setting_pages.forEach(h => h.classList.add("hidden"));
setting_pages[0].classList.remove("hidden");

setting_headers.forEach((header, index) => {
    header.addEventListener("click", function () {
        setting_headers.forEach(h => h.classList.remove("active"));
        header.classList.add("active");

        setting_pages.forEach(p => p.classList.add("hidden"));
        setting_pages[index].classList.remove("hidden");
    });
})

// Logout
const logout = document.getElementById("logout-button");
console.log(logout);

logout.addEventListener("click", async () => {
    console.log("Logout clicked");
    const response = await fetch("/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    if (result.success) {
    window.location.href = "/"; // redirect to homepage or login page
    }
});
