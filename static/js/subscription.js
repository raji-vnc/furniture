const SUBSCRIPTION_API_URL = "/api/contacts/contacts/";

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

function splitName(fullName) {
  const name = String(fullName || "").trim();
  if (!name) return { first: "Subscriber", last: "User" };
  const parts = name.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: parts[0] };
  const first = parts[0];
  const last = parts.slice(1).join(" ");
  return { first, last };
}

function bindSubscriptionForms() {
  const forms = document.querySelectorAll("[data-subscription-form]");
  if (!forms.length) return;

  forms.forEach((form) => {
    const statusEl = form.querySelector("[data-subscription-status]");
    const nameInput = form.querySelector('input[name="subscriber_name"]');
    const emailInput = form.querySelector('input[name="subscriber_email"]');
    const button = form.querySelector("button[type=submit]");

    const setStatus = (message, isError = false) => {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.className = isError ? "text-danger small" : "text-success small";
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setStatus("");

      const name = nameInput?.value || "";
      const email = emailInput?.value || "";
      if (!email) {
        setStatus("Please enter your email.", true);
        return;
      }

      if (button) {
        button.disabled = true;
      }

      const { first, last } = splitName(name);
      try {
        const response = await fetch(SUBSCRIPTION_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken") || "",
          },
          credentials: "include",
          body: JSON.stringify({
            firstname: first,
            lastname: last,
            email,
            message: "Newsletter subscription",
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.detail || "Subscription failed. Please try again.");
        }

        form.reset();
        setStatus("Thanks for subscribing!");
      } catch (error) {
        setStatus(error.message || "Subscription failed. Please try again.", true);
      } finally {
        if (button) {
          button.disabled = false;
        }
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", bindSubscriptionForms);
