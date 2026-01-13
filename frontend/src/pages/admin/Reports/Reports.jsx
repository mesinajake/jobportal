import { useState, useEffect } from 'react';
import './Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    // TODO: Fetch reports from API
    setLoading(false);
  }, [dateRange]);

  return (
    <div className="admin-reports">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <div className="date-filter">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <h3>User Registrations</h3>
          <div className="chart-placeholder">
            <p>Chart will be displayed here</p>
          </div>
        </div>

        <div className="report-card">
          <h3>Job Postings</h3>
          <div className="chart-placeholder">
            <p>Chart will be displayed here</p>
          </div>
        </div>

        <div className="report-card">
          <h3>Applications</h3>
          <div className="chart-placeholder">
            <p>Chart will be displayed here</p>
          </div>
        </div>

        <div className="report-card">
          <h3>User Activity</h3>
          <div className="chart-placeholder">
            <p>Chart will be displayed here</p>
          </div>
        </div>
      </div>

      <div className="export-section">
        <h2>Export Reports</h2>
        <div className="export-buttons">
          <button className="export-btn">Export as PDF</button>
          <button className="export-btn">Export as CSV</button>
          <button className="export-btn">Export as Excel</button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
