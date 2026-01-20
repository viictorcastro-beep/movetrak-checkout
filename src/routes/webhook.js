const express = require('express');
const router = express.Router();

/**
 * POST /webhook/asaas
 * Webhook endpoint for Asaas payment notifications
 * Validates token and processes payment updates
 */
router.post('/asaas', (req, res) => {
  try {
    // Get token from header or query parameter
    const token = req.headers['asaas-access-token'] || req.query.token;
    const webhookToken = process.env.WEBHOOK_TOKEN;

    // Validate token
    if (!token || token !== webhookToken) {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    // Get webhook payload
    const payload = req.body;

    // Log the webhook event
    console.log('Webhook Asaas received:', {
      event: payload.event,
      payment: payload.payment
    });

    // Process webhook based on event type
    switch (payload.event) {
      case 'PAYMENT_RECEIVED':
        console.log('Payment received:', payload.payment.id);
        // Here you would update your order status, send confirmation email, etc.
        break;
      
      case 'PAYMENT_CONFIRMED':
        console.log('Payment confirmed:', payload.payment.id);
        // Update order status to confirmed
        break;
      
      case 'PAYMENT_OVERDUE':
        console.log('Payment overdue:', payload.payment.id);
        // Send reminder to customer
        break;
      
      default:
        console.log('Unhandled webhook event:', payload.event);
    }

    // Always respond with 200 to acknowledge receipt
    res.json({
      success: true,
      message: 'Webhook processado com sucesso'
    });
  } catch (error) {
    console.error('Error in /webhook/asaas:', error);
    res.status(500).json({
      error: 'Erro ao processar webhook',
      message: error.message
    });
  }
});

module.exports = router;
