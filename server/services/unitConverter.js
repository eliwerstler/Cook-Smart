/**
 * Unit Conversion Service for Cooking Measurements
 * Handles conversion between different units used in recipes and pantry items
 */

class UnitConverter {
  constructor() {
    // Define unit categories and their base units
    this.unitCategories = {
      weight: {
        base: 'g', // grams as base unit
        units: {
          'g': 1,
          'gram': 1,
          'grams': 1,
          'kg': 1000,
          'kilogram': 1000,
          'kilograms': 1000,
          'oz': 28.3495,
          'ounce': 28.3495,
          'ounces': 28.3495,
          'lb': 453.592,
          'pound': 453.592,
          'pounds': 453.592,
          'lbs': 453.592
        }
      },
      volume: {
        base: 'ml', // milliliters as base unit
        units: {
          'ml': 1,
          'milliliter': 1,
          'milliliters': 1,
          'l': 1000,
          'liter': 1000,
          'liters': 1000,
          'cup': 236.588,
          'cups': 236.588,
          'tbsp': 14.7868,
          'tablespoon': 14.7868,
          'tablespoons': 14.7868,
          'tsp': 4.92892,
          'teaspoon': 4.92892,
          'teaspoons': 4.92892,
          'fl oz': 29.5735,
          'fluid ounce': 29.5735,
          'fluid ounces': 29.5735,
          'pt': 473.176,
          'pint': 473.176,
          'pints': 473.176,
          'qt': 946.353,
          'quart': 946.353,
          'quarts': 946.353,
          'gal': 3785.41,
          'gallon': 3785.41,
          'gallons': 3785.41
        }
      },
      pieces: {
        base: 'pieces',
        units: {
          'piece': 1,
          'pieces': 1,
          'pcs': 1,
          'pcs.': 1,
          'pc': 1,
          'pc.': 1,
          'item': 1,
          'items': 1,
          'each': 1,
          'whole': 1,
          'head': 1,
          'heads': 1,
          'clove': 1,
          'cloves': 1,
          'leaf': 1,
          'leaves': 1,
          'stalk': 1,
          'stalks': 1,
          'bunch': 1,
          'bunches': 1
        }
      },
      length: {
        base: 'cm',
        units: {
          'cm': 1,
          'centimeter': 1,
          'centimeters': 1,
          'm': 100,
          'meter': 100,
          'meters': 100,
          'mm': 0.1,
          'millimeter': 0.1,
          'millimeters': 0.1,
          'in': 2.54,
          'inch': 2.54,
          'inches': 2.54,
          'ft': 30.48,
          'foot': 30.48,
          'feet': 30.48
        }
      }
    };

    // Special conversion rules for common cooking ingredients
    this.specialConversions = {
      // Butter: 1 cup = 227g
      'butter': {
        'cup': { 'g': 227, 'tbsp': 16, 'tsp': 48 },
        'tbsp': { 'g': 14.2, 'tsp': 3 },
        'tsp': { 'g': 4.7 }
      },
      // Flour: 1 cup = 125g
      'flour': {
        'cup': { 'g': 125, 'tbsp': 16, 'tsp': 48 },
        'tbsp': { 'g': 7.8, 'tsp': 3 },
        'tsp': { 'g': 2.6 }
      },
      // Sugar: 1 cup = 200g
      'sugar': {
        'cup': { 'g': 200, 'tbsp': 16, 'tsp': 48 },
        'tbsp': { 'g': 12.5, 'tsp': 3 },
        'tsp': { 'g': 4.2 }
      },
      // Rice: 1 cup = 185g
      'rice': {
        'cup': { 'g': 185, 'tbsp': 16, 'tsp': 48 },
        'tbsp': { 'g': 11.6, 'tsp': 3 },
        'tsp': { 'g': 3.9 }
      },
      // Oil: 1 cup = 218g
      'oil': {
        'cup': { 'g': 218, 'ml': 236.588, 'tbsp': 16, 'tsp': 48 },
        'tbsp': { 'g': 13.6, 'ml': 14.7868, 'tsp': 3 },
        'tsp': { 'g': 4.5, 'ml': 4.92892 }
      },
      // Milk: 1 cup = 244g (density ~1.03 g/ml)
      'milk': {
        'cup': { 'g': 244, 'ml': 236.588, 'tbsp': 16, 'tsp': 48 },
        'tbsp': { 'g': 15.3, 'ml': 14.7868, 'tsp': 3 },
        'tsp': { 'g': 5.1, 'ml': 4.92892 }
      }
    };

    // Ingredients that should use special conversions
    this.specialIngredients = Object.keys(this.specialConversions);
  }

  /**
   * Normalize a unit name to its standard form
   * @param {string} unit - The unit to normalize
   * @returns {string} - Normalized unit name
   */
  normalizeUnit(unit) {
    if (!unit || typeof unit !== 'string') {
      return 'pieces';
    }

    const normalized = unit.toLowerCase().trim();
    
    // Handle common abbreviations and variations
    const unitMap = {
      'g': 'g',
      'gram': 'g',
      'grams': 'g',
      'kg': 'kg',
      'kilogram': 'kg',
      'kilograms': 'kg',
      'oz': 'oz',
      'ounce': 'oz',
      'ounces': 'oz',
      'lb': 'lb',
      'pound': 'lb',
      'pounds': 'lb',
      'lbs': 'lb',
      'ml': 'ml',
      'milliliter': 'ml',
      'milliliters': 'ml',
      'l': 'l',
      'liter': 'l',
      'liters': 'l',
      'cup': 'cup',
      'cups': 'cup',
      'tbsp': 'tbsp',
      'tablespoon': 'tbsp',
      'tablespoons': 'tbsp',
      'tsp': 'tsp',
      'teaspoon': 'tsp',
      'teaspoons': 'tsp',
      'fl oz': 'fl oz',
      'fluid ounce': 'fl oz',
      'fluid ounces': 'fl oz',
      'pt': 'pt',
      'pint': 'pt',
      'pints': 'pt',
      'qt': 'qt',
      'quart': 'qt',
      'quarts': 'qt',
      'gal': 'gal',
      'gallon': 'gal',
      'gallons': 'gal',
      'piece': 'pieces',
      'pieces': 'pieces',
      'pcs': 'pieces',
      'pcs.': 'pieces',
      'pc': 'pieces',
      'pc.': 'pieces',
      'item': 'pieces',
      'items': 'pieces',
      'each': 'pieces',
      'whole': 'pieces',
      'head': 'pieces',
      'heads': 'pieces',
      'clove': 'pieces',
      'cloves': 'pieces',
      'leaf': 'pieces',
      'leaves': 'pieces',
      'stalk': 'pieces',
      'stalks': 'pieces',
      'bunch': 'pieces',
      'bunches': 'pieces'
    };

    return unitMap[normalized] || normalized;
  }

  /**
   * Get the category of a unit
   * @param {string} unit - The unit to categorize
   * @returns {string|null} - The category name or null if not found
   */
  getUnitCategory(unit) {
    const normalized = this.normalizeUnit(unit);
    
    for (const [category, config] of Object.entries(this.unitCategories)) {
      if (config.units.hasOwnProperty(normalized)) {
        return category;
      }
    }
    
    return null;
  }

  /**
   * Check if two units are compatible (same category)
   * @param {string} unit1 - First unit
   * @param {string} unit2 - Second unit
   * @returns {boolean} - True if units are compatible
   */
  areUnitsCompatible(unit1, unit2) {
    const category1 = this.getUnitCategory(unit1);
    const category2 = this.getUnitCategory(unit2);
    
    return category1 !== null && category1 === category2;
  }

  /**
   * Convert a quantity from one unit to another
   * @param {number} quantity - The quantity to convert
   * @param {string} fromUnit - The source unit
   * @param {string} toUnit - The target unit
   * @param {string} ingredient - The ingredient name (for special conversions)
   * @returns {number|null} - Converted quantity or null if conversion not possible
   */
  convert(quantity, fromUnit, toUnit, ingredient = null) {
    if (quantity === null || quantity === undefined || isNaN(quantity)) {
      return null;
    }

    const normalizedFrom = this.normalizeUnit(fromUnit);
    const normalizedTo = this.normalizeUnit(toUnit);

    // If units are the same, no conversion needed
    if (normalizedFrom === normalizedTo) {
      return quantity;
    }

    // Try special ingredient conversions first
    if (ingredient && this.specialIngredients.includes(ingredient.toLowerCase())) {
      const converted = this.convertSpecial(quantity, normalizedFrom, normalizedTo, ingredient);
      if (converted !== null) {
        return converted;
      }
    }

    // Get categories for both units
    const fromCategory = this.getUnitCategory(normalizedFrom);
    const toCategory = this.getUnitCategory(normalizedTo);

    // If categories don't match, conversion not possible
    if (fromCategory !== toCategory) {
      return null;
    }

    // Get conversion factors
    const fromFactor = this.unitCategories[fromCategory].units[normalizedFrom];
    const toFactor = this.unitCategories[toCategory].units[normalizedTo];

    if (fromFactor === undefined || toFactor === undefined) {
      return null;
    }

    // Convert to base unit, then to target unit
    const baseQuantity = quantity * fromFactor;
    const convertedQuantity = baseQuantity / toFactor;

    return Math.round(convertedQuantity * 1000) / 1000; // Round to 3 decimal places
  }

  /**
   * Convert using special ingredient conversion rules
   * @param {number} quantity - The quantity to convert
   * @param {string} fromUnit - The source unit
   * @param {string} toUnit - The target unit
   * @param {string} ingredient - The ingredient name
   * @returns {number|null} - Converted quantity or null if conversion not possible
   */
  convertSpecial(quantity, fromUnit, toUnit, ingredient) {
    const ingredientLower = ingredient.toLowerCase();
    const conversions = this.specialConversions[ingredientLower];

    if (!conversions || !conversions[fromUnit] || !conversions[fromUnit][toUnit]) {
      return null;
    }

    const factor = conversions[fromUnit][toUnit];
    return Math.round(quantity * factor * 1000) / 1000;
  }

  /**
   * Check if a pantry item has sufficient quantity for a recipe requirement
   * @param {Object} pantryItem - The pantry item {quantity, unit}
   * @param {Object} recipeRequirement - The recipe requirement {quantity, unit}
   * @param {string} ingredient - The ingredient name
   * @returns {Object} - Result with sufficient flag and converted quantities
   */
  checkSufficientQuantity(pantryItem, recipeRequirement, ingredient = null) {
    const pantryQty = pantryItem.quantity;
    const requiredQty = recipeRequirement.quantity;
    const pantryUnit = this.normalizeUnit(pantryItem.unit);
    const requiredUnit = this.normalizeUnit(recipeRequirement.unit);

    // If units match, direct comparison
    if (pantryUnit === requiredUnit) {
      return {
        sufficient: pantryQty >= requiredQty,
        pantryQuantity: pantryQty,
        requiredQuantity: requiredQty,
        pantryUnit: pantryUnit,
        requiredUnit: requiredUnit,
        converted: false
      };
    }

    // Try to convert pantry quantity to required unit
    const convertedPantryQty = this.convert(pantryQty, pantryUnit, requiredUnit, ingredient);
    
    if (convertedPantryQty === null) {
      // Conversion not possible
      return {
        sufficient: false,
        pantryQuantity: pantryQty,
        requiredQuantity: requiredQty,
        pantryUnit: pantryUnit,
        requiredUnit: requiredUnit,
        converted: false,
        error: 'Units not compatible'
      };
    }

    return {
      sufficient: convertedPantryQty >= requiredQty,
      pantryQuantity: convertedPantryQty,
      requiredQuantity: requiredQty,
      pantryUnit: requiredUnit,
      requiredUnit: requiredUnit,
      originalPantryQuantity: pantryQty,
      originalPantryUnit: pantryUnit,
      converted: true
    };
  }

  /**
   * Get a list of all supported units
   * @returns {Object} - Object with categories and their units
   */
  getAllUnits() {
    const result = {};
    
    for (const [category, config] of Object.entries(this.unitCategories)) {
      result[category] = Object.keys(config.units);
    }
    
    return result;
  }

  /**
   * Get standard units for a given category
   * @param {string} category - The unit category
   * @returns {Array} - Array of standard units for the category
   */
  getStandardUnits(category) {
    const config = this.unitCategories[category];
    return config ? Object.keys(config.units) : [];
  }

  /**
   * Suggest alternative units for a given unit
   * @param {string} unit - The unit to find alternatives for
   * @returns {Array} - Array of alternative units in the same category
   */
  getAlternativeUnits(unit) {
    const category = this.getUnitCategory(unit);
    if (!category) {
      return [];
    }

    const allUnits = this.getStandardUnits(category);
    return allUnits.filter(u => u !== this.normalizeUnit(unit));
  }
}

module.exports = new UnitConverter();
