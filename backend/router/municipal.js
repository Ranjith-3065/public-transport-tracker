const express = require("express");
const router = express.Router();
const Request = require("../models/BusRequest"); // your schema
const authMiddleware = require("../middleware/authmiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Municipal dashboard - show forwarded requests
router.get("/", authMiddleware, roleMiddleware("municipal"), async (req, res) => {
  try {
    const requests = await Request.find({ status: "Forwarded" }).sort({ createdAt: -1 });
    res.render("municipal", { requests });  // ✅ pass requests always
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading municipal dashboard");
  }
});


// Municipal decision
// Municipal decision
router.post("/:id/decision", async (req, res) => {
  try {
    const { decision } = req.body; // "Approved" or "Rejected"

    let newStatus = decision;
    if (decision === "Approved") {
      // Send back to Authority for bus addition
      newStatus = "Municipal Approved";
    }

    await Request.findByIdAndUpdate(req.params.id, { status: newStatus });
    res.redirect("/municipal");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating request");
  }
});


module.exports = router;
