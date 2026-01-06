import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingReports: 0
  });

  useEffect(() => {
    // TODO: Fetch admin dashboard stats
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name || 'Administrator'}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Jobs</h3>
          <p className="stat-number">{stats.totalJobs}</p>
        </div>
        <div className="stat-card">
          <h3>Applications</h3>
          <p className="stat-number">{stats.totalApplications}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Reports</h3>
          <p className="stat-number">{stats.pendingReports}</p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn">Manage Users</button>
          <button className="action-btn">View Reports</button>
          <button className="action-btn">System Settings</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
