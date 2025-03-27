require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const morgan = require('morgan');

// Initialize Express app
const app = express();
const port = process.env.PORT || 8000;
const APP_SECRET = process.env.APP_SECRET || 'S0M3S3CR3T'; // From environment or fallback

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev')); // HTTP request logging

// Data store
const shopwareStores = new Map();

// Helper function to sort and stringify query parameters
const normalizeQueryParams = (params) => {
  return Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
};

// Signature verification middleware
const verifyShopwareRequest = (req, res, next) => {
  const receivedSignature = req.get('shopware-app-signature');
  
  if (!receivedSignature) {
    const error = new Error('Missing shopware-app-signature header');
    error.status = 401;
    return next(error);
  }

  try {
    let dataToSign;
    if (req.method === 'GET') {
      dataToSign = normalizeQueryParams(req.query);
    } else {
      dataToSign = JSON.stringify(req.body);
    }

    console.debug('[Signature Verification] Data being signed:', dataToSign);

    const hmac = crypto.createHmac('sha256', APP_SECRET);
    hmac.update(dataToSign);
    const calculatedSignature = hmac.digest('hex');

    console.debug('[Signature Verification]', {
      received: receivedSignature,
      calculated: calculatedSignature
    });

    if (!crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(calculatedSignature, 'hex')
    )) {
      const error = new Error('Invalid signature');
      error.status = 401;
      error.details = {
        received: receivedSignature,
        calculated: calculatedSignature
      };
      return next(error);
    }

    next();
  } catch (error) {
    error.message = `Signature verification failed: ${error.message}`;
    error.status = error.status || 500;
    next(error);
  }
};

// Validate required parameters middleware
const validateRegistrationParams = (req, res, next) => {
  const params = req.method === 'GET' ? req.query : req.body;
  const { 'shop-id': shopId, 'shop-url': shopUrl, timestamp } = params;

  if (!shopId || !shopUrl || !timestamp) {
    const error = new Error('Missing required parameters');
    error.status = 400;
    error.missingParams = [];
    if (!shopId) error.missingParams.push('shop-id');
    if (!shopUrl) error.missingParams.push('shop-url');
    if (!timestamp) error.missingParams.push('timestamp');
    return next(error);
  }

  // Validate timestamp freshness (within 5 minutes)
  const requestTime = new Date(parseInt(timestamp) * 1000);
  const currentTime = new Date();
  const timeDiff = (currentTime - requestTime) / 1000 / 60; // in minutes

  if (Math.abs(timeDiff) > 5) {
    const error = new Error('Timestamp too old or in future');
    error.status = 401;
    error.details = {
      requestTime,
      currentTime,
      differenceMinutes: timeDiff
    };
    return next(error);
  }

  // Normalize shop URL
  try {
    const url = new URL(shopUrl);
    if (url.hostname === 'localhost') {
      url.hostname = 'host.docker.internal';
    }
    req.normalizedShopUrl = url.toString();
  } catch (error) {
    error.message = `Invalid shop-url: ${error.message}`;
    error.status = 400;
    return next(error);
  }

  req.registrationParams = {
    shopId,
    shopUrl: req.normalizedShopUrl,
    timestamp
  };

  next();
};

// Registration endpoint
app.all('/shopware/simple-auth', 
  verifyShopwareRequest,
  validateRegistrationParams,
  (req, res) => {
    try {
      const { shopId, shopUrl, timestamp } = req.registrationParams;

      // Store shop information
      shopwareStores.set(shopId, {
        shopId,
        shopUrl,
        timestamp,
        registeredAt: new Date().toISOString()
      });

      // Generate proof
      const proofData = `${shopId}${shopUrl}${APP_SECRET}${timestamp}`;
      const proof = crypto.createHmac('sha256', APP_SECRET)
                         .update(proofData)
                         .digest('hex');

      const response = {
        proof,
        secret: APP_SECRET,
        confirmation_url: `http://${process.env.HOST || 'host.docker.internal'}:${port}/confirm`
      };

      // Sign the response
      const responseSignature = crypto.createHmac('sha256', APP_SECRET)
                                    .update(JSON.stringify(response))
                                    .digest('hex');

      res.set({
        'shopware-app-signature': responseSignature,
        'Content-Type': 'application/json'
      });

      res.status(200).json(response);

    } catch (error) {
      error.message = `Registration failed: ${error.message}`;
      error.status = error.status || 500;
      throw error;
    }
  }
);

// Confirmation endpoint
app.post('/confirm', 
  verifyShopwareRequest,
  (req, res, next) => {
    try {
      const { shopId, apiKey, secretKey } = req.body;

      if (!shopwareStores.has(shopId)) {
        const error = new Error('Shop not found');
        error.status = 404;
        throw error;
      }

      const shopData = shopwareStores.get(shopId);
      shopData.apiKey = apiKey;
      shopData.secretKey = secretKey;
      shopData.confirmedAt = new Date().toISOString();

      res.status(200).json({ 
        status: 'confirmed',
        shopId
      });

    } catch (error) {
      next(error);
    }
  }
);

// Debug endpoint
app.get('/debug/signature', (req, res) => {
  const sampleData = {
    'shop-id': 'test123',
    'shop-url': 'http://localhost',
    timestamp: Math.floor(Date.now() / 1000)
  };

  const queryString = normalizeQueryParams(sampleData);
  const signature = crypto.createHmac('sha256', APP_SECRET)
                         .update(queryString)
                         .digest('hex');

  res.json({
    instructions: 'Use this to verify your signature implementation',
    secret: APP_SECRET,
    sampleData,
    queryString,
    signature
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  const status = error.status || 500;
  const response = {
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(error.missingParams && { missingParams: error.missingParams })
  };

  if (status >= 500) {
    console.error('Server error:', error);
  }

  res.status(status).json(response);
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`
  Shopware App Mock Server
  ========================
  Running on: http://0.0.0.0:${port}
  App Secret: ${APP_SECRET.replace(/./g, '*')}
  
  Endpoints:
  - GET/POST /shopware/simple-auth  Registration endpoint
  - POST /confirm                   Confirmation endpoint
  - GET /debug/signature            Signature debug tool

  Environment:
  - NODE_ENV: ${process.env.NODE_ENV || 'development'}
  - PORT: ${port}
  `);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});