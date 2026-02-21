const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "fleet-flow-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

// @route   POST /api/auth/register
// @desc    Register a new user
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Validate role
        const validRoles = ["manager", "dispatcher"];
        const userRole = validRoles.includes(role) ? role : "dispatcher";

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userRole,
        });

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: "Account created successfully",
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token,
        });
    } catch (err) {
        console.error("Register error:", err.message);
        res.status(500).json({ message: "Server error. Please try again." });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & return token
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            message: "Login successful",
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token,
        });
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ message: "Server error. Please try again." });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user from token
router.get("/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
});

module.exports = router;
