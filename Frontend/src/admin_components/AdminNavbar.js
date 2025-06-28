// src/components/Navbar.js

import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem('adminName');

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      localStorage.removeItem('adminJwtToken');
      localStorage.removeItem('adminName');
      localStorage.removeItem('adminId');
      navigate('/alogin');
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand>
          <Link to='/admin/dashboard' style={{ color: "white", textDecoration: "none" }}>
            ShopSmart Admin
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/admin/users" className="nav-link">Users</Link>
            <Link to="/admin/all-products" className="nav-link">Products</Link>
            <Link to="/admin/add-product" className="nav-link">Add Product</Link>
            <Link to="/admin/orders" className="nav-link">Orders</Link>
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            {adminName && (
              <span className="nav-link disabled">
                Welcome, {adminName}
              </span>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
