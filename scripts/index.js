// Simulate login redirect
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    window.location.href = '/feed/index.html';
  });
}

// Simulate register redirect
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    window.location.href = '/feed/index.html';
  });
}
