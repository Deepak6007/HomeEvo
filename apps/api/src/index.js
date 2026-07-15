const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { createClient } = require('redis');

const app = express();
const port = process.env.PORT || 4000;

const JWT_SECRET = process.env.JWT_SECRET || 'homeevo_local_dev_jwt_secret_change_in_production';

// Initialize Redis client for webhook idempotency checks
const isSecureRedis = process.env.REDIS_URL && process.env.REDIS_URL.startsWith('rediss:');
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: isSecureRedis ? {
    tls: true,
    rejectUnauthorized: false
  } : undefined
});
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect().catch((err) => console.error('Redis Connect Error', err));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:3000',
  credentials: true
}));
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

// Rate Limiting Middleware for Auth
const authLimiter = async (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const key = `rate_limit:auth:${ip}`;
  const limit = 5; // Max 5 requests
  const windowSeconds = 900; // 15 minutes

  try {
    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, windowSeconds);
    }
    if (count > limit) {
      return res.status(429).json({
        success: false,
        message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
      });
    }
    next();
  } catch (err) {
    console.error('Rate limit error, falling open:', err);
    next();
  }
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
app.post('/api/v1/auth/signin', authLimiter, (req, res) => {
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
app.post('/api/v1/auth/signup', authLimiter, (req, res) => {
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

// Authentication Token Refresh Endpoint
app.post('/api/v1/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token is required' });
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    const tokenPayload = {
      sub: payload.sub,
      role: payload.role
    };

    const newAccessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
});

// Secure payments webhook endpoint with signature verification & idempotency
app.post('/api/v1/payments/webhook', async (req, res) => {
  console.log('Received Razorpay Webhook Event:', req.body);

  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';

  // 1. Signature Verification
  if (!signature) {
    return res.status(400).json({ success: false, message: 'Missing Razorpay signature' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  // 2. Idempotency Check (Deduplication via Redis)
  const eventId = req.headers['x-razorpay-event-id'] || req.body.id;
  if (!eventId) {
    return res.status(400).json({ success: false, message: 'Missing webhook event ID' });
  }

  try {
    const isNewEvent = await redisClient.set(
      `webhook_event:${eventId}`,
      'processed',
      {
        NX: true,
        EX: 86400 // Expire in 24 hours
      }
    );

    if (!isNewEvent) {
      console.warn(`[Webhook] Duplicate event ignored: ${eventId}`);
      return res.status(200).json({ success: true, message: 'Duplicate event skipped' });
    }
  } catch (err) {
    console.error('[Webhook] Redis deduplication check failed:', err);
    return res.status(500).json({ success: false, message: 'Failed to verify event uniqueness' });
  }

  // Proceed with processing payment details (milestone release, etc.)
  res.json({ success: true, message: 'Webhook verified and processed successfully' });
});

app.listen(port, () => {
  console.log(`🚀 HomeEvo Backend API running on port ${port}`);
});
