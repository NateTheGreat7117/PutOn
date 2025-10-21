export async function initSignup() {
  // Insert html
  const response = await fetch('/components/modals/account-set-up.html');
  const html = await response.text();
  document.getElementById('create-account-page-placeholder').innerHTML = html;

  const script = document.createElement("script");
  script.src = "/assets/js/components/setup-account.js";
  script.type = "module";
  document.body.appendChild(script);


  // Set up signup page
  const createAccountButton = document.querySelector(".create-account");
  const overlay = document.querySelector(".overlay");
  const sidebar = document.querySelector(".create-account-page");
  const closeButton = document.querySelector(".close-page");
  const dropdown = document.querySelector('.dropdown-menu');
  const userButton = document.getElementById('header-user-button');

  if (!createAccountButton || !overlay || !sidebar || !closeButton) return;

  createAccountButton.addEventListener("click", () => {
    overlay.style.display = "block";
    sidebar.style.display = "block";
    dropdown.style.display = 'none';
    userButton.style.transform = 'scale(1)';
  });

  overlay.addEventListener("click", closeSidebar);
  closeButton.addEventListener("click", closeSidebar);

  function closeSidebar() {
    overlay.style.display = "none";
    sidebar.style.display = "none";
  }
}
