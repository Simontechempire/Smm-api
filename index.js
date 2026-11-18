const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const config = require("./config");
const connectDatabase = require("./database/connection");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "50kb" }));

app.use(rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false
}));

app.use(express.static(path.join(__dirname, "public")));

app.get("/health", async (req, res) => {
  const mongoose = require("mongoose");

  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected,
    name: config.appName,
    server: "online",
    database: connected ? "connected" : "disconnected",
    uptime: Math.floor(process.uptime())
  });
});

app.get("/api/docs", (req, res) => {
  res.json({
    name: config.appName,
    version: "1.0.0",
    authentication: "x-api-key",
    endpoints: [
      "GET /api/v1/services",
      "GET /api/v1/orders"
    ],
    ownerEndpoints: [
      "GET /dashboard/stats",
      "GET /dashboard/activity",
      "POST /api/keys",
      "GET /api/keys",
      "DELETE /api/keys/:id",
      "GET /services",
      "POST /services",
      "PATCH /services/:id",
      "DELETE /services/:id",
      "GET /orders",
      "POST /orders",
      "PATCH /orders/:id/status",
      "GET /settings",
      "PUT /settings"
    ]
  });
});

app.use("/dashboard", require("./routes/dashboard"));
app.use("/services", require("./routes/services"));
app.use("/orders", require("./routes/orders"));
app.use("/api", require("./routes/api"));
app.use("/settings", require("./routes/settings"));

app.use(errorHandler);

async function start() {
  try {
    await connectDatabase();

    app.listen(config.port, "0.0.0.0", () => {
      console.log("--------------------------------");
      console.log(config.appName);
      console.log("PRIVATE MODE: ACTIVE");
      console.log(`PORT: ${config.port}`);
      console.log("DATABASE: CONNECTED");
      console.log("--------------------------------");
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

start();
