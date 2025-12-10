/**
 * Tax Calculator Utility
 * Calculates sales tax based on shipping location
 * 
 * Note: This is a simplified tax calculator. For production use, consider integrating
 * with a tax service like TaxJar, Avalara, or Stripe Tax for accurate, up-to-date rates.
 */

// State sales tax rates (as of 2024 - update as needed)
// These are general state rates; local taxes may apply
const STATE_TAX_RATES = {
  'AL': 0.04, // Alabama
  'AK': 0.00, // Alaska (no state tax, but local taxes may apply)
  'AZ': 0.056, // Arizona
  'AR': 0.065, // Arkansas
  'CA': 0.0725, // California (base rate, varies by location)
  'CO': 0.029, // Colorado
  'CT': 0.0635, // Connecticut
  'DE': 0.00, // Delaware
  'FL': 0.06, // Florida
  'GA': 0.04, // Georgia
  'HI': 0.04, // Hawaii
  'ID': 0.06, // Idaho
  'IL': 0.0625, // Illinois
  'IN': 0.07, // Indiana
  'IA': 0.06, // Iowa
  'KS': 0.065, // Kansas
  'KY': 0.06, // Kentucky
  'LA': 0.0445, // Louisiana
  'ME': 0.055, // Maine
  'MD': 0.06, // Maryland
  'MA': 0.0625, // Massachusetts
  'MI': 0.06, // Michigan
  'MN': 0.06875, // Minnesota
  'MS': 0.07, // Mississippi
  'MO': 0.04225, // Missouri
  'MT': 0.00, // Montana
  'NE': 0.055, // Nebraska
  'NV': 0.0685, // Nevada
  'NH': 0.00, // New Hampshire
  'NJ': 0.06625, // New Jersey
  'NM': 0.05125, // New Mexico
  'NY': 0.04, // New York (base rate, varies by location)
  'NC': 0.0475, // North Carolina
  'ND': 0.05, // North Dakota
  'OH': 0.0575, // Ohio
  'OK': 0.045, // Oklahoma
  'OR': 0.00, // Oregon (no sales tax)
  'PA': 0.06, // Pennsylvania
  'RI': 0.07, // Rhode Island
  'SC': 0.06, // South Carolina
  'SD': 0.045, // South Dakota
  'TN': 0.07, // Tennessee
  'TX': 0.0625, // Texas
  'UT': 0.061, // Utah
  'VT': 0.06, // Vermont
  'VA': 0.053, // Virginia
  'WA': 0.065, // Washington
  'WV': 0.06, // West Virginia
  'WI': 0.05, // Wisconsin
  'WY': 0.04, // Wyoming
  'DC': 0.06, // District of Columbia
};

/**
 * Calculate sales tax based on state
 * @param {number} subtotal - The subtotal amount before tax
 * @param {string} state - Two-letter state code (e.g., 'OR', 'CA')
 * @param {boolean} isLocalPickup - Whether this is a local pickup order
 * @returns {number} The tax amount
 */
export const calculateTax = (subtotal, state, isLocalPickup = false) => {
  // If local pickup, use Oregon rate (no tax)
  if (isLocalPickup) {
    return 0;
  }

  // If no state provided, return 0
  if (!state || state.length !== 2) {
    return 0;
  }

  const stateCode = state.toUpperCase();
  const taxRate = STATE_TAX_RATES[stateCode] || 0;
  
  return subtotal * taxRate;
};

/**
 * Get tax rate for a state (for display purposes)
 * @param {string} state - Two-letter state code
 * @returns {number} Tax rate as decimal (e.g., 0.06 for 6%)
 */
export const getTaxRate = (state) => {
  if (!state || state.length !== 2) {
    return 0;
  }
  return STATE_TAX_RATES[state.toUpperCase()] || 0;
};
