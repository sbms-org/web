import React from 'react';
import { useLocation } from 'react-router-dom';
import './Navbar.css';

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/owners': 'Building Owners',
    '/tenants': 'Tenant Users',
    '/pending-approvals': 'Pending Approvals',
    '/transactions': 'Transactions',
    '/payment-methods': 'Payment Methods',
    '/notifications': 'Notification Templates',
    '/audit-logs': 'Audit Logs',
    '/reports': 'Reports',
    '/settings': 'System Settings',
};

const Navbar = ({ onMenuClick }) => {
    const { pathname } = useLocation();
    const title = pageTitles[pathname] || 'Admin Panel';
    const now = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <header className="navbar">
            <div className="navbar__left">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="navbar__menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
                        ☰
                    </button>
                    <div>
                        <h1 className="navbar__title">{title}</h1>
                        <p className="navbar__date">{now}</p>
                    </div>
                </div>
            </div>
            <div className="navbar__right">
                <div className="navbar__badge">
                    <span className="navbar__badge-dot"></span>
                    System Online
                </div>
            </div>
        </header>
    );
};

export default Navbar;
