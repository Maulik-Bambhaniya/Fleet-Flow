const express = require('express')
const router  = express.Router()
const Vehicle            = require('../models/Vehicle')
const MaintenanceAlert   = require('../models/MaintenanceAlert')
const CargoOrder         = require('../models/CargoOrder')
const VehicleUtilization = require('../models/VehicleUtilization')

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const [activeFleet, maintenanceAlerts, fleetUtilization, pendingCargoOrders] =
      await Promise.all([
        Vehicle.getActiveCount(),
        MaintenanceAlert.getPendingCount(),
        Vehicle.getUtilizationPercentage(),
        CargoOrder.getPendingCount(),
      ])
    res.json({ activeFleet, maintenanceAlerts, fleetUtilization, pendingCargoOrders })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/dashboard/fleet-status
router.get('/fleet-status', async (req, res) => {
  try {
    const c = await Vehicle.getStatusCounts()
    res.json({
      total:     parseInt(c.total)    || 0,
      available: parseInt(c.available)|| 0,
      onTrip:    parseInt(c.on_trip)  || 0,
      inShop:    parseInt(c.in_shop)  || 0,
      critical:  parseInt(c.critical) || 0,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/dashboard/weekly-utilization
router.get('/weekly-utilization', async (req, res) => {
  try {
    const data = await VehicleUtilization.getWeeklyData()
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
