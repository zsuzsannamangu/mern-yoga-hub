import React, { useEffect, useState } from 'react';
import './AdminSubscribers.scss';
// Using emoji icons (matches AdminFinances)
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

  const copyToClipboard = async (text, successMessage) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'success',
        title: successMessage,
        showConfirmButton: false,
        timer: 1200,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error('Copy failed:', err);
      Swal.fire('Error', 'Could not copy to clipboard.', 'error');
    }
  };

  const handleCopyAllEmails = () => {
    const emails = subscribers.map((s) => s.email).filter(Boolean);
    if (emails.length === 0) return;
    copyToClipboard(emails.join('\n'), `Copied ${emails.length} email${emails.length === 1 ? '' : 's'}`);
  };

  return (
    <AdminLayout>
      <div className="admin-subscribers">
      <h3 className="section-title">Newsletter Subscribers</h3>
      {subscribers.length === 0 ? (
        <div className="no-subscribers">No subscribers yet.</div>
      ) : (
        <>
        <div className="subscribers-actions">
          <button
            type="button"
            className="copy-all-button"
            onClick={handleCopyAllEmails}
            data-tooltip="Copy all emails"
            aria-label="Copy all emails"
          >
            <span aria-hidden="true">📋</span> Copy all emails
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Subscribed At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub, index) => (
              <tr key={sub._id}>
                <td>{index + 1}</td>
                <td className="email-cell">
                  <span className="email-text">{sub.email}</span>
                </td>
                <td>{new Date(sub.subscribedAt).toLocaleString()}</td>
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="copy-button"
                      onClick={() => copyToClipboard(sub.email, 'Copied email')}
                      data-tooltip="Copy email"
                      aria-label="Copy email"
                    >
                      <span aria-hidden="true">📋</span>
                    </button>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => deleteSubscriber(sub._id)}
                      data-tooltip="Delete"
                      aria-label="Delete"
                    >
                      <span aria-hidden="true">🗑️</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </>
      )}
      </div>
    </AdminLayout>
  );
};

export default AdminSubscribers;
