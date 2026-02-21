import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Landing from './pages/Landing'
import MaintenanceLogs from './pages/MaintenanceLogs'
import TripDispatcher from './pages/TripDispatcher'
import VehicleRegistry from './pages/VehicleRegistry'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Landing />} />
      <Route path="/vehicles" element={<VehicleRegistry />} />
      <Route path="/maintenance" element={<MaintenanceLogs />} />
      <Route path="/dispatch" element={<TripDispatcher />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
