const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock data store
const shopwareStores = {};

// Serve a mock loader.js
app.get('/loader.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.send(`
    console.log('Hellobar loader initialized');
    window.hellobar = function(action, config) {
      console.log('Hellobar action:', action, 'with config:', config);
      if (action === 'init') {
        // Create a simple popup after 2 seconds
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

// Handle app registration
app.get('/shopware/auth', (req, res) => {
  const shopId = req.query['shop-id'];
  const shopUrl = req.query['shop-url'];
  const timestamp = req.query.timestamp;
  
  console.log('Registration request received:', { shopId, shopUrl, timestamp });
  
  // Store shop information
  shopwareStores[shopId] = {
    shopId,
    shopUrl,
    registeredAt: new Date().toISOString()
  };
  
  // Redirect back to the success URL with our mock confirmation
  const hmac = crypto
    .createHmac('sha256', 'S0M3S3CR3T')
    .update(shopId)
    .digest('hex');
    
  const confirmationUrl = `${shopUrl}/api/app-system/registration/confirm?confirmation_id=${shopId}&shop-signature=${hmac}`;
  
  console.log('Redirecting to confirmation URL:', confirmationUrl);
  
  res.redirect(confirmationUrl);
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
        </style>
      </head>
      <body>
        <h1>Hellobar Configuration</h1>
        <p>This is a mock admin interface for the Hellobar Shopware integration.</p>
        
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
  res.json(shopwareStores);
});

app.listen(port, () => {
  console.log(`Mock Hellobar server listening at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('- GET /loader.js - The Hellobar JavaScript loader');
  console.log('- GET /shopware/auth - Registration endpoint for Shopware');
  console.log('- GET /admin - Mock admin interface');
  console.log('- GET /shops - List all registered Shopware stores');
}); 