const CART_ITEMS_URL = "/api/cart/cartitems/";
const REMOVE_ITEM_URL = "/api/cart/remove/";

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
  loadCart();
  bindCartActions();
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
      const nextQuantity = Number(quantityInput.value) + 1;
      await updateQuantity(itemId, nextQuantity);
      return;
    }

    if (decreaseButton) {
      const itemId = decreaseButton.dataset.itemId;
      const quantityInput = document.querySelector(`#quantity-${itemId}`);
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
    const image = item.image || item.product_image || "";
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
              type="text"
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
  const total = items.reduce((sum, item) => sum + Number(item.line_total || 0), 0);
  const formattedTotal = `$${total.toFixed(2)}`;

  if (subtotalElement) {
    subtotalElement.textContent = formattedTotal;
  }

  if (totalElement) {
    totalElement.textContent = formattedTotal;
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
