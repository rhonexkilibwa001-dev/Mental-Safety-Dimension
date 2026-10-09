const resourceList = document.getElementById("resourceList");
const postList = document.getElementById("postList");
const postForm = document.getElementById("postForm");
const checkinForm = document.getElementById("checkinForm");
const contactForm = document.getElementById("contactForm");

async function fetchAPI(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

async function loadResources() {
  try {
    const resources = await fetchAPI("/api/resources");
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
    const posts = await fetchAPI("/api/posts");
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

  const formData = new FormData(postForm);
  const body = {
    name: formData.get("name"),
    title: formData.get("title"),
    content: formData.get("content")
  };

  try {
    await fetchAPI("/api/posts", {
      method: "POST",
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

  const formData = new FormData(checkinForm);
  const body = {
    mood: formData.get("mood"),
    note: formData.get("note")
  };

  try {
    const result = await fetchAPI("/api/checkins", {
      method: "POST",
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
  loadResources();
  loadPosts();
});
