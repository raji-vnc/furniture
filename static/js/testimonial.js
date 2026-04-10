const TESTIMONIAL_API_URL = "/api/testimonials/";
const TESTIMONIAL_FALLBACK_IMAGE = "/static/images/person-1.png";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatPosition(name, position) {
  if (name && position) return `${escapeHtml(name)} — ${escapeHtml(position)}`;
  if (name) return escapeHtml(name);
  return escapeHtml(position || "");
}

async function loadTestimonials() {
  const slider = document.querySelector(".testimonial-slider");
  const nav = document.getElementById("testimonial-nav");
  const status = document.getElementById("testimonial-status");

  if (!slider || !nav) return;
  if (status) status.textContent = "Loading…";

  try {
    const resp = await fetch(TESTIMONIAL_API_URL, { credentials: "include" });
    if (!resp.ok) throw new Error("Unable to load testimonials.");

    const data = await resp.json();
    const items = Array.isArray(data) ? data : data.results || [];

    if (!items.length) {
      slider.innerHTML = `<div class="item"><p class="text-muted mb-0">No testimonials yet.</p></div>`;
      nav.style.display = "none";
      if (status) status.textContent = "";
      return;
    }

    slider.innerHTML = items
      .map(
        (t) => `
        <div class="item">
          <div class="row justify-content-center">
            <div class="col-lg-8 mx-auto">
              <div class="testimonial-block text-center">
                <blockquote class="mb-4">
                  <p>${escapeHtml(t.feedback || "")}</p>
                </blockquote>
                <div class="author-info">
                  <div class="author-pic mb-2">
                    <img src="${t.image || TESTIMONIAL_FALLBACK_IMAGE}" alt="${escapeHtml(t.name || "Guest")}" class="img-fluid rounded-circle" style="max-width:96px;">
                  </div>
                  <h3 class="font-weight-bold mb-0">${escapeHtml(t.name || "Guest")}</h3>
                  <span class="position d-block mb-2">${escapeHtml(t.position || "")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>`
      )
      .join("");

    if (status) status.textContent = `${items.length} testimonial${items.length === 1 ? "" : "s"}`;

    // Initialize slider now that content exists
    if (window.initTestimonialSlider) {
      window.initTestimonialSlider();
    }
  } catch (err) {
    if (status) status.textContent = err.message;
    slider.innerHTML = `<div class="item"><p class="text-danger mb-0">Failed to load testimonials.</p></div>`;
    nav.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", loadTestimonials);
