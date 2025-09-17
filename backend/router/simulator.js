// simulator.js
const mongoose = require("mongoose");
const SimulationBus = require("./models/simulationbus");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("✅ Connected to DB for simulation");
  runSimulation();
});

async function runSimulation() {
  const buses = await SimulationBus.find();

  for (let bus of buses) {
    if (!bus.routePath || bus.routePath.length === 0) continue;

    // move along route
    let i = bus.routeIndex || 0;
    const [lng, lat] = bus.routePath[i];
    bus.location = { type: "Point", coordinates: [lng, lat] };
    bus.routeIndex = (i + 1) % bus.routePath.length;

    await bus.save();
    console.log(`🚍 ${bus.busNumber} moved to ${lat}, ${lng}`);
  }

  setTimeout(runSimulation, 5000); // move every 5s
}

