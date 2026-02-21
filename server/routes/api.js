const express = require("express");
const router = express.Router();

// @route   GET /api/status
// @desc    Health-check endpoint
router.get("/status", (req, res) => {
    res.json({
        status: "ok",
        message: "Fleet-Flow API is running",
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
