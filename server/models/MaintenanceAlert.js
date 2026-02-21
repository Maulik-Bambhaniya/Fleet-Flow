const pool = require('../config/db')

const MaintenanceAlert = {
  async createTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS maintenance_alerts (
        id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
        vehicle_id    UUID,
        vehicle_name  VARCHAR(255),
        type          VARCHAR(255) NOT NULL,
        description   TEXT,
        severity      VARCHAR(50)  DEFAULT 'warning',
        status        VARCHAR(50)  DEFAULT 'pending',
        created_at    TIMESTAMPTZ  DEFAULT NOW(),
        updated_at    TIMESTAMPTZ  DEFAULT NOW()
      )
    `)
  },

  async seedDefaults() {
    const { rows } = await pool.query('SELECT COUNT(*) FROM maintenance_alerts')
    if (parseInt(rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO maintenance_alerts (vehicle_name, type, description, severity, status) VALUES
        ('Volvo VNL 860', 'Engine', 'Check engine light on', 'critical', 'pending'),
        ('Freightliner Cascadia', 'Tires', 'Low pressure warning', 'warning', 'pending'),
        ('Peterbilt 579', 'Oil', 'Scheduled oil change', 'info', 'completed'),
        ('Kenworth T680', 'Brakes', 'Brake pad replacement needed', 'warning', 'pending'),
        ('Mack Anthem', 'Coolant', 'Coolant temp high', 'critical', 'pending')
      `)
    }
  },

  async getPendingCount() {
    const { rows } = await pool.query(
      "SELECT COUNT(*) FROM maintenance_alerts WHERE status = 'pending'"
    )
    return parseInt(rows[0].count)
  },

  async findAll({ status } = {}) {
    if (status) {
      const { rows } = await pool.query(
        'SELECT * FROM maintenance_alerts WHERE status = $1 ORDER BY created_at DESC',
        [status]
      )
      return rows
    }
    const { rows } = await pool.query(
      'SELECT * FROM maintenance_alerts ORDER BY created_at DESC'
    )
    return rows
  },

  async count() {
    const { rows } = await pool.query('SELECT COUNT(*) FROM maintenance_alerts')
    return parseInt(rows[0].count)
  },
}

module.exports = MaintenanceAlert
