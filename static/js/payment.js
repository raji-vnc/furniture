const PAYMENT_CART_ITEMS_URL = "/api/cart/cart-items/";
const PAYMENT_CREATE_URL = "/api/payments/payment-create/";
const PAYMENT_CONFIRM_URL = "/api/payments/payment-confirm/";
const THANK_YOU_URL = "/products/thankyou/";
let currentPaymentTotal = 0;

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

function formatPaymentCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function getSelectedPaymentMethod() {
  return document.querySelector('input[name="payment_method"]:checked')?.value || "card";
}

function getPaymentMessageElement() {
  return document.getElementById("payment-form-message");
}

function setPaymentMessage(message) {
  const element = getPaymentMessageElement();
  if (element) {
    element.textContent = message;
  }
}

function validatePaymentForm() {
  const selectedMethod = getSelectedPaymentMethod();

  if (selectedMethod === "card") {
    const cardName = document.getElementById("card_name")?.value.trim() || "";
    const cardNumber = document.getElementById("card_number")?.value.replace(/\s+/g, "") || "";
    const expiryDate = document.getElementById("expiry_date")?.value.trim() || "";
    const cvv = document.getElementById("cvv")?.value.trim() || "";

    if (!cardName || !cardNumber || !expiryDate || !cvv) {
      return "Please fill in all card payment fields.";
    }

    if (!/^\d{12,19}$/.test(cardNumber)) {
      return "Card number must contain 12 to 19 digits.";
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      return "Expiry date must be in MM/YY format.";
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      return "CVV must be 3 or 4 digits.";
    }
  }

  return "";
}

async function loadPaymentSummary() {
  const orderItemsBody = document.getElementById("payment-order-items");
  const subtotalElement = document.getElementById("payment-subtotal");
  const totalElement = document.getElementById("payment-total");

  if (!orderItemsBody || !subtotalElement || !totalElement) {
    return;
  }

  try {
    const response = await fetch(PAYMENT_CART_ITEMS_URL, {
      credentials: "include",
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : data.results || data.items || [];
    const total = items.reduce((sum, item) => sum + Number(item.line_total || 0), 0);
    currentPaymentTotal = total;

    orderItemsBody.innerHTML = items.length
      ? items
          .map(
            (item) => `
              <tr>
                <td>${item.product_name} <strong class="mx-2">x</strong> ${item.quantity}</td>
                <td>${formatPaymentCurrency(item.line_total)}</td>
              </tr>
            `,
          )
          .join("")
      : `
          <tr>
            <td>Your cart is empty.</td>
            <td>${formatPaymentCurrency(0)}</td>
          </tr>
        `;

    subtotalElement.textContent = formatPaymentCurrency(total);
    totalElement.textContent = formatPaymentCurrency(total);
  } catch (error) {
    console.error("Failed to load payment summary", error);
  }
}

function bindPaymentButton() {
  const completePaymentButton = document.getElementById("complete-payment-btn");
  if (!completePaymentButton) {
    return;
  }

  completePaymentButton.addEventListener("click", async () => {
    setPaymentMessage("");

    if (!currentPaymentTotal) {
      window.location.href = THANK_YOU_URL;
      return;
    }

    const validationMessage = validatePaymentForm();
    if (validationMessage) {
      setPaymentMessage(validationMessage);
      return;
    }

    if (getSelectedPaymentMethod() !== "card") {
      window.location.href = THANK_YOU_URL;
      return;
    }

    completePaymentButton.disabled = true;
    completePaymentButton.textContent = "Processing...";

    try {
      const response = await fetch(PAYMENT_CREATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        credentials: "include",
        body: JSON.stringify({
          amount: currentPaymentTotal,
          order_id: sessionStorage.getItem("latest_order_id") || "",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.checkout_url) {
        throw new Error(data.error || "Unable to start payment.");
      }

      window.location.href = data.checkout_url;
    } catch (error) {
      console.error("Payment creation failed", error);
      completePaymentButton.disabled = false;
      completePaymentButton.textContent = "Complete Payment";
      alert("Payment setup failed. Please try again.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadPaymentSummary();
  bindPaymentButton();
});
