const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 4000;

const JWT_SECRET = process.env.JWT_SECRET || 'homeevo_local_dev_jwt_secret_change_in_production';

app.use(cors());
app.use(express.json());

// Seeded database mock users map
const MOCK_USERS = {
  'admin@homeevo.dev': { id: 'admin-uuid-001', name: 'HomeEvo Admin', role: 'admin', password: 'Admin@123' },
  
  // Real names
  'raju@homeevo.dev': { id: 'vendor-uuid-001', name: 'Raju', role: 'vendor', password: 'Vendor@123' },
  'krishna@homeevo.dev': { id: 'vendor-uuid-002', name: 'Krishna', role: 'vendor', password: 'Vendor@123' },
  'lakshmi@homeevo.dev': { id: 'vendor-uuid-003', name: 'Lakshmi', role: 'vendor', password: 'Vendor@123' },
  'sridhar@homeevo.dev': { id: 'vendor-uuid-004', name: 'Sridhar', role: 'vendor', password: 'Vendor@123' },
  'ramesh@homeevo.dev': { id: 'vendor-uuid-005', name: 'Ramesh', role: 'vendor', password: 'Vendor@123' },
  'srinivas@homeevo.dev': { id: 'vendor-uuid-006', name: 'Srinivas', role: 'vendor', password: 'Vendor@123' },
  'anji@homeevo.dev': { id: 'vendor-uuid-007', name: 'Anji', role: 'vendor', password: 'Vendor@123' },
  'satya@homeevo.dev': { id: 'vendor-uuid-008', name: 'Satya', role: 'vendor', password: 'Vendor@123' },
  'naidu@homeevo.dev': { id: 'vendor-uuid-009', name: 'Naidu', role: 'vendor', password: 'Vendor@123' },
  'prasad@homeevo.dev': { id: 'vendor-uuid-010', name: 'Prasad', role: 'vendor', password: 'Vendor@123' },

  // Standardized vendor aliases (to match client1/client2 style)
  'vendor1@homeevo.dev': { id: 'vendor-uuid-001', name: 'Raju', role: 'vendor', password: 'Vendor@123' },
  'vendor2@homeevo.dev': { id: 'vendor-uuid-002', name: 'Krishna', role: 'vendor', password: 'Vendor@123' },
  'vendor3@homeevo.dev': { id: 'vendor-uuid-003', name: 'Lakshmi', role: 'vendor', password: 'Vendor@123' },
  'vendor4@homeevo.dev': { id: 'vendor-uuid-004', name: 'Sridhar', role: 'vendor', password: 'Vendor@123' },
  'vendor5@homeevo.dev': { id: 'vendor-uuid-005', name: 'Ramesh', role: 'vendor', password: 'Vendor@123' },
  'vendor6@homeevo.dev': { id: 'vendor-uuid-006', name: 'Srinivas', role: 'vendor', password: 'Vendor@123' },
  'vendor7@homeevo.dev': { id: 'vendor-uuid-007', name: 'Anji', role: 'vendor', password: 'Vendor@123' },
  'vendor8@homeevo.dev': { id: 'vendor-uuid-008', name: 'Satya', role: 'vendor', password: 'Vendor@123' },
  'vendor9@homeevo.dev': { id: 'vendor-uuid-009', name: 'Naidu', role: 'vendor', password: 'Vendor@123' },
  'vendor10@homeevo.dev': { id: 'vendor-uuid-010', name: 'Prasad', role: 'vendor', password: 'Vendor@123' },

  // Clients
  'client1@homeevo.dev': { id: 'client-uuid-001', name: 'Priya Reddy', role: 'client', password: 'Client@123' },
  'client2@homeevo.dev': { id: 'client-uuid-002', name: 'Arjun Varma', role: 'client', password: 'Client@123' },
  'client3@homeevo.dev': { id: 'client-uuid-003', name: 'Sunita Rao', role: 'client', password: 'Client@123' },
  'client4@homeevo.dev': { id: 'client-uuid-004', name: 'Manish Kumar', role: 'client', password: 'Client@123' },
  'client5@homeevo.dev': { id: 'client-uuid-005', name: 'Kavitha Patel', role: 'client', password: 'Client@123' }
};

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'homeevo-api',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication Sign In Endpoint
app.post('/api/v1/auth/signin', (req, res) => {
  const { email, password } = req.body;
  console.log(`[Mock API] Sign In Request: email=${email}`);

  const user = MOCK_USERS[email?.toLowerCase()];

  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate real JWS/JWT tokens
  const tokenPayload = {
    sub: user.id,
    role: user.role
  };
  
  const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

  // Success response
  res.json({
    success: true,
    message: 'Welcome back!',
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: email,
        name: user.name,
        role: user.role
      }
    }
  });
});

// Authentication Sign Up Endpoint
app.post('/api/v1/auth/signup', (req, res) => {
  const { email, password, name, role } = req.body;
  console.log(`[Mock API] Sign Up Request: email=${email}, name=${name}, role=${role}`);

  // Create temporary in-memory mock user for sign-in
  const userId = `mock-user-${Math.random().toString(36).substr(2, 9)}`;
  MOCK_USERS[email.toLowerCase()] = {
    id: userId,
    name: name,
    role: role,
    password: password
  };

  const tokenPayload = {
    sub: userId,
    role: role
  };

  const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

  res.json({
    success: true,
    message: 'Account created successfully!',
    data: {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: email,
        name: name,
        role: role
      }
    }
  });
});

// Mock payments webhook endpoint for Razorpay testing
app.post('/api/v1/payments/webhook', (req, res) => {
  console.log('Received Razorpay Webhook Event:', req.body);
  res.json({ success: true, message: 'Webhook received successfully' });
});

app.listen(port, () => {
  console.log(`🚀 HomeEvo Backend API running on port ${port}`);
});
