/*
  MaintenanceLog model — wraps PostgreSQL queries for the "maintenance_logs" table.
  Links to vehicles table. Adding a log with "In Shop" or "Critical" status
  automatically sets the vehicle status to "In Shop".
*/

const pool = require("../config/db");

const MaintenanceLog = {
    // Ensure the table exists
    async createTable() {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS maintenance_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
        service_type VARCHAR(255) NOT NULL,
        cost NUMERIC,
        service_date DATE NOT NULL DEFAULT CURRENT_DATE,
        status VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    },

    // Fetch all logs with vehicle info, supports filters
    async findAll({ vehicle_id, status, date_from, date_to, search } = {}) {
        let query = `
      SELECT ml.*, v.name as vehicle_name, v.license_plate, v.type as vehicle_type
      FROM maintenance_logs ml
      JOIN vehicles v ON ml.vehicle_id = v.id
      WHERE 1=1
    `;
        const values = [];
        let i = 1;

        if (vehicle_id) {
            query += ` AND ml.vehicle_id = $${i}`;
            values.push(vehicle_id);
            i++;
        }
        if (status) {
            query += ` AND ml.status = $${i}`;
            values.push(status);
            i++;
        }
        if (date_from) {
            query += ` AND ml.service_date >= $${i}`;
            values.push(date_from);
            i++;
        }
        if (date_to) {
            query += ` AND ml.service_date <= $${i}`;
            values.push(date_to);
            i++;
        }
        if (search) {
            query += ` AND (v.name ILIKE $${i} OR v.license_plate ILIKE $${i} OR ml.service_type ILIKE $${i})`;
            values.push(`%${search}%`);
            i++;
        }

        query += " ORDER BY ml.service_date DESC, ml.created_at DESC";

        const { rows } = await pool.query(query, values);
        return rows;
    },

    // Fetch single log with vehicle info
    async findById(id) {
        const { rows } = await pool.query(
            `SELECT ml.*, v.name as vehicle_name, v.license_plate, v.type as vehicle_type
       FROM maintenance_logs ml
       JOIN vehicles v ON ml.vehicle_id = v.id
       WHERE ml.id = $1`,
            [id]
        );
        return rows[0] || null;
    },

    // Create a new maintenance log
    async create({ vehicle_id, service_type, cost, service_date, status = "Scheduled", notes }) {
        const { rows } = await pool.query(
            `INSERT INTO maintenance_logs (vehicle_id, service_type, cost, service_date, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [vehicle_id, service_type, cost || null, service_date, status, notes || null]
        );

        // Auto-status logic: set vehicle to "In Shop" if maintenance is active
        if (status === "In Shop" || status === "Critical") {
            await pool.query(
                `UPDATE vehicles SET status = 'In Shop', updated_at = NOW() WHERE id = $1`,
                [vehicle_id]
            );
        }

        return rows[0];
    },

    // Update a maintenance log
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
            `UPDATE maintenance_logs SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
            values
        );

        // If status changed to completed, check if vehicle can be set back to Available
        if (fields.status === "Completed") {
            const log = rows[0];
            if (log) {
                const { rows: activeLogs } = await pool.query(
                    `SELECT COUNT(*) FROM maintenance_logs
           WHERE vehicle_id = $1 AND id != $2 AND status IN ('In Shop', 'Critical')`,
                    [log.vehicle_id, id]
                );
                if (parseInt(activeLogs[0].count) === 0) {
                    await pool.query(
                        `UPDATE vehicles SET status = 'Available', updated_at = NOW() WHERE id = $1`,
                        [log.vehicle_id]
                    );
                }
            }
        }

        return rows[0];
    },

    // Delete a maintenance log
    async delete(id) {
        // Get the log before deleting to check vehicle status
        const log = await MaintenanceLog.findById(id);
        await pool.query("DELETE FROM maintenance_logs WHERE id = $1", [id]);

        // If this was an active maintenance, check if vehicle can go back to Available
        if (log && (log.status === "In Shop" || log.status === "Critical")) {
            const { rows: activeLogs } = await pool.query(
                `SELECT COUNT(*) FROM maintenance_logs
         WHERE vehicle_id = $1 AND status IN ('In Shop', 'Critical')`,
                [log.vehicle_id]
            );
            if (parseInt(activeLogs[0].count) === 0) {
                await pool.query(
                    `UPDATE vehicles SET status = 'Available', updated_at = NOW() WHERE id = $1`,
                    [log.vehicle_id]
                );
            }
        }

        return true;
    },

    // Get dashboard statistics
    async getStats() {
        const currentYear = new Date().getFullYear();
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Total cost YTD
        const costResult = await pool.query(
            `SELECT COALESCE(SUM(cost), 0) as total_cost
       FROM maintenance_logs
       WHERE EXTRACT(YEAR FROM service_date) = $1 AND cost IS NOT NULL`,
            [currentYear]
        );

        // In Shop count
        const inShopResult = await pool.query(
            `SELECT COUNT(DISTINCT vehicle_id) as in_shop_count
       FROM maintenance_logs
       WHERE status IN ('In Shop', 'Critical')`
        );

        // Critical alerts
        const criticalResult = await pool.query(
            `SELECT COUNT(*) as critical_count
       FROM maintenance_logs
       WHERE status = 'Critical'`
        );

        // Scheduled next 7 days
        const scheduledResult = await pool.query(
            `SELECT COUNT(*) as scheduled_count
       FROM maintenance_logs
       WHERE status = 'Scheduled' AND service_date BETWEEN $1 AND $2`,
            [now.toISOString().split("T")[0], nextWeek.toISOString().split("T")[0]]
        );

        return {
            total_cost_ytd: parseFloat(costResult.rows[0].total_cost),
            in_shop_count: parseInt(inShopResult.rows[0].in_shop_count),
            critical_count: parseInt(criticalResult.rows[0].critical_count),
            scheduled_count: parseInt(scheduledResult.rows[0].scheduled_count),
        };
    },

    // Seed default maintenance logs for development
    async seedDefaults(vehicleMap) {
        const { rows } = await pool.query("SELECT COUNT(*) FROM maintenance_logs");
        if (parseInt(rows[0].count) > 0) return;

        const defaults = [
            { plate: "V78-992-KL", service_type: "Engine Transmission Failure", cost: 4250, service_date: "2023-10-24", status: "Critical" },
            { plate: "M45-123-ZZ", service_type: "Brake Pad Replacement", cost: 850, service_date: "2023-10-25", status: "In Shop" },
            { plate: "S88-554-PL", service_type: "Routine Oil Change & Filters", cost: 320, service_date: "2023-10-20", status: "Completed" },
            { plate: "F12-332-NY", service_type: "Alternator Check", cost: 450, service_date: "2023-11-02", status: "Scheduled" },
            { plate: "K99-112-TX", service_type: "AC System Overhaul", cost: 1200, service_date: "2023-10-26", status: "In Shop" },
            { plate: "V22-118-CA", service_type: "Tire Rotation (All Axles)", cost: 550, service_date: "2023-10-18", status: "Completed" },
            { plate: "R44-991-FL", service_type: "Bumper Repair", cost: 1100, service_date: "2023-10-15", status: "Completed" },
            { plate: "P11-223-AZ", service_type: "Coolant Leak / Overheating", cost: null, service_date: "2023-10-26", status: "Critical" },
        ];

        for (const log of defaults) {
            const vehicleId = vehicleMap[log.plate];
            if (vehicleId) {
                await MaintenanceLog.create({
                    vehicle_id: vehicleId,
                    service_type: log.service_type,
                    cost: log.cost,
                    service_date: log.service_date,
                    status: log.status,
                });
            }
        }
    },
};

module.exports = MaintenanceLog;
