import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import './MainLayout.css';

/**
 * MainLayout - Default layout wrapper for public pages
 * Includes header and footer for all wrapped routes
 */
export default function MainLayout() {
  return (
    <div className="main-layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
