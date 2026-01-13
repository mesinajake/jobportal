import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './AuthLayout.css';

/**
 * AuthLayout - Layout wrapper for authentication pages (Login, Register)
 * Clean, centered layout without main navigation
 */
export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <i className="fa-solid fa-users"></i>
            {' '}AppliTrak
          </Link>
        </div>
        <main className="auth-content">
          <Outlet />
        </main>
        <div className="auth-footer">
          <p>© 2024 AppliTrak. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}
