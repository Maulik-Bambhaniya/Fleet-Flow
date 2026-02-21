/*
  User model — wraps PostgreSQL queries for the "users" table.
  Table includes a `role` field for RBAC (manager / dispatcher).
*/

const pool = require("../config/db");

const User = {
    // Ensure the table exists
    async createTable() {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'dispatcher',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    },

    // Fetch all users
    async findAll() {
        const { rows } = await pool.query(
            "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
        );
        return rows;
    },

    // Fetch a single user by ID
    async findById(id) {
        const { rows } = await pool.query(
            "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
            [id]
        );
        return rows[0] || null;
    },

    // Fetch a single user by email (includes password for auth)
    async findByEmail(email) {
        const { rows } = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        return rows[0] || null;
    },

    // Create a new user
    async create({ name, email, password, role = "dispatcher" }) {
        const { rows } = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at",
            [name, email, password, role]
        );
        return rows[0];
    },

    // Update a user
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
            `UPDATE users SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
            values
        );
        return rows[0];
    },

    // Delete a user
    async delete(id) {
        await pool.query("DELETE FROM users WHERE id = $1", [id]);
        return true;
    },
};

module.exports = User;
