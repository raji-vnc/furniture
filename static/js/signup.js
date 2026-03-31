const REGISTER_API_URL = "/api/accounts/register/";
const CSRF_COOKIE_NAME = "csrftoken";
const CSRF_HEADER_NAME = "X-CSRFToken";

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

function getCsrfToken() {
  const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
  return getCookie(CSRF_COOKIE_NAME) || csrfInput?.value || "";
}

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

const signupForm = document.getElementById("signupForm");
const messageElement = document.getElementById("message");

if (signupForm && messageElement) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const csrfToken = getCsrfToken();

    messageElement.innerText = "";

    if (!username || !email || !password || !confirmPassword) {
      messageElement.innerText = "Please fill in all fields.";
      return;
    }

    if (password !== confirmPassword) {
      messageElement.innerText = "Passwords do not match.";
      return;
    }

    if (!csrfToken) {
      messageElement.innerText = "CSRF token is missing. Reload the page and try again.";
      return;
    }

    try {
      const response = await fetch(REGISTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [CSRF_HEADER_NAME]: csrfToken,
        },
        credentials: "same-origin",
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        messageElement.innerText =
          data.detail ||
          data.username?.[0] ||
          data.email?.[0] ||
          data.password?.[0] ||
          "Registration failed.";
        return;
      }

      messageElement.innerText = "Registration successful. You can sign in now.";
      signupForm.reset();
    } catch (error) {
      console.error("Signup failed:", error);
      messageElement.innerText = "Something went wrong. Please try again.";
    }
  });
}
