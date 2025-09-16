const express = require("express");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
const cookies = require("cookie-parser");
const dotenv = require("dotenv");
const authRoutes = require("./router/auth");
const authMiddleware = require("../backend/middleware/authmiddleware");
const busesRoutes = require("./router/buses");
const authorityRoutes = require("./router/authority");
const roleMiddleware = require("./middleware/roleMiddleware");
const busRequestRoutes = require("./router/busRequest");
const municipalRoute = require("./router/municipal")


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
app.get("/api/search", async (req, res) => {
  const query = req.query.q;
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch location" });
  }
});


// Pages
app.get("/", (req, res) => res.redirect("/login"));
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));
app.get("/dashboard", authMiddleware, (req, res) => {
   const user = req.user;
  console.log("User in dashboard:", req.user);
  res.render("dashboard", 
    { title: "Dashboard", user }
  );
});

app.use("/logout", authRoutes);
app.use("/api/buses", busesRoutes);
// New routes for the links in dashboard.ejs
app.get("/busses-available",(req, res) => res.render("busses-available", { title: "Buses Available on this Route" },));
app.get("/source-destination",(req, res) => res.render("source-destination", { title: "Source to Destination Route" }));
app.use("/authorities", authorityRoutes);
app.use("/api/bus-requests", busRequestRoutes);
app.use("/municipal", municipalRoute);

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
