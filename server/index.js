const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/auth");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Fleet-Flow API" });
});

// Start server — auto-create tables, then listen
const start = async () => {
    try {
        await User.createTable();
        console.log("Database tables verified");
    } catch (err) {
        console.error("Table creation warning:", err.message);
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

start();
