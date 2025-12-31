import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HiHome, HiLogout, HiUserCircle, HiFolder } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">🎫 Ticket Manager</h1>
        </div>
        <ul className="nav-menu">
          <li>
            <Link 
              to="/" 
              className={`nav-item ${isActive('/') ? 'active' : ''}`}
            >
              <HiHome className="nav-icon" />
              <span className="nav-text">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/projects" 
              className={`nav-item ${isActive('/projects') ? 'active' : ''}`}
            >
              <HiFolder className="nav-icon" />
              <span className="nav-text">Projects</span>
            </Link>
          </li>
        </ul>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <HiUserCircle className="user-avatar" />
            <div className="user-details">
              <div className="user-name">{user?.fullName || user?.username || 'User'}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <HiLogout className="nav-icon" />
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
