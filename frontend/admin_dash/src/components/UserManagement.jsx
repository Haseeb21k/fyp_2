import React, { useEffect, useState } from 'react';
import API from '../api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await API.get('/auth/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await API.post('/auth/register', { email: newUserEmail });
      const password = res.data.password;
      setMessage(`User ${newUserEmail} registered successfully! Password: ${password} (Save this password to share with the user)`);
      setNewUserEmail('');
      loadUsers();
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to register user');
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      if (isActive) {
        await API.post(`/auth/users/${userId}/deactivate`);
      } else {
        await API.post(`/auth/users/${userId}/activate`);
      }
      loadUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="card shadow-sm rounded-4 p-4">
      <h3 className="mb-4">User Management</h3>
      
      <form onSubmit={handleRegister} className="mb-4">
        <div className="row g-2">
          <div className="col-md-8">
            <input
              type="email"
              className="form-control"
              placeholder="Enter work email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <button type="submit" className="btn btn-primary w-100">Register User</button>
          </div>
        </div>
        {message && (
          <div className={`alert mt-2 ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}
      </form>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.is_superuser ? 'bg-danger' : 'bg-secondary'}`}>
                    {user.is_superuser ? 'Superuser' : 'User'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.is_active ? 'bg-success' : 'bg-warning'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {!user.is_superuser && (
                    <button
                      className={`btn btn-sm ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

