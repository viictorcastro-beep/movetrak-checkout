const express = require('express');
const router = express.Router();
const { calculatePackaging, calculateWeight } = require('../utils/packaging');
const superfreteService = require('../services/superfrete');
const asaasService = require('../services/asaas');

/**
 * POST /api/checkout
 * Process checkout
 * Body: { nome, email, telefone, cpfCnpj, cepDestino, qty }
 */
router.post('/', async (req, res) => {
  try {
    const { nome, email, telefone, cpfCnpj, cepDestino, qty } = req.body;

    // Validate required fields
    if (!nome || !email || !telefone || !cpfCnpj || !cepDestino || !qty) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nome, email, telefone, cpfCnpj, cepDestino, qty'
      });
    }

    // Calculate packaging based on quantity
    const packagingResult = calculatePackaging(qty);
    
    if (!packagingResult.valid) {
      return res.status(400).json({
        error: packagingResult.error
      });
    }

    // Calculate weight
    const weight = calculateWeight(qty);

    // For checkout, we'll assume a fixed origin CEP for shipping calculation
    // In a real scenario, this would come from your warehouse/store location
    const cepOrigem = '01310-100'; // Example: São Paulo

    // Get shipping quote
    let shippingCost = 0;
    try {
      const shippingQuote = await superfreteService.getShippingQuote(
        cepOrigem,
        cepDestino,
        packagingResult.packaging,
        weight
      );
      
      // Use the cheapest shipping option
      if (shippingQuote && shippingQuote.length > 0) {
        shippingCost = Math.min(...shippingQuote.map(q => q.price || 0));
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      // Continue with checkout even if shipping calculation fails
    }

    // Calculate total value (for now, just shipping cost)
    // In a real scenario, you'd add product cost here
    const totalValue = shippingCost;

    // Create payment in Asaas
    const payment = await asaasService.createPayment(
      { nome, email, telefone, cpfCnpj, cepDestino },
      totalValue
    );

    res.json({
      success: true,
      data: {
        order: {
          qty,
          packaging: packagingResult.packaging,
          weight,
          shippingCost
        },
        payment: {
          id: payment.id,
          status: payment.status,
          value: payment.value,
          dueDate: payment.dueDate,
          invoiceUrl: payment.invoiceUrl,
          bankSlipUrl: payment.bankSlipUrl
        }
      }
    });
  } catch (error) {
    console.error('Error in /api/checkout:', error);
    res.status(500).json({
      error: 'Erro ao processar checkout',
      message: error.message
    });
  }
});

module.exports = router;
