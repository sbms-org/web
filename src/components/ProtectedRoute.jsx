import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user } = useAuth();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Check if user exists in localStorage
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('adminUser');
        
        if (!token || !storedUser) {
            setChecking(false);
            return;
        }
        
        setChecking(false);
    }, []);

    if (checking) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Loading...</div>
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
