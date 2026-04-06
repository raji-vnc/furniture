const CHECKOUT_CART_ITEMS_URL = "/api/cart/cart-items/";
const PLACE_ORDER_URL = "/api/orders/place/";
const SIGNIN_URL = "/accounts/signin/";
let currentCheckoutItemsCount = 0;

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
      <tr>
        <td class="text-black font-weight-bold"><strong>Order Total</strong></td>
        <td class="text-black font-weight-bold"><strong id="checkout-total">${formatCurrency(subtotal)}</strong></td>
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
  loadCheckoutOrder();
  bindPlaceOrderButton();
});
