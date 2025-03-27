const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

// Initialize Express app
const app = express();
const port = 8000;

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock data store
const shopwareStores = {};

// Middleware to verify Shopware request signature
function verifyShopwareRequest(req, res, next) {
    const signature = req.get('shopware-app-signature');
    if (!signature) {
        console.error('Missing shopware-app-signature header');
        return res.status(401).json({ error: 'Missing signature header' });
    }

    const hmac = crypto.createHmac('sha256', 'S0M3S3CR3T');
    const data = req.method === 'GET' 
        ? JSON.stringify(req.query) 
        : JSON.stringify(req.body);
    
    hmac.update(data);
    const calculatedSignature = hmac.digest('hex');

    if (signature !== calculatedSignature) {
        console.error('Invalid signature received');
        console.error('Expected:', calculatedSignature);
        console.error('Received:', signature);
        return res.status(401).json({ error: 'Invalid signature' });
    }

    next();
}

// Serve a mock loader.js
app.get('/loader.js', (req, res) => {
    res.set('Content-Type', 'application/javascript');
    res.send(`
        console.log('Hellobar loader initialized');
        window.hellobar = function(action, config) {
            console.log('Hellobar action:', action, 'with config:', config);
            if (action === 'init') {
                setTimeout(() => {
                    const popup = document.createElement('div');
                    popup.style.position = 'fixed';
                    popup.style.top = '10px';
                    popup.style.left = '10px';
                    popup.style.right = '10px';
                    popup.style.backgroundColor = '#3498db';
                    popup.style.color = 'white';
                    popup.style.padding = '20px';
                    popup.style.zIndex = '9999';
                    popup.style.borderRadius = '5px';
                    popup.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
                    popup.style.textAlign = 'center';

                    popup.innerHTML = '<h3>Hello from Hellobar!</h3><p>This is a demonstration popup for the Shopware integration.</p><button id="close-hellobar" style="border: none; background: white; color: #3498db; padding: 5px 15px; border-radius: 3px; cursor: pointer;">Close</button>';
                    
                    document.body.appendChild(popup);
                    
                    document.getElementById('close-hellobar').addEventListener('click', function() {
                        popup.style.display = 'none';
                    });
                }, 2000);
            }
        };
    `);
});

// Combined GET/POST handler for registration
app.all('/shopware/simple-auth', verifyShopwareRequest, (req, res) => {
    try {
        // Get parameters from either query (GET) or body (POST)
        const shopId = req.method === 'GET' ? req.query['shop-id'] : req.body.shopId;
        let shopUrl = req.method === 'GET' ? req.query['shop-url'] : req.body.shopUrl;
        const timestamp = req.method === 'GET' ? req.query.timestamp : req.body.timestamp;
        
        console.log('Registration request received:', { 
            method: req.method,
            shopId, 
            shopUrl, 
            timestamp 
        });

        // Validate required parameters
        if (!shopId || !shopUrl || !timestamp) {
            console.error('Missing parameters:', { shopId, shopUrl, timestamp });
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['shop-id', 'shop-url', 'timestamp']
            });
        }

        // Fix URL encoding issues (replace × with & if present)
        if (shopUrl.includes('×')) {
            shopUrl = shopUrl.replace('×', '&');
        }

        // Standardize hostname
        shopUrl = shopUrl.replace('localhost', 'host.docker.internal')
                         .replace('192.168.29.204', 'host.docker.internal');

        // Store shop information
        shopwareStores[shopId] = {
            shopId,
            shopUrl,
            registeredAt: new Date().toISOString(),
            timestamp
        };

        // Generate proof according to Shopware requirements
        const appSecret = 'S0M3S3CR3T';
        const dataToSign = `${shopId}${shopUrl}${appSecret}${timestamp}`;
        console.log('Data being signed:', dataToSign);
        
        const proof = crypto
            .createHmac('sha256', appSecret)
            .update(dataToSign)
            .digest('hex');

        console.log('Generated proof:', proof);

        // Prepare response
        const response = {
            proof: proof,
            secret: appSecret,
            confirmation_url: `http://host.docker.internal:8000/confirm`
        };

        // Sign the response
        const responseHmac = crypto.createHmac('sha256', appSecret);
        responseHmac.update(JSON.stringify(response));
        const responseSignature = responseHmac.digest('hex');

        res.set('shopware-app-signature', responseSignature);
        res.json(response);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Confirmation endpoint
app.post('/confirm', (req, res) => {
    try {
        console.log('Confirmation request received:', req.body);
        
        const { shopId, shopUrl, timestamp, apiKey, secretKey } = req.body;
        const signature = req.headers['shopware-shop-signature'];
        
        if (shopwareStores[shopId]) {
            shopwareStores[shopId].apiKey = apiKey;
            shopwareStores[shopId].secretKey = secretKey;
            shopwareStores[shopId].confirmed = true;
            shopwareStores[shopId].confirmationTime = new Date().toISOString();
            
            console.log('Shop confirmed:', shopId);
            res.status(200).json({ status: 'confirmed', shopId });
        } else {
            console.error('Unknown shop ID:', shopId);
            res.status(404).json({ error: 'Shop not found', shopId });
        }
    } catch (error) {
        console.error('Confirmation error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Admin configuration endpoint
app.get('/admin', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Hellobar Admin</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                    h1 { color: #3498db; }
                    .form-group { margin-bottom: 15px; }
                    label { display: block; margin-bottom: 5px; }
                    input, select { width: 100%; padding: 8px; box-sizing: border-box; }
                    button { background: #3498db; color: white; border: none; padding: 10px 15px; cursor: pointer; }
                    .status { padding: 10px; background: #f8f9fa; border-radius: 5px; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <h1>Hellobar Configuration</h1>
                <div class="status">
                    <h3>Server Status</h3>
                    <p>Registered shops: ${Object.keys(shopwareStores).length}</p>
                </div>
                
                <div class="form-group">
                    <label>Account ID</label>
                    <input type="text" value="demo-account-123" readonly />
                </div>
                
                <div class="form-group">
                    <label>Popup Type</label>
                    <select>
                        <option>Bar</option>
                        <option>Modal</option>
                        <option>Takeover</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Message</label>
                    <input type="text" value="Welcome to our store!" />
                </div>
                
                <button>Save Configuration</button>
            </body>
        </html>
    `);
});

// List all registered shops
app.get('/shops', (req, res) => {
    res.json({
        status: 'success',
        count: Object.keys(shopwareStores).length,
        shops: shopwareStores
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`\nHellobar Mock Server running on http://0.0.0.0:${port}`);
    console.log('Available endpoints:');
    console.log(`- GET/POST /shopware/simple-auth - Registration endpoint (Shopware will call this)`);
    console.log(`- POST /confirm - Confirmation endpoint`);
    console.log(`- GET /loader.js - JavaScript loader for frontend`);
    console.log(`- GET /admin - Admin interface`);
    console.log(`- GET /shops - List registered shops`);
    console.log(`- GET /health - Health check endpoint\n`);
});