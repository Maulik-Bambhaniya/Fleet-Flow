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

  async seedDefaults() {
    const { rows } = await pool.query('SELECT COUNT(*) FROM cargo_orders')
    if (parseInt(rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO cargo_orders (order_number, status, origin, destination, vehicle_name, weight_kg) VALUES
        ('ORD-2023-001', 'pending', 'Los Angeles, CA', 'San Francisco, CA', 'Volvo VNL 860', 12500.50),
        ('ORD-2023-002', 'in_transit', 'New York, NY', 'Boston, MA', 'Freightliner Cascadia', 18200.00),
        ('ORD-2023-003', 'pending', 'Dallas, TX', 'Austin, TX', 'Peterbilt 579', 8500.25),
        ('ORD-2023-004', 'delivered', 'Miami, FL', 'Orlando, FL', 'Mack Anthem', 3200.00),
        ('ORD-2023-005', 'pending', 'Seattle, WA', 'Portland, OR', 'Volvo VNL 860', 9400.00)
      `)
    }
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
