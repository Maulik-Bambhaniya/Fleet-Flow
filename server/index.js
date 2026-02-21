const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/auth");
const maintenanceRoutes = require("./routes/maintenance");
const vehicleRoutes = require("./routes/vehicles");
const User = require("./models/User");
const Vehicle = require("./models/Vehicle");
const MaintenanceLog = require("./models/MaintenanceLog");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/vehicles", vehicleRoutes);

// Root route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Fleet-Flow API" });
});

// Start server — auto-create tables, then listen
const start = async () => {
    try {
        await User.createTable();
        await Vehicle.createTable();
        await MaintenanceLog.createTable();
        console.log("Database tables verified");

        // Seed default data for development
        await Vehicle.seedDefaults();
        const vehicles = await Vehicle.findAll();
        const vehicleMap = {};
        vehicles.forEach((v) => { vehicleMap[v.license_plate] = v.id; });
        await MaintenanceLog.seedDefaults(vehicleMap);
        console.log("Seed data verified");
    } catch (err) {
        console.error("Table creation warning:", err.message);
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

start();
