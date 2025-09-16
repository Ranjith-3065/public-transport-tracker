const mongoose = require("mongoose");

const BusSchema = new mongoose.Schema({
  busNumber: String,
  route: String,
  status: { type: String, default: "On Time" },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: [Number] // [lng, lat]
  },
  nextStop: String,
  routePath: { type: [[Number]], default: [] } // [[lat, lng], ...]
}, { timestamps: true });

BusSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("SimulationBus", BusSchema);
