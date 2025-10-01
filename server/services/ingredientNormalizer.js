/**
 * Ingredient Normalization Service
 * Normalizes ingredient names to match variations like:
 * - "tomato", "tomatos", "tomatoes", "chopped tomatoes", "cherry tomatoes"
 * - "onion", "onions", "diced onion", "red onion"
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
      'bunch', 'of', 'can', 'jar'
    ];

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
}

module.exports = new IngredientNormalizer();

