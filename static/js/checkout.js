const CHECKOUT_CART_ITEMS_URL = "/api/cart/cart-items/";
const PLACE_ORDER_URL = "/api/orders/place/";
const SIGNIN_URL = "/accounts/signin/";
const COUPON_APPLY_URL = "/api/coupons/apply/";
const COUPON_AVAILABLE_URL = "/api/coupons/available/";
const COUPON_STORAGE_KEY = "applied_coupon";
let currentCheckoutItemsCount = 0;
let checkoutAppliedCoupon = null;

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

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

async function loadCheckoutOrder() {
  const orderItemsBody = document.getElementById("checkout-order-items");
  const subtotalElement = document.getElementById("checkout-subtotal");
  const totalElement = document.getElementById("checkout-total");

  if (!orderItemsBody || !subtotalElement || !totalElement) {
    return;
  }

  try {
    const response = await fetch(CHECKOUT_CART_ITEMS_URL, {
      credentials: "include",
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : data.results || data.items || [];
    currentCheckoutItemsCount = items.length;
    const subtotal = items.reduce((sum, item) => sum + Number(item.line_total || 0), 0);
    const discountPct = checkoutAppliedCoupon ? Number(checkoutAppliedCoupon.discount || 0) : 0;
    const discountAmount = subtotal * (discountPct / 100);
    const total = subtotal - discountAmount;

    const itemRows = items.length
      ? items
          .map(
            (item) => `
              <tr>
                <td>${item.product_name} <strong class="mx-2">x</strong> ${item.quantity}</td>
                <td>${formatCurrency(item.line_total)}</td>
              </tr>
            `,
          )
          .join("")
      : `
          <tr>
            <td>Your cart is empty.</td>
            <td>${formatCurrency(0)}</td>
          </tr>
        `;

    orderItemsBody.innerHTML = `
      ${itemRows}
      <tr>
        <td class="text-black font-weight-bold"><strong>Cart Subtotal</strong></td>
        <td class="text-black" id="checkout-subtotal">${formatCurrency(subtotal)}</td>
      </tr>
      ${
        discountPct
          ? `<tr>
              <td class="text-success font-weight-bold"><strong>Coupon (${discountPct}% off)</strong></td>
              <td class="text-success">- ${formatCurrency(discountAmount)}</td>
            </tr>`
          : ""
      }
      <tr>
        <td class="text-black font-weight-bold"><strong>Order Total</strong></td>
        <td class="text-black font-weight-bold"><strong id="checkout-total">${formatCurrency(total)}</strong></td>
      </tr>
    `;
  } catch (error) {
    console.error("Failed to load checkout order summary", error);
  }
}

function getCheckoutMessageElement() {
  return document.getElementById("checkout-message");
}

function setCheckoutMessage(message, isError = false) {
  const element = getCheckoutMessageElement();
  if (!element) return;

  element.textContent = message;
  element.className = isError ? "text-danger mt-3" : "text-success mt-3";
  element.scrollIntoView({ behavior: "smooth", block: "center" });
}

function validateOrderPayload(payload) {
  return "";
}

function buildOrderPayload() {
  return {
    order_notes: document.getElementById("c_order_notes")?.value.trim() || "",
    coupon_code: checkoutAppliedCoupon?.code || null,
  };
}

async function readResponseData(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return { error: "Unexpected server response." };
}

function bindPlaceOrderButton() {
  const placeOrderButton = document.getElementById("place-order-btn");
  if (!placeOrderButton) {
    return;
  }

  placeOrderButton.addEventListener("click", async () => {
    setCheckoutMessage("");

    try {
      if (currentCheckoutItemsCount === 0) {
        const message = "Your cart is empty. Add products before placing your order.";
        setCheckoutMessage(message, true);
        alert(message);
        return;
      }

      const payload = buildOrderPayload();
      const validationMessage = validateOrderPayload(payload);
      if (validationMessage) {
        setCheckoutMessage(validationMessage, true);
        alert(validationMessage);
        return;
      }

      placeOrderButton.disabled = true;
      placeOrderButton.textContent = "Placing...";

      const response = await fetch(PLACE_ORDER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await readResponseData(response);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          const message = "Please log in before placing your order.";
          setCheckoutMessage(message, true);
          alert(message);
          window.setTimeout(() => {
            window.location.href = SIGNIN_URL;
          }, 1200);
          placeOrderButton.disabled = false;
          placeOrderButton.textContent = "Place Order";
          return;
        }
        throw new Error(data.error || "Unable to place order.");
      }

      sessionStorage.setItem("latest_order_id", String(data.order_id));
      window.location.href = "/products/payment/";
    } catch (error) {
      console.error("Order placement failed", error);
      setCheckoutMessage(error.message, true);
      alert(error.message);
      placeOrderButton.disabled = false;
      placeOrderButton.textContent = "Place Order";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  restoreStoredCoupon();
  loadCheckoutOrder();
  loadAvailableCoupons();
  bindCouponActions();
  bindPlaceOrderButton();
});

function bindCouponActions() {
  const input = document.getElementById("c_code");
  const applyBtn = document.getElementById("button-addon2");
  const status = document.getElementById("checkout-coupon-status");
  const available = document.getElementById("checkout-coupon-available");

  const setStatus = (msg, isError = false) => {
    if (!status) return;
    status.textContent = msg;
    status.className = isError ? "text-danger small mb-2" : "text-muted small mb-2";
  };

  if (applyBtn && input) {
    applyBtn.addEventListener("click", async () => {
      const code = input.value.trim();
      if (!code) {
        setStatus("Enter a coupon code", true);
        return;
      }
      setStatus("Applying...");
      applyBtn.disabled = true;
      try {
        const resp = await fetch(COUPON_APPLY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken") || "",
          },
          credentials: "include",
          body: JSON.stringify({ code }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.detail || data.message || "Invalid coupon");
        checkoutAppliedCoupon = data.coupon;
        setStoredCoupon(data.coupon);
        setStatus(data.message || "Coupon applied");
        await loadCheckoutOrder();
      } catch (err) {
        console.error("Apply coupon failed", err);
        setStatus(err.message || "Unable to apply coupon", true);
      } finally {
        applyBtn.disabled = false;
      }
    });
  }

  if (available && applyBtn && input) {
    available.addEventListener("click", (event) => {
      const pill = event.target.closest("[data-coupon-code]");
      if (!pill) return;
      input.value = pill.dataset.couponCode;
      applyBtn.click();
    });
  }
}

async function loadAvailableCoupons() {
  const target = document.getElementById("checkout-coupon-available");
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
          `<button type="button" class="btn btn-outline-dark btn-sm me-2 mb-2" data-coupon-code="${c.code}">${c.code} (${Number(
            c.discount || 0,
          )}% off)</button>`
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
    if (coupon && coupon.code) {
      checkoutAppliedCoupon = coupon;
      const input = document.getElementById("c_code");
      const status = document.getElementById("checkout-coupon-status");
      if (input) input.value = coupon.code;
      if (status) {
        status.textContent = `Coupon ${coupon.code} applied (${Number(coupon.discount || 0)}% off)`;
        status.className = "text-muted small mb-2";
      }
    }
  } catch (e) {
    console.warn("Unable to restore coupon", e);
  }
}
