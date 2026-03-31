const CHECKOUT_CART_ITEMS_URL = "/api/cart/cartitems/";

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

document.addEventListener("DOMContentLoaded", () => {
  loadCheckoutOrder();
});
