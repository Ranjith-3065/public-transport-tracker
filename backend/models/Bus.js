// models/Bus.js
const mongoose = require("mongoose");

const BusSchema = new mongoose.Schema({
  busNumber: String,
  route: String,
  status: { type: String, default: "On Time" },
  location: { type: { type: String, enum: ["Point"], default: "Point" }, coordinates: [Number] },
  nextStop: String,
}, { timestamps: true });

BusSchema.index({ location: "2dsphere" }); // for geospatial queries

module.exports = mongoose.model("Bus", BusSchema);
