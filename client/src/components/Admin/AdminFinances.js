import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import './AdminFinances.scss';
import '../../App.scss';

const AdminFinances = () => {
    const [classData, setClassData] = useState([]);
    const [expandedMonths, setExpandedMonths] = useState(new Set());
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newEntry, setNewEntry] = useState({
        date: '',
        time: '',
        class: '',
        location: '',
        address: '',
        rate: '',
        paymentFrequency: 'per-class',
        paymentMethod: 'cash',
        paymentRequestSent: 'no',
        paid: 'no',
        taxed: 'no'
    });

    useEffect(() => {
        fetchClassData();
    }, []);

    const fetchClassData = async () => {
        try {
            // TODO: Replace with actual API call
            const sampleData = [
                {
                    id: 1,
                    date: '2024-01-15',
                    time: '15:00',
                    class: 'Hatha Yoga',
                    location: 'Studio A',
                    address: '123 Main St, Portland, OR',
                    rate: 75,
                    paymentFrequency: 'per-class',
                    paymentMethod: 'venmo',
                    paymentRequestSent: 'yes',
                    paid: 'yes',
                    taxed: 'yes'
                },
                {
                    id: 2,
                    date: '2024-01-15',
                    time: '10:00',
                    class: 'Gentle Flow',
                    location: 'Online',
                    address: 'Zoom',
                    rate: 60,
                    paymentFrequency: 'per-class',
                    paymentMethod: 'paypal',
                    paymentRequestSent: 'yes',
                    paid: 'no',
                    taxed: 'no'
                },
                {
                    id: 3,
                    date: '2024-02-10',
                    time: '14:00',
                    class: 'Yoga Therapy',
                    location: 'Private Home',
                    address: '456 Oak Ave, Portland, OR',
                    rate: 100,
                    paymentFrequency: 'monthly',
                    paymentMethod: 'check',
                    paymentRequestSent: 'no',
                    paid: 'no',
                    taxed: 'yes'
                },
                {
                    id: 4,
                    date: '2024-02-12',
                    time: '09:00',
                    class: 'Restorative Yoga',
                    location: 'Studio B',
                    address: '789 Pine St, Portland, OR',
                    rate: 80,
                    paymentFrequency: 'per-class',
                    paymentMethod: 'cash',
                    paymentRequestSent: 'n/a',
                    paid: 'yes',
                    taxed: 'yes'
                }
            ];
            
            setClassData(sortClassData(sampleData));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching class data:', error);
            setLoading(false);
        }
    };

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
            const date = new Date(entry.date);
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

    const handleAddEntry = (e) => {
        e.preventDefault();
        const newId = Math.max(...classData.map(item => item.id), 0) + 1;
        const entryWithId = {
            ...newEntry,
            id: newId,
            rate: parseFloat(newEntry.rate) || 0
        };
        
        const updatedData = [...classData, entryWithId];
        setClassData(sortClassData(updatedData));
        
        // Reset form
        setNewEntry({
            date: '',
            time: '',
            class: '',
            location: '',
            address: '',
            rate: '',
            paymentFrequency: 'per-class',
            paymentMethod: 'cash',
            paymentRequestSent: 'no',
            paid: 'no',
            taxed: 'no'
        });
        setShowAddForm(false);
    };

    const formatCurrency = (amount) => {
        return `$${amount.toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
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

    if (loading) {
        return (
            <div className="admin-finances">
                <AdminNavbar />
                <div className="loading">Loading class data...</div>
            </div>
        );
    }

    const groupedData = groupDataByMonth(classData);
    const totalRevenue = classData.reduce((sum, entry) => sum + entry.rate, 0);

    return (
        <div className="admin-finances">
            <AdminNavbar />
            <div className="finances-header">
                <h1>Class & Financial Tracking</h1>
                <button 
                    className="add-entry-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancel' : 'Add New Class'}
                </button>
            </div>

            <div className="finances-summary">
                <div className="summary-card">
                    <h3>Total Revenue</h3>
                    <p className="revenue-amount">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="summary-card">
                    <h3>Total Classes</h3>
                    <p className="revenue-amount">{classData.length}</p>
                </div>
            </div>

            {showAddForm && (
                <div className="add-entry-form">
                    <h2>Add New Class Entry</h2>
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
                                    placeholder="e.g., Studio A"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={newEntry.address}
                                    onChange={handleInputChange}
                                    placeholder="Full address or 'Online'"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Rate ($)</label>
                                <input
                                    type="number"
                                    name="rate"
                                    value={newEntry.rate}
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
                                    <option value="package">Package</option>
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
                        <div className="header-cell">Date</div>
                        <div className="header-cell">Time</div>
                        <div className="header-cell">Class</div>
                        <div className="header-cell">Location</div>
                        <div className="header-cell">Address</div>
                        <div className="header-cell">Rate</div>
                        <div className="header-cell">Payment Freq.</div>
                        <div className="header-cell">Payment Method</div>
                        <div className="header-cell">Request Sent</div>
                        <div className="header-cell">Paid</div>
                        <div className="header-cell">Taxed</div>
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
                                            <div className="table-cell">{formatDate(entry.date)}</div>
                                            <div className="table-cell">{formatTime(entry.time)}</div>
                                            <div className="table-cell">{entry.class}</div>
                                            <div className="table-cell">{entry.location}</div>
                                            <div className="table-cell">{entry.address}</div>
                                            <div className="table-cell">{formatCurrency(entry.rate)}</div>
                                            <div className="table-cell">{entry.paymentFrequency}</div>
                                            <div className="table-cell">{entry.paymentMethod}</div>
                                            <div className={`table-cell status-${entry.paymentRequestSent}`}>
                                                {entry.paymentRequestSent}
                                            </div>
                                            <div className={`table-cell status-${entry.paid}`}>
                                                {entry.paid}
                                            </div>
                                            <div className={`table-cell status-${entry.taxed}`}>
                                                {entry.taxed}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminFinances;
