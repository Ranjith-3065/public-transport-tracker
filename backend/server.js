const express = require("express");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
const cookies = require("cookie-parser");
const dotenv = require("dotenv");
const authRoutes = require("./router/auth");
const authMiddleware = require("../backend/middleware/authmiddleware");
const busesRoutes = require("./router/buses");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cookies());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend/public")));

// Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));

// Routes
app.use("/api/auth", authRoutes);

// Pages
app.get("/", (req, res) => res.redirect("/login"));
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));
app.get("/dashboard",authMiddleware,(req, res) => res.render("dashboard", { title: "Bus Tracker Dashboard" }));
app.use("/logout", authRoutes);
app.use("/api/buses", busesRoutes);
// New routes for the links in dashboard.ejs
app.get("/busses-available",(req, res) => res.render("busses-available", { title: "Buses Available on this Route" }));
app.get("/source-destination",(req, res) => res.render("source-destination", { title: "Source to Destination Route" }));

// Start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn("⚠️ No MongoDB URI found. Running without DB.");
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("✅ Connected to MongoDB");
      app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
    })
    .catch((err) => console.error("❌ MongoDB connection error:", err));
}
