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

async function loadBlogs() {
  const container = document.getElementById("blog-list");
  const status = document.getElementById("blog-status");
  if (!container) return;

  try {
    const response = await fetch(BLOG_API_URL, { credentials: "include" });
    if (!response.ok) {
      throw new Error("Unable to load blog posts right now.");
    }

    const data = await response.json();
    const blogs = Array.isArray(data) ? data : data.results || [];

    if (!blogs.length) {
      container.innerHTML = '<div class="col-12"><p class="text-muted">No blog posts available yet.</p></div>';
      status.textContent = "";
      return;
    }

    status.textContent = `${blogs.length} post${blogs.length === 1 ? "" : "s"} loaded`;
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
    status.textContent = error.message;
    container.innerHTML = '<div class="col-12"><p class="text-danger">Failed to load blog posts.</p></div>';
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

document.addEventListener("DOMContentLoaded", loadBlogs);
