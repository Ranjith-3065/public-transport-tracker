// routes/buses.js
const express = require("express");
const router = express.Router();
const Bus = require("../models/Bus"); // MongoDB model
const SimulationBus = require("../models/simulationbus");


// GET /api/buses/search?query=townName
router.get("/search", async (req, res) => {
  try {
    const query = req.query.query || "";

    // Exact match only for the start of the route
    const buses = await Bus.find({
      route: { $regex: `^${query}`, $options: "i" } // ^ = starts with
    });

    res.json({ success: true, buses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to search buses" });
  }
});

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

// GET /api/buses/route?source=...&destination=...
router.get("/route", async (req, res) => {
  const { source, destination } = req.query;
  if (!source || !destination) {
    return res.status(400).json({ success: false, error: "Source & Destination required" });
  }

  try {
    // 1️⃣ Geocode (you can cache these in DB)
    const fetch = (await import("node-fetch")).default;
    const srcRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(source)}`);
    const srcData = await srcRes.json();
    const destRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`);
    const destData = await destRes.json();

    if (!srcData.length || !destData.length) {
      return res.json({ success: false, error: "Invalid source/destination" });
    }

    const src = [srcData[0].lon, srcData[0].lat];
    const dest = [destData[0].lon, destData[0].lat];

    // 2️⃣ Fetch OSRM route
    const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${src[0]},${src[1]};${dest[0]},${dest[1]}?overview=full&geometries=geojson`);
    const routeData = await routeRes.json();

    if (!routeData.routes || !routeData.routes.length) {
      return res.json({ success: false, error: "No route found" });
    }

    const coords = routeData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

    // 3️⃣ Optionally save a simulated bus for this route
    const bus = new SimulationBus({
      busNumber: "SIM-" + Math.floor(Math.random() * 1000),
      route: `${source} - ${destination}`,
      location: { type: "Point", coordinates: [parseFloat(src[0]), parseFloat(src[1])] },
      nextStop: destination,
      routePath: coords
    });
    await bus.save();

    res.json({
      success: true,
      bus,
      route: coords,
      distanceKm: (routeData.routes[0].distance / 1000).toFixed(2),
      durationMins: (routeData.routes[0].duration / 60).toFixed(1)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
