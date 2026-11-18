const API = "";
const token = () => localStorage.getItem("simonAdminToken");

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

async function request(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "x-admin-token": token() || "",
    ...options.headers
  };

  const response = await fetch(API + url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({
    status: false,
    message: "Invalid server response"
  }));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function notify(message) {
  alert(message);
}

function logout() {
  localStorage.removeItem("simonAdminToken");
  location.href = "/";
}

// Login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const value = document.getElementById("token").value;
    const message = document.getElementById("message");

    try {
      const response = await fetch("/dashboard/stats", {
        headers: {
          "x-admin-token": value
        }
      });

      if (!response.ok) {
        throw new Error("Invalid admin token");
      }

      localStorage.setItem("simonAdminToken", value);
      location.href = "/dashboard.html";
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

// Logout button
document.addEventListener("click", event => {
  if (event.target.closest("[data-logout]")) {
    logout();
  }
});

// Dashboard
async function loadDashboard() {
  const statsElement = document.getElementById("services");

  if (!statsElement) return;

  try {
    const data = await request("/dashboard/stats");
    const s = data.statistics;

    document.getElementById("services").textContent = s.services;
    document.getElementById("orders").textContent = s.orders;
    document.getElementById("keys").textContent = s.activeApiKeys;
    document.getElementById("completed").textContent = s.completed;

    const recent = await request("/dashboard/recent-orders");

    document.getElementById("recentOrders").innerHTML =
      recent.orders.length
        ? recent.orders.map(order => `
          <div class="item">
            <strong>${escapeHTML(order.title)}</strong>
            <p>${escapeHTML(order.orderId)}</p>
            <span class="badge">${escapeHTML(order.status)}</span>
          </div>
        `).join("")
        : "No campaigns created yet.";

    const provider = await request("/dashboard/provider");

    document.getElementById("provider").textContent =
      provider.provider.message;

    await loadKeys();
  } catch (error) {
    notify(error.message);
  }
}

// API key management
async function loadKeys() {
  const element = document.getElementById("keyList");

  if (!element) return;

  const data = await request("/api/keys");

  element.innerHTML = data.keys.length
    ? data.keys.map(key => `
      <div class="item">
        <strong>${escapeHTML(key.name)}</strong>
        <p>Requests: ${key.requests}</p>
        <span class="badge">${key.active ? "ACTIVE" : "REVOKED"}</span>
        ${key.active ? `
          <button class="danger"
            data-revoke-key="${escapeHTML(key._id)}">
            Revoke
          </button>
        ` : ""}
      </div>
    `).join("")
    : "No API keys generated.";
}

const keyForm = document.getElementById("keyForm");

if (keyForm) {
  keyForm.addEventListener("submit", async event => {
    event.preventDefault();

    try {
      const name = new FormData(keyForm).get("name");

      const data = await request("/api/keys", {
        method: "POST",
        body: JSON.stringify({ name })
      });

      document.getElementById("newKey").textContent =
        data.apiKey;

      notify("API key generated. Copy and store it securely.");

      keyForm.reset();
      await loadKeys();
    } catch (error) {
      notify(error.message);
    }
  });
}

// Revoke API key
document.addEventListener("click", async event => {
  const button = event.target.closest("[data-revoke-key]");

  if (!button) return;

  if (!confirm("Revoke this API key?")) return;

  try {
    await request("/api/keys/" + encodeURIComponent(
      button.dataset.revokeKey
    ), {
      method: "DELETE"
    });

    notify("API key revoked.");
    await loadKeys();
  } catch (error) {
    notify(error.message);
  }
});

// Services
async function loadServices() {
  const list = document.getElementById("serviceList");
  const select = document.getElementById("serviceSelect");

  if (!list && !select) return;

  try {
    const data = await request("/services");

    if (list) {
      list.innerHTML = data.services.length
        ? data.services.map(service => `
          <div class="item">
            <strong>${escapeHTML(service.name)}</strong>
            <p>${escapeHTML(service.category)} ·
               ${escapeHTML(service.platform)}</p>
            <p>${escapeHTML(service.description)}</p>
            <span class="badge">
              ${service.active ? "ACTIVE" : "INACTIVE"}
            </span>
            <button data-toggle-service="${escapeHTML(service._id)}"
              data-active="${service.active}">
              ${service.active ? "Deactivate" : "Activate"}
            </button>
            <button class="danger"
              data-delete-service="${escapeHTML(service._id)}">
              Delete
            </button>
          </div>
        `).join("")
        : "No services available.";
    }

    if (select) {
      select.innerHTML =
        '<option value="">Select a service</option>' +
        data.services
          .filter(service => service.active)
          .map(service => `
            <option value="${escapeHTML(service._id)}">
              ${escapeHTML(service.name)}
            </option>
          `).join("");
    }
  } catch (error) {
    notify(error.message);
  }
}

const serviceForm = document.getElementById("serviceForm");

if (serviceForm) {
  serviceForm.addEventListener("submit", async event => {
    event.preventDefault();

    const form = Object.fromEntries(
      new FormData(serviceForm).entries()
    );

    try {
      await request("/services", {
        method: "POST",
        body: JSON.stringify(form)
      });

      notify("Service created successfully.");
      serviceForm.reset();
      await loadServices();
    } catch (error) {
      notify(error.message);
    }
  });
}

document.addEventListener("click", async event => {
  const toggle = event.target.closest("[data-toggle-service]");
  const remove = event.target.closest("[data-delete-service]");

  try {
    if (toggle) {
      const active = toggle.dataset.active !== "true";

      await request(
        "/services/" + encodeURIComponent(toggle.dataset.toggleService),
        {
          method: "PATCH",
          body: JSON.stringify({ active })
        }
      );

      await loadServices();
    }

    if (remove) {
      if (!confirm("Delete this service?")) return;

      await request(
        "/services/" + encodeURIComponent(remove.dataset.deleteService),
        { method: "DELETE" }
      );

      notify("Service deleted.");
      await loadServices();
    }
  } catch (error) {
    notify(error.message);
  }
});

// Orders
async function loadOrders() {
  const list = document.getElementById("orderList");

  if (!list) return;

  try {
    const data = await request("/orders");

    list.innerHTML = data.orders.length
      ? data.orders.map(order => `
        <div class="item">
          <strong>${escapeHTML(order.title)}</strong>
          <p>${escapeHTML(order.orderId)}</p>
          <p>Service: ${escapeHTML(order.service?.name || "Unknown")}</p>
          <p>Platform: ${escapeHTML(order.platform)}</p>
          <span class="badge">${escapeHTML(order.status)}</span>
          <select data-order-status="${escapeHTML(order.orderId)}">
            ${["planned","in_progress","completed","cancelled"]
              .map(status => `
                <option value="${status}"
                  ${order.status === status ? "selected" : ""}>
                  ${status}
                </option>
              `).join("")}
          </select>
          <a href="${escapeHTML(order.targetUrl)}"
             target="_blank" rel="noopener noreferrer">
            Open campaign URL
          </a>
        </div>
      `).join("")
      : "No campaigns created yet.";
  } catch (error) {
    notify(error.message);
  }
}

const orderForm = document.getElementById("orderForm");

if (orderForm) {
  orderForm.addEventListener("submit", async event => {
    event.preventDefault();

    const form = Object.fromEntries(
      new FormData(orderForm).entries()
    );

    try {
      await request("/orders", {
        method: "POST",
        body: JSON.stringify(form)
      });

      notify("Campaign created.");
      orderForm.reset();

      await loadOrders();
    } catch (error) {
      notify(error.message);
    }
  });
}

document.addEventListener("change", async event => {
  const select = event.target.closest("[data-order-status]");

  if (!select) return;

  try {
    await request(
      "/orders/" + encodeURIComponent(select.dataset.orderStatus) + "/status",
      {
        method: "PATCH",
        body: JSON.stringify({ status: select.value })
      }
    );

    notify("Campaign status updated.");
    await loadOrders();
  } catch (error) {
    notify(error.message);
  }
});

// Settings
async function loadSettings() {
  const form = document.getElementById("settingsForm");

  if (!form) return;

  try {
    const data = await request("/settings");

    form.elements.appName.value =
      data.settings.appName || "SIMON SMM";

    form.elements.ownerName.value =
      data.settings.ownerName || "Simon";
  } catch (error) {
    notify(error.message);
  }
}

const settingsForm = document.getElementById("settingsForm");

if (settingsForm) {
  settingsForm.addEventListener("submit", async event => {
    event.preventDefault();

    const values = Object.fromEntries(
      new FormData(settingsForm).entries()
    );

    try {
      await request("/settings", {
        method: "PUT",
        body: JSON.stringify(values)
      });

      notify("Settings saved.");
    } catch (error) {
      notify(error.message);
    }
  });
}

// Initialize the page
if (token() && !loginForm) {
  loadDashboard();
  loadServices();
  loadOrders();
  loadSettings();
}

if (!token() && !loginForm) {
  location.href = "/";
}
