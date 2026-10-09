const resourceList = document.getElementById("resourceList");
const postList = document.getElementById("postList");
const postForm = document.getElementById("postForm");
const checkinForm = document.getElementById("checkinForm");
const contactForm = document.getElementById("contactForm");
const guestView = document.getElementById("guestView");
const userView = document.getElementById("userView");
const welcomeEmail = document.getElementById("welcomeEmail");
const headerAuthButton = document.getElementById("headerAuthButton");
const logoutBtn = document.getElementById("logoutBtn");

const STORAGE_KEY = "mental_safety_token";
const USER_KEY = "mental_safety_user";

function getToken() {
  return localStorage.getItem(STORAGE_KEY);
}

function setToken(token) {
  if (token) localStorage.setItem(STORAGE_KEY, token);
  else localStorage.removeItem(STORAGE_KEY);
}

function setUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

async function fetchAPI(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

function renderAuthState(user) {
  const isLoggedIn = Boolean(user);
  guestView.classList.toggle("hidden", isLoggedIn);
  userView.classList.toggle("hidden", !isLoggedIn);

  if (isLoggedIn) {
    welcomeEmail.textContent = user.email;
    headerAuthButton.textContent = "Logged in";
    headerAuthButton.disabled = true;
  } else {
    headerAuthButton.textContent = "Create Account";
    headerAuthButton.disabled = false;
  }
}

async function restoreSession() {
  const token = getToken();
  if (!token) {
    renderAuthState(null);
    return;
  }

  try {
    const data = await fetchAPI("/api/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setUser(data.user);
    renderAuthState(data.user);
  } catch (error) {
    console.error("Failed to restore session:", error);
    setToken(null);
    setUser(null);
    renderAuthState(null);
  }
}

async function signupUser(event) {
  event.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  try {
    const data = await fetchAPI("/api/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });

    setToken(data.token);
    setUser(data.user);
    renderAuthState(data.user);
    document.getElementById("signupForm").reset();
    alert("Account created successfully.");
  } catch (error) {
    alert(error.message);
  }
}

async function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const data = await fetchAPI("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    setToken(data.token);
    setUser(data.user);
    renderAuthState(data.user);
    document.getElementById("loginForm").reset();
    alert("Login successful.");
  } catch (error) {
    alert(error.message);
  }
}

async function logoutUser() {
  const token = getToken();

  if (!token) {
    setUser(null);
    renderAuthState(null);
    return;
  }

  try {
    await fetchAPI("/api/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error("Logout warning:", error);
  }

  setToken(null);
  setUser(null);
  renderAuthState(null);
}

function switchAuthTab(targetId) {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.target === targetId);
  });

  document.querySelectorAll(".auth-form").forEach((form) => {
    form.classList.toggle("active", form.id === targetId);
  });
}

headerAuthButton.addEventListener("click", () => {
  if (getUser()) return;
  document.getElementById("signupForm").scrollIntoView({ behavior: "smooth", block: "center" });
  switchAuthTab("signupForm");
});

logoutBtn.addEventListener("click", logoutUser);

document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => switchAuthTab(button.dataset.target));
});

document.getElementById("signupForm").addEventListener("submit", signupUser);
document.getElementById("loginForm").addEventListener("submit", loginUser);

async function fetchAPIWithoutAuth(url, options) {
  return fetchAPI(url, options);
}

async function loadResources() {
  try {
    const resources = await fetchAPIWithoutAuth("/api/resources");
    renderResources(resources);
  } catch (error) {
    console.error("Error loading resources:", error);
    resourceList.innerHTML =
      "<p class='error'>We could not load wellbeing resources right now.</p>";
  }
}

function renderResources(resources) {
  resourceList.innerHTML = resources
    .map(
      (resource) => `
        <article class="resource-card">
          <span class="resource-type">${resource.category}</span>
          <h3>${resource.title}</h3>
          <p>${resource.description}</p>
          <a href="${resource.link}" target="_blank" rel="noreferrer">Explore resource</a>
        </article>
      `
    )
    .join("");
}

async function loadPosts() {
  try {
    const posts = await fetchAPIWithoutAuth("/api/posts");
    renderPosts(posts);
  } catch (error) {
    console.error("Error loading posts:", error);
    postList.innerHTML =
      "<p class='error'>Community posts are temporarily unavailable.</p>";
  }
}

function renderPosts(posts) {
  if (!posts || posts.length === 0) {
    postList.innerHTML = "<p class='empty'>No posts yet — be the first to share.</p>";
    return;
  }

  postList.innerHTML = posts
    .map(
      (post) => `
        <article class="post-item">
          <div class="post-head">
            <h3>${post.title}</h3>
            <span class="post-author">${post.name}</span>
          </div>
          <p>${post.content}</p>
        </article>
      `
    )
    .join("");
}

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const token = getToken();
  if (!token) {
    alert("Please log in to post to the community.");
    switchAuthTab("loginForm");
    return;
  }

  const formData = new FormData(postForm);
  const body = {
    title: formData.get("title"),
    content: formData.get("content")
  };

  try {
    await fetchAPI("/api/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    postForm.reset();
    await loadPosts();
  } catch (error) {
    alert(error.message);
  }
});

checkinForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const token = getToken();
  if (!token) {
    alert("Please log in to save your check-in.");
    switchAuthTab("loginForm");
    return;
  }

  const formData = new FormData(checkinForm);
  const body = {
    mood: formData.get("mood"),
    note: formData.get("note")
  };

  try {
    const result = await fetchAPI("/api/checkins", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    alert(result.message);
    checkinForm.reset();
  } catch (error) {
    alert(error.message);
  }
});

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const body = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message")
  };

  try {
    const result = await fetchAPI("/api/contact", {
      method: "POST",
      body: JSON.stringify(body)
    });

    alert(result.message);
    contactForm.reset();
  } catch (error) {
    alert(error.message);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const existingUser = getUser();
  renderAuthState(existingUser);
  loadResources();
  loadPosts();
  restoreSession();
});
