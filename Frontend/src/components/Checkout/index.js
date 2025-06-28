import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'
import Header from '../Header';

const FormContainer = styled.div`
  text-align: start;
  width: 600px;
  margin: 12vh auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  
  @media screen and (max-width: 768px) {
    width: 100%;
  }
`;


const FormHeader = styled.h2`
  font-size: 1.5rem;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const Checkout = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        phone: '',
        quantity: '',
        paymentMethod: 'cod',
        address: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        upiId: '',
        bankName: '',
        walletType: ''
    });
    const [productDetails, setProductDetails] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const { id } = useParams();

    useEffect(() => {
        // Fetch product data using Axios
        axios.get(`http://localhost:5100/products/${id}`)
            .then((response) => {
                // Assuming that response.data contains the product information
                const productData = response.data;

                // Update the component state with the received product data
                setProductDetails({
                    ...formData,
                    // Assuming that you have fields like name, price, etc. in your product data
                    productName: productData.productname,
                    price: productData.price,
                    // Include other fields as needed
                });
            })
            .catch((error) => {
                console.error('Error fetching product data:', error);
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const userId = Cookies.getItem('userId');
        const price = productDetails.price;
        const productname = productDetails.productname;
        
        // Prepare payment details based on payment method
        let paymentDetails = {};
        if (formData.paymentMethod === 'credit' || formData.paymentMethod === 'debit') {
            paymentDetails = {
                cardNumber: formData.cardNumber,
                expiryDate: formData.expiryDate,
                cvv: formData.cvv
            };
        } else if (formData.paymentMethod === 'upi') {
            paymentDetails = {
                upiId: formData.upiId
            };
        } else if (formData.paymentMethod === 'netbanking') {
            paymentDetails = {
                bankName: formData.bankName
            };
        } else if (formData.paymentMethod === 'wallet') {
            paymentDetails = {
                walletType: formData.walletType
            };
        }

        const formDetails = {
            firstname: formData.firstname,
            lastname: formData.lastname,
            user: userId,
            phone: formData.phone,
            productId: id,
            quantity: formData.quantity,
            price,
            productname,
            paymentMethod: formData.paymentMethod,
            address: formData.address,
            paymentDetails
        };

        try {
            const response = await axios.post('http://localhost:5100/orders', formDetails);
            const { order, payment } = response.data;
            
            if (payment.status === 'Success') {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/my-orders');
                }, 2000);
            } else if (payment.status === 'Failed') {
                setError('Payment failed. Please try again.');
            } else if (payment.status === 'Pending' && formData.paymentMethod === 'cod') {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/my-orders');
                }, 2000);
            }

            setFormData({
                firstname: '',
                lastname: '',
                phone: '',
                quantity: '',
                paymentMethod: 'cod',
                address: '',
                cardNumber: '',
                expiryDate: '',
                cvv: '',
                upiId: '',
                bankName: '',
                walletType: ''
            });
        } catch (error) {
            console.error('Error creating order:', error);
            setError('Failed to process order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h3>Processing Payment...</h3>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header/>
            <FormContainer>
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="alert alert-success" role="alert">
                        Order placed successfully! Redirecting to orders page...
                    </div>
                )}
                <FormHeader>Order Details</FormHeader>
                <form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>First Name:</Label>
                        <Input
                            type="text"
                            name="firstname"
                            placeholder="Enter your first name"
                            value={formData.firstname}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Last Name:</Label>
                        <Input
                            type="text"
                            name="lastname"
                            placeholder="Enter your last name"
                            value={formData.lastname}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Phone:</Label>
                        <Input
                            type="number"
                            name="phone"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Quantity:</Label>
                        <Input
                            type="number"
                            name="quantity"
                            placeholder="Enter the quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Address:</Label>
                        <textarea
                            type="text"
                            rows={5}
                            style={{ width: '100%',border:"1px solid grey " }}
                            name="address"
                            placeholder="Enter your address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Payment Method:</Label>
                        <Select
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            required
                        >
                            <option value="cod">Cash on Delivery (COD)</option>
                            <option value="credit">Credit Card</option>
                            <option value="debit">Debit Card</option>
                            <option value="upi">UPI Payment</option>
                            <option value="netbanking">Net Banking</option>
                            <option value="wallet">Digital Wallet</option>
                            <option value="paypal">PayPal</option>
                        </Select>
                    </FormGroup>

                    {formData.paymentMethod !== 'cod' && (
                        <FormGroup>
                            <Label>Payment Details:</Label>
                            {formData.paymentMethod === 'credit' || formData.paymentMethod === 'debit' ? (
                                <>
                                    <Input
                                        type="text"
                                        name="cardNumber"
                                        placeholder="Card Number"
                                        pattern="[0-9]{16}"
                                        maxLength="16"
                                        required
                                    />
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <Input
                                            type="text"
                                            name="expiryDate"
                                            placeholder="MM/YY"
                                            pattern="(0[1-9]|1[0-2])\/([0-9]{2})"
                                            maxLength="5"
                                            required
                                            style={{ width: '50%' }}
                                        />
                                        <Input
                                            type="password"
                                            name="cvv"
                                            placeholder="CVV"
                                            pattern="[0-9]{3,4}"
                                            maxLength="4"
                                            required
                                            style={{ width: '50%' }}
                                        />
                                    </div>
                                </>
                            ) : formData.paymentMethod === 'upi' ? (
                                <Input
                                    type="text"
                                    name="upiId"
                                    placeholder="Enter UPI ID (e.g. name@bank)"
                                    pattern="[a-zA-Z0-9\\.\\-]{2,256}@[a-zA-Z][a-zA-Z]{2,64}"
                                    required
                                />
                            ) : formData.paymentMethod === 'netbanking' ? (
                                <>
                                    <Select
                                        name="bankName"
                                        required
                                        style={{ marginBottom: '10px' }}
                                    >
                                        <option value="">Select Bank</option>
                                        <option value="sbi">State Bank of India</option>
                                        <option value="hdfc">HDFC Bank</option>
                                        <option value="icici">ICICI Bank</option>
                                        <option value="axis">Axis Bank</option>
                                        <option value="other">Other</option>
                                    </Select>
                                </>
                            ) : formData.paymentMethod === 'wallet' ? (
                                <Select
                                    name="walletType"
                                    required
                                >
                                    <option value="">Select Wallet</option>
                                    <option value="paytm">Paytm</option>
                                    <option value="phonepe">PhonePe</option>
                                    <option value="gpay">Google Pay</option>
                                    <option value="other">Other</option>
                                </Select>
                            ) : null}
                        </FormGroup>
                    )}

                    <Button type="submit">Place Order</Button>
                </form>
            </FormContainer>
        </div>
    );
};

export default Checkout;
