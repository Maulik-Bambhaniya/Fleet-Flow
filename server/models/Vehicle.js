/*
  Vehicle model — wraps PostgreSQL queries for the "vehicles" table.
  Tracks fleet assets with status management for maintenance and dispatch.
  Statuses: 'Available' | 'On Trip' | 'In Shop' | 'Out of Service'
*/

const pool = require("../config/db");

const Vehicle = {
    // Ensure the table exists
    async createTable() {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        license_plate VARCHAR(100) UNIQUE NOT NULL,
        type VARCHAR(100) NOT NULL DEFAULT 'Truck',
        max_capacity NUMERIC DEFAULT 0,
        region VARCHAR(100),
        odometer NUMERIC DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'Available',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    },

    // Fetch all vehicles
    async findAll() {
        const { rows } = await pool.query(
            "SELECT * FROM vehicles ORDER BY name ASC"
        );
        return rows;
    },

    // Fetch vehicles filtered by status
    async findByStatus(status) {
        const { rows } = await pool.query(
            "SELECT * FROM vehicles WHERE status = $1 ORDER BY name",
            [status]
        );
        return rows;
    },

    // Fetch only available vehicles (for dispatch dropdown)
    async findAvailable() {
        const { rows } = await pool.query(
            "SELECT * FROM vehicles WHERE status = 'Available' ORDER BY name ASC"
        );
        return rows;
    },

    // Fetch a single vehicle by ID
    async findById(id) {
        const { rows } = await pool.query(
            "SELECT * FROM vehicles WHERE id = $1",
            [id]
        );
        return rows[0] || null;
    },

    // Get count of active (non-out-of-service) vehicles
    async getActiveCount() {
        const { rows } = await pool.query(
            "SELECT COUNT(*) FROM vehicles WHERE status != 'Out of Service'"
        );
        return parseInt(rows[0].count);
    },

    // Get utilization percentage (On Trip / Total)
    async getUtilizationPercentage() {
        const { rows: totalRows } = await pool.query("SELECT COUNT(*) FROM vehicles");
        const { rows: activeRows } = await pool.query("SELECT COUNT(*) FROM vehicles WHERE status = 'On Trip' OR status = 'Available'");

        const total = parseInt(totalRows[0].count);
        const active = parseInt(activeRows[0].count);

        if (total === 0) return 0;
        return Math.round((active / total) * 100);
    },

    // Get count of vehicles grouped by their status
    async getStatusCounts() {
        const { rows } = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN LOWER(status) = 'available' THEN 1 ELSE 0 END) as available,
                SUM(CASE WHEN LOWER(status) = 'on trip' OR LOWER(status) = 'on_trip' THEN 1 ELSE 0 END) as on_trip,
                SUM(CASE WHEN LOWER(status) = 'in shop' OR LOWER(status) = 'in_shop' THEN 1 ELSE 0 END) as in_shop,
                SUM(CASE WHEN LOWER(status) = 'critical' OR LOWER(status) = 'out of service' THEN 1 ELSE 0 END) as critical
            FROM vehicles
        `);
        return rows[0];
    },

    // Create a new vehicle
    async create({ name, license_plate, type = "Truck", max_capacity = 0, odometer = 0, region = null, status = "Available" }) {
        const { rows } = await pool.query(
            `INSERT INTO vehicles (name, license_plate, type, max_capacity, odometer, region, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [name, license_plate, type, max_capacity, odometer, region, status]
        );
        return rows[0];
    },

    // Update vehicle status
    async updateStatus(id, status) {
        const { rows } = await pool.query(
            `UPDATE vehicles SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [status, id]
        );
        return rows[0];
    },

    // Update a vehicle
    async update(id, fields) {
        const sets = [];
        const values = [];
        let i = 1;

        for (const [key, value] of Object.entries(fields)) {
            sets.push(`${key} = $${i}`);
            values.push(value);
            i++;
        }
        sets.push(`updated_at = NOW()`);
        values.push(id);

        const { rows } = await pool.query(
            `UPDATE vehicles SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
            values
        );
        return rows[0];
    },

    // Seed default vehicles for development
    async seedDefaults() {
        const { rows } = await pool.query("SELECT COUNT(*) FROM vehicles");
        if (parseInt(rows[0].count) > 0) return;

        const defaults = [
            { name: "Volvo FH16 - #402", license_plate: "V78-992-KL", type: "Truck", max_capacity: 18000, odometer: 125000, region: "North West" },
            { name: "Mercedes Actros - #205", license_plate: "M45-123-ZZ", type: "Truck", max_capacity: 15000, odometer: 98000, region: "East Coast" },
            { name: "Scania R500 - #112", license_plate: "S88-554-PL", type: "Truck", max_capacity: 20000, odometer: 210000, region: "South" },
            { name: "Ford Transit - #VAN04", license_plate: "F12-332-NY", type: "Van", max_capacity: 1500, odometer: 45000, region: "East Coast" },
            { name: "Kenworth T680 - #301", license_plate: "K99-112-TX", type: "Truck", max_capacity: 22000, odometer: 175000, region: "South West" },
            { name: "Volvo VNL - #410", license_plate: "V22-118-CA", type: "Truck", max_capacity: 19000, odometer: 142000, region: "North West" },
            { name: "Ram ProMaster - #VAN09", license_plate: "R44-991-FL", type: "Van", max_capacity: 1800, odometer: 62000, region: "South East" },
            { name: "Peterbilt 579 - #550", license_plate: "P11-223-AZ", type: "Truck", max_capacity: 24000, odometer: 198000, region: "South West" },
        ];

        for (const v of defaults) {
            await Vehicle.create(v);
        }
    },
};

module.exports = Vehicle;
