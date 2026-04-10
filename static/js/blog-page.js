const BLOG_API_URL = "/api/blogs/blogs/";
const BLOG_FALLBACK_IMAGE = "/static/images/post-1.jpg";

function formatBlogDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
}

function truncateText(value, maxLength = 140) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

function getAccessToken() {
  return localStorage.getItem("access") || "";
}

function setStatus(elementId, message, isError = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = isError ? "text-danger small mb-0" : "text-muted small mb-0";
}

async function loadBlogs() {
  const container = document.getElementById("blog-list");
  const status = document.getElementById("blog-status");
  if (!container) return;

  setStatus("blog-status", "Loading...");

  try {
    const response = await fetch(BLOG_API_URL, { credentials: "include" });
    if (!response.ok) {
      throw new Error("Unable to load blog posts right now.");
    }

    const data = await response.json();
    const blogs = Array.isArray(data) ? data : data.results || [];

    if (!blogs.length) {
      container.innerHTML = '<div class="col-12"><p class="text-muted mb-0">No blog posts yet. Be the first to publish.</p></div>';
      setStatus("blog-status", "");
      return;
    }

    setStatus("blog-status", `${blogs.length} post${blogs.length === 1 ? "" : "s"} loaded`);
    container.innerHTML = blogs
      .map(
        (blog) => `
          <div class="col-12 col-sm-6 col-md-4 mb-5">
            <div class="post-entry">
              <a href="#" class="post-thumbnail">
                <img src="${blog.image || BLOG_FALLBACK_IMAGE}" alt="${escapeHtml(blog.title || "Blog post")}" class="img-fluid">
              </a>
              <div class="post-content-entry">
                <h3><a href="#">${escapeHtml(blog.title || "Untitled")}</a></h3>
                <p>${escapeHtml(truncateText(blog.content))}</p>
                <div class="meta">
                  <span>by <a href="#">${escapeHtml(blog.author || "Furni")}</a></span>
                  <span>on <a href="#">${escapeHtml(formatBlogDate(blog.created_at))}</a></span>
                </div>
              </div>
            </div>
          </div>
        `,
      )
      .join("");
  } catch (error) {
    setStatus("blog-status", error.message, true);
    container.innerHTML = '<div class="col-12"><p class="text-danger">Failed to load blog posts.</p></div>';
  }
}

async function submitBlog(event) {
  event.preventDefault();
  const token = getAccessToken();
  if (!token) {
    setStatus("blog-create-status", "Please sign in to post a blog.", true);
    return;
  }

  const title = document.getElementById("blog-title")?.value.trim();
  const content = document.getElementById("blog-content")?.value.trim();

  if (!title || !content) {
    setStatus("blog-create-status", "Title and content are required.", true);
    return;
  }

  setStatus("blog-create-status", "Posting...");

  try {
    const response = await fetch(BLOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || "Unable to publish blog right now.");
    }

    document.getElementById("blog-form").reset();
    setStatus("blog-create-status", "Blog published!");
    await loadBlogs();
  } catch (error) {
    setStatus("blog-create-status", error.message || "Unable to publish blog.", true);
  }
}

function toggleCreateSection() {
  const card = document.getElementById("blog-create-card");
  if (!card) return;
  const token = getAccessToken();
  card.style.display = token ? "block" : "none";
  if (!token) {
    setStatus("blog-create-status", "Sign in to publish your own posts.");
  } else {
    setStatus("blog-create-status", "");
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

document.addEventListener("DOMContentLoaded", () => {
  loadBlogs();
  toggleCreateSection();
  const form = document.getElementById("blog-form");
  if (form) {
    form.addEventListener("submit", submitBlog);
  }
});
