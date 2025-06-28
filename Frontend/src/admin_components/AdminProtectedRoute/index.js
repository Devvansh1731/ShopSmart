import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar';

const AdminProtectedRoute = (props) => {
    const { Component } = props;
    const navigate = useNavigate();
    
    useEffect(() => {
        const adminToken = Cookies.get('adminJwtToken');
        const userToken = Cookies.get('jwtToken');
        
        if (!adminToken) {
            navigate('/alogin');
            return;
        }
        
        // If it's only a user token, redirect to home
        if (userToken && !adminToken) {
            navigate('/');
            return;
        }
    }, [navigate]);

    return (
        <>
            <AdminNavbar />
            <Component />
        </>
    );
};

export default AdminProtectedRoute;
