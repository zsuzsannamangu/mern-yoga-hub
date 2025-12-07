import React, { useState, useEffect, useCallback } from 'react';
import { adminAxiosInstance } from '../../config/axiosConfig';
import AdminLayout from './AdminLayout';
import './AdminFinances.scss';
import '../../App.scss';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

const AdminFinances = () => {
    const [classData, setClassData] = useState([]);
    const [expandedMonths, setExpandedMonths] = useState(new Set());
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editingData, setEditingData] = useState({});
    const [newEntry, setNewEntry] = useState({
        date: '',
        time: '',
        class: '',
        location: '',
        category: 'other',
        grossRate: '',
        receivedRate: '',
        paymentFrequency: 'per-class',
        paymentMethod: 'cash',
        paymentRequestSent: 'no',
        paid: 'no',
        taxed: 'no',
        repeat: 'no',
        repeatCount: 1,
        repeatFrequency: 'weekly'
    });

    const fetchClassData = useCallback(async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await adminAxiosInstance.get('/api/finances', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                // Convert MongoDB _id to id for frontend compatibility
                const formattedData = response.data.finances.map(entry => ({
                    ...entry,
                    id: entry._id
                }));
                setClassData(sortClassData(formattedData));
            } else {
                console.error('Error fetching finances:', response.data.message);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to fetch finance data',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching class data:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to connect to server',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClassData();
    }, [fetchClassData]);

    const sortClassData = (data) => {
        return data.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateA - dateB;
        });
    };

    const groupDataByMonth = (data) => {
        const grouped = {};
        data.forEach(entry => {
            // Parse date string as local date to avoid timezone shifts
            const [year, month, day] = entry.date.split('-');
            const date = new Date(year, month - 1, day); // month is 0-indexed
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            
            if (!grouped[monthKey]) {
                grouped[monthKey] = {
                    name: monthName,
                    entries: []
                };
            }
            grouped[monthKey].entries.push(entry);
        });
        
        return grouped;
    };

    const calculateMonthlyTotals = (groupedData, expandedMonths) => {
        let totalRevenue = 0;
        let totalClasses = 0;
        const monthNames = [];

        expandedMonths.forEach(monthKey => {
            if (groupedData[monthKey]) {
                const monthData = groupedData[monthKey];
                const monthRevenue = monthData.entries.reduce((sum, entry) => sum + (entry.receivedRate || entry.rate || 0), 0);
                totalRevenue += monthRevenue;
                totalClasses += monthData.entries.length;
                monthNames.push(monthData.name);
            }
        });

        return {
            totalRevenue,
            totalClasses,
            monthNames,
            hasExpandedMonths: expandedMonths.size > 0
        };
    };

    const toggleMonth = (monthKey) => {
        const newExpanded = new Set(expandedMonths);
        if (newExpanded.has(monthKey)) {
            newExpanded.delete(monthKey);
        } else {
            newExpanded.add(monthKey);
        }
        setExpandedMonths(newExpanded);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEntry(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const generateRepeatDates = (startDate, frequency, count) => {
        const dates = [];
        // Parse date string as local date to avoid timezone shifts
        const [year, month, day] = startDate.split('-');
        const start = new Date(year, month - 1, day); // month is 0-indexed
        
        for (let i = 0; i < count; i++) {
            const newDate = new Date(start);
            
            switch (frequency) {
                case 'daily':
                    newDate.setDate(start.getDate() + (i * 1));
                    break;
                case 'weekly':
                    newDate.setDate(start.getDate() + (i * 7));
                    break;
                case 'biweekly':
                    newDate.setDate(start.getDate() + (i * 14));
                    break;
                case 'monthly':
                    newDate.setMonth(start.getMonth() + i);
                    break;
                default:
                    newDate.setDate(start.getDate() + (i * 7)); // Default to weekly
            }
            
            // Format as YYYY-MM-DD using local date
            const formattedDate = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
            dates.push(formattedDate);
        }
        
        return dates;
    };

    const handleAddEntry = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('adminToken');
            
            // Prepare entries to create
            const entriesToCreate = [];
            
            if (newEntry.repeat === 'yes') {
                // Generate multiple dates
                const dates = generateRepeatDates(
                    newEntry.date, 
                    newEntry.repeatFrequency, 
                    parseInt(newEntry.repeatCount)
                );
                
                // Create entry for each date
                dates.forEach(date => {
                    entriesToCreate.push({
                        date,
                        time: newEntry.time,
                        class: newEntry.class,
                        location: newEntry.location,
                        category: newEntry.category,
                        grossRate: newEntry.grossRate,
                        receivedRate: newEntry.receivedRate,
                        paymentFrequency: newEntry.paymentFrequency,
                        paymentMethod: newEntry.paymentMethod,
                        paymentRequestSent: newEntry.paymentRequestSent,
                        paid: newEntry.paid,
                        taxed: newEntry.taxed
                    });
                });
            } else {
                // Single entry
                entriesToCreate.push({
                    date: newEntry.date,
                    time: newEntry.time,
                    class: newEntry.class,
                    location: newEntry.location,
                    category: newEntry.category,
                    grossRate: newEntry.grossRate,
                    receivedRate: newEntry.receivedRate,
                    paymentFrequency: newEntry.paymentFrequency,
                    paymentMethod: newEntry.paymentMethod,
                    paymentRequestSent: newEntry.paymentRequestSent,
                    paid: newEntry.paid,
                    taxed: newEntry.taxed
                });
            }

            // Create all entries
            const createdEntries = [];
            for (const entryData of entriesToCreate) {
                const response = await adminAxiosInstance.post('/api/finances', entryData, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.success) {
                    createdEntries.push({
                        ...response.data.finance,
                        id: response.data.finance._id
                    });
                } else {
                    throw new Error(response.data.message);
                }
            }

            // Update local state with all new entries
            const updatedData = [...classData, ...createdEntries];
            setClassData(sortClassData(updatedData));
            
            // Reset form
            setNewEntry({
                date: '',
                time: '',
                class: '',
                location: '',
                category: 'other',
                grossRate: '',
                receivedRate: '',
                paymentFrequency: 'per-class',
                paymentMethod: 'cash',
                paymentRequestSent: 'no',
                paid: 'no',
                taxed: 'no',
                repeat: 'no',
                repeatCount: 1,
                repeatFrequency: 'weekly'
            });
            setShowAddForm(false);

            const entryCount = createdEntries.length;
            Swal.fire({
                title: 'Success!',
                text: `${entryCount} finance ${entryCount === 1 ? 'entry' : 'entries'} added successfully`,
                icon: 'success',
                confirmButtonText: 'OK'
            });

        } catch (error) {
            console.error('Error adding finance entry:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Failed to add finance entry',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const formatCurrency = (amount) => {
        return `$${amount.toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        // Parse date string as local date to avoid timezone shifts
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day); // month is 0-indexed
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleEdit = (entry) => {
        setEditingId(entry.id);
        setEditingData({ 
            ...entry,
            category: entry.category || 'other',
            grossRate: entry.grossRate || entry.rate || '',
            receivedRate: entry.receivedRate || entry.rate || ''
        });
    };

    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await adminAxiosInstance.put(`/api/finances/${editingId}`, editingData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                // Update the local state
                const updatedData = classData.map(item => 
                    item.id === editingId ? { ...response.data.finance, id: response.data.finance._id } : item
                );
                setClassData(sortClassData(updatedData));
                setEditingId(null);
                setEditingData({});
                // No popup - just exit edit mode silently
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error updating finance entry:', error);
            // Only show error popup if something goes wrong
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Failed to update finance entry',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingData({});
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await adminAxiosInstance.delete(`/api/finances/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.success) {
                    // Remove from local state
                    const updatedData = classData.filter(item => item.id !== id);
                    setClassData(updatedData);

                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Finance entry has been deleted.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error) {
                console.error('Error deleting finance entry:', error);
                Swal.fire({
                    title: 'Error',
                    text: error.response?.data?.message || 'Failed to delete finance entry',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="admin-finances">
                    <div className="loading">Loading class data...</div>
                </div>
            </AdminLayout>
        );
    }

    const groupedData = groupDataByMonth(classData);
    const totalRevenue = classData.reduce((sum, entry) => sum + (entry.receivedRate || entry.rate || 0), 0);
    const monthlyTotals = calculateMonthlyTotals(groupedData, expandedMonths);

    return (
        <AdminLayout>
            <div className="admin-finances">
            <h3 className="section-title">Class & Financial Tracking</h3>
            <div className="finances-header">
                <button 
                    className="add-entry-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancel' : 'Add New Class'}
                </button>
            </div>

            <div className="finances-summary">
                {/* Yearly Totals */}
                <div className="summary-card yearly">
                    <h3>Total Revenue (All Time)</h3>
                    <p className="revenue-amount">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="summary-card yearly">
                    <h3>Total Classes (All Time)</h3>
                    <p className="revenue-amount">{classData.length}</p>
                </div>
                
                {/* Monthly Totals - Only show when months are expanded */}
                {monthlyTotals.hasExpandedMonths && (
                    <>
                        <div className="summary-card monthly">
                            <h3>
                                {monthlyTotals.monthNames.length === 1 
                                    ? `${monthlyTotals.monthNames[0]} Revenue`
                                    : `Selected Months Revenue`
                                }
                            </h3>
                            <p className="revenue-amount">{formatCurrency(monthlyTotals.totalRevenue)}</p>
                            {monthlyTotals.monthNames.length > 1 && (
                                <p className="month-list">{monthlyTotals.monthNames.join(', ')}</p>
                            )}
                        </div>
                        <div className="summary-card monthly">
                            <h3>
                                {monthlyTotals.monthNames.length === 1 
                                    ? `${monthlyTotals.monthNames[0]} Classes`
                                    : `Selected Months Classes`
                                }
                            </h3>
                            <p className="revenue-amount">{monthlyTotals.totalClasses}</p>
                            {monthlyTotals.monthNames.length > 1 && (
                                <p className="month-list">{monthlyTotals.monthNames.join(', ')}</p>
                            )}
                        </div>
                    </>
                )}
            </div>

            {showAddForm && (
                <div className="add-entry-form">
                    <h2>Add New Entry</h2>
                    <form onSubmit={handleAddEntry}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={newEntry.date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input
                                    type="time"
                                    name="time"
                                    value={newEntry.time}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Class</label>
                                <input
                                    type="text"
                                    name="class"
                                    value={newEntry.class}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Hatha Yoga"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={newEntry.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Studio A, Online, Private Home"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={newEntry.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="chocolate">Chocolate</option>
                                    <option value="yoga teaching">Yoga Teaching</option>
                                    <option value="yoga therapy">Yoga Therapy</option>
                                    <option value="workshop">Workshop</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Gross Rate ($)</label>
                                <input
                                    type="number"
                                    name="grossRate"
                                    value={newEntry.grossRate}
                                    onChange={handleInputChange}
                                    placeholder="100.00"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Received Rate ($)</label>
                                <input
                                    type="number"
                                    name="receivedRate"
                                    value={newEntry.receivedRate}
                                    onChange={handleInputChange}
                                    placeholder="75.00"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Payment Frequency</label>
                                <select
                                    name="paymentFrequency"
                                    value={newEntry.paymentFrequency}
                                    onChange={handleInputChange}
                                >
                                    <option value="per-class">Per Class</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="biweekly">Biweekly</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Payment Method</label>
                                <select
                                    name="paymentMethod"
                                    value={newEntry.paymentMethod}
                                    onChange={handleInputChange}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="check">Check</option>
                                    <option value="venmo">Venmo</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="zelle">Zelle</option>
                                    <option value="deposit">Deposit</option>
                                    <option value="card">Card</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Payment Request Sent</label>
                                <select
                                    name="paymentRequestSent"
                                    value={newEntry.paymentRequestSent}
                                    onChange={handleInputChange}
                                >
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                    <option value="n/a">N/A</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Paid</label>
                                <select
                                    name="paid"
                                    value={newEntry.paid}
                                    onChange={handleInputChange}
                                >
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Taxed</label>
                                <select
                                    name="taxed"
                                    value={newEntry.taxed}
                                    onChange={handleInputChange}
                                >
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row repeat-section">
                            <div className="form-group">
                                <label>Repeat Class</label>
                                <select
                                    name="repeat"
                                    value={newEntry.repeat}
                                    onChange={handleInputChange}
                                >
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                </select>
                            </div>
                            {newEntry.repeat === 'yes' && (
                                <>
                                    <div className="form-group">
                                        <label>How Many Times</label>
                                        <input
                                            type="number"
                                            name="repeatCount"
                                            value={newEntry.repeatCount}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="52"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Repeat Every</label>
                                        <select
                                            name="repeatFrequency"
                                            value={newEntry.repeatFrequency}
                                            onChange={handleInputChange}
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="biweekly">Biweekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="submit-btn">Add Entry</button>
                            <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="class-table-container">
                <div className="class-table">
                    <div className="table-header">
                        <div className="header-cell">Month</div>
                        <div className="header-cell">Category</div>
                        <div className="header-cell">Date</div>
                        <div className="header-cell">Time</div>
                        <div className="header-cell">Class</div>
                        <div className="header-cell">Location</div>
                        <div className="header-cell">Gross Rate</div>
                        <div className="header-cell">Received Rate</div>
                        <div className="header-cell">Payment Method</div>
                        <div className="header-cell">Paid</div>
                        <div className="header-cell">Taxed</div>
                        <div className="header-cell">Actions</div>
                    </div>

                    {Object.entries(groupedData).map(([monthKey, monthData]) => (
                        <div key={monthKey} className="month-group">
                            <div 
                                className={`month-header ${expandedMonths.has(monthKey) ? 'expanded' : ''}`}
                                onClick={() => toggleMonth(monthKey)}
                            >
                                <span className="expand-icon">
                                    {expandedMonths.has(monthKey) ? '▼' : '▶'}
                                </span>
                                <span className="month-name">{monthData.name}</span>
                                <span className="month-count">({monthData.entries.length} classes)</span>
                            </div>
                            
                            {expandedMonths.has(monthKey) && (
                                <div className="month-entries">
                                    {monthData.entries.map(entry => (
                                        <div key={entry.id} className="table-row">
                                            <div className="table-cell"></div>
                                            {editingId === entry.id ? (
                                                // Edit mode
                                                <>
                                                    <div className="table-cell">
                                                        <select
                                                            name="category"
                                                            value={editingData.category || 'other'}
                                                            onChange={handleEditInputChange}
                                                            className="edit-select category-select"
                                                        >
                                                            <option value="chocolate">Chocolate</option>
                                                            <option value="yoga teaching">Yoga Teaching</option>
                                                            <option value="yoga therapy">Yoga Therapy</option>
                                                            <option value="workshop">Workshop</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                    </div>
                                                    <div className="table-cell">
                                                        <input
                                                            type="date"
                                                            name="date"
                                                            value={editingData.date}
                                                            onChange={handleEditInputChange}
                                                            className="edit-input"
                                                        />
                                                    </div>
                                                    <div className="table-cell">
                                                        <input
                                                            type="time"
                                                            name="time"
                                                            value={editingData.time}
                                                            onChange={handleEditInputChange}
                                                            className="edit-input"
                                                        />
                                                    </div>
                                                    <div className="table-cell">
                                                        <input
                                                            type="text"
                                                            name="class"
                                                            value={editingData.class}
                                                            onChange={handleEditInputChange}
                                                            className="edit-input"
                                                        />
                                                    </div>
                                                    <div className="table-cell">
                                                        <input
                                                            type="text"
                                                            name="location"
                                                            value={editingData.location}
                                                            onChange={handleEditInputChange}
                                                            className="edit-input"
                                                        />
                                                    </div>
                                                    <div className="table-cell">
                                                        <input
                                                            type="number"
                                                            name="grossRate"
                                                            value={editingData.grossRate}
                                                            onChange={handleEditInputChange}
                                                            className="edit-input"
                                                            step="0.01"
                                                            min="0"
                                                        />
                                                    </div>
                                                    <div className="table-cell">
                                                        <input
                                                            type="number"
                                                            name="receivedRate"
                                                            value={editingData.receivedRate}
                                                            onChange={handleEditInputChange}
                                                            className="edit-input"
                                                            step="0.01"
                                                            min="0"
                                                        />
                                                    </div>
                                                    <div className="table-cell">
                                                        <select
                                                            name="paymentMethod"
                                                            value={editingData.paymentMethod}
                                                            onChange={handleEditInputChange}
                                                            className="edit-select"
                                                        >
                                                            <option value="cash">Cash</option>
                                                            <option value="check">Check</option>
                                                            <option value="venmo">Venmo</option>
                                                            <option value="paypal">PayPal</option>
                                                            <option value="zelle">Zelle</option>
                                                            <option value="deposit">Deposit</option>
                                                            <option value="card">Card</option>
                                                        </select>
                                                    </div>
                                                    <div className="table-cell">
                                                        <select
                                                            name="paid"
                                                            value={editingData.paid}
                                                            onChange={handleEditInputChange}
                                                            className="edit-select"
                                                        >
                                                            <option value="no">No</option>
                                                            <option value="yes">Yes</option>
                                                        </select>
                                                    </div>
                                                    <div className="table-cell">
                                                        <select
                                                            name="taxed"
                                                            value={editingData.taxed}
                                                            onChange={handleEditInputChange}
                                                            className="edit-select"
                                                        >
                                                            <option value="no">No</option>
                                                            <option value="yes">Yes</option>
                                                        </select>
                                                    </div>
                                                    <div className="table-cell actions-cell">
                                                        <button className="save-btn" onClick={handleSaveEdit}>✓</button>
                                                        <button className="cancel-btn" onClick={handleCancelEdit}>✕</button>
                                                    </div>
                                                </>
                                            ) : (
                                                // View mode
                                                <>
                                                    <div className={`table-cell category-cell category-${(entry.category || 'other').replace(/\s+/g, '-')}`}>
                                                        {entry.category || 'other'}
                                                    </div>
                                                    <div className="table-cell">{formatDate(entry.date)}</div>
                                                    <div className="table-cell">{formatTime(entry.time)}</div>
                                                    <div className="table-cell">{entry.class}</div>
                                                    <div className="table-cell">{entry.location}</div>
                                                    <div className="table-cell">{formatCurrency(entry.grossRate || entry.rate || 0)}</div>
                                                    <div className="table-cell">{formatCurrency(entry.receivedRate || entry.rate || 0)}</div>
                                                    <div className="table-cell">{entry.paymentMethod}</div>
                                                    <div className={`table-cell status-${entry.paid}`}>
                                                        {entry.paid}
                                                    </div>
                                                    <div className={`table-cell status-${entry.taxed}`}>
                                                        {entry.taxed}
                                                    </div>
                                                    <div className="table-cell actions-cell">
                                                        <button className="edit-btn" onClick={() => handleEdit(entry)}>✏️</button>
                                                        <button className="delete-btn" onClick={() => handleDelete(entry.id)}>🗑️</button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            </div>
        </AdminLayout>
    );
};

export default AdminFinances;
