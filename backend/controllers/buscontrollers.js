const express = require("express")
const router = require("router")

exports.dashboard = authMiddleware,(req, res) => {
  res.render("dashboard", { title: "Bus Tracker Dashboard" });
};
