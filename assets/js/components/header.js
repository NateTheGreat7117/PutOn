export async function loadHeader() {
  const response = await fetch('/components/header.html');
  const html = await response.text();
  document.getElementById('header-placeholder').innerHTML = html;

  // --- Switch Pages ---
  const headerButtons = document.querySelectorAll(".new-page-button");
  const pages = [
    "homepage.html",
    "explore.html",
    "build-outfit.html",
    "virtual-wardrobe.html",
    "wishlist.html",
    "find-item.html",
    "sales-discounts.html"
  ];

  headerButtons.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      window.location.href = `/pages/${pages[i]}`;
    });
  });
}