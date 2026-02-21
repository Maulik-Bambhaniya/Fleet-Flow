const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from repo root (server is run from /server subfolder)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/auth");
const maintenanceRoutes = require("./routes/maintenance");
const tripRoutes = require("./routes/trips");
const vehicleRoutes = require("./routes/vehicles");
const driverRoutes = require("./routes/drivers");
const expenseRoutes = require("./routes/expenses");
const dashboardRoutes = require("./routes/dashboard");
const seed = require("./config/seed");

const User = require("./models/User");
const Vehicle = require("./models/Vehicle");
const MaintenanceLog = require("./models/MaintenanceLog");
const Driver = require("./models/Driver");
const Trip = require("./models/Trip");
const Expense = require("./models/Expense");

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
app.use("/api/trips", tripRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Root
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Fleet-Flow API" });
});

// Start server — auto-create tables (order matters: vehicles/drivers before trips FK), then listen
const start = async () => {
    try {
        // Create tables in dependency order
        await User.createTable();
        await Vehicle.createTable();   // must exist before Trip (FK) and MaintenanceLog (FK)
        await Driver.createTable();
        await MaintenanceLog.createTable();
        await Trip.createTable();
        await Expense.createTable();
        console.log("Database tables verified");

        // Seed default data for development
        await Vehicle.seedDefaults();
        const vehicles = await Vehicle.findAll();
        const vehicleMap = {};
        vehicles.forEach((v) => { vehicleMap[v.license_plate] = v.id; });
        await MaintenanceLog.seedDefaults(vehicleMap);
        await Expense.seedDefaults();
        console.log("Seed data verified");
    } catch (err) {
        console.error("Setup warning:", err.message);
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

start();
