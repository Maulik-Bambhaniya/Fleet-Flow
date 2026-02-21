const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from repo root (server is run from /server subfolder)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const vehicleRoutes = require("./routes/vehicles");
const driverRoutes = require("./routes/drivers");

const User = require("./models/User");
const Vehicle = require("./models/Vehicle");
const Driver = require("./models/Driver");
const Trip = require("./models/Trip");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);

// Root route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Fleet-Flow API" });
});

// Start server — auto-create tables (order matters: vehicles/drivers before trips FK), then listen
const start = async () => {
    try {
        await User.createTable();
        await Vehicle.createTable();   // must exist before Trip (FK)
        await Driver.createTable();
        await Trip.createTable();
        console.log("Database tables verified");
    } catch (err) {
        console.error("Table creation warning:", err.message);
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

start();
