const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const jwt = require("jsonwebtoken");

// Simple auth middleware (re-used from auth.js pattern)
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fleet_secret_key");
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}

// GET /api/trips — list with optional ?status=all|active|drafts&page=1&limit=10
router.get("/", async (req, res) => {
    try {
        const { status = "all", page = 1, limit = 10 } = req.query;
        const result = await Trip.findAll({
            status,
            page: parseInt(page),
            limit: parseInt(limit),
        });
        res.json(result);
    } catch (err) {
        console.error("GET /api/trips error:", err.message);
        res.status(500).json({ error: "Failed to fetch trips" });
    }
});

// POST /api/trips — create new trip (requires auth)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            origin,
            destination,
            scheduled_departure,
            cargo_type,
            vehicle_id,
            vehicle_name,
            driver_name,
            notes,
            status,
        } = req.body;

        if (!origin || !destination) {
            return res.status(400).json({ error: "Origin and destination are required" });
        }

        const trip = await Trip.create({
            origin,
            destination,
            scheduled_departure,
            cargo_type: cargo_type || "General Freight",
            vehicle_id,
            vehicle_name,
            driver_name,
            notes,
            status: status || "dispatched",
            created_by: req.user?.id || null,
        });

        res.status(201).json(trip);
    } catch (err) {
        console.error("POST /api/trips error:", err.message);
        res.status(500).json({ error: "Failed to create trip" });
    }
});

// PATCH /api/trips/:id/status — update trip status
router.patch("/:id/status", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ["draft", "dispatched", "completed", "cancelled"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }
        const trip = await Trip.updateStatus(req.params.id, status);
        if (!trip) return res.status(404).json({ error: "Trip not found" });
        res.json(trip);
    } catch (err) {
        console.error("PATCH /api/trips/:id/status error:", err.message);
        res.status(500).json({ error: "Failed to update trip status" });
    }
});

// DELETE /api/trips/:id — cancel a trip
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const trip = await Trip.cancel(req.params.id);
        if (!trip) return res.status(404).json({ error: "Trip not found" });
        res.json({ message: "Trip cancelled", trip });
    } catch (err) {
        console.error("DELETE /api/trips/:id error:", err.message);
        res.status(500).json({ error: "Failed to cancel trip" });
    }
});

module.exports = router;
