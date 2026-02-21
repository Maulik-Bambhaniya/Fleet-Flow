const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/**
 * GET /api/search?q=<query>
 * Global search across vehicles, drivers, trips, maintenance logs
 * Returns categorized results (top 5 per category)
 */
router.get("/", async (req, res) => {
    try {
        const q = req.query.q;
        if (!q || q.trim().length < 2) {
            return res.json({ vehicles: [], drivers: [], trips: [], maintenance: [] });
        }

        const search = `%${q.trim()}%`;

        const [vehicles, drivers, trips, maintenance] = await Promise.all([
            pool.query(
                `SELECT id, name, license_plate, type, status, region
                 FROM vehicles
                 WHERE name ILIKE $1 OR license_plate ILIKE $1 OR type ILIKE $1 OR region ILIKE $1
                 ORDER BY name ASC LIMIT 5`,
                [search]
            ),
            pool.query(
                `SELECT id, name, license_id, status, experience_yrs, safety_score
                 FROM drivers
                 WHERE name ILIKE $1 OR license_id ILIKE $1
                 ORDER BY name ASC LIMIT 5`,
                [search]
            ),
            pool.query(
                `SELECT id, trip_id, origin, destination, vehicle_name, driver_name, status, cargo_type
                 FROM trips
                 WHERE trip_id ILIKE $1 OR origin ILIKE $1 OR destination ILIKE $1 
                    OR vehicle_name ILIKE $1 OR driver_name ILIKE $1 OR cargo_type ILIKE $1
                 ORDER BY created_at DESC LIMIT 5`,
                [search]
            ),
            pool.query(
                `SELECT ml.id, ml.service_type, ml.status, ml.service_date, ml.cost,
                        v.name as vehicle_name, v.license_plate
                 FROM maintenance_logs ml
                 LEFT JOIN vehicles v ON ml.vehicle_id = v.id
                 WHERE ml.service_type ILIKE $1 OR ml.notes ILIKE $1 
                    OR v.name ILIKE $1 OR v.license_plate ILIKE $1
                 ORDER BY ml.service_date DESC LIMIT 5`,
                [search]
            ),
        ]);

        res.json({
            vehicles: vehicles.rows,
            drivers: drivers.rows,
            trips: trips.rows,
            maintenance: maintenance.rows,
        });
    } catch (err) {
        console.error("Search error:", err.message);
        res.status(500).json({ message: "Search failed" });
    }
});

module.exports = router;
