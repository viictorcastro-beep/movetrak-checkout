const express = require('express');
const router = express.Router();
const { calculatePackaging, calculateWeight } = require('../utils/packaging');
const superfreteService = require('../services/superfrete');

/**
 * POST /api/frete/cotar
 * Calculate shipping quote
 * Body: { cepOrigem, cepDestino, qty }
 */
router.post('/cotar', async (req, res) => {
  try {
    const { cepOrigem, cepDestino, qty } = req.body;

    // Validate required fields
    if (!cepOrigem || !cepDestino || !qty) {
      return res.status(400).json({
        error: 'Campos obrigatórios: cepOrigem, cepDestino, qty'
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

    // Get shipping quote from Superfrete
    const shippingQuote = await superfreteService.getShippingQuote(
      cepOrigem,
      cepDestino,
      packagingResult.packaging,
      weight
    );

    res.json({
      success: true,
      data: {
        packaging: packagingResult.packaging,
        weight: weight,
        quote: shippingQuote
      }
    });
  } catch (error) {
    console.error('Error in /api/frete/cotar:', error);
    res.status(500).json({
      error: 'Erro ao calcular frete',
      message: error.message
    });
  }
});

module.exports = router;
