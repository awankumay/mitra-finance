const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { env } = require("./config/env");
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/users.routes");
const assetRoutes = require("./modules/assets/assets.routes");
const snapshotRoutes = require("./modules/snapshots/snapshots.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const auditRoutes = require("./modules/audit/audit.routes");
const { authMiddleware } = require("./middlewares/auth.middleware");
const { apiKeyMiddleware } = require("./middlewares/apikey.middleware");

const app = express();

// -- Security: hardened Helmet with explicit CSP --
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

app.use(cors({ origin: env.CORS_ORIGIN.split(",") }));

// -- Security: limit request body size to 10 KB --
app.use(express.json({ limit: "10kb" }));

// -- Logging: use 'combined' format in production to avoid verbose output --
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// -- Security: general rate limiter for all API endpoints (burst protection) --
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// -- Security: stricter limiter for write operations --
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many write requests, please try again later." },
});

app.use("/api", apiLimiter);

// -- Security: API key guard (all /api routes except /api/health) --
app.use("/api", apiKeyMiddleware);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", authMiddleware, writeLimiter, userRoutes);
app.use("/api/assets", authMiddleware, writeLimiter, assetRoutes);
app.use("/api/snapshots", authMiddleware, writeLimiter, snapshotRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/admin/logs", authMiddleware, auditRoutes);

// -- Production: serve React frontend build --
if (env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(distPath));
  // SPA catch-all: return index.html for non-API routes
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
});

module.exports = { app };
