import React, { useEffect } from 'react';
import Cookies from 'js-cookies';
import { useNavigate } from 'react-router-dom';

const AdminProtectedRoute = (props) => {
    const { Component } = props;
    const navigate = useNavigate();
    
    useEffect(() => {
        const adminToken = localStorage.getItem('adminJwtToken');
        const userToken = Cookies.getItem('jwtToken');
        
        if (!adminToken) {
            navigate('/alogin');
            return;
        }
        
        // If it's a user token, redirect to home
        if (userToken) {
            navigate('/');
            return;
        }
    }, [navigate]);

    return <Component />;
};

export default AdminProtectedRoute;
