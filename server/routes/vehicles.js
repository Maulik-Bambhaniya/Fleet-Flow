const express = require("express");
const { auth } = require("../middleware/auth");
const Vehicle = require("../models/Vehicle");

const router = express.Router();

// @route   GET /api/vehicles
// @desc    List all vehicles
router.get("/", auth, async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll();
        res.json(vehicles);
    } catch (err) {
        console.error("List vehicles error:", err.message);
        res.status(500).json({ message: "Server error fetching vehicles" });
    }
});

// @route   POST /api/vehicles
// @desc    Create a new vehicle
router.post("/", auth, async (req, res) => {
    try {
        const { name, license_plate, type, max_capacity, odometer } = req.body;

        if (!name || !license_plate) {
            return res.status(400).json({ message: "Name and license plate are required" });
        }

        const vehicle = await Vehicle.create({ name, license_plate, type, max_capacity, odometer });
        res.status(201).json(vehicle);
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ message: "A vehicle with this license plate already exists" });
        }
        console.error("Create vehicle error:", err.message);
        res.status(500).json({ message: "Server error creating vehicle" });
    }
});

module.exports = router;
