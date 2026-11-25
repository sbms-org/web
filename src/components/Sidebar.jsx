import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/owners', label: 'Owners', icon: '👥' },
    // { path: '/tenants', label: 'Tenants', icon: '🏠' },
    { path: '/pending-approvals', label: 'Pending Approvals', icon: '⏳' },
    { path: '/pending-buildings', label: 'Pending Buildings', icon: '🏗️' },
    { path: '/transactions', label: 'Transactions', icon: '💳' },
    { path: '/payment-methods', label: 'Payment Methods', icon: '🏦' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
    { path: '/audit-logs', label: 'Audit Logs', icon: '📋' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavClick = () => {
        // Close sidebar on mobile when clicking a nav item
        if (window.innerWidth <= 768 && collapsed) {
            setCollapsed(false);
        }
    };

    const handleOverlayClick = () => {
        // Close sidebar when clicking overlay on mobile
        if (window.innerWidth <= 768 && collapsed) {
            setCollapsed(false);
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            {collapsed && (
                <div 
                    className="sidebar-overlay" 
                    onClick={handleOverlayClick}
                />
            )}
            <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
                <div className="sidebar__header">
                    <div className="sidebar__brand">
                        <span className="sidebar__logo">🏢</span>
                        <span className="sidebar__title">PixelRents</span>
                    </div>
                    <button
                        className="sidebar__toggle"
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? 'Expand' : 'Collapse'}
                    >
                        {collapsed ? '→' : '←'}
                    </button>
                </div>

                <nav className="sidebar__nav">
                    {navItems.map(({ path, label, icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
                            }
                            onClick={handleNavClick}
                        >
                            <span className="sidebar__nav-icon">{icon}</span>
                            <span className="sidebar__nav-label">{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar__footer">
                    <div className="sidebar__user">
                        <div className="sidebar__avatar">{user?.fullName?.[0] || 'A'}</div>
                        <div className="sidebar__user-info">
                            <p className="sidebar__user-name">{user?.fullName}</p>
                            <p className="sidebar__user-role">{user?.role}</p>
                        </div>
                    </div>
                    <button className="sidebar__logout" onClick={handleLogout} title="Logout">
                        🚪 <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
