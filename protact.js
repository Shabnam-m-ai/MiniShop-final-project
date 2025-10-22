// ========================
// 🔐 BLOCK ALL PAGES UNTIL LOGIN
// ========================
document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("loggedIn");
  const page = window.location.pathname.split("/").pop();

  // pages that require login
  const protectedPages = [
    "index.html",
    "about.html",
    "contact.html",
    "cart.html",
    "checkout.html"
  ];

  // if not logged in and page is protected → redirect to login
  if (!isLoggedIn && protectedPages.includes(page)) {
    window.location.href = "login.html";
  }

  // if already logged in but on login page → go to home
  if (isLoggedIn && page === "login.html") {
    window.location.href = "index.html";
  }
});