const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
});

// Test the connection on startup
pool.query("SELECT NOW()")
    .then(() => console.log("PostgreSQL connected (Supabase)"))
    .catch((err) => console.error("PostgreSQL connection error:", err.message));

module.exports = pool;
