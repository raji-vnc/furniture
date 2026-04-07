const PAYMENT_CONFIRM_URL = "/api/payments/payment-confirm/";

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

async function confirmSuccessfulPayment() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id") || sessionStorage.getItem("latest_order_id") || "";
  const sessionId = params.get("session_id") || "";
  const paymentMethod = params.get("payment_method") || "";

  if (!orderId) {
    return;
  }

  if (paymentMethod && paymentMethod !== "card") {
    sessionStorage.removeItem("latest_order_id");
    return;
  }

  if (!sessionId) {
    return;
  }

  try {
    const response = await fetch(PAYMENT_CONFIRM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken") || "",
      },
      credentials: "include",
      body: JSON.stringify({
        order_id: orderId,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error("Unable to confirm payment.");
    }

    sessionStorage.removeItem("latest_order_id");
  } catch (error) {
    console.error("Payment confirmation failed", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  confirmSuccessfulPayment();
});
