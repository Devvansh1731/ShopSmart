import React, { useEffect } from 'react';
import Cookies from 'js-cookies';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = (props) => {
    const { Component } = props;
    const navigate = useNavigate();
    
    useEffect(() => {
        const token = Cookies.getItem('jwtToken');
        const adminToken = localStorage.getItem('adminJwtToken');
        
        if (!token && !adminToken) {
            navigate('/login');
            return;
        }
        
        // If it's an admin token, redirect to admin dashboard
        if (adminToken) {
            navigate('/admin/dashboard');
            return;
        }
    }, [navigate]);

    return <Component />;
};

export default ProtectedRoute;
