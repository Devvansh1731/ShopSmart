import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = (props) => {
    const { Component } = props;
    const navigate = useNavigate();
    
    useEffect(() => {
        const token = Cookies.get('jwtToken');
        const adminToken = Cookies.get('adminJwtToken');
        
        if (!token && !adminToken) {
            navigate('/login');
            return;
        }
        
        // If it's an admin token and no user token, redirect to admin dashboard
        if (adminToken && !token) {
            navigate('/admin/dashboard');
            return;
        }
    }, [navigate]);

    return <Component />;
};

export default ProtectedRoute;
