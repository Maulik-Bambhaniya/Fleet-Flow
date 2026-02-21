const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// @route   GET /api/status
// @desc    Health-check — verifies PostgreSQL connection
router.get("/status", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            status: "ok",
            database: "postgresql (supabase)",
            message: "Fleet-Flow API is running",
            serverTime: result.rows[0].now,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message || "Database connection failed",
        });
    }
});

module.exports = router;
