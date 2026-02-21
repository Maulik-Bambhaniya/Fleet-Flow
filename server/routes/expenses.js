const express = require("express");
const { auth } = require("../middleware/auth");
const Expense = require("../models/Expense");

const router = express.Router();

// GET /api/expenses/stats
router.get("/stats", auth, async (req, res) => {
    try {
        const stats = await Expense.getStats();
        res.json(stats);
    } catch (err) {
        console.error("Expense stats error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/expenses/export/csv
router.get("/export/csv", auth, async (req, res) => {
    try {
        const logs = await Expense.findAll(req.query);
        const header = "Trip ID,Date,Vehicle,Route,Fuel Cost,Maintenance Cost,Total\n";
        const rows = logs.map((l) => {
            const total = (parseFloat(l.fuel_cost) + parseFloat(l.maintenance_cost)).toFixed(2);
            return `"${l.trip_id}","${l.date_completed}","${l.vehicle_name}","${l.route_from} → ${l.route_to}","$${l.fuel_cost}","$${l.maintenance_cost}","$${total}"`;
        });
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=expenses.csv");
        res.send(header + rows.join("\n"));
    } catch (err) {
        console.error("Expense CSV error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/expenses
router.get("/", auth, async (req, res) => {
    try {
        const logs = await Expense.findAll(req.query);
        res.json(logs);
    } catch (err) {
        console.error("List expenses error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/expenses
router.post("/", auth, async (req, res) => {
    try {
        const expense = await Expense.create(req.body);
        res.status(201).json(expense);
    } catch (err) {
        console.error("Create expense error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE /api/expenses/:id
router.delete("/:id", auth, async (req, res) => {
    try {
        await Expense.delete(req.params.id);
        res.json({ message: "Expense deleted" });
    } catch (err) {
        console.error("Delete expense error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
