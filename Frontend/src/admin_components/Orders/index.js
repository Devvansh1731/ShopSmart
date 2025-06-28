import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import LoaderSpinner from '../../components/LoaderSpinner';
import AdminNavbar from '../AdminNavbar';
import { API_BASE_URL } from '../../context/context';

// Styled components
const Container = styled.div`
  text-align: start;
  margin-top: 60px;
`;

const Heading = styled.h1`
  color: rgb(62, 62, 62);
  font-size: 38px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const OrderCard = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
`;

const OrderDetail = styled.p`
  margin: 5px 0;
`;

const Button = styled.button`
  background-color: rgb(98, 90, 252);
  color: #fff;
  width: 150px;
  margin-top: 10px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgb(68, 60, 196);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Orders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [statusForm, setStatusForm] = useState({
    status: 'Confirmed',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const adminToken = localStorage.getItem('adminJwtToken');
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const onSubmit = async (formData) => {
    try {
      const adminToken = localStorage.getItem('adminJwtToken');
      await axios.put(`${API_BASE_URL}/orders/${selectedOrderId}`, formData, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      setIsUpdate(false);
      getData();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const onChangeStatus = (orderId) => {
    setIsUpdate(true);
    setSelectedOrderId(orderId);
  };

  return (
    <div>
      <AdminNavbar />
      {isLoading ? (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoaderSpinner />
        </div>
      ) : (
        <Container className="container">
          <h1 className='text-center'>Orders</h1>
          {data.length === 0 ? (
            <div>
              <p>No orders in your shop!</p>
            </div>
          ) : (
            <div>
              {isUpdate ? (
                <div>
                  <form onSubmit={(e) => { e.preventDefault(); onSubmit(statusForm); }}>
                    <div className="form-group">
                      <label htmlFor="statusSelect">Select Status</label>
                      <select 
                        className="form-control" 
                        id="statusSelect" 
                        value={statusForm.status} 
                        onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                    <Button type="submit">Save Changes</Button>
                  </form>
                </div>
              ) : null}
              {data.map((order) => (
                <OrderCard key={order._id}>
                  <OrderDetail>Order ID: {order._id}</OrderDetail>
                  <OrderDetail>Customer: {order.userName}</OrderDetail>
                  <OrderDetail>Status: {order.status}</OrderDetail>
                  <OrderDetail>Total Amount: ${order.totalAmount}</OrderDetail>
                  <Button onClick={() => onChangeStatus(order._id)}>Update Status</Button>
                </OrderCard>
              ))}
            </div>
          )}
        </Container>
      )}
    </div>
  );
};

export default Orders;
