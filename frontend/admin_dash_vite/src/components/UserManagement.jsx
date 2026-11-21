import React, { useEffect, useState } from 'react';
import API from '../api';
import { Plus, Trash2, Shield, User } from 'lucide-react';

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

  const handleDelete = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) {
      return;
    }
    try {
      await API.delete(`/auth/users/${userId}`);
      setMessage(`User ${email} deleted successfully.`);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      setMessage(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading users...</div>;

  return (
    <div className="space-y-6">
      {/* Add New User Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Add New User</h3>
        <form onSubmit={handleRegister} className="flex gap-4">
          <input
            type="email"
            placeholder="Email Address"
            className="flex-1 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={newUserEmail}
            onChange={e => setNewUserEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center text-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" /> Register User
          </button>
        </form>
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${message.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full flex items-center w-fit ${user.is_superuser ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {user.is_superuser ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                    {user.is_superuser ? 'Superuser' : 'Standard'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                    className={`text-xs font-medium px-2 py-1 rounded-full ${user.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {user.is_active ? 'Active' : 'Suspended'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {!user.is_superuser && (
                    <button onClick={() => handleDelete(user.id, user.email)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
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
