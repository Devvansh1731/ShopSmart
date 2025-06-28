import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookies';
import Header from '../components/Header';
import { API_BASE_URL } from '../context/context';

const commonFields = [
    { controlId: 'email', label: 'Email', type: 'email' },
    { controlId: 'password', label: 'Password', type: 'password' },
];

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const navigate = useNavigate();
    const token = Cookies.getItem('jwtToken');
    const adminToken = localStorage.getItem('adminJwtToken');

    useEffect(() => {
        if (token) {
            navigate('/'); // Redirect to home if user token exists
        } else if (adminToken) {
            navigate('/admin/dashboard'); // Redirect to admin dashboard if admin token exists
        }
    }, [navigate, token, adminToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/adminlogin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.token && data.user.isAdmin) {
                    localStorage.setItem('adminJwtToken', data.token);
                    localStorage.setItem('adminName', data.user.firstname);
                    localStorage.setItem('adminId', data.user._id);
                    alert('Admin Login Successful');
                    navigate('/admin/dashboard');
                } else {
                    alert('Invalid admin credentials');
                }
            } else {
                alert('Invalid email or password');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Error during login. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    return (
        <div>
            <Header />
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', paddingTop: '10vh' }}>
                <Card className="shadow p-4" style={{ width: '400px' }}>
                    <Card.Body>
                        <h2 className="mb-4">Admin Login</h2>
                        <Form onSubmit={handleSubmit}>
                            {commonFields.map((field) => (
                                <Form.Group style={{ textAlign: 'start', marginBottom: '10px' }} controlId={field.controlId} key={field.controlId}>
                                    <Form.Label>{field.label}</Form.Label>
                                    <Form.Control
                                        type={field.type}
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                        name={field.controlId}
                                        value={formData[field.controlId]}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            ))}
                            <Button type="submit" className="btn-primary w-100 mt-3">Login</Button>
                        </Form>
                        <p>
                            Don't have an account? <Link to="/asignup">Sign Up</Link>
                        </p>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default AdminLogin;


