import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LuLandmark as Landmark,
  LuBell as Bell,
  LuMail as Mail,
  LuLogOut as LogOut,
  LuShield as Shield,
  LuChevronDown as ChevronDown,
  LuLayoutDashboard as LayoutDashboard,
  LuArrowDownLeft as ArrowDownLeft,
  LuArrowUpRight as ArrowUpRight,
  LuSend as Send,
  LuUsers as Users,
  LuHistory as History,
  LuSettings as Settings,
  LuMenu as Menu,
  LuX as X,
} from 'react-icons/lu';
import './Navbar.css';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const activePath = location.pathname;

  // Navigation items for regular users
  const navItems = user ? [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/deposit', label: 'Deposit', icon: ArrowDownLeft },
    { path: '/transfer', label: 'Transfer', icon: Send },
    { path: '/withdraw', label: 'Withdraw', icon: ArrowUpRight },
    { path: '/invite', label: 'Invite', icon: Users },
    { path: '/transactions', label: 'History', icon: History },
  ] : [];

  // Admin sub-nav items
  const adminNavItems = [
    { path: '/admin/users', label: 'Users DB', icon: Users },
    { path: '/admin/withdrawals', label: 'Withdrawals', icon: ArrowUpRight },
    { path: '/admin/transactions', label: 'All Tx Approvals', icon: History },
    { path: '/admin/settings', label: 'Bank Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="brand" onClick={() => navigate(user ? '/dashboard' : '/')}>
          <div className="brand-icon"><Landmark /></div>
          <div className="brand-text">
            <span className="brand-name">Wintrust</span>
            <span className="brand-sub">Institutional Banking</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        {user && (
          <nav className="desktop-nav">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${activePath === item.path ? 'active' : ''}`}
              >
                <item.icon />
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <div className="admin-nav-group">
                {adminNavItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`admin-nav-link ${activePath === item.path ? 'active' : ''}`}
                  >
                    <item.icon />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>
        )}

        {/* Right Icons & Profile */}
        <div className="navbar-actions">
          {user && (
            <>
              <button className="icon-btn" title="Emails">
                <Mail />
              </button>
              <button className="icon-btn" title="Notifications">
                <Bell />
                {/* Unread badge would be fetched from API */}
              </button>
              <div className="profile-dropdown">
                <button
                  className="profile-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <div className="avatar">
                    {isAdmin ? <Shield /> : user.firstName.charAt(0)}
                  </div>
                  <span className="profile-name">{user.firstName}</span>
                  <ChevronDown />
                </button>
                {profileDropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <p>{user.firstName} {user.lastName}</p>
                      <p className="dropdown-email">{user.email}</p>
                      <div className="dropdown-account">Acc: {user.accountNumber}</div>
                    </div>
                    <Link to="/dashboard" onClick={() => setProfileDropdownOpen(false)}>
                      <LayoutDashboard /> Dashboard
                    </Link>
                    <Link to="/invite" onClick={() => setProfileDropdownOpen(false)}>
                      <Users /> Refer & Earn
                    </Link>
                    <Link to="/transactions" onClick={() => setProfileDropdownOpen(false)}>
                      <History /> History
                    </Link>
                    {isAdmin && (
                      <Link to="/admin/users" onClick={() => setProfileDropdownOpen(false)}>
                        <Shield /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="logout-btn">
                      <LogOut /> Sign Out
                    </button>
                  </div>
                )}
              </div>
              <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {user && mobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${activePath === item.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon /> {item.label}
            </Link>
          ))}
          {isAdmin && (
            <div className="mobile-admin-section">
              <p>Admin</p>
              {adminNavItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-link ${activePath === item.path ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon /> {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};