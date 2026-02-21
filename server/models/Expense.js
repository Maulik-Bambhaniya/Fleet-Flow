/*
  Expense model — wraps PostgreSQL queries for the "expenses" table.
  Tracks fuel and maintenance costs per completed trip/vehicle.
*/

const pool = require("../config/db");

const Expense = {
    async createTable() {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        trip_id VARCHAR(50),
        vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
        vehicle_name VARCHAR(255),
        vehicle_code VARCHAR(50),
        route_from VARCHAR(255),
        route_to VARCHAR(255),
        date_completed DATE NOT NULL DEFAULT CURRENT_DATE,
        fuel_cost NUMERIC DEFAULT 0,
        maintenance_cost NUMERIC DEFAULT 0,
        fuel_liters NUMERIC DEFAULT 0,
        distance_km NUMERIC DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    },

    // Fetch all expenses with optional filters
    async findAll({ vehicle_id, date_from, date_to, search } = {}) {
        let query = `SELECT * FROM expenses WHERE 1=1`;
        const values = [];
        let i = 1;

        if (vehicle_id) { query += ` AND vehicle_id = $${i}`; values.push(vehicle_id); i++; }
        if (date_from) { query += ` AND date_completed >= $${i}`; values.push(date_from); i++; }
        if (date_to) { query += ` AND date_completed <= $${i}`; values.push(date_to); i++; }
        if (search) {
            query += ` AND (trip_id ILIKE $${i} OR vehicle_name ILIKE $${i} OR route_from ILIKE $${i} OR route_to ILIKE $${i})`;
            values.push(`%${search}%`); i++;
        }
        query += " ORDER BY date_completed DESC, created_at DESC";

        const { rows } = await pool.query(query, values);
        return rows;
    },

    // Create a new expense
    async create(data) {
        const { rows } = await pool.query(
            `INSERT INTO expenses (trip_id, vehicle_id, vehicle_name, vehicle_code, route_from, route_to, date_completed, fuel_cost, maintenance_cost, fuel_liters, distance_km, notes)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
            [data.trip_id, data.vehicle_id || null, data.vehicle_name, data.vehicle_code || null,
            data.route_from, data.route_to, data.date_completed, data.fuel_cost || 0,
            data.maintenance_cost || 0, data.fuel_liters || 0, data.distance_km || 0, data.notes || null]
        );
        return rows[0];
    },

    // Delete
    async delete(id) {
        await pool.query("DELETE FROM expenses WHERE id = $1", [id]);
        return true;
    },

    // Get monthly stats
    async getStats() {
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const mtdResult = await pool.query(
            `SELECT COALESCE(SUM(fuel_cost + maintenance_cost), 0) as total,
                    COALESCE(SUM(fuel_liters), 0) as total_liters,
                    COALESCE(SUM(distance_km), 0) as total_km
             FROM expenses WHERE date_completed >= $1`,
            [firstOfMonth.toISOString().split("T")[0]]
        );

        return {
            total_mtd: parseFloat(mtdResult.rows[0].total),
            total_liters: parseFloat(mtdResult.rows[0].total_liters),
            total_km: parseFloat(mtdResult.rows[0].total_km),
        };
    },

    // Seed defaults
    async seedDefaults() {
        const { rows } = await pool.query("SELECT COUNT(*) FROM expenses");
        if (parseInt(rows[0].count) > 0) return;

        const seeds = [
            { trip_id: "TR-2026-8901", vehicle_name: "Volvo FH16", vehicle_code: "V-102", route_from: "Seattle", route_to: "Portland", date_completed: "2026-02-18", fuel_cost: 342.50, maintenance_cost: 0, fuel_liters: 120, distance_km: 280 },
            { trip_id: "TR-2026-8894", vehicle_name: "Kenworth T680", vehicle_code: "V-205", route_from: "Chicago", route_to: "Detroit", date_completed: "2026-02-17", fuel_cost: 512.80, maintenance_cost: 120.00, fuel_liters: 180, distance_km: 450 },
            { trip_id: "TR-2026-8872", vehicle_name: "Freightliner", vehicle_code: "V-108", route_from: "Dallas", route_to: "Houston", date_completed: "2026-02-16", fuel_cost: 215.45, maintenance_cost: 0, fuel_liters: 75, distance_km: 390 },
            { trip_id: "TR-2026-8850", vehicle_name: "Volvo FH16", vehicle_code: "V-102", route_from: "Portland", route_to: "Seattle", date_completed: "2026-02-15", fuel_cost: 320.10, maintenance_cost: 0, fuel_liters: 112, distance_km: 280 },
            { trip_id: "TR-2026-8849", vehicle_name: "Mack Anthem", vehicle_code: "V-331", route_from: "Miami", route_to: "Orlando", date_completed: "2026-02-14", fuel_cost: 185.90, maintenance_cost: 55.00, fuel_liters: 65, distance_km: 380 },
            { trip_id: "TR-2026-8835", vehicle_name: "Kenworth T680", vehicle_code: "V-205", route_from: "Detroit", route_to: "Toronto", date_completed: "2026-02-13", fuel_cost: 445.60, maintenance_cost: 0, fuel_liters: 156, distance_km: 380 },
        ];

        for (const s of seeds) {
            await Expense.create(s);
        }
    },
};

module.exports = Expense;
