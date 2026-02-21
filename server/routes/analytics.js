const express = require("express");
const { auth } = require("../middleware/auth");
const Analytics = require("../models/Analytics");

const router = express.Router();

// GET /api/analytics
router.get("/", auth, async (req, res) => {
    try {
        const data = await Analytics.getDashboardMetrics();
        if (!data) return res.status(404).json({ message: "Analytics data not found" });
        res.json(data);
    } catch (err) {
        console.error("Fetch analytics error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
