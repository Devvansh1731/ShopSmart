import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from '../Header';
import { API_BASE_URL } from '../../context/context';

const commonFields = [
    { controlId: 'email', label: 'Email', type: 'email' },
    { controlId: 'password', label: 'Password', type: 'password' },
];

const Login = () => {
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
            navigate('/');
        } else if (adminToken) {
            navigate('/admin/all-products');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.token) {
                    if (data.user.isAdmin) {
                        // Admin login
                        Cookies.set('adminJwtToken', data.token, { expires: 30 });
                        Cookies.set('userName', data.user.firstname);
                        navigate('/admin/dashboard');
                    } else {
                        // Regular user login
                        Cookies.set('jwtToken', data.token, { expires: 30 });
                        Cookies.set('userId', data.user._id);
                        Cookies.set('userName', data.user.firstname);
                        navigate('/');
                    }
                }
            } else {
                setError(data.message || "Invalid email or password");
            }
        } catch (error) {
            setError('An error occurred during login. Please try again.');
            console.error('Login error:', error);
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
                        <h2 className="mb-4">Login</h2>
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
                            Don't have an account? <Link to="/signup">Sign Up</Link>
                        </p>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default Login;
