/*
  Trip model — wraps PostgreSQL queries for the "trips" table.
  Statuses: 'draft' | 'dispatched' | 'completed' | 'cancelled'
*/

const pool = require("../config/db");

const Trip = {
    async createTable() {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        trip_id      VARCHAR(30) UNIQUE NOT NULL,
        origin       VARCHAR(255) NOT NULL,
        destination  VARCHAR(255) NOT NULL,
        scheduled_departure TIMESTAMPTZ,
        cargo_type   VARCHAR(100) NOT NULL DEFAULT 'General Freight',
        vehicle_id   UUID REFERENCES vehicles(id) ON DELETE SET NULL,
        vehicle_name VARCHAR(255),
        driver_name  VARCHAR(255),
        notes        TEXT,
        status       VARCHAR(30) NOT NULL DEFAULT 'draft',
        created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    },

    // Generate a sequential trip ID like TR-2024-001
    async generateTripId() {
        const year = new Date().getFullYear();
        const { rows } = await pool.query(
            "SELECT COUNT(*) FROM trips WHERE trip_id LIKE $1",
            [`TR-${year}-%`]
        );
        const count = parseInt(rows[0].count, 10) + 1;
        return `TR-${year}-${String(count).padStart(3, "0")}`;
    },

    // Fetch all trips with optional status filter and pagination
    async findAll({ status = null, page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        const values = [];
        let whereClause = "";

        if (status && status !== "all") {
            if (status === "active") {
                whereClause = "WHERE status = 'dispatched'";
            } else if (status === "drafts") {
                whereClause = "WHERE status = 'draft'";
            } else {
                whereClause = "WHERE status = $1";
                values.push(status);
            }
        }

        const countValues = [...values];
        const { rows: countRows } = await pool.query(
            `SELECT COUNT(*) FROM trips ${whereClause}`,
            countValues
        );
        const total = parseInt(countRows[0].count, 10);

        values.push(limit, offset);
        const limitIdx = values.length - 1;
        const offsetIdx = values.length;

        const { rows } = await pool.query(
            `SELECT * FROM trips ${whereClause} ORDER BY created_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
            values
        );

        return { trips: rows, total };
    },

    // Create a new trip
    async create({ origin, destination, scheduled_departure, cargo_type, vehicle_id, vehicle_name, driver_name, notes, status = "dispatched", created_by }) {
        const trip_id = await Trip.generateTripId();
        const { rows } = await pool.query(
            `INSERT INTO trips
        (trip_id, origin, destination, scheduled_departure, cargo_type, vehicle_id, vehicle_name, driver_name, notes, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
            [trip_id, origin, destination, scheduled_departure || null, cargo_type, vehicle_id || null, vehicle_name || null, driver_name || null, notes || null, status, created_by || null]
        );
        return rows[0];
    },

    // Update trip status
    async updateStatus(id, status) {
        const { rows } = await pool.query(
            "UPDATE trips SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
            [status, id]
        );
        return rows[0];
    },

    // Cancel (soft-delete) a trip
    async cancel(id) {
        return Trip.updateStatus(id, "cancelled");
    },
};

module.exports = Trip;
