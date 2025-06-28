import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table,Card } from 'react-bootstrap';
import { FaTrash,FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AdminNavabar from '../AdminNavbar'
import { API_BASE_URL } from '../../context/context';


const Users = () => {
  const [userbookings, setUserbookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };
  const [showDetail, setShowDetail] = useState(false);

  const toggleDetail = () => {
    setShowDetail(!showDetail);
  };

   useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const adminToken = localStorage.getItem('adminJwtToken');
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      setUsers(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const adminToken = localStorage.getItem('adminJwtToken');
        await axios.delete(`${API_BASE_URL}/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        alert('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const fetchUserBikeData = (userId) => {
   
    axios.get(`http://localhost:5100/getbookings/${userId}`)

    .then((response) => {
      setUserbookings(response.data);
      toggleDetails(); // Show Plan Details when data is fetched
    })
    .catch((error) => {
      console.error('Error fetching user bike data:', error);
    });
  };
  const calculateStatus = (date) => {
    const currentDate = new Date();
    const formattedDeliveryDate = new Date(date);

    if (formattedDeliveryDate >= currentDate) {
      return "Upcomming";
    } else {
      return "completed";
    }
  };

  return (
    <div>
      <AdminNavabar/>
    <br />
    <h1 className='text-center'>Users</h1> <br />
    <div style={{display:"flex",justifyContent:"center"}}>
    <Table striped bordered hover variant="dark" style={{width:"70%"}}>
      <thead>
        <tr>
          <th>sl/no</th>
          <th>UserId</th>
          <th>User name</th>
          <th>Email</th>
          <th>Operation</th>
        </tr>
      </thead>
      <tbody>
        {users.map((item, index) => (
          <tr key={item._id}>
            <td>{index + 1}</td>
            <td>{item._id}</td>
            <td>{item.username}</td>
            <td>{item.email}</td>
            <td>
              <Button 
                variant="danger" 
                onClick={() => handleDeleteUser(item._id)}
                style={{ border: 'none', background: 'none', color: 'red' }}
              >
                <FaTrash />
              </Button>
              <Button onClick={() => fetchUserBikeData(item._id)} style={{ marginBottom: '12px' }}>
                view
              </Button>
              <div style={{ display: 'flex' }}>
                {showDetails && (
                  <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-50" >
                    <div className="bg-gray-900 bg-opacity-50 absolute inset-0"></div>
                    <div className="bg-white p-4 rounded-lg z-10 relative" style={{ maxHeight: "80vh", overflowY: "scroll" }}>
                      {/* Rest of your content */}
                      <p className="text-sm text-gray-600">
                        <div className="container mx-auto mt-8" style={{width:"1350px"}}>
                          <h1 className='text-center text-blue-300'>User Bookings</h1>
                          {userbookings.map((item) => {
                             const status = calculateStatus(item.date);
                            return (
                                <Card
                                key={item._id}
                                style={{
                                  width: '90%',
                                  marginLeft: '65px',
                                  backgroundColor: '#fff',
                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                  borderRadius: '8px',
                                  paddingTop: '15px',
                                  marginBottom: '35px',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                  <div >
                                  <img src={`http://localhost:7000/organizer/${item?.templeImage}`} style={{ height: "80px",width:"120px" }} /> 
                                  </div>
                                  <div>
                                    <p>Temple Name:</p>
                                    <p>{item.templeName}</p>
                                  </div>
                                  <div>
                                    <p>Darshan Name:</p>
                                    <p>{item.darshanName}</p>
                                  </div>
                                  <div>
                                    <p>Bookingid:</p>
                                    <p>{item._id.slice(0,10)}</p>
                                  </div>
                                  <div>
                                    <p>Organizer</p>
                                    <p>{item.organizerName}</p>
                                  </div>
                                  <div>
                                    <p>BookingDate</p>
                                    <p>{item.BookingDate}</p>
                                  </div>
                                  <div>
                                    <p>Timings</p>
                                    <p>{item.open}-{item.close}</p>
                                  </div>
                                  <div>
                                    <p>Quantity</p>
                                    <p>{item.quantity}</p>
                                  </div>
                                  <div>
                                    <p>Price</p>
                                    <p>{item.totalamount}</p>
                                  </div>
                                  <div>
                                    <p>Status</p>
                                    <p>{status}</p>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </p>
                      <Button onClick={toggleDetails} className="mt-4">
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
    </div>
  </div>
  
  )
}

export default Users
