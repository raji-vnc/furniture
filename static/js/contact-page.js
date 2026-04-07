const CONTACT_API_URL = "/api/contacts/contacts/";

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

function setContactMessage(message, isError = false) {
  const element = document.getElementById("contact-message");
  if (!element) return;
  element.textContent = message;
  element.className = isError ? "text-danger mb-3" : "text-success mb-3";
}

function buildPayload() {
  return {
    firstname: document.getElementById("fname")?.value.trim() || "",
    lastname: document.getElementById("lname")?.value.trim() || "",
    email: document.getElementById("email")?.value.trim() || "",
    message: document.getElementById("message")?.value.trim() || "",
  };
}

function validatePayload(payload) {
  if (!payload.firstname || !payload.lastname || !payload.email || !payload.message) {
    return "Please fill in all contact form fields.";
  }
  return "";
}

function bindContactForm() {
  const form = document.getElementById("contact-form");
  const button = document.getElementById("contact-submit-btn");
  if (!form || !button) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setContactMessage("");

    const payload = buildPayload();
    const validationError = validatePayload(payload);
    if (validationError) {
      setContactMessage(validationError, true);
      return;
    }

    button.disabled = true;
    button.textContent = "Sending...";

    try {
      const response = await fetch(CONTACT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Unable to send your message.");
      }

      form.reset();
      setContactMessage("Your message has been sent successfully.");
    } catch (error) {
      setContactMessage(error.message || "Unable to send your message.", true);
    } finally {
      button.disabled = false;
      button.textContent = "Send Message";
    }
  });
}

document.addEventListener("DOMContentLoaded", bindContactForm);
