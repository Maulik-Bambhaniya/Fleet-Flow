const pool = require('../config/db')

const CargoOrder = {
  async createTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cargo_orders (
        id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
        order_number  VARCHAR(100) UNIQUE NOT NULL,
        status        VARCHAR(50)  DEFAULT 'pending',
        origin        VARCHAR(255),
        destination   VARCHAR(255),
        vehicle_id    UUID,
        vehicle_name  VARCHAR(255),
        driver_name   VARCHAR(255),
        weight_kg     DECIMAL(10,2),
        created_at    TIMESTAMPTZ  DEFAULT NOW(),
        updated_at    TIMESTAMPTZ  DEFAULT NOW()
      )
    `)
  },

  async getPendingCount() {
    const { rows } = await pool.query(
      "SELECT COUNT(*) FROM cargo_orders WHERE status = 'pending'"
    )
    return parseInt(rows[0].count)
  },

  async findAll() {
    const { rows } = await pool.query(
      'SELECT * FROM cargo_orders ORDER BY created_at DESC'
    )
    return rows
  },

  async count() {
    const { rows } = await pool.query('SELECT COUNT(*) FROM cargo_orders')
    return parseInt(rows[0].count)
  },
}

module.exports = CargoOrder
