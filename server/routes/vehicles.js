const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");

// GET /api/vehicles — returns all vehicles with their status
router.get("/", async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll();
        res.json(vehicles);
    } catch (err) {
        console.error("GET /api/vehicles error:", err.message);
        res.status(500).json({ error: "Failed to fetch vehicles" });
    }
});

// GET /api/vehicles/available — returns only available vehicles for dispatch
router.get("/available", async (req, res) => {
    try {
        const vehicles = await Vehicle.findAvailable();
        res.json(vehicles);
    } catch (err) {
        console.error("GET /api/vehicles/available error:", err.message);
        res.status(500).json({ error: "Failed to fetch available vehicles" });
    }
});

module.exports = router;
