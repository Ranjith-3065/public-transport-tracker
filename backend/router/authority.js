// routes/authority.js
const express = require("express");
const router = express.Router();
const Bus = require("../models/Bus");
const authMiddleware = require("../middleware/authmiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


router.get("/", authMiddleware, roleMiddleware("authority"), (req, res) => {
  console.log("Authority access user:", req.user); // should show the logged-in user
  res.render("authorities", { title: "Authorities Panel" });
});

router.post("/add-bus", authMiddleware, roleMiddleware("authority"), async (req, res) => {
  try {
    console.log("Form data received:", req.body); // <--- check this

    const { busNumber, route, status = "On Time", lat, lng, nextStop } = req.body;

    if (!busNumber || !route || !lat || !lng) {
      console.log("Missing required fields!");
      return res.status(400).send("Missing required fields");
    }

    const bus = new Bus({
      busNumber,
      route,
      status,
      nextStop,
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
    });

    const savedBus = await bus.save();
    console.log("Bus saved successfully:", savedBus);

    res.redirect("/authorities");
  } catch (err) {
    console.error("Error saving bus:", err);
    res.status(500).send("Error adding bus");
  }
});

router.get("/approved", authMiddleware, roleMiddleware("authority"), async (req, res) => {
  try {
    const requests = await Request.find({ status: "Municipal Approved" }).sort({ createdAt: -1 });
    res.render("authority", { requests });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading authority dashboard");
  }
});


module.exports = router;
