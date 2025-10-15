const express = require('express');
const app = express();

// Simple test to check if our routes are working
app.use(express.json());

// Test route
app.get('/api/test-connection', (req, res) => {
  res.json({ success: true, message: 'API connection working' });
});

// Import and test subscription routes
const subscriptionRoutes = require('./routes/subscriptions');
app.use('/api/subscriptions', subscriptionRoutes);

// Test if routes are registered
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
      routes.push({
        method: Object.keys(r.route.methods)[0].toUpperCase(),
        path: r.route.path
      });
    } else if (r.name === 'router') {
      r.handle.stack.forEach(function(rr){
        if (rr.route) {
          routes.push({
            method: Object.keys(rr.route.methods)[0].toUpperCase(),
            path: r.regexp.source.replace('\\/?(?=\\/|$)', '') + rr.route.path
          });
        }
      });
    }
  });
  res.json({ routes });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/api/test-connection`);
  console.log(`Routes: http://localhost:${PORT}/api/debug/routes`);
});