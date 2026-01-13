import { useState, useEffect } from 'react';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // TODO: Fetch users from API
    setLoading(false);
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // TODO: Delete user API call
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    // TODO: Toggle user active status
  };

  return (
    <div className="manage-users">
      <div className="page-header">
        <h1>Manage Users</h1>
        <div className="filter-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Users</option>
            <option value="jobseeker">Job Seekers</option>
            <option value="employer">Employers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="actions">
                      <button onClick={() => handleToggleStatus(user._id, user.isActive)}>
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="delete-btn" onClick={() => handleDeleteUser(user._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
