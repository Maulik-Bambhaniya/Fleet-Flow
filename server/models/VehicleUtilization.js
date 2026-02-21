const pool = require('../config/db')

const VehicleUtilization = {
  async createTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicle_utilization (
        id                      UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
        date                    DATE    UNIQUE NOT NULL,
        utilized_count          INTEGER DEFAULT 0,
        total_count             INTEGER DEFAULT 0,
        utilization_percentage  DECIMAL(5,2) DEFAULT 0,
        created_at              TIMESTAMPTZ  DEFAULT NOW()
      )
    `)
  },

  async getWeeklyData() {
    const { rows } = await pool.query(`
      SELECT
        TO_CHAR(date, 'Dy')         AS day,
        utilized_count              AS utilized,
        (total_count - utilized_count) AS available,
        utilization_percentage
      FROM vehicle_utilization
      WHERE date >= CURRENT_DATE - INTERVAL '6 days'
      ORDER BY date ASC
    `)
    return rows
  },

  async count() {
    const { rows } = await pool.query('SELECT COUNT(*) FROM vehicle_utilization')
    return parseInt(rows[0].count)
  },
}

module.exports = VehicleUtilization
