import { loadHeader } from "../components/header.js";
import { initDropdown } from "../components/dropdown.js";
import { initSignup } from "../components/signup.js";
import { loadFooter } from "../components/footer.js";

async function safeRun(fn, name) {
  try {
    await fn();
  } catch (err) {}
}

async function initPage() {
  await safeRun(loadHeader, "loadHeader");
  await safeRun(initDropdown, "initDropdown");
  await safeRun(initSignup, "initSignup");
  await safeRun(loadFooter, "loadFooter");
}

initPage();
