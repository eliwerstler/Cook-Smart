/**
 * Enhanced Ingredient Normalization Service
 * Normalizes ingredient names to match variations like:
 * - "tomato", "tomatos", "tomatoes", "chopped tomatoes", "cherry tomatoes"
 * - "onion", "onions", "diced onion", "red onion"
 * - Integrates with unit converter for comprehensive ingredient management
 */

class IngredientNormalizer {
  constructor() {
    // Common preparation/cooking methods to strip
    this.preparationWords = [
      'chopped', 'diced', 'sliced', 'minced', 'crushed', 'grated',
      'shredded', 'julienned', 'cubed', 'peeled', 'cored',
      'fresh', 'dried', 'frozen', 'canned', 'cooked', 'raw',
      'whole', 'ground', 'powdered', 'toasted', 'roasted',
      'large', 'small', 'medium', 'baby', 'ripe',
      'boneless', 'skinless', 'seedless',
      'extra', 'virgin', 'pure', 'organic',
      'bunch', 'of', 'can', 'jar', 'bottle', 'bag', 'box'
    ];

    // Standard ingredient mappings for common variations
    this.standardMappings = {
      // Tomatoes
      'tomato': 'tomato',
      'tomatoes': 'tomato',
      'cherry tomato': 'tomato',
      'cherry tomatoes': 'tomato',
      'plum tomato': 'tomato',
      'plum tomatoes': 'tomato',
      'roma tomato': 'tomato',
      'roma tomatoes': 'tomato',
      'beefsteak tomato': 'tomato',
      'beefsteak tomatoes': 'tomato',
      'grape tomato': 'tomato',
      'grape tomatoes': 'tomato',
      
      // Onions
      'onion': 'onion',
      'onions': 'onion',
      'yellow onion': 'onion',
      'yellow onions': 'onion',
      'white onion': 'onion',
      'white onions': 'onion',
      'red onion': 'onion',
      'red onions': 'onion',
      'sweet onion': 'onion',
      'sweet onions': 'onion',
      'vidalia onion': 'onion',
      'vidalia onions': 'onion',
      
      // Garlic
      'garlic': 'garlic',
      'garlic clove': 'garlic',
      'garlic cloves': 'garlic',
      'garlic bulb': 'garlic',
      'garlic bulbs': 'garlic',
      'minced garlic': 'garlic',
      'garlic powder': 'garlic',
      
      // Potatoes
      'potato': 'potato',
      'potatoes': 'potato',
      'russet potato': 'potato',
      'russet potatoes': 'potato',
      'red potato': 'potato',
      'red potatoes': 'potato',
      'yukon gold potato': 'potato',
      'yukon gold potatoes': 'potato',
      'sweet potato': 'sweet potato',
      'sweet potatoes': 'sweet potato',
      
      // Carrots
      'carrot': 'carrot',
      'carrots': 'carrot',
      'baby carrot': 'carrot',
      'baby carrots': 'carrot',
      
      // Peppers
      'bell pepper': 'bell pepper',
      'bell peppers': 'bell pepper',
      'red bell pepper': 'bell pepper',
      'red bell peppers': 'bell pepper',
      'green bell pepper': 'bell pepper',
      'green bell peppers': 'bell pepper',
      'yellow bell pepper': 'bell pepper',
      'yellow bell peppers': 'bell pepper',
      'orange bell pepper': 'bell pepper',
      'orange bell peppers': 'bell pepper',
      
      // Herbs
      'basil': 'basil',
      'fresh basil': 'basil',
      'dried basil': 'basil',
      'oregano': 'oregano',
      'fresh oregano': 'oregano',
      'dried oregano': 'oregano',
      'thyme': 'thyme',
      'fresh thyme': 'thyme',
      'dried thyme': 'thyme',
      'rosemary': 'rosemary',
      'fresh rosemary': 'rosemary',
      'dried rosemary': 'rosemary',
      'parsley': 'parsley',
      'fresh parsley': 'parsley',
      'dried parsley': 'parsley',
      'cilantro': 'cilantro',
      'fresh cilantro': 'cilantro',
      'dried cilantro': 'cilantro',
      
      // Dairy
      'milk': 'milk',
      'whole milk': 'milk',
      '2% milk': 'milk',
      'skim milk': 'milk',
      'butter': 'butter',
      'unsalted butter': 'butter',
      'salted butter': 'butter',
      'cheese': 'cheese',
      'cheddar cheese': 'cheddar cheese',
      'mozzarella cheese': 'mozzarella cheese',
      'parmesan cheese': 'parmesan cheese',
      'cream cheese': 'cream cheese',
      'sour cream': 'sour cream',
      'yogurt': 'yogurt',
      'greek yogurt': 'greek yogurt',
      'plain yogurt': 'yogurt',
      
      // Meats
      'chicken': 'chicken',
      'chicken breast': 'chicken',
      'chicken breasts': 'chicken',
      'chicken thigh': 'chicken',
      'chicken thighs': 'chicken',
      'ground chicken': 'ground chicken',
      'beef': 'beef',
      'ground beef': 'ground beef',
      'beef steak': 'beef',
      'beef steaks': 'beef',
      'pork': 'pork',
      'ground pork': 'ground pork',
      'pork chop': 'pork',
      'pork chops': 'pork',
      
      // Grains
      'rice': 'rice',
      'white rice': 'rice',
      'brown rice': 'brown rice',
      'jasmine rice': 'rice',
      'basmati rice': 'rice',
      'pasta': 'pasta',
      'spaghetti': 'pasta',
      'penne pasta': 'pasta',
      'macaroni': 'pasta',
      'bread': 'bread',
      'white bread': 'bread',
      'whole wheat bread': 'bread',
      'flour': 'flour',
      'all-purpose flour': 'flour',
      'bread flour': 'flour',
      'whole wheat flour': 'flour',
      
      // Oils and fats
      'olive oil': 'olive oil',
      'extra virgin olive oil': 'olive oil',
      'vegetable oil': 'vegetable oil',
      'canola oil': 'vegetable oil',
      'coconut oil': 'coconut oil',
      'butter': 'butter',
      
      // Spices
      'salt': 'salt',
      'sea salt': 'salt',
      'kosher salt': 'salt',
      'black pepper': 'black pepper',
      'ground black pepper': 'black pepper',
      'cayenne pepper': 'cayenne pepper',
      'paprika': 'paprika',
      'cumin': 'cumin',
      'ground cumin': 'cumin',
      'cinnamon': 'cinnamon',
      'ground cinnamon': 'cinnamon',
      'nutmeg': 'nutmeg',
      'ground nutmeg': 'nutmeg',
      'ginger': 'ginger',
      'fresh ginger': 'ginger',
      'ground ginger': 'ginger',
      'ginger powder': 'ginger'
    };

    // Common ingredient variations that should be normalized to the same base
    this.varietyWords = [
      'plum', 'cherry', 'grape', 'roma', 'beefsteak', 'heirloom',
      'red', 'green', 'yellow', 'white', 'black', 'orange', 'purple', 'brown',
      'sweet', 'hot', 'spicy', 'mild',
      'long', 'short', 'thick', 'thin'
    ];

    // Singular to plural mappings for common ingredients
    this.pluralRules = [
      { singular: /(.*)ies$/i, plural: '$1y' },      // berries -> berry
      { singular: /(.*)oes$/i, plural: '$1o' },      // tomatoes -> tomato, potatoes -> potato
      { singular: /(.*)sses$/i, plural: '$1ss' },    // grasses -> grass
      { singular: /(.*)s$/i, plural: '$1' }          // apples -> apple
    ];
  }

  /**
   * Normalize an ingredient name to its base form
   * @param {string} ingredient - The ingredient name to normalize
   * @param {boolean} keepVarieties - Whether to keep variety words (default: false)
   * @returns {string} - Normalized ingredient name
   */
  normalize(ingredient, keepVarieties = false) {
    if (!ingredient || typeof ingredient !== 'string') {
      return '';
    }

    let normalized = ingredient.toLowerCase().trim();

    // Check for exact match in standard mappings first
    if (this.standardMappings[normalized]) {
      return this.standardMappings[normalized];
    }

    // Remove parentheses and their contents
    normalized = normalized.replace(/\([^)]*\)/g, '');

    // Split into words
    let words = normalized.split(/\s+/);

    // Remove preparation words
    words = words.filter(word => !this.preparationWords.includes(word));

    // Optionally remove variety words
    if (!keepVarieties) {
      words = words.filter(word => !this.varietyWords.includes(word));
    }

    // Rejoin words
    normalized = words.join(' ').trim();

    // Check again for standard mapping after cleaning
    if (this.standardMappings[normalized]) {
      return this.standardMappings[normalized];
    }

    // Convert plural to singular
    normalized = this.singularize(normalized);

    // Remove extra spaces
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
  }

  /**
   * Convert plural form to singular
   * @param {string} word - The word to singularize
   * @returns {string} - Singular form
   */
  singularize(word) {
    for (const rule of this.pluralRules) {
      if (rule.singular.test(word)) {
        return word.replace(rule.singular, rule.plural);
      }
    }
    return word;
  }

  /**
   * Check if two ingredients match (same base ingredient)
   * @param {string} ingredient1 - First ingredient name
   * @param {string} ingredient2 - Second ingredient name
   * @returns {boolean} - True if ingredients match
   */
  match(ingredient1, ingredient2) {
    const norm1 = this.normalize(ingredient1);
    const norm2 = this.normalize(ingredient2);

    // Exact match
    if (norm1 === norm2) {
      return true;
    }

    // Partial match (one contains the other)
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      return true;
    }

    return false;
  }

  /**
   * Get a display name for an ingredient (keeps first variety/modifier)
   * @param {string} ingredient - The ingredient name
   * @returns {string} - Display name
   */
  getDisplayName(ingredient) {
    if (!ingredient || typeof ingredient !== 'string') {
      return '';
    }

    let display = ingredient.toLowerCase().trim();

    // Remove parentheses
    display = display.replace(/\([^)]*\)/g, '');

    // Split into words
    let words = display.split(/\s+/);

    // Keep first variety or modifier word, remove excessive preparation words
    const excessiveWords = ['chopped', 'diced', 'sliced', 'minced', 'crushed'];
    words = words.filter((word, index) => {
      // Keep first word unless it's an excessive preparation word
      if (index === 0 && !excessiveWords.includes(word)) return true;
      // Keep main ingredient words
      if (!this.preparationWords.includes(word)) return true;
      return false;
    });

    // Capitalize first letter of each word
    display = words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return display;
  }

  /**
   * Group ingredients by their normalized form
   * @param {Array<string>} ingredients - Array of ingredient names
   * @returns {Object} - Object mapping normalized names to original names
   */
  groupIngredients(ingredients) {
    const groups = {};

    ingredients.forEach(ingredient => {
      const normalized = this.normalize(ingredient);
      if (!groups[normalized]) {
        groups[normalized] = [];
      }
      groups[normalized].push(ingredient);
    });

    return groups;
  }

  /**
   * Get the standard name for an ingredient
   * @param {string} ingredient - The ingredient name
   * @returns {string} - Standard ingredient name
   */
  getStandardName(ingredient) {
    const normalized = this.normalize(ingredient);
    
    // Check if we have a standard mapping for this ingredient
    for (const [standard, mapping] of Object.entries(this.standardMappings)) {
      if (mapping === normalized) {
        return normalized;
      }
    }
    
    return normalized;
  }

  /**
   * Check if an ingredient is a special ingredient that needs custom unit conversion
   * @param {string} ingredient - The ingredient name
   * @returns {boolean} - True if it's a special ingredient
   */
  isSpecialIngredient(ingredient) {
    const normalized = this.normalize(ingredient);
    const specialIngredients = ['butter', 'flour', 'sugar', 'rice', 'oil', 'milk'];
    return specialIngredients.includes(normalized);
  }

  /**
   * Suggest alternative names for an ingredient
   * @param {string} ingredient - The ingredient name
   * @returns {Array} - Array of alternative names
   */
  getAlternativeNames(ingredient) {
    const normalized = this.normalize(ingredient);
    const alternatives = [];
    
    // Find all ingredients that normalize to the same standard
    for (const [original, standard] of Object.entries(this.standardMappings)) {
      if (standard === normalized && original !== ingredient.toLowerCase()) {
        alternatives.push(original);
      }
    }
    
    return alternatives;
  }

  /**
   * Get all standard ingredient names
   * @returns {Array} - Array of all standard ingredient names
   */
  getAllStandardNames() {
    const standards = new Set();
    for (const standard of Object.values(this.standardMappings)) {
      standards.add(standard);
    }
    return Array.from(standards).sort();
  }

  /**
   * Validate and suggest corrections for ingredient names
   * @param {string} ingredient - The ingredient name to validate
   * @returns {Object} - Validation result with suggestions
   */
  validateIngredient(ingredient) {
    const normalized = this.normalize(ingredient);
    const standard = this.getStandardName(ingredient);
    const alternatives = this.getAlternativeNames(ingredient);
    
    return {
      original: ingredient,
      normalized: normalized,
      standard: standard,
      alternatives: alternatives,
      isValid: normalized === standard,
      needsCorrection: normalized !== standard && alternatives.length > 0
    };
  }
}

module.exports = new IngredientNormalizer();

