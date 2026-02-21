import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Landing from './pages/Landing'
import MaintenanceLogs from './pages/MaintenanceLogs'
import CommandCenter from './pages/CommandCenter'
import TripDispatcher from './pages/TripDispatcher'
import VehicleRegistry from './pages/VehicleRegistry'
import ExpensesFuel from './pages/ExpensesFuel'
import DriverProfiles from './pages/DriverProfiles'
import Analytics from './pages/Analytics'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Landing />} />
      <Route path="/vehicles" element={<VehicleRegistry />} />
      <Route path="/maintenance" element={<MaintenanceLogs />} />
      <Route path="/dashboard" element={<CommandCenter />} />
      <Route path="/dispatch" element={<TripDispatcher />} />
      <Route path="/expenses" element={<ExpensesFuel />} />
      <Route path="/drivers" element={<DriverProfiles />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
