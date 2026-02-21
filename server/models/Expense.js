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
            { trip_id: "TR-2026-001", vehicle_name: "Volvo FH16 - #402", vehicle_code: "V-402", route_from: "Seattle", route_to: "Portland", date_completed: "2026-01-24", fuel_cost: 342.50, maintenance_cost: 0, fuel_liters: 120, distance_km: 280 },
            { trip_id: "TR-2026-002", vehicle_name: "Scania R500 - #112", vehicle_code: "V-112", route_from: "Los Angeles", route_to: "San Francisco", date_completed: "2026-01-26", fuel_cost: 585.20, maintenance_cost: 150.00, fuel_liters: 205, distance_km: 615 },
            { trip_id: "TR-2026-003", vehicle_name: "Kenworth T680 - #301", vehicle_code: "V-301", route_from: "Chicago", route_to: "Detroit", date_completed: "2026-01-28", fuel_cost: 512.80, maintenance_cost: 120.00, fuel_liters: 180, distance_km: 450 },
            { trip_id: "TR-2026-004", vehicle_name: "Freightliner Cascadia - #610", vehicle_code: "V-610", route_from: "Dallas", route_to: "Houston", date_completed: "2026-01-30", fuel_cost: 215.45, maintenance_cost: 0, fuel_liters: 75, distance_km: 390 },
            { trip_id: "TR-2026-005", vehicle_name: "Mack Anthem - #331", vehicle_code: "V-331", route_from: "Miami", route_to: "Orlando", date_completed: "2026-02-01", fuel_cost: 185.90, maintenance_cost: 55.00, fuel_liters: 65, distance_km: 380 },
            { trip_id: "TR-2026-006", vehicle_name: "DAF XF - #815", vehicle_code: "V-815", route_from: "New York", route_to: "Boston", date_completed: "2026-02-03", fuel_cost: 445.60, maintenance_cost: 0, fuel_liters: 156, distance_km: 345 },
            { trip_id: "TR-2026-007", vehicle_name: "Kenworth W990 - #305", vehicle_code: "V-305", route_from: "Denver", route_to: "Salt Lake City", date_completed: "2026-02-05", fuel_cost: 620.30, maintenance_cost: 200.00, fuel_liters: 218, distance_km: 830 },
            { trip_id: "TR-2026-008", vehicle_name: "Peterbilt 579 - #550", vehicle_code: "V-550", route_from: "Phoenix", route_to: "Las Vegas", date_completed: "2026-02-07", fuel_cost: 298.75, maintenance_cost: 0, fuel_liters: 105, distance_km: 480 },
            { trip_id: "TR-2026-009", vehicle_name: "Ram ProMaster - #VAN09", vehicle_code: "V-VAN09", route_from: "Atlanta", route_to: "Nashville", date_completed: "2026-02-09", fuel_cost: 178.40, maintenance_cost: 0, fuel_liters: 62, distance_km: 400 },
            { trip_id: "TR-2026-010", vehicle_name: "Volvo VNL - #410", vehicle_code: "V-410", route_from: "San Diego", route_to: "Los Angeles", date_completed: "2026-02-11", fuel_cost: 89.50, maintenance_cost: 75.00, fuel_liters: 31, distance_km: 195 },
            { trip_id: "TR-2026-011", vehicle_name: "Volvo FH16 - #402", vehicle_code: "V-402", route_from: "Portland", route_to: "Seattle", date_completed: "2026-02-12", fuel_cost: 320.10, maintenance_cost: 0, fuel_liters: 112, distance_km: 280 },
            { trip_id: "TR-2026-012", vehicle_name: "MAN TGX - #920", vehicle_code: "V-920", route_from: "Minneapolis", route_to: "Milwaukee", date_completed: "2026-02-13", fuel_cost: 265.90, maintenance_cost: 85.00, fuel_liters: 93, distance_km: 540 },
            { trip_id: "TR-2026-013", vehicle_name: "International LT - #720", vehicle_code: "V-720", route_from: "Detroit", route_to: "Columbus", date_completed: "2026-02-14", fuel_cost: 198.30, maintenance_cost: 0, fuel_liters: 70, distance_km: 310 },
            { trip_id: "TR-2026-014", vehicle_name: "Ford Transit - #VAN04", vehicle_code: "V-VAN04", route_from: "Tampa", route_to: "Jacksonville", date_completed: "2026-02-15", fuel_cost: 142.60, maintenance_cost: 0, fuel_liters: 50, distance_km: 320 },
            { trip_id: "TR-2026-015", vehicle_name: "Volvo VNR - #430", vehicle_code: "V-430", route_from: "Sacramento", route_to: "Reno", date_completed: "2026-02-16", fuel_cost: 198.90, maintenance_cost: 0, fuel_liters: 70, distance_km: 215 },
            { trip_id: "TR-2026-016", vehicle_name: "Freightliner Cascadia - #610", vehicle_code: "V-610", route_from: "Houston", route_to: "San Antonio", date_completed: "2026-02-17", fuel_cost: 165.20, maintenance_cost: 310.00, fuel_liters: 58, distance_km: 315 },
            { trip_id: "TR-2026-017", vehicle_name: "DAF XF - #815", vehicle_code: "V-815", route_from: "Boston", route_to: "Philadelphia", date_completed: "2026-02-18", fuel_cost: 488.40, maintenance_cost: 0, fuel_liters: 171, distance_km: 500 },
            { trip_id: "TR-2026-018", vehicle_name: "Mack Anthem - #331", vehicle_code: "V-331", route_from: "Charlotte", route_to: "Raleigh", date_completed: "2026-02-19", fuel_cost: 124.80, maintenance_cost: 0, fuel_liters: 44, distance_km: 270 },
            { trip_id: "TR-2026-019", vehicle_name: "Scania R500 - #112", vehicle_code: "V-112", route_from: "San Francisco", route_to: "Portland", date_completed: "2026-02-10", fuel_cost: 625.00, maintenance_cost: 0, fuel_liters: 219, distance_km: 1015 },
            { trip_id: "TR-2026-020", vehicle_name: "Kenworth T680 - #301", vehicle_code: "V-301", route_from: "Detroit", route_to: "Chicago", date_completed: "2026-02-08", fuel_cost: 490.30, maintenance_cost: 180.00, fuel_liters: 172, distance_km: 450 },
            { trip_id: "TR-2026-021", vehicle_name: "Mercedes Actros - #205", vehicle_code: "V-205", route_from: "Newark", route_to: "Baltimore", date_completed: "2026-02-06", fuel_cost: 275.60, maintenance_cost: 420.00, fuel_liters: 97, distance_km: 310 },
            { trip_id: "TR-2026-022", vehicle_name: "Ford E-Transit - #VAN15", vehicle_code: "V-VAN15", route_from: "Seattle", route_to: "Tacoma", date_completed: "2026-02-04", fuel_cost: 45.00, maintenance_cost: 0, fuel_liters: 16, distance_km: 55 },
        ];

        for (const s of seeds) {
            await Expense.create(s);
        }
    },
};

module.exports = Expense;
