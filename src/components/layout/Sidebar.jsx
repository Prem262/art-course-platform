import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { X, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-header">
            <div>
              <span className="editorial-eyebrow">CREATIVE PRACTICE</span>
              <div className="sidebar-brand-name">Botanical Studio</div>
            </div>

            <button
              className="btn btn-ghost"
              onClick={onClose}
              style={{ padding: 6 }}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="sidebar-nav">
            <span className="editorial-eyebrow" style={{ padding: '8px 14px', fontSize: 10 }}>
              PRACTICE & WORKSPACE
            </span>

            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span>Studio & Progress</span>
            </NavLink>

            <NavLink
              to="/courses"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span>My Enrolled Classes</span>
            </NavLink>

            <NavLink
              to="/explore"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span>Explore Available Classes</span>
            </NavLink>

            {isAdmin && (
              <>
                <span className="editorial-eyebrow" style={{ padding: '16px 14px 6px', fontSize: 10 }}>
                  ADMINISTRATION
                </span>
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span>Student Manager</span>
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile-summary">
            <UserAvatar name={user?.name} initials={user?.initials} size="sm" />
            <div className="user-info-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="user-name">{user?.name || "Student 1"}</span>
                {isAdmin && <span className="badge badge-role-admin" style={{ fontSize: 9 }}>Admin</span>}
              </div>
              <div className="user-email">{user?.email || "student@demo.com"}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn-sidebar-logout"
            aria-label="Sign out"
          >
            <LogOut size={14} />
            <span>Leave Studio</span>
          </button>
        </div>
      </aside>
    </>
  );
};
