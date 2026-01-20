require('dotenv').config();
const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const freteRoutes = require('./routes/frete');
const checkoutRoutes = require('./routes/checkout');
const webhookRoutes = require('./routes/webhook');

app.use('/api/frete', freteRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/webhook', webhookRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Movetrak Checkout API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Movetrak Checkout API running on port ${PORT}`);
});

module.exports = app;
