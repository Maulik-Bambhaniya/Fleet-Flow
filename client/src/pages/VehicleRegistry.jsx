import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import './VehicleRegistry.css'

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function getToken() {
    return sessionStorage.getItem('token') || localStorage.getItem('token')
}

function getUser() {
    try {
        const raw = sessionStorage.getItem('user') || localStorage.getItem('user')
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

function getInitials(name = '') {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || '')
        .join('')
}

function avatarColor(name = '') {
    const colors = [
        { bg: '#dbeafe', text: '#1d4ed8' },
        { bg: '#fce7f3', text: '#be185d' },
        { bg: '#d1fae5', text: '#065f46' },
        { bg: '#fed7aa', text: '#c2410c' },
        { bg: '#ede9fe', text: '#7c3aed' },
    ]
    const idx = (name.charCodeAt(0) || 0) % colors.length
    return colors[idx]
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
function VehicleRegistry() {
    const navigate = useNavigate()
    const user = getUser()

    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedVehicles, setSelectedVehicles] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [editingVehicle, setEditingVehicle] = useState(null)
    const [formData, setFormData] = useState({
        license_plate: '',
        max_capacity: '',
        odometer: '',
        type: '',
        name: '',
        region: ''
    })
    const itemsPerPage = 6

    // Fetch vehicles from API and merge with localStorage
    const fetchVehicles = useCallback(async () => {
        const token = getToken()

        try {
            const resp = await fetch(`${API}/api/vehicles`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!resp.ok) {
                if (resp.status === 401) {
                    navigate('/login')
                    return
                }
                throw new Error('Failed to fetch vehicles')
            }
            const apiData = await resp.json()

            // Get vehicles from localStorage
            const localVehicles = JSON.parse(localStorage.getItem('localVehicles') || '[]')

            // Merge API data with localStorage vehicles
            const allVehicles = [...apiData, ...localVehicles]
            setVehicles(allVehicles)
        } catch (err) {
            console.error('Error fetching vehicles:', err)
            // If API fails, still show localStorage vehicles
            const localVehicles = JSON.parse(localStorage.getItem('localVehicles') || '[]')
            setVehicles(localVehicles)
        } finally {
            setLoading(false)
        }
    }, [navigate])

    useEffect(() => {
        fetchVehicles()
    }, [fetchVehicles])

    // Logout handler
    const handleLogout = () => {
        sessionStorage.clear()
        localStorage.clear()
        navigate('/login')
    }

    // Calculate statistics
    const stats = {
        total: vehicles.length,
        available: vehicles.filter(v => v.status === 'Available').length,
        onTrip: vehicles.filter(v => v.status === 'On Trip').length,
        maintenance: vehicles.filter(v => v.status === 'In Shop').length +
            vehicles.filter(v => v.status === 'Critical').length
    }

    // Filter and paginate vehicles
    const filteredVehicles = vehicles.filter(v => {
        const query = searchQuery.toLowerCase()
        return (
            v.name?.toLowerCase().includes(query) ||
            v.license_plate?.toLowerCase().includes(query) ||
            v.status?.toLowerCase().includes(query) ||
            v.type?.toLowerCase().includes(query)
        )
    })

    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
    const startIdx = (currentPage - 1) * itemsPerPage
    const paginatedVehicles = filteredVehicles.slice(startIdx, startIdx + itemsPerPage)

    // Checkbox handlers
    const toggleSelectAll = () => {
        if (selectedVehicles.length === paginatedVehicles.length) {
            setSelectedVehicles([])
        } else {
            setSelectedVehicles(paginatedVehicles.map(v => v.id))
        }
    }

    const toggleSelectVehicle = (id) => {
        setSelectedVehicles(prev =>
            prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
        )
    }

    // Determine vehicle icon based on type
    const getVehicleIcon = (type) => {
        const t = type?.toLowerCase() || ''
        if (t.includes('van')) return 'airport_shuttle'
        if (t.includes('truck')) return 'local_shipping'
        return 'commute'
    }

    // Status pill classes
    const getStatusClass = (status) => {
        switch (status) {
            case 'Available': return 'status-pill status-available'
            case 'On Trip': return 'status-pill status-trip'
            case 'In Shop': return 'status-pill status-shop'
            case 'Critical': return 'status-pill status-critical'
            default: return 'status-pill'
        }
    }

    // Handle status change
    const handleStatusChange = (vehicleId, newStatus) => {
        // Update in state
        setVehicles(prev => prev.map(v =>
            v.id === vehicleId ? { ...v, status: newStatus } : v
        ))

        // Update in localStorage if it's a local vehicle
        const localVehicles = JSON.parse(localStorage.getItem('localVehicles') || '[]')
        const updatedLocalVehicles = localVehicles.map(v =>
            v.id === vehicleId ? { ...v, status: newStatus } : v
        )
        localStorage.setItem('localVehicles', JSON.stringify(updatedLocalVehicles))

        // TODO: If it's an API vehicle, you could also send a PATCH request to update the backend
    }

    // Edit vehicle handler
    const handleEditVehicle = (vehicle) => {
        openModal(vehicle)
    }

    // Delete vehicle handler
    const handleDeleteVehicle = (vehicleId) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) {
            return
        }

        // Remove from state
        setVehicles(prev => prev.filter(v => v.id !== vehicleId))

        // Remove from localStorage if it's a local vehicle
        const localVehicles = JSON.parse(localStorage.getItem('localVehicles') || '[]')
        const updatedLocalVehicles = localVehicles.filter(v => v.id !== vehicleId)
        localStorage.setItem('localVehicles', JSON.stringify(updatedLocalVehicles))

        // TODO: If it's an API vehicle, send a DELETE request to the backend
    }

    // Modal handlers
    const openModal = (vehicle = null) => {
        setShowModal(true)
        if (vehicle) {
            setEditingVehicle(vehicle)
            setFormData({
                license_plate: vehicle.license_plate,
                max_capacity: vehicle.max_capacity.toString(),
                odometer: vehicle.odometer.toString(),
                type: vehicle.type,
                name: vehicle.name,
                region: vehicle.region || ''
            })
        } else {
            setEditingVehicle(null)
            setFormData({
                license_plate: '',
                max_capacity: '',
                odometer: '',
                type: '',
                name: '',
                region: ''
            })
        }
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingVehicle(null)
        setFormData({
            license_plate: '',
            max_capacity: '',
            odometer: '',
            type: '',
            name: '',
            region: ''
        })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSaveVehicle = () => {
        // Validate required fields
        if (!formData.license_plate || !formData.max_capacity || !formData.odometer || !formData.type || !formData.name || !formData.region) {
            alert('Please fill in all fields')
            return
        }

        if (editingVehicle) {
            // Update existing vehicle
            const updatedVehicle = {
                ...editingVehicle,
                name: formData.name,
                license_plate: formData.license_plate,
                type: formData.type,
                max_capacity: parseFloat(formData.max_capacity),
                odometer: parseFloat(formData.odometer),
                region: formData.region
            }

            // Update in state
            setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? updatedVehicle : v))

            // Update in localStorage if it's a local vehicle
            const localVehicles = JSON.parse(localStorage.getItem('localVehicles') || '[]')
            const updatedLocalVehicles = localVehicles.map(v =>
                v.id === editingVehicle.id ? updatedVehicle : v
            )
            localStorage.setItem('localVehicles', JSON.stringify(updatedLocalVehicles))

            // TODO: If it's an API vehicle, send a PATCH request to update the backend
        } else {
            // Create new vehicle object
            const newVehicle = {
                id: `local-${Date.now()}`,
                name: formData.name,
                license_plate: formData.license_plate,
                type: formData.type,
                max_capacity: parseFloat(formData.max_capacity),
                odometer: parseFloat(formData.odometer),
                status: 'Available',
                region: formData.region,
                created_at: new Date().toISOString()
            }

            // Get existing localStorage vehicles
            const localVehicles = JSON.parse(localStorage.getItem('localVehicles') || '[]')

            // Add new vehicle
            const updatedVehicles = [...localVehicles, newVehicle]

            // Save to localStorage
            localStorage.setItem('localVehicles', JSON.stringify(updatedVehicles))

            // Update state
            setVehicles(prev => [...prev, newVehicle])
        }

        // Close modal
        closeModal()
    }

    return (
        <DashboardLayout>
            <main className="vr-content">
                {/* Page title and actions */}
                <div className="vr-page-header">
                    <div className="vr-page-title-section">
                        <h2 className="vr-page-title">Vehicle Registry</h2>
                        <p className="vr-page-subtitle">
                            Manage your fleet inventory, track availability, and view vehicle details.
                        </p>
                    </div>
                    <div className="vr-page-search">
                        <span className="material-symbols-outlined vr-page-search-icon">search</span>
                        <input
                            type="text"
                            className="vr-page-search-input"
                            placeholder="Search vehicles, plates, or status..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="vr-page-actions">
                        <button className="vr-btn-secondary">
                            <span className="material-symbols-outlined vr-btn-icon">filter_list</span>
                            Filters
                        </button>
                        <button className="vr-btn-primary" onClick={() => openModal()}>
                            <span className="material-symbols-outlined vr-btn-icon">add</span>
                            Add Vehicle
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="vr-stats-grid">
                    <div className="vr-stat-card">
                        <p className="vr-stat-label">Total Vehicles</p>
                        <p className="vr-stat-value">{stats.total}</p>
                    </div>
                    <div className="vr-stat-card">
                        <p className="vr-stat-label">Available</p>
                        <p className="vr-stat-value vr-stat-success">{stats.available}</p>
                    </div>
                    <div className="vr-stat-card">
                        <p className="vr-stat-label">On Trip</p>
                        <p className="vr-stat-value vr-stat-trip">{stats.onTrip}</p>
                    </div>
                    <div className="vr-stat-card">
                        <p className="vr-stat-label">Maintenance</p>
                        <p className="vr-stat-value vr-stat-warning">{stats.maintenance}</p>
                    </div>
                </div>

                {/* Vehicles Table */}
                <div className="vr-table-card">
                    {loading ? (
                        <div className="vr-loading">Loading vehicles...</div>
                    ) : (
                        <>
                            <div className="vr-table-wrapper">
                                <table className="vr-table">
                                    <thead className="vr-table-head">
                                        <tr>
                                            <th className="vr-table-header vr-table-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="vr-checkbox"
                                                    checked={selectedVehicles.length === paginatedVehicles.length && paginatedVehicles.length > 0}
                                                    onChange={toggleSelectAll}
                                                />
                                            </th>
                                            <th className="vr-table-header">Vehicle Name</th>
                                            <th className="vr-table-header">License Plate</th>
                                            <th className="vr-table-header">Type &amp; Capacity</th>
                                            <th className="vr-table-header">Odometer</th>
                                            <th className="vr-table-header">Region</th>
                                            <th className="vr-table-header">Status</th>
                                            <th className="vr-table-header vr-table-header-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="vr-table-body">
                                        {paginatedVehicles.map((vehicle) => (
                                            <tr key={vehicle.id} className="vr-table-row">
                                                <td className="vr-table-cell vr-table-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        className="vr-checkbox"
                                                        checked={selectedVehicles.includes(vehicle.id)}
                                                        onChange={() => toggleSelectVehicle(vehicle.id)}
                                                    />
                                                </td>
                                                <td className="vr-table-cell">
                                                    <div className="vr-vehicle-info">
                                                        <div className="vr-vehicle-icon">
                                                            <span className="material-symbols-outlined">
                                                                {getVehicleIcon(vehicle.type)}
                                                            </span>
                                                        </div>
                                                        <div className="vr-vehicle-details">
                                                            <div className="vr-vehicle-name">{vehicle.name}</div>
                                                            <div className="vr-vehicle-id">ID: {vehicle.id?.substring(0, 8).toUpperCase()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="vr-table-cell">
                                                    <span className="vr-license-plate">{vehicle.license_plate}</span>
                                                </td>
                                                <td className="vr-table-cell">
                                                    <div className="vr-vehicle-type">{vehicle.type}</div>
                                                    <div className="vr-vehicle-capacity">
                                                        {vehicle.max_capacity ? `${vehicle.max_capacity.toLocaleString()} lbs` : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="vr-table-cell vr-text-muted">
                                                    {vehicle.odometer ? `${vehicle.odometer.toLocaleString()} mi` : 'N/A'}
                                                </td>
                                                <td className="vr-table-cell vr-text-muted">
                                                    {vehicle.region || 'Unassigned'}
                                                </td>
                                                <td className="vr-table-cell">
                                                    <select
                                                        className={`vr-status-select ${getStatusClass(vehicle.status)}`}
                                                        value={vehicle.status}
                                                        onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                                                    >
                                                        <option value="Available">Available</option>
                                                        <option value="On Trip">On Trip</option>
                                                        <option value="In Shop">In Shop</option>
                                                        <option value="Critical">Critical</option>
                                                    </select>
                                                </td>
                                                <td className="vr-table-cell vr-table-cell-right">
                                                    <div className="vr-action-buttons">
                                                        <button
                                                            className="vr-action-btn vr-edit-btn"
                                                            onClick={() => handleEditVehicle(vehicle)}
                                                            title="Edit vehicle"
                                                        >
                                                            <span className="material-symbols-outlined">edit</span>
                                                        </button>
                                                        <button
                                                            className="vr-action-btn vr-delete-btn"
                                                            onClick={() => handleDeleteVehicle(vehicle.id)}
                                                            title="Delete vehicle"
                                                        >
                                                            <span className="material-symbols-outlined">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="vr-pagination">
                                <div className="vr-pagination-info">
                                    Showing <span className="vr-pagination-bold">{startIdx + 1}</span> to{' '}
                                    <span className="vr-pagination-bold">
                                        {Math.min(startIdx + itemsPerPage, filteredVehicles.length)}
                                    </span> of{' '}
                                    <span className="vr-pagination-bold">{filteredVehicles.length}</span> results
                                </div>
                                <div className="vr-pagination-controls">
                                    <button
                                        className="vr-pagination-btn"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        className="vr-pagination-btn"
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* ═══════ ADD VEHICLE MODAL ═══════ */}
            {showModal && (
                <div className="vr-modal-overlay" onClick={closeModal}>
                    <div className="vr-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="vr-modal-title">{editingVehicle ? 'Edit Vehicle' : 'New Vehicle Registration'}</h3>

                        <div className="vr-modal-form">
                            <div className="vr-form-group">
                                <label className="vr-form-label">License Plate:</label>
                                <input
                                    type="text"
                                    name="license_plate"
                                    className="vr-form-input"
                                    value={formData.license_plate}
                                    onChange={handleInputChange}
                                    placeholder="e.g., CA 4829 XP"
                                />
                            </div>

                            <div className="vr-form-group">
                                <label className="vr-form-label">Max Payload:</label>
                                <input
                                    type="number"
                                    name="max_capacity"
                                    className="vr-form-input"
                                    value={formData.max_capacity}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 44000"
                                />
                            </div>

                            <div className="vr-form-group">
                                <label className="vr-form-label">Initial Odometer:</label>
                                <input
                                    type="number"
                                    name="odometer"
                                    className="vr-form-input"
                                    value={formData.odometer}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 0"
                                />
                            </div>

                            <div className="vr-form-group">
                                <label className="vr-form-label">Type:</label>
                                <input
                                    type="text"
                                    name="type"
                                    className="vr-form-input"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Heavy Truck, Van"
                                />
                            </div>

                            <div className="vr-form-group">
                                <label className="vr-form-label">Model:</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="vr-form-input"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Volvo FH16-750"
                                />
                            </div>

                            <div className="vr-form-group">
                                <label className="vr-form-label">Region:</label>
                                <input
                                    type="text"
                                    name="region"
                                    className="vr-form-input"
                                    value={formData.region}
                                    onChange={handleInputChange}
                                    placeholder="e.g., North West, South, East Coast"
                                />
                            </div>
                        </div>

                        <div className="vr-modal-actions">
                            <button className="vr-modal-btn vr-modal-btn-save" onClick={handleSaveVehicle}>
                                Save
                            </button>
                            <button className="vr-modal-btn vr-modal-btn-cancel" onClick={closeModal}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default VehicleRegistry
