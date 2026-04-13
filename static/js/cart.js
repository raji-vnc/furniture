(() => {
const CART_ITEMS_URL = "/api/cart/cart-items/";
const REMOVE_ITEM_URL = "/api/cart/remove/";
const COUPON_APPLY_URL = "/api/coupons/apply/";
const COUPON_AVAILABLE_URL = "/api/coupons/available/";
const FALLBACK_PRODUCT_IMAGE = "/static/images/product-1.png";
const COUPON_STORAGE_KEY = "applied_coupon";
const todayMidnight = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

function isCouponExpired(coupon) {
  if (!coupon || !coupon.expiry_date) return false;
  const expiry = new Date(coupon.expiry_date);
  expiry.setHours(0, 0, 0, 0);
  return expiry < todayMidnight();
}

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

const CSRF_TOKEN = getCookie("csrftoken");

document.addEventListener("DOMContentLoaded", () => {
  // restore persisted coupon (shared across pages)
  restoreStoredCoupon();
  const cartTableBody = document.getElementById("cart-items");
  if (!cartTableBody) {
    return;
  }

  loadCart();
  loadAvailableCoupons();
  bindCartActions();
  bindCartButtons();
});

async function loadCart() {
  try {
    const response = await fetch(CART_ITEMS_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      renderCartItems([]);
      updateCartTotal([]);
      return;
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : data.results || data.items || [];

    renderCartItems(items);
    updateCartTotal(items);
  } catch (error) {
    console.error("Failed to load cart:", error);
    renderCartItems([]);
    updateCartTotal([]);
  }
}

function bindCartActions() {
  const tbody = document.getElementById("cart-items");

  if (!tbody) {
    return;
  }

  tbody.addEventListener("click", async (event) => {
    const increaseButton = event.target.closest(".increase");
    const decreaseButton = event.target.closest(".decrease");
    const removeButton = event.target.closest(".remove-item");

    if (increaseButton) {
      const itemId = increaseButton.dataset.itemId;
      const quantityInput = document.querySelector(`#quantity-${itemId}`);
      if (!quantityInput) return;
      const nextQuantity = Number(quantityInput.value) + 1;
      await updateQuantity(itemId, nextQuantity);
      return;
    }

    if (decreaseButton) {
      const itemId = decreaseButton.dataset.itemId;
      const quantityInput = document.querySelector(`#quantity-${itemId}`);
      if (!quantityInput) return;
      const nextQuantity = Math.max(1, Number(quantityInput.value) - 1);
      await updateQuantity(itemId, nextQuantity);
      return;
    }

    if (removeButton) {
      event.preventDefault();
      await removeItem(removeButton.dataset.itemId);
    }
  });

  tbody.addEventListener("change", async (event) => {
    if (!event.target.classList.contains("quantity-amount")) {
      return;
    }

    const itemId = event.target.dataset.itemId;
    const nextQuantity = Math.max(1, Number(event.target.value) || 1);
    event.target.value = nextQuantity;
    await updateQuantity(itemId, nextQuantity);
  });
}

function bindCartButtons() {
  const updateBtn = document.getElementById("btn-update-cart");
  const applyCouponBtn = document.getElementById("btn-apply-coupon");
  const couponInput = document.getElementById("coupon");
  const couponStatus = document.getElementById("coupon-status");
  const availableWrapper = document.getElementById("coupon-available");

  if (updateBtn) {
    updateBtn.addEventListener("click", loadCart);
  }

  if (applyCouponBtn && couponInput) {
    applyCouponBtn.addEventListener("click", async () => {
      const code = couponInput.value.trim();
      if (!code) {
        setCouponStatus("Enter a coupon code", true);
        return;
      }
      setCouponStatus("Applying...");
      applyCouponBtn.disabled = true;
      try {
        const response = await fetch(COUPON_APPLY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": CSRF_TOKEN || "",
          },
          credentials: "include",
          body: JSON.stringify({ code }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || data.message || "Invalid coupon");
        }
        setStoredCoupon(data.coupon);
        window.appliedCoupon = data.coupon;
        setCouponStatus(data.message || "Coupon applied");
        await loadCart();
      } catch (err) {
        console.error("Coupon apply failed", err);
        setCouponStatus(err.message || "Unable to apply coupon", true);
      } finally {
        applyCouponBtn.disabled = false;
      }
    });
  }

  function setCouponStatus(msg, isError = false) {
    if (!couponStatus) return;
    couponStatus.textContent = msg;
    couponStatus.className = isError ? "text-danger mb-2" : "text-muted mb-2";
  }

  // Allow clicking on a coupon badge to autofill and apply
  if (availableWrapper && applyCouponBtn && couponInput) {
    availableWrapper.addEventListener("click", (event) => {
      const pill = event.target.closest("[data-coupon-code]");
      if (!pill) return;
      couponInput.value = pill.dataset.couponCode;
      applyCouponBtn.click();
    });
  }
}

function renderCartItems(items) {
  const tbody = document.getElementById("cart-items");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";

  if (!items.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4">
          <p class="text-muted mb-0">Your cart is empty.</p>
        </td>
      </tr>
    `;
    return;
  }

  items.forEach((item) => {
    const price = Number(item.product_price || 0);
    const quantity = Number(item.quantity || 1);
    const lineTotal = Number(item.line_total || price * quantity);
    const image = item.image || item.product_image || FALLBACK_PRODUCT_IMAGE;
    const productName = item.product_name || "Product";

    const row = `
      <tr>
        <td class="product-thumbnail">
          <img src="${image}" alt="${escapeHtml(productName)}" class="img-fluid">
        </td>
        <td class="product-name">
          <h2 class="h5 text-black">${escapeHtml(productName)}</h2>
        </td>
        <td>$${price.toFixed(2)}</td>
        <td>
          <div class="input-group mb-3 d-flex align-items-center quantity-container" style="max-width: 120px;">
            <div class="input-group-prepend">
              <button class="btn btn-outline-black decrease" type="button" data-item-id="${item.id}">&minus;</button>
            </div>
            <input
              id="quantity-${item.id}"
              type="number"
              min="1"
              class="form-control text-center quantity-amount"
              value="${quantity}"
              data-item-id="${item.id}"
              aria-label="Quantity for ${escapeHtml(productName)}"
            >
            <div class="input-group-append">
              <button class="btn btn-outline-black increase" type="button" data-item-id="${item.id}">&plus;</button>
            </div>
          </div>
        </td>
        <td>$${lineTotal.toFixed(2)}</td>
        <td>
          <a href="#" class="btn btn-black btn-sm remove-item" data-item-id="${item.id}">X</a>
        </td>
      </tr>
    `;

    tbody.insertAdjacentHTML("beforeend", row);
  });
}

function updateCartTotal(items) {
  const subtotalElement = document.getElementById("cart-subtotal");
  const totalElement = document.getElementById("cart-total");
  const subtotal = items.reduce((sum, item) => sum + Number(item.line_total || 0), 0);

  const discountPct = window.appliedCoupon ? Number(window.appliedCoupon.discount || 0) : 0;
  const discountAmount = subtotal * (discountPct / 100);
  const total = subtotal - discountAmount;

  const formattedSubtotal = `$${subtotal.toFixed(2)}`;
  const formattedTotal = `$${total.toFixed(2)}`;

  if (subtotalElement) {
    subtotalElement.textContent = formattedSubtotal;
  }

  if (totalElement) {
    totalElement.textContent = formattedTotal;
  }
}

async function loadAvailableCoupons() {
  const target = document.getElementById("coupon-available");
  if (!target) return;
  try {
    const res = await fetch(COUPON_AVAILABLE_URL, { credentials: "include" });
    if (!res.ok) throw new Error("Unable to load coupons");
    const coupons = await res.json();
    if (!coupons.length) {
      target.textContent = "No coupons available right now.";
      return;
    }
    target.innerHTML = coupons
      .map(
        (c) =>
          `<button type="button" class="btn btn-outline-dark btn-sm me-2 mb-2" data-coupon-code="${escapeHtml(
            c.code
          )}">${escapeHtml(c.code)} (${Number(c.discount || 0)}% off)</button>`
      )
      .join("");
  } catch (err) {
    target.textContent = "Coupons unavailable at the moment.";
    console.error("Failed to load available coupons", err);
  }
}

function setStoredCoupon(coupon) {
  try {
    sessionStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
  } catch (e) {
    console.warn("Unable to persist coupon", e);
  }
}

function restoreStoredCoupon() {
  try {
    const raw = sessionStorage.getItem(COUPON_STORAGE_KEY);
    if (!raw) return;
    const coupon = JSON.parse(raw);
    const status = document.getElementById("coupon-status");
    const input = document.getElementById("coupon");

    if (!coupon || !coupon.code) return;

    if (isCouponExpired(coupon)) {
      sessionStorage.removeItem(COUPON_STORAGE_KEY);
      if (status) {
        status.textContent = "Saved coupon expired. Please try another code.";
        status.className = "text-danger mb-2";
      }
      if (input) input.value = "";
      return;
    }

    window.appliedCoupon = coupon;
    if (status) {
      status.textContent = `Coupon ${coupon.code} applied (${Number(coupon.discount || 0)}% off)`;
      status.className = "text-muted mb-2";
    }
    if (input) input.value = coupon.code;
  } catch (e) {
    console.warn("Unable to restore coupon", e);
  }
}

async function updateQuantity(itemId, quantity) {
  try {
    const response = await fetch(`${CART_ITEMS_URL}${itemId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": CSRF_TOKEN,
      },
      credentials: "include",
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Unable to update item ${itemId}`);
    }

    await loadCart();
  } catch (error) {
    console.error("Failed to update cart item:", error);
  }
}

async function removeItem(itemId) {
  try {
    const response = await fetch(`${REMOVE_ITEM_URL}${itemId}/`, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": CSRF_TOKEN,
      },
      credentials: "include",
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Unable to remove item ${itemId}`);
    }

    await loadCart();
  } catch (error) {
    console.error("Failed to remove cart item:", error);
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
})();
