const pool = require('./db')

const VEHICLES = [
  { name: 'Volvo FH16',            license_plate: 'FL-2049', status: 'on_trip',   region: 'Pacific NW',      capacity_percentage: 85, driver_name: 'John Doe',      driver_initials: 'JD' },
  { name: 'Mercedes Actros',       license_plate: 'FL-3921', status: 'available', region: 'California South', capacity_percentage: 0,  driver_name: null,            driver_initials: null },
  { name: 'Scania R500',           license_plate: 'FL-8820', status: 'in_shop',   region: 'Nevada',           capacity_percentage: 0,  driver_name: 'Mike Smith',    driver_initials: 'MS' },
  { name: 'Kenworth T680',         license_plate: 'FL-1192', status: 'critical',  region: 'Texas North',      capacity_percentage: 95, driver_name: 'Alice Lee',     driver_initials: 'AL' },
  { name: 'Peterbilt 579',         license_plate: 'FL-4415', status: 'on_trip',   region: 'Arizona',          capacity_percentage: 72, driver_name: 'Robert Kim',    driver_initials: 'RK' },
  { name: 'Freightliner Cascadia', license_plate: 'FL-6032', status: 'available', region: 'Oregon',           capacity_percentage: 0,  driver_name: null,            driver_initials: null },
  { name: 'Mack Anthem',           license_plate: 'FL-7891', status: 'on_trip',   region: 'Colorado',         capacity_percentage: 60, driver_name: 'Sarah Chen',    driver_initials: 'SC' },
  { name: 'Navistar LT',           license_plate: 'FL-9234', status: 'available', region: 'New Mexico',       capacity_percentage: 0,  driver_name: null,            driver_initials: null },
  { name: 'DAF XF',                license_plate: 'FL-1567', status: 'in_shop',   region: 'Utah',             capacity_percentage: 0,  driver_name: null,            driver_initials: null },
  { name: 'MAN TGX',               license_plate: 'FL-2890', status: 'on_trip',   region: 'Montana',          capacity_percentage: 78, driver_name: 'David Johnson', driver_initials: 'DJ' },
  { name: 'Iveco Stralis',         license_plate: 'FL-3123', status: 'available', region: 'Wyoming',          capacity_percentage: 0,  driver_name: null,            driver_initials: null },
  { name: 'Western Star 4700',     license_plate: 'FL-4456', status: 'critical',  region: 'Idaho',            capacity_percentage: 88, driver_name: 'Emma Wilson',   driver_initials: 'EW' },
  { name: 'Volvo VNL 860',         license_plate: 'FL-5789', status: 'on_trip',   region: 'Washington',       capacity_percentage: 45, driver_name: 'James Brown',   driver_initials: 'JB' },
  { name: 'Peterbilt 389',         license_plate: 'FL-6012', status: 'available', region: 'California North', capacity_percentage: 0,  driver_name: null,            driver_initials: null },
  { name: 'Kenworth W900',         license_plate: 'FL-7345', status: 'in_shop',   region: 'Nevada',           capacity_percentage: 0,  driver_name: null,            driver_initials: null },
  { name: 'Freightliner 114SD',    license_plate: 'FL-8678', status: 'on_trip',   region: 'Oregon',           capacity_percentage: 92, driver_name: 'John Doe',      driver_initials: 'JD' },
  { name: 'Mack Granite',          license_plate: 'FL-9901', status: 'available', region: 'Arizona',          capacity_percentage: 0,  driver_name: null,            driver_initials: null },
  { name: 'Scania S450',           license_plate: 'FL-1234', status: 'on_trip',   region: 'Texas South',      capacity_percentage: 55, driver_name: 'Mike Smith',    driver_initials: 'MS' },
  { name: 'Mercedes Arocs',        license_plate: 'FL-2567', status: 'available', region: 'Florida',          capacity_percentage: 0,  driver_name: null,            driver_initials: null },
  { name: 'Volvo FM 370',          license_plate: 'FL-3890', status: 'critical',  region: 'Georgia',          capacity_percentage: 97, driver_name: 'Alice Lee',     driver_initials: 'AL' },
]

const MAINTENANCE_ALERTS = [
  { vehicle_name: 'Scania R500',       type: 'Oil Change',        description: 'Overdue oil change scheduled',       severity: 'warning',  status: 'pending' },
  { vehicle_name: 'Kenworth T680',     type: 'Brake Inspection',  description: 'Brake pads worn below safety limit', severity: 'critical', status: 'pending' },
  { vehicle_name: 'DAF XF',           type: 'Transmission',      description: 'Transmission fluid leak detected',   severity: 'critical', status: 'pending' },
  { vehicle_name: 'Kenworth W900',     type: 'Tire Replacement',  description: 'Multiple tires need replacement',    severity: 'warning',  status: 'pending' },
  { vehicle_name: 'Volvo FM 370',      type: 'Engine Check',      description: 'Engine check light on',             severity: 'critical', status: 'pending' },
  { vehicle_name: 'Iveco Stralis',     type: 'Air Filter',        description: 'Air filter replacement needed',     severity: 'info',     status: 'pending' },
  { vehicle_name: 'Western Star 4700', type: 'Battery',           description: 'Battery health low — 23%',         severity: 'warning',  status: 'pending' },
  { vehicle_name: 'MAN TGX',          type: 'Coolant',           description: 'Coolant level critically low',      severity: 'warning',  status: 'pending' },
]

// 24 pending cargo orders
const CARGO_ORDERS = Array.from({ length: 24 }, (_, i) => ({
  order_number: `ORD-${String(2026001 + i).padStart(7, '0')}`,
  status: 'pending',
  origin:      ['Los Angeles, CA', 'Seattle, WA', 'Denver, CO', 'Phoenix, AZ'][i % 4],
  destination: ['Chicago, IL',     'Houston, TX', 'Miami, FL',  'New York, NY'][i % 4],
}))

// 7-day utilization data (Mon → Sun relative to today)
const UTILIZATION_OFFSETS = [
  { daysAgo: 6, utilized: 110, total: 142 },
  { daysAgo: 5, utilized: 125, total: 142 },
  { daysAgo: 4, utilized: 100, total: 142 },
  { daysAgo: 3, utilized: 130, total: 142 },
  { daysAgo: 2, utilized: 120, total: 142 },
  { daysAgo: 1, utilized: 70,  total: 142 },
  { daysAgo: 0, utilized: 55,  total: 142 },
]

async function seed() {
  try {
    // Skip if already seeded
    const { rows } = await pool.query('SELECT COUNT(*) FROM vehicles')
    if (parseInt(rows[0].count) > 0) {
      console.log('Seed: data already present, skipping.')
      return
    }

    console.log('Seeding database with initial fleet data...')

    // Vehicles
    for (const v of VEHICLES) {
      await pool.query(
        `INSERT INTO vehicles (name, license_plate, status, region, capacity_percentage, driver_name, driver_initials)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (license_plate) DO NOTHING`,
        [v.name, v.license_plate, v.status, v.region, v.capacity_percentage, v.driver_name, v.driver_initials]
      )
    }

    // Maintenance alerts
    for (const m of MAINTENANCE_ALERTS) {
      await pool.query(
        `INSERT INTO maintenance_alerts (vehicle_name, type, description, severity, status)
         VALUES ($1,$2,$3,$4,$5)`,
        [m.vehicle_name, m.type, m.description, m.severity, m.status]
      )
    }

    // Cargo orders
    for (const c of CARGO_ORDERS) {
      await pool.query(
        `INSERT INTO cargo_orders (order_number, status, origin, destination)
         VALUES ($1,$2,$3,$4) ON CONFLICT (order_number) DO NOTHING`,
        [c.order_number, c.status, c.origin, c.destination]
      )
    }

    // Vehicle utilization (last 7 days)
    const today = new Date()
    for (const u of UTILIZATION_OFFSETS) {
      const d = new Date(today)
      d.setDate(d.getDate() - u.daysAgo)
      const dateStr = d.toISOString().split('T')[0]
      const pct = parseFloat(((u.utilized / u.total) * 100).toFixed(2))
      await pool.query(
        `INSERT INTO vehicle_utilization (date, utilized_count, total_count, utilization_percentage)
         VALUES ($1,$2,$3,$4) ON CONFLICT (date) DO NOTHING`,
        [dateStr, u.utilized, u.total, pct]
      )
    }

    console.log('Seed: completed successfully.')
  } catch (err) {
    console.error('Seed error:', err.message)
  }
}

module.exports = seed
