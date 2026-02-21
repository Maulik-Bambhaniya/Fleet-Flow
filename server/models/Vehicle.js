/*
  Vehicle model — wraps PostgreSQL queries for the "vehicles" table.
  Statuses: 'available' | 'on_trip' | 'in_shop' | 'critical'
*/

const pool = require("../config/db");

const Vehicle = {
    async createTable() {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        plate      VARCHAR(50),
        type       VARCHAR(100) DEFAULT 'Heavy Truck',
        capacity   VARCHAR(50),
        status     VARCHAR(30) NOT NULL DEFAULT 'available',
        region     VARCHAR(100),
        odometer   INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

        // Seed some default vehicles if table is empty
        const { rows } = await pool.query("SELECT COUNT(*) FROM vehicles");
        if (parseInt(rows[0].count, 10) === 0) {
            await pool.query(`
        INSERT INTO vehicles (name, plate, type, capacity, status, region) VALUES
          ('Volvo VNL 860',        'CA-4829-XP', 'Heavy Truck',     '44,000 lbs', 'available', 'North West'),
          ('Freightliner Cascadia','NY-8812-LK', 'Heavy Truck',     '40,000 lbs', 'available', 'East Coast'),
          ('Peterbilt 579',        'TX-2021-AA', 'Heavy Truck',     '42,000 lbs', 'available', 'South'),
          ('Kenworth T680',        'AZ-4511-CC', 'Heavy Truck',     '45,000 lbs', 'on_trip',   'South West'),
          ('Mack Anthem',          'FL-3321-BB', 'Refrigerated Van','3,500 lbs',  'available', 'South East')
      `);
        }
    },

    // Fetch all vehicles
    async findAll() {
        const { rows } = await pool.query(
            "SELECT * FROM vehicles ORDER BY name ASC"
        );
        return rows;
    },

    // Fetch only available vehicles (for dispatch dropdown)
    async findAvailable() {
        const { rows } = await pool.query(
            "SELECT * FROM vehicles WHERE status = 'available' ORDER BY name ASC"
        );
        return rows;
    },
};

module.exports = Vehicle;
