const axios = require('axios');

/**
 * Service to interact with Superfrete API for shipping quotes
 */
class SuperfreteService {
  constructor() {
    this.token = process.env.SUPERFRETE_TOKEN;
    this.baseUrl = 'https://api.superfrete.com';
  }

  /**
   * Get shipping quote from Superfrete
   */
  async getShippingQuote(cepOrigem, cepDestino, packaging, weight) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v0/calculator`,
        {
          from: {
            postal_code: cepOrigem
          },
          to: {
            postal_code: cepDestino
          },
          package: {
            height: packaging.dimensions.height,
            width: packaging.dimensions.width,
            length: packaging.dimensions.length,
            weight: weight
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Superfrete API error:', error.message);
      throw new Error('Erro ao consultar frete');
    }
  }
}

module.exports = new SuperfreteService();
