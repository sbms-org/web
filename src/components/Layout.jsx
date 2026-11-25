import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css';

const Layout = () => {
    const [collapsed, setCollapsed] = useState(false);

    const handleMenuClick = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className="layout">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className={`layout__main ${collapsed ? 'layout__main--expanded' : ''}`}>
                <Navbar onMenuClick={handleMenuClick} />
                <main className="layout__content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
