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

    // Seed default trips for development
    async seedDefaults(vehicleMap = {}) {
        const { rows } = await pool.query("SELECT COUNT(*) FROM trips");
        if (parseInt(rows[0].count, 10) > 0) return;

        const trips = [
            { origin: "Seattle, WA", destination: "Portland, OR", cargo_type: "Electronics", vehicle_name: "Volvo FH16 - #402", driver_name: "Robert Jones", status: "completed", days_ago: 28 },
            { origin: "Los Angeles, CA", destination: "San Francisco, CA", cargo_type: "General Freight", vehicle_name: "Scania R500 - #112", driver_name: "Sarah Johnson", status: "completed", days_ago: 26 },
            { origin: "Chicago, IL", destination: "Detroit, MI", cargo_type: "Auto Parts", vehicle_name: "Kenworth T680 - #301", driver_name: "Michael Chen", status: "completed", days_ago: 24 },
            { origin: "Dallas, TX", destination: "Houston, TX", cargo_type: "Chemicals", vehicle_name: "Freightliner Cascadia - #610", driver_name: "James Wilson", status: "completed", days_ago: 22 },
            { origin: "Miami, FL", destination: "Orlando, FL", cargo_type: "Perishable Goods", vehicle_name: "Mack Anthem - #331", driver_name: "Maria Garcia", status: "completed", days_ago: 20 },
            { origin: "New York, NY", destination: "Boston, MA", cargo_type: "Retail Goods", vehicle_name: "DAF XF - #815", driver_name: "Lisa Anderson", status: "completed", days_ago: 18 },
            { origin: "Denver, CO", destination: "Salt Lake City, UT", cargo_type: "Construction Materials", vehicle_name: "Kenworth W990 - #305", driver_name: "Thomas Davis", status: "completed", days_ago: 16 },
            { origin: "Phoenix, AZ", destination: "Las Vegas, NV", cargo_type: "General Freight", vehicle_name: "Peterbilt 579 - #550", driver_name: "Christopher Lee", status: "completed", days_ago: 14 },
            { origin: "Atlanta, GA", destination: "Nashville, TN", cargo_type: "Food Products", vehicle_name: "Ram ProMaster - #VAN09", driver_name: "Elena Rodriguez", status: "completed", days_ago: 12 },
            { origin: "San Diego, CA", destination: "Los Angeles, CA", cargo_type: "Electronics", vehicle_name: "Volvo VNL - #410", driver_name: "Amanda Martinez", status: "completed", days_ago: 10 },
            { origin: "Portland, OR", destination: "Seattle, WA", cargo_type: "Lumber", vehicle_name: "Volvo FH16 - #402", driver_name: "Robert Jones", status: "completed", days_ago: 9 },
            { origin: "Minneapolis, MN", destination: "Milwaukee, WI", cargo_type: "Machinery", vehicle_name: "MAN TGX - #920", driver_name: "Daniel Taylor", status: "completed", days_ago: 8 },
            { origin: "Detroit, MI", destination: "Columbus, OH", cargo_type: "Auto Parts", vehicle_name: "International LT - #720", driver_name: "Kevin Brown", status: "completed", days_ago: 7 },
            { origin: "Tampa, FL", destination: "Jacksonville, FL", cargo_type: "Medical Supplies", vehicle_name: "Ford Transit - #VAN04", driver_name: "Stephanie Clark", status: "completed", days_ago: 6 },
            { origin: "Sacramento, CA", destination: "Reno, NV", cargo_type: "General Freight", vehicle_name: "Volvo VNR - #430", driver_name: "Michael Chen", status: "completed", days_ago: 5 },
            { origin: "Houston, TX", destination: "San Antonio, TX", cargo_type: "Hazardous Materials", vehicle_name: "Freightliner Cascadia - #610", driver_name: "James Wilson", status: "completed", days_ago: 4 },
            { origin: "Boston, MA", destination: "Philadelphia, PA", cargo_type: "Pharmaceuticals", vehicle_name: "DAF XF - #815", driver_name: "Lisa Anderson", status: "completed", days_ago: 3 },
            { origin: "Charlotte, NC", destination: "Raleigh, NC", cargo_type: "Textiles", vehicle_name: "Mack Anthem - #331", driver_name: "Maria Garcia", status: "completed", days_ago: 2 },
            // Active dispatched trips
            { origin: "Seattle, WA", destination: "San Francisco, CA", cargo_type: "Tech Equipment", vehicle_name: "Volvo FH16 - #402", driver_name: "Robert Jones", status: "dispatched", days_ago: 1 },
            { origin: "Chicago, IL", destination: "Indianapolis, IN", cargo_type: "Retail Goods", vehicle_name: "International LT - #720", driver_name: "Sarah Johnson", status: "dispatched", days_ago: 0 },
            { origin: "Miami, FL", destination: "Atlanta, GA", cargo_type: "Perishable Goods", vehicle_name: "Freightliner Cascadia - #610", driver_name: "James Wilson", status: "dispatched", days_ago: 0 },
            { origin: "Denver, CO", destination: "Phoenix, AZ", cargo_type: "Machinery", vehicle_name: "Volvo VNR - #430", driver_name: "Thomas Davis", status: "dispatched", days_ago: 0 },
            // Draft trips
            { origin: "New York, NY", destination: "Washington, DC", cargo_type: "Government Supplies", vehicle_name: null, driver_name: null, status: "draft", days_ago: 0 },
            { origin: "Los Angeles, CA", destination: "Phoenix, AZ", cargo_type: "Electronics", vehicle_name: null, driver_name: null, status: "draft", days_ago: 0 },
            // Cancelled
            { origin: "Dallas, TX", destination: "Oklahoma City, OK", cargo_type: "Furniture", vehicle_name: "Peterbilt 579 - #550", driver_name: "David Miller", status: "cancelled", days_ago: 15 },
        ];

        for (const t of trips) {
            const depDate = new Date();
            depDate.setDate(depDate.getDate() - t.days_ago);
            await Trip.create({
                origin: t.origin,
                destination: t.destination,
                cargo_type: t.cargo_type,
                vehicle_name: t.vehicle_name,
                driver_name: t.driver_name,
                status: t.status,
                scheduled_departure: depDate.toISOString(),
            });
        }
    },
};

module.exports = Trip;
