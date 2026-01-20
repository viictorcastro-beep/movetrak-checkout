const axios = require('axios');

/**
 * Service to interact with Asaas Payment Gateway API
 */
class AsaasService {
  constructor() {
    this.apiKey = process.env.ASAAS_API_KEY;
    this.baseUrl = 'https://api.asaas.com/v3';
  }

  /**
   * Create a new payment/charge in Asaas
   */
  async createPayment(customerData, value) {
    try {
      // First, create or get customer
      const customer = await this.createCustomer(customerData);
      
      // Then create the payment
      const response = await axios.post(
        `${this.baseUrl}/payments`,
        {
          customer: customer.id,
          billingType: 'BOLETO',
          value: value,
          dueDate: this.getNextDueDate()
        },
        {
          headers: {
            'access_token': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Asaas API error:', error.message);
      throw new Error('Erro ao criar cobrança');
    }
  }

  /**
   * Create or get customer in Asaas
   */
  async createCustomer(customerData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/customers`,
        {
          name: customerData.nome,
          email: customerData.email,
          phone: customerData.telefone,
          cpfCnpj: customerData.cpfCnpj,
          postalCode: customerData.cepDestino
        },
        {
          headers: {
            'access_token': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      // If customer already exists, return existing
      if (error.response && error.response.status === 400) {
        // Try to find existing customer by CPF/CNPJ
        const customers = await this.findCustomerByCpfCnpj(customerData.cpfCnpj);
        if (customers && customers.length > 0) {
          return customers[0];
        }
      }
      throw error;
    }
  }

  /**
   * Find customer by CPF/CNPJ
   */
  async findCustomerByCpfCnpj(cpfCnpj) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/customers`,
        {
          params: { cpfCnpj },
          headers: {
            'access_token': this.apiKey
          }
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error finding customer:', error.message);
      return null;
    }
  }

  /**
   * Get next due date (7 days from now)
   */
  getNextDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  }
}

module.exports = new AsaasService();
