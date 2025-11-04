function switchTab(event, tab) {
    // Remove active class from all buttons
    document.querySelectorAll('.posts-toggle button').forEach(btn => {
    btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // In a real app, you would load different content here
    console.log('Switched to:', tab);
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.querySelector(".logout-button");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const response = await fetch("http://localhost:3000/logout", {
          method: "POST",
          credentials: "include", // important: send session cookie
        });

        const data = await response.json();

        if (data.success) {
          console.log("✅ Logged out successfully");
          // Redirect to sign-in or home page
          window.location.href = "/pages/homepage.html";
        } else {
          console.error("❌ Logout failed:", data.message);
          alert("Logout failed. Try again.");
        }
      } catch (err) {
        console.error("Error during logout:", err);
        alert("Error during logout. Please try again.");
      }
    });
  }

  const addPost = document.querySelector(".add-post");

  if (addPost) {
    addPost.addEventListener("click", async () => {
      window.href = "/pages/new-post.html";
    })
  }

  const saveButton = document.querySelector(".save-button");
  if (saveButton) {
    saveButton.addEventListener("click", async () => {
      const name = document.getElementById("display-name-input").value.trim();
      const username = document.getElementById("display-username-input").value.trim();
      try {
        const res = await fetch("/update-user", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, username }),
        });

        const data = await res.json();

        if (data.success) {
          document.querySelector(".profile-name").textContent = name;
          document.querySelector(".profile-username").textContent = username;
        } else {
          // Failed
        }
      } catch (err) {
        console.error("Error updating user:", err);
        // Server error
      }
    });
  }
});