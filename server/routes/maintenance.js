const express = require("express");
const { auth } = require("../middleware/auth");
const MaintenanceLog = require("../models/MaintenanceLog");

const router = express.Router();

// @route   GET /api/maintenance/stats
// @desc    Get dashboard KPI statistics
router.get("/stats", auth, async (req, res) => {
    try {
        const stats = await MaintenanceLog.getStats();
        res.json(stats);
    } catch (err) {
        console.error("Stats error:", err.message);
        res.status(500).json({ message: "Server error fetching stats" });
    }
});

// @route   GET /api/maintenance/export/csv
// @desc    Export maintenance logs as CSV
router.get("/export/csv", auth, async (req, res) => {
    try {
        const { vehicle_id, status, date_from, date_to } = req.query;
        const logs = await MaintenanceLog.findAll({ vehicle_id, status, date_from, date_to });

        const header = "Vehicle,License Plate,Service Type,Cost,Date,Status,Notes\n";
        const csvRows = logs.map((log) => {
            const cost = log.cost != null ? `$${parseFloat(log.cost).toFixed(2)}` : "TBD";
            const date = new Date(log.service_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
            });
            const notes = (log.notes || "").replace(/"/g, '""');
            return `"${log.vehicle_name}","${log.license_plate}","${log.service_type}","${cost}","${date}","${log.status}","${notes}"`;
        });

        const csv = header + csvRows.join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=maintenance_logs.csv");
        res.send(csv);
    } catch (err) {
        console.error("CSV export error:", err.message);
        res.status(500).json({ message: "Server error exporting CSV" });
    }
});

// @route   GET /api/maintenance
// @desc    List all maintenance logs with optional filters
router.get("/", auth, async (req, res) => {
    try {
        const { vehicle_id, status, date_from, date_to, search } = req.query;
        const logs = await MaintenanceLog.findAll({ vehicle_id, status, date_from, date_to, search });
        res.json(logs);
    } catch (err) {
        console.error("List maintenance error:", err.message);
        res.status(500).json({ message: "Server error fetching maintenance logs" });
    }
});

// @route   GET /api/maintenance/:id
// @desc    Get a single maintenance log
router.get("/:id", auth, async (req, res) => {
    try {
        const log = await MaintenanceLog.findById(req.params.id);
        if (!log) return res.status(404).json({ message: "Maintenance log not found" });
        res.json(log);
    } catch (err) {
        console.error("Get maintenance error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   POST /api/maintenance
// @desc    Create a new maintenance log
router.post("/", auth, async (req, res) => {
    try {
        const { vehicle_id, service_type, cost, service_date, status, notes } = req.body;

        if (!vehicle_id || !service_type) {
            return res.status(400).json({ message: "Vehicle and service type are required" });
        }

        const log = await MaintenanceLog.create({
            vehicle_id,
            service_type,
            cost,
            service_date: service_date || new Date().toISOString().split("T")[0],
            status: status || "Scheduled",
            notes,
        });

        // Fetch with vehicle info
        const full = await MaintenanceLog.findById(log.id);
        res.status(201).json(full);
    } catch (err) {
        console.error("Create maintenance error:", err.message);
        res.status(500).json({ message: "Server error creating maintenance log" });
    }
});

// @route   PUT /api/maintenance/:id
// @desc    Update a maintenance log
router.put("/:id", auth, async (req, res) => {
    try {
        const { vehicle_id, service_type, cost, service_date, status, notes } = req.body;
        const fields = {};
        if (vehicle_id !== undefined) fields.vehicle_id = vehicle_id;
        if (service_type !== undefined) fields.service_type = service_type;
        if (cost !== undefined) fields.cost = cost;
        if (service_date !== undefined) fields.service_date = service_date;
        if (status !== undefined) fields.status = status;
        if (notes !== undefined) fields.notes = notes;

        const log = await MaintenanceLog.update(req.params.id, fields);
        if (!log) return res.status(404).json({ message: "Maintenance log not found" });

        const full = await MaintenanceLog.findById(log.id);
        res.json(full);
    } catch (err) {
        console.error("Update maintenance error:", err.message);
        res.status(500).json({ message: "Server error updating maintenance log" });
    }
});

// @route   DELETE /api/maintenance/:id
// @desc    Delete a maintenance log
router.delete("/:id", auth, async (req, res) => {
    try {
        await MaintenanceLog.delete(req.params.id);
        res.json({ message: "Maintenance log deleted" });
    } catch (err) {
        console.error("Delete maintenance error:", err.message);
        res.status(500).json({ message: "Server error deleting maintenance log" });
    }
});

module.exports = router;
