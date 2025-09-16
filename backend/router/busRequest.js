// routes/busRequests.js
const express = require("express");
const BusRequest = require("../models/BusRequest");
const router = express.Router();

// Submit new request
router.post("/", async (req, res) => {
  try {
    const newRequest = new BusRequest(req.body);
    await newRequest.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Authority can fetch all requests
router.get("/", async (req, res) => {
  const requests = await BusRequest.find().sort({ createdAt: -1 });
  res.json({ success: true, requests });
});

// Authority can update status
router.put("/:id", async (req, res) => {
  const updated = await BusRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json({ success: true, updated });
});

router.get("/pending", async (req, res) => {
  const requests = await BusRequest.find({ status: "Pending" }).sort({ createdAt: -1 });
  res.json({ success: true, requests });
});

// Update status (forward / reject)
router.post("/:id/status", async (req, res) => {
  const { status } = req.body;  // "Forwarded", "Rejected", "Approved"
  await BusRequest.findByIdAndUpdate(req.params.id, { status });
  res.json({ success: true });
});

router.get("/approved", async (req, res) => {
  try {
    const requests = await BusRequest.find({ status: "Municipal Approved" }).sort({ createdAt: -1 });
    res.json({ success: true, requests }); // ✅ send JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
