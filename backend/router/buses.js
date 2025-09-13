// routes/buses.js
const express = require("express");
const router = express.Router();
const Bus = require("../models/Bus"); // MongoDB model

// Get available buses for a route or location
router.get("/available", async (req, res) => {
  const { route, lat, lng } = req.query; // can filter by route or nearby lat/lng
  try {
    let buses;
    if(route){
      buses = await Bus.find({ route: route });
    } else if(lat && lng){
      // simple radius filter, e.g., 2km radius
      buses = await Bus.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: 2000
          }
        }
      });
    } else {
      buses = await Bus.find(); // all active buses
    }
    res.json({ success: true, buses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
