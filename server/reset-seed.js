/**
 * Reset seed data — drops and re-seeds all non-user tables.
 * Run with: node reset-seed.js
 */
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const pool = require("./config/db");

async function reset() {
    console.log("Dropping old seed data...");
    await pool.query("DROP TABLE IF EXISTS vehicle_utilization CASCADE");
    await pool.query("DROP TABLE IF EXISTS cargo_orders CASCADE");
    await pool.query("DROP TABLE IF EXISTS maintenance_alerts CASCADE");
    await pool.query("DROP TABLE IF EXISTS analytics_data CASCADE");
    await pool.query("DROP TABLE IF EXISTS expenses CASCADE");
    await pool.query("DROP TABLE IF EXISTS trips CASCADE");
    await pool.query("DROP TABLE IF EXISTS maintenance_logs CASCADE");
    await pool.query("DROP TABLE IF EXISTS drivers CASCADE");
    await pool.query("DROP TABLE IF EXISTS vehicles CASCADE");
    console.log("Tables dropped. Restart the server to re-seed.");
    process.exit(0);
}

reset().catch(err => { console.error(err); process.exit(1); });
