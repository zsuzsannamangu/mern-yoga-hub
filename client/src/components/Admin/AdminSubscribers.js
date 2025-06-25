import React, { useEffect, useState } from 'react';
import './AdminSubscribers.scss';

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    const fetchSubscribers = async () => {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.REACT_APP_API}/api/admin/subscribers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setSubscribers(data);
    };

    fetchSubscribers();
  }, []);

  return (
    <div className="admin-subscribers">
      <h2>Newsletter Subscribers</h2>
      {subscribers.length === 0 ? (
        <div className="no-subscribers">No subscribers yet.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Subscribed At</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub, index) => (
              <tr key={sub._id}>
                <td>{index + 1}</td>
                <td>{sub.email}</td>
                <td>{new Date(sub.subscribedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminSubscribers;
