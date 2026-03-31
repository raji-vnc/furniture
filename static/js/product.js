const API_URL = "/api/products/products/";
const CART_ADD_URL = "/api/cart/add/";
const CART_ITEMS_URL = "/api/cart/cartitems/";

function getCookie(name) {
  let cookieValue = null;

  if (document.cookie && document.cookie !== "") {
    document.cookie.split(";").forEach((cookie) => {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(`${name}=`)) {
        cookieValue = decodeURIComponent(trimmed.substring(name.length + 1));
      }
    });
  }

  return cookieValue;
}

function getCartLink() {
  return document.querySelector('a[href*="/cart/cart/"], a[href*="/cart/"]');
}

function ensureCartBadge() {
  const cartLink = getCartLink();
  if (!cartLink) return null;

  let badge = cartLink.querySelector(".cart-count-badge");
  if (badge) return badge;

  cartLink.style.position = "relative";
  badge = document.createElement("span");
  badge.className = "cart-count-badge";
  badge.textContent = "0";
  Object.assign(badge.style, {
    position: "absolute",
    top: "-6px",
    right: "-10px",
    minWidth: "18px",
    height: "18px",
    padding: "0 5px",
    borderRadius: "999px",
    background: "#d74f4f",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "700",
    lineHeight: "18px",
    textAlign: "center",
    display: "none",
  });
  cartLink.appendChild(badge);
  return badge;
}

function updateCartBadge(count) {
  const badge = ensureCartBadge();
  if (!badge) return;

  const safeCount = Number(count) || 0;
  badge.textContent = String(safeCount);
  badge.style.display = safeCount > 0 ? "inline-block" : "none";
}

function showCartNotification(message) {
  let toast = document.getElementById("cart-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cart-toast";
    Object.assign(toast.style, {
      position: "fixed",
      top: "24px",
      right: "24px",
      zIndex: "2000",
      padding: "12px 16px",
      borderRadius: "12px",
      background: "#24313d",
      color: "#fff",
      boxShadow: "0 12px 30px rgba(0, 0, 0, 0.18)",
      fontSize: "14px",
      opacity: "0",
      transform: "translateY(-10px)",
      transition: "opacity 180ms ease, transform 180ms ease",
    });
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  window.clearTimeout(window.cartToastTimer);
  window.cartToastTimer = window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
  }, 1800);
}

async function refreshCartBadge() {
  try {
    const response = await fetch(CART_ITEMS_URL, {
      credentials: "include",
    });
    if (!response.ok) return;

    const data = await response.json();
    const items = Array.isArray(data) ? data : data.results || data.items || [];
    const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    updateCartBadge(count);
  } catch (error) {
    console.error("Failed to refresh cart badge", error);
  }
}

window.addToCart = async function addToCart(productId, quantity = 1) {
  const response = await fetch(CART_ADD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken") || "",
    },
    credentials: "include",
    body: JSON.stringify({
      product_id: productId,
      quantity,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to add item to cart.");
  }

  updateCartBadge(data.cart_count);
  showCartNotification(data.message || "Product added to cart.");
  return data;
};

async function fetchProducts({ page = 1, page_size = 12, search = "", ordering = "" } = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("page_size", page_size);
  if (search) params.set("search", search);
  if (ordering) params.set("ordering", ordering);

  const res = await fetch(`${API_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

function bindCartButtons(container) {
  if (!container || container.dataset.cartBound === "true") return;

  container.addEventListener("click", async (event) => {
    const btn = event.target.closest(".btn-add-cart");
    if (!btn) return;

    const pid = btn.getAttribute("data-product-id");
    if (!pid) return;

    try {
      await window.addToCart(Number(pid), 1);
    } catch (error) {
      console.error("addToCart call failed", error);
      showCartNotification("Unable to add product to cart.");
    }
  });

  container.dataset.cartBound = "true";
}

function renderProducts(data) {
  const container = document.getElementById("container");
  if (!container) return;
  container.innerHTML = "";

  const products = Array.isArray(data) ? data : data.results || [];

  function imageUrl(path) {
    if (!path) return "/static/images/product-1.png";
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `/media/${path}`;
  }

  products.forEach((product) => {
    const img = imageUrl(product.image || product.image_url || "");
    const pid = product.id || product.pk || "";
    const html = `
      <div class="col-12 col-md-4 col-lg-3 mb-5">
        <a class="product-item" href="#">
          <img src="${img}" class="img-fluid product-thumbnail">
          <h3 class="product-title">${product.name || ""}</h3>
          <strong class="product-price">$${product.price || ""}</strong>

          <span class="icon-cross">
            <img src="/static/images/cross.svg" class="img-fluid">
          </span>
        </a>
        <div class="mt-2 text-center">
          <button class="btn btn-sm btn-primary btn-add-cart" data-product-id="${pid}">Add to cart</button>
        </div>
      </div>
    `;
    container.innerHTML += html;
  });

  bindCartButtons(container);
}

function renderPagination(data) {
  const paginateRoot = document.getElementById("pagination");
  if (!paginateRoot || !data) return;
  paginateRoot.innerHTML = "";
  const current = data.current_page || 1;
  const total = data.total_pages || Math.ceil((data.count || 0) / (data.page_size || 12));

  for (let p = 1; p <= total; p += 1) {
    const btn = document.createElement("button");
    btn.className = p === current ? "btn btn-primary me-2" : "btn btn-outline-primary me-2";
    btn.textContent = p;
    btn.addEventListener("click", () => load({ page: p }));
    paginateRoot.appendChild(btn);
  }
}

async function load(opts = {}) {
  try {
    const data = await fetchProducts(opts);
    renderProducts(data);
    renderPagination(data);
  } catch (err) {
    console.error("Failed to load products", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  ensureCartBadge();
  refreshCartBadge();
  load({ page: 1, page_size: 12 });
});
