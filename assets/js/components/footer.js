// assets/js/components/footer.js
export async function loadFooter() {
  const response = await fetch("/components/footer.html");
  const html = await response.text();
  document.getElementById("footer-placeholder").innerHTML = html;
}