const express = require("express");
const router = express.Router();
const Driver = require("../models/Driver");

// GET /api/drivers — returns all drivers with their status
router.get("/", async (req, res) => {
    try {
        const drivers = await Driver.findAll();
        res.json(drivers);
    } catch (err) {
        console.error("GET /api/drivers error:", err.message);
        res.status(500).json({ error: "Failed to fetch drivers" });
    }
});

// GET /api/drivers/available — returns only available drivers for dispatch
router.get("/available", async (req, res) => {
    try {
        const drivers = await Driver.findAvailable();
        res.json(drivers);
    } catch (err) {
        console.error("GET /api/drivers/available error:", err.message);
        res.status(500).json({ error: "Failed to fetch available drivers" });
    }
});

module.exports = router;
