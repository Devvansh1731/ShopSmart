import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
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
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get('jwtToken');
        const adminToken = Cookies.get('adminJwtToken');

        if (token) {
            navigate('/'); // Redirect to home if user token exists
        } else if (adminToken) {
            navigate('/admin/dashboard'); // Redirect to admin dashboard if admin token exists
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/adminlogin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.token && data.user.isAdmin) {
                    Cookies.set('adminJwtToken', data.token, { expires: 30 });
                    Cookies.set('adminName', data.user.firstname, { expires: 30 });
                    Cookies.set('adminId', data.user._id, { expires: 30 });
                    navigate('/admin/dashboard');
                } else {
                    setError('Invalid admin credentials');
                }
            } else {
                setError(data.message || 'Invalid email or password');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('Error during login. Please try again.');
        } finally {
            setIsLoading(false);
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
                        {error && <div className="alert alert-danger">{error}</div>}
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
                                        disabled={isLoading}
                                    />
                                </Form.Group>
                            ))}
                            <Button 
                                type="submit" 
                                className="btn-primary w-100 mt-3"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </Button>
                        </Form>
                        <p className="mt-3 mb-0">
                            Don't have an account? <Link to="/admin/signup">Sign Up</Link>
                        </p>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default AdminLogin;


