const { createProxyMiddleware } = require('http-proxy-middleware');
console.log('Setting up proxy middleware for API requests...');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001', // your backend port
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};
console.log('Proxy middleware setup complete.');