import React, { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { API_BASE_URL } from '../context/context';

const commonFields = [
    { controlId: "firstname", label: "First Name", type: "text" },
    { controlId: "lastname", label: "Last Name", type: "text" },
    { controlId: "username", label: "Username", type: "text" },
    { controlId: "email", label: "Email", type: "email" },
    { controlId: "password", label: "Password", type: "password" },
];

const AdminSignup = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
    });

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`${API_BASE_URL}/adminregister`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log('Admin registration successful:', data);
                alert('Admin registration successful');
                navigate('/alogin');
            } else {
                const errorData = await response.json();
                alert('Registration failed: ' + errorData.message);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Error during registration. Please try again.');
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
                        <h2 className="mb-4">Admin Sign Up</h2>
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
                            <Button type="submit" className="btn-primary w-100 mt-3">Sign Up</Button>
                        </Form>
                        <p>Already have an account? <Link to="/alogin">Log In</Link></p>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default AdminSignup;
