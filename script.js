/* ====================================================
   Final unified script.js
   - Require login for protected pages
   - Login handling (localStorage)
   - Logout handling (loginLink or logoutBtn)
   - Dark mode toggle (persist)
   - Cart system (localStorage)
   - Fetch products from data/products.json if used
   - Welcome message
   ==================================================== */
// 🔒 BLOCK ACCESS BEFORE LOGIN
document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("loggedIn");
  const currentPage = window.location.pathname.split("/").pop();

  // اگر لاگن نکرده، فقط login.html را اجازه بده
  if (!isLoggedIn && currentPage !== "login.html") {
    window.location.href = "login.html";
  }

  // اگر لاگن کرده و روی login.html رفت، بفرست به index.html
  if (isLoggedIn && currentPage === "login.html") {
    window.location.href = "index.html";
  }
});
/* ---------- UTIL ------- */
function isProtectedPage(pageName) {
  const protectedPages = ["index.html", "about.html", "contact.html", "cart.html", "checkout.html"];
  return protectedPages.includes(pageName);
}
function getCurrentPage() {
  return window.location.pathname.split("/").pop();
}

/* ---------- ACCESS CONTROL: block pages before login ---------- */
document.addEventListener("DOMContentLoaded", function () {
  try {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const currentPage = getCurrentPage();

    // If not logged in and trying to open a protected page -> go to login
    if (!isLoggedIn && isProtectedPage(currentPage)) {
      // If we are already on login.html do nothing
      if (currentPage !== "login.html") {
        window.location.href = "login.html";
        return; // stop further running on protected pages before redirect
      }
    }

    // If logged in and on login page -> forward to index
    if (isLoggedIn && currentPage === "login.html") {
      window.location.href = "index.html";
      return;
    }
  } catch (e) {
    console.error("Access control init error:", e);
  }
});

/* ---------- LOGIN HANDLING (expects form with id="loginForm", inputs id="username" & id="password") ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const usernameInput = document.getElementById("username");
      const passwordInput = document.getElementById("password");
      const username = usernameInput ? usernameInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value.trim() : "";

      // basic validation
      if (!username || !password) {
        // use bootstrap validation style if present
        loginForm.classList.add("was-validated");
        return;
      }

      // demo credential check (change as needed)
      if (username === "admin" && password === "12345") {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("username", username);
        // convert any login link to logout immediately (UI feedback)
        convertLoginLinkToLogout();
        // redirect to index
        window.location.href = "index.html";
      } else {
        // show inline message if available, else alert
        const msgEl = document.getElementById("message") || document.getElementById("loginMessage");
        if (msgEl) msgEl.textContent = "❌ Invalid username or password!";
        else alert("❌ Invalid username or password!");
      }
    });
  }
});

/* ---------- LOGOUT HANDLING ---------- */
function performLogout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("username");
  // optional: remove cart? keep cart usually. If you want to clear cart uncomment:
  // localStorage.removeItem("cart");
  // redirect to login
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  // If there's a dedicated logout button with id logoutBtn or logout
  const logoutBtn = document.getElementById("logoutBtn") || document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      performLogout();
    });
  }

  // If navbar contains an <a id="loginLink">Login</a>, convert it to Logout when logged in
  convertLoginLinkToLogout();
});

function convertLoginLinkToLogout() {
  const loginLink = document.getElementById("loginLink");
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";
  if (!loginLink) return;
  if (isLoggedIn) {
    // change link to logout behavior
    loginLink.textContent = "Logout";
    loginLink.href = "#";
    loginLink.classList.remove("nav-link");
    loginLink.classList.add("btn", "btn-outline-danger", "ms-3");
    loginLink.addEventListener("click", function (e) {
      e.preventDefault();
      performLogout();
    });
  } else {
    // ensure it points to login
    loginLink.textContent = "Login";
    loginLink.href = "login.html";
    // restore classes if needed
    loginLink.classList.remove("btn", "btn-outline-danger", "ms-3");
    loginLink.classList.add("nav-link");
  }
}

/* ---------- DARK MODE TOGGLE ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("theme-toggle");
  // apply saved theme immediately (if page reloaded)
  try {
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
      if (themeToggle) themeToggle.textContent = "☀️ Light";
    } else {
      if (themeToggle) themeToggle.textContent = "🌙 Dark";
    }
  } catch (e) {
    console.warn("theme apply error", e);
  }

  if (!themeToggle) return;
  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggle.textContent = isDark ? "☀️ Light" : "🌙 Dark";
  });
});

/* ---------- CART SYSTEM ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const cartCount = document.getElementById("cart-count");
  const cartItemsContainer = document.getElementById("cartItems");
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  // Attach add-to-cart for product buttons (class btn-primary on product cards)
  const addToCartBtns = document.querySelectorAll(".product-card .btn-primary, .btn-add-to-cart");
  addToCartBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const card = btn.closest(".product-card");
      if (!card) return;
      const nameEl = card.querySelector(".card-title");
      const priceEl = card.querySelector(".card-text");
      const name = nameEl ? nameEl.textContent.trim() : "Product";
      const price = priceEl ? priceEl.textContent.trim() : "$0.00";
      cart.push({ name, price });
      localStorage.setItem("cart", JSON.stringify(cart));
      if (cartCount) cartCount.textContent = cart.length;
      // small UI feedback
      btn.blur();
      const prevText = btn.textContent;
      btn.textContent = "Added ✓";
      setTimeout(() => (btn.textContent = prevText), 800);
    });
  });

  // Update cart count on load
  if (cartCount) cartCount.textContent = cart.length;

  // Render cart items on cart.html
  if (cartItemsContainer) {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Your cart is empty 🛍</p>";
    } else {
      cartItemsContainer.innerHTML = cart
        .map(
          (item, index) => `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span>${item.name} — <strong>${item.price}</strong></span>
          <button class="btn btn-sm btn-danger remove-btn" data-index="${index}">Remove</button>
        </div>`
        )
        .join("");
      // wire remove buttons
      cartItemsContainer.querySelectorAll(".remove-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const idx = parseInt(btn.dataset.index, 10);
          if (!Number.isNaN(idx)) {
            cart.splice(idx, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            window.location.reload();
          }
        });
      });
    }
  }
});

/* ---------- CHECKOUT ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // could add validation here
      alert("🎉 Your order has been placed successfully!");
      localStorage.removeItem("cart");
      window.location.href = "index.html";
    });
  }
});

/* ---------- CONTACT FORM ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      alert("📨 Message sent successfully! We'll get back to you soon.");
      contactForm.reset();
    });
  }
});

/* ---------- FETCH PRODUCTS FROM JSON (optional) ---------- */
document.addEventListener("DOMContentLoaded", function () {
  try {
    const productContainer = document.querySelector(".row.g-4[data-source='json']");
    if (productContainer) {
      fetch("data/products.json")
        .then((res) => res.json())
        .then((data) => {
          productContainer.innerHTML = data
            .map(
              (p) => `
            <div class="col-md-4">
              <div class="card product-card h-100">
                <img src="${p.image}" class="card-img-top" alt="${p.name}">
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">${p.name}</h5>
                  <p class="card-text text-muted flex-grow-1">${p.price}</p>
                  <button class="btn btn-primary mt-auto">Add to Cart</button>
                </div>
              </div>
            </div>`
            )
            .join("");
        })
        .catch((err) => console.error("Failed to fetch products.json", err));
    }
  } catch (e) {
    console.error("Fetch JSON error", e);
  }
});

/* ---------- WELCOME MESSAGE (on index.html) ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const username = localStorage.getItem("username");
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";
  const currentPage = getCurrentPage();

  if (currentPage === "index.html" && isLoggedIn && username) {
    const welcomeMsg = document.createElement("div");
    welcomeMsg.className = "alert alert-info text-center fade-in";
    welcomeMsg.style.marginTop = "20px";
    welcomeMsg.innerHTML = '👋 Welcome back, <strong>${username}</strong>! We’re happy to see you again!;'

    const mainContainer = document.querySelector("main") || document.body;
    mainContainer.prepend(welcomeMsg);

    setTimeout(() => {
      welcomeMsg.style.transition = "opacity 1s ease";
      welcomeMsg.style.opacity = "0";
      setTimeout(() => welcomeMsg.remove(), 1000);
    }, 5000);
  }
});
// ========================
// 🚪 LOGOUT FUNCTIONALITY
// ========================
document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("username");
      alert("👋 You have been logged out successfully!");
      window.location.href = "login.html";
    });
  }
});

// ==== Animate elements when scrolling into view ====
document.addEventListener("DOMContentLoaded", () => {
  const fadeElements = document.querySelectorAll(".fade-in-on-scroll");

  const appearOnScroll = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  fadeElements.forEach(el => {
    appearOnScroll.observe(el);
  });
});
