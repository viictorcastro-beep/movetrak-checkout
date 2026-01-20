/**
 * Calculate packaging details based on quantity
 * Rules:
 * - 1-3 items: 1 envelope 12x18
 * - 4-6 items: 2 envelopes 12x18
 * - 7-15 items: 1 box 28x21x12
 * - >15 items: reject
 */
function calculatePackaging(qty) {
  const quantity = parseInt(qty);
  
  if (isNaN(quantity) || quantity < 1) {
    return {
      error: 'Quantidade inválida',
      valid: false
    };
  }
  
  if (quantity > 15) {
    return {
      error: 'Quantidade máxima excedida (máximo 15 unidades)',
      valid: false
    };
  }
  
  let packaging;
  
  if (quantity >= 1 && quantity <= 3) {
    packaging = {
      type: 'envelope',
      quantity: 1,
      dimensions: {
        height: 12,
        width: 18,
        length: 1
      }
    };
  } else if (quantity >= 4 && quantity <= 6) {
    packaging = {
      type: 'envelope',
      quantity: 2,
      dimensions: {
        height: 12,
        width: 18,
        length: 1
      }
    };
  } else if (quantity >= 7 && quantity <= 15) {
    packaging = {
      type: 'box',
      quantity: 1,
      dimensions: {
        height: 12,
        width: 21,
        length: 28
      }
    };
  }
  
  return {
    packaging,
    valid: true
  };
}

/**
 * Calculate total weight based on quantity
 * Unit weight: 0.0432kg
 * Packaging weight: 0.020kg per unit (as specified in requirements)
 * Total: qty * 0.0632kg
 * 
 * Note: The packaging weight is calculated per unit, not per package,
 * as per the requirements: "total=qty*(0.0632)"
 */
function calculateWeight(qty) {
  const quantity = parseInt(qty);
  
  if (isNaN(quantity) || quantity < 1) {
    return null;
  }
  
  const unitWeight = 0.0432;
  const packagingWeight = 0.020;
  const totalWeightPerUnit = unitWeight + packagingWeight; // 0.0632
  
  return quantity * totalWeightPerUnit;
}

module.exports = {
  calculatePackaging,
  calculateWeight
};
