import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';

export const Header = ({ onOpenMenu }) => {
  const { user, isAdmin, switchUser } = useAuth();
  const navigate = useNavigate();

  const handleToggleRole = () => {
    if (isAdmin) {
      switchUser('student-001');
      navigate('/dashboard');
    } else {
      switchUser('admin-001');
      navigate('/admin');
    }
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        {/* Menu + Button for mobile and quick drawer */}
        <button
          onClick={onOpenMenu}
          className="btn btn-ghost"
          style={{ padding: '6px 10px', fontSize: 13, letterSpacing: '0.1em' }}
          aria-label="Open menu"
        >
          <span>Menu +</span>
        </button>

        {/* Studio Mark */}
        <Link to="/dashboard" className="studio-mark-link">
          <span className="studio-mark-text">Botanical Art Studio</span>
          <span className="studio-tagline">· Learn & Practice</span>
        </Link>

        {/* Desktop Topbar Navigation Links */}
        <nav className="topbar-nav-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `topbar-nav-item ${isActive ? 'active' : ''}`}
          >
            Studio
          </NavLink>

          <NavLink
            to="/courses"
            className={({ isActive }) => `topbar-nav-item ${isActive ? 'active' : ''}`}
          >
            My Practice
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) => `topbar-nav-item ${isActive ? 'active' : ''}`}
          >
            Explore Classes
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `topbar-nav-item ${isActive ? 'active' : ''}`}
              style={{ color: '#111111', fontWeight: 600 }}
            >
              Student Manager
            </NavLink>
          )}
        </nav>
      </div>

      <div className="topbar-right">
        {/* Quick Demo Switcher */}
        <button
          onClick={handleToggleRole}
          className="role-switcher-pill"
          title={isAdmin ? "Switch to Student View" : "Switch to Admin Mode"}
        >
          <ArrowRightLeft size={12} />
          <span>{isAdmin ? "Student View" : "Admin Mode"}</span>
        </button>

        <div className="topbar-user">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
            <span className="topbar-user-name">{user?.name || "Student 1"}</span>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
              {isAdmin ? "Admin" : "Student"}
            </span>
          </div>
          <UserAvatar name={user?.name} initials={user?.initials || "S1"} size="sm" />
        </div>
      </div>
    </header>
  );
};
