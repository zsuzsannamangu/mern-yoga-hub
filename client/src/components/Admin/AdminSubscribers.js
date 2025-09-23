import React, { useEffect, useState } from 'react';
import './AdminSubscribers.scss';
import { FaTrash } from 'react-icons/fa';
import '../../App.scss';
import AdminLayout from './AdminLayout';
import Swal from 'sweetalert2';

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${process.env.REACT_APP_API}/api/admin/subscribers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setSubscribers(data);
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
    }
  };

  const deleteSubscriber = async (id) => {
    const token = localStorage.getItem('adminToken');

    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This subscriber will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API}/api/admin/subscribers/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Delete failed');

      setSubscribers(subscribers.filter(sub => sub._id !== id));

      Swal.fire('Deleted!', 'Subscriber has been deleted.', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Could not delete subscriber.', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="admin-subscribers">
      <h3 className="section-title">Newsletter Subscribers</h3>
      {subscribers.length === 0 ? (
        <div className="no-subscribers">No subscribers yet.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Subscribed At</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub, index) => (
              <tr key={sub._id}>
                <td>{index + 1}</td>
                <td>{sub.email}</td>
                <td>{new Date(sub.subscribedAt).toLocaleString()}</td>
                <td>
                  <button className="delete-button" onClick={() => deleteSubscriber(sub._id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      </div>
    </AdminLayout>
  );
};

export default AdminSubscribers;
