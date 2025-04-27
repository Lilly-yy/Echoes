// Simulate login redirect
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (email === "adventure@echoes.com" && password === "naturelover") {
      // Successful fake login
      localStorage.setItem("selectedUsername", "adventureseeker");
      window.location.href = "/feed/index.html";
    } else {
      // Show error nicely
      loginError.textContent = "Incorrect email or password. Please try again.";
      loginError.classList.remove("hidden");
    }
  });
}

// Simulate register redirect
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    window.location.href = "/feed/index.html";
  });
}

// Toggle between Login and Register
const showRegisterLink = document.getElementById("showRegister");
const showLoginLink = document.getElementById("showLogin");
const loginSection = document.getElementById("loginForm").closest("section");
const registerSection = document.getElementById("registerSection");

if (showRegisterLink && showLoginLink && loginSection && registerSection) {
  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginSection.classList.add("hidden");
    registerSection.classList.remove("hidden");
  });

  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    registerSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
  });
}
