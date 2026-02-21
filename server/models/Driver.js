/*
  Driver model — wraps PostgreSQL queries for the "drivers" table.
  Statuses: 'available' | 'on_duty' | 'resting' | 'suspended'
*/

const pool = require("../config/db");

const Driver = {
  async createTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name          VARCHAR(255) NOT NULL,
        license_id    VARCHAR(50),
        license_status VARCHAR(30) DEFAULT 'valid',
        experience_yrs INTEGER DEFAULT 0,
        safety_score  INTEGER DEFAULT 100,
        status        VARCHAR(30) NOT NULL DEFAULT 'available',
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Seed some default drivers if table is empty
    const { rows } = await pool.query("SELECT COUNT(*) FROM drivers");
    if (parseInt(rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO drivers (name, license_id, license_status, experience_yrs, safety_score, status) VALUES
          ('Michael Chen',    'DRV-3902', 'valid',          3,  94, 'available'),
          ('Sarah Johnson',   'DRV-4821', 'valid',          5,  98, 'on_duty'),
          ('David Miller',    'DRV-1104', 'valid',          4,  92, 'resting'),
          ('Robert Jones',    'DRV-7712', 'valid',         12,  99, 'on_duty'),
          ('Elena Rodriguez', 'DRV-5591', 'expiring_soon',  8,  78, 'available'),
          ('James Wilson',    'DRV-6234', 'valid',          6,  95, 'on_duty'),
          ('Maria Garcia',    'DRV-8810', 'valid',          7,  91, 'available'),
          ('Kevin Brown',     'DRV-2245', 'valid',          2,  88, 'resting'),
          ('Lisa Anderson',   'DRV-9930', 'valid',         10,  97, 'on_duty'),
          ('Thomas Davis',    'DRV-3367', 'valid',          9,  93, 'available'),
          ('Jennifer White',  'DRV-4412', 'expired',        1,  72, 'suspended'),
          ('Christopher Lee', 'DRV-5589', 'valid',         15,  99, 'available'),
          ('Amanda Martinez', 'DRV-7723', 'valid',          4,  90, 'available'),
          ('Daniel Taylor',   'DRV-8856', 'expiring_soon', 11,  85, 'resting'),
          ('Stephanie Clark', 'DRV-1198', 'valid',          3,  96, 'available')
      `);
    }
  },

  // Fetch all drivers
  async findAll() {
    const { rows } = await pool.query(
      "SELECT * FROM drivers ORDER BY name ASC"
    );
    return rows;
  },

  // Fetch only available drivers (for dispatch dropdown)
  async findAvailable() {
    const { rows } = await pool.query(
      "SELECT * FROM drivers WHERE status = 'available' ORDER BY name ASC"
    );
    return rows;
  },
};

module.exports = Driver;
