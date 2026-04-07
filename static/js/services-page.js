const TESTIMONIALS_API_URL = "/api/testimonials/";
const TESTIMONIAL_FALLBACK_IMAGE = "/static/images/person-1.png";

async function loadTestimonials() {
  const container = document.getElementById("services-testimonials");
  const status = document.getElementById("services-status");
  if (!container) return;

  try {
    const response = await fetch(TESTIMONIALS_API_URL, { credentials: "include" });
    if (!response.ok) {
      throw new Error("Unable to load testimonials right now.");
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : data.results || [];

    if (!items.length) {
      status.textContent = "";
      container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No testimonials available yet.</p></div>';
      return;
    }

    status.textContent = `${items.length} customer review${items.length === 1 ? "" : "s"}`;
    container.innerHTML = items
      .map(
        (item) => `
          <div class="col-md-6 col-lg-4 mb-4">
            <div class="testimonial-block text-center h-100 p-4 border rounded">
              <blockquote class="mb-4">
                <p>&ldquo;${escapeHtml(item.feedback || "")}&rdquo;</p>
              </blockquote>
              <div class="author-info">
                <div class="author-pic mb-3">
                  <img src="${item.image || TESTIMONIAL_FALLBACK_IMAGE}" alt="${escapeHtml(item.name || "Customer")}" class="img-fluid" style="width:72px;height:72px;border-radius:50%;object-fit:cover;">
                </div>
                <h3 class="font-weight-bold">${escapeHtml(item.name || "Customer")}</h3>
                <span class="position d-block mb-3">${escapeHtml(item.position || "")}</span>
              </div>
            </div>
          </div>
        `,
      )
      .join("");
  } catch (error) {
    status.textContent = error.message;
    container.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Failed to load testimonials.</p></div>';
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

document.addEventListener("DOMContentLoaded", loadTestimonials);
