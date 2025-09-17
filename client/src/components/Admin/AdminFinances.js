import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import './AdminFinances.scss';
import '../../App.scss';

const AdminFinances = () => {
    const [financialData, setFinancialData] = useState({
        totalRevenue: 0,
        monthlyRevenue: 0,
        chocolateOrders: [],
        yogaBookings: [],
        loading: true
    });

    useEffect(() => {
        fetchFinancialData();
    }, []);

    const fetchFinancialData = async () => {
        try {
            // TODO: Implement API calls to fetch financial data
            // For now, using placeholder data
            setFinancialData({
                totalRevenue: 2450.75,
                monthlyRevenue: 680.25,
                chocolateOrders: [
                    { id: 1, date: '2024-01-15', amount: 45.50, customer: 'John Doe' },
                    { id: 2, date: '2024-01-14', amount: 32.75, customer: 'Jane Smith' }
                ],
                yogaBookings: [
                    { id: 1, date: '2024-01-16', amount: 75.00, client: 'Sarah Johnson' },
                    { id: 2, date: '2024-01-15', amount: 85.00, client: 'Mike Wilson' }
                ],
                loading: false
            });
        } catch (error) {
            console.error('Error fetching financial data:', error);
            setFinancialData(prev => ({ ...prev, loading: false }));
        }
    };

    if (financialData.loading) {
        return (
            <div className="admin-finances">
                <div className="loading">Loading financial data...</div>
            </div>
        );
    }

    return (
        <div className="admin-finances">
            <AdminNavbar />
            <div className="finances-header">
                <h1>Financial Overview</h1>
            </div>

            <div className="finances-summary">
                <div className="summary-card">
                    <h3>Total Revenue</h3>
                    <p className="revenue-amount">${financialData.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="summary-card">
                    <h3>This Month</h3>
                    <p className="revenue-amount">${financialData.monthlyRevenue.toFixed(2)}</p>
                </div>
            </div>

            <div className="finances-content">
                <div className="finances-section">
                    <h2>Recent Chocolate Orders</h2>
                    <div className="finances-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {financialData.chocolateOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>{new Date(order.date).toLocaleDateString()}</td>
                                        <td>{order.customer}</td>
                                        <td>${order.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="finances-section">
                    <h2>Recent Yoga Bookings</h2>
                    <div className="finances-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Client</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {financialData.yogaBookings.map(booking => (
                                    <tr key={booking.id}>
                                        <td>{new Date(booking.date).toLocaleDateString()}</td>
                                        <td>{booking.client}</td>
                                        <td>${booking.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFinances;
