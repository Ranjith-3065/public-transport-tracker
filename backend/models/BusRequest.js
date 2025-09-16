// models/BusRequest.js
const mongoose = require("mongoose");

const busRequestSchema = new mongoose.Schema({
  town: String,
  source: String,
  destination: String,
  reason: String,
  status: { type: String, default: "Pending" }, // Pending | Approved | Rejected
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BusRequest", busRequestSchema);
