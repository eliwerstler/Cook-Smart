/**
 * Recipe Validation Service
 * Validates recipe quality and completeness
 */

const ingredientNormalizer = require('./ingredientNormalizer');
const unitConverter = require('./unitConverter');

class RecipeValidator {
  constructor() {
    this.ingredientNormalizer = ingredientNormalizer;
    this.unitConverter = unitConverter;
  }

  /**
   * Validate recipe quality and completeness
   * @param {Object} recipe - Recipe object to validate
   * @returns {Object} - Validation result with score and details
   */
  validateRecipe(recipe) {
    const errors = [];
    const warnings = [];
    let score = 1.0;

    // Required field validation
    this.validateRequiredFields(recipe, errors);
    
    // Ingredient validation
    this.validateIngredients(recipe, errors, warnings);
    
    // Content quality validation
    this.validateContentQuality(recipe, warnings);
    
    // Time validation
    this.validateTimes(recipe, warnings);
    
    // Calculate quality score
    score = this.calculateQualityScore(recipe, errors, warnings);

    return {
      valid: errors.length === 0,
      score: Math.round(score * 100) / 100,
      errors,
      warnings,
      details: this.getValidationDetails(recipe, errors, warnings)
    };
  }

  /**
   * Validate required fields
   * @param {Object} recipe - Recipe object
   * @param {Array} errors - Error array to populate
   */
  validateRequiredFields(recipe, errors) {
    if (!recipe.title || typeof recipe.title !== 'string' || recipe.title.trim().length < 3) {
      errors.push('Title is required and must be at least 3 characters long');
    }

    if (!recipe.instructions || typeof recipe.instructions !== 'string' || recipe.instructions.trim().length < 20) {
      errors.push('Instructions are required and must be at least 20 characters long');
    }

    if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
      errors.push('At least one ingredient is required');
    }
  }

  /**
   * Validate ingredients
   * @param {Object} recipe - Recipe object
   * @param {Array} errors - Error array to populate
   * @param {Array} warnings - Warning array to populate
   */
  validateIngredients(recipe, errors, warnings) {
    if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
      return;
    }

    const ingredientNames = new Set();
    let hasDuplicateIngredients = false;

    recipe.ingredients.forEach((ingredient, index) => {
      // Validate ingredient name
      if (!ingredient.name || typeof ingredient.name !== 'string' || ingredient.name.trim().length === 0) {
        errors.push(`Ingredient ${index + 1}: Name is required`);
        return;
      }

      const ingredientName = ingredient.name.trim().toLowerCase();
      if (ingredientNames.has(ingredientName)) {
        hasDuplicateIngredients = true;
        warnings.push(`Duplicate ingredient: "${ingredient.name}"`);
      } else {
        ingredientNames.add(ingredientName);
      }

      // Validate quantity
      if (ingredient.quantity === undefined || ingredient.quantity === null) {
        errors.push(`Ingredient "${ingredient.name}": Quantity is required`);
      } else if (typeof ingredient.quantity !== 'number' || ingredient.quantity <= 0) {
        errors.push(`Ingredient "${ingredient.name}": Quantity must be a positive number`);
      }

      // Validate unit
      if (!ingredient.unit || typeof ingredient.unit !== 'string' || ingredient.unit.trim().length === 0) {
        warnings.push(`Ingredient "${ingredient.name}": Missing unit (defaulting to "pieces")`);
      } else {
        // Validate unit exists in our system
        const normalizedUnit = this.unitConverter.normalizeUnit(ingredient.unit);
        if (normalizedUnit === 'pieces' && ingredient.unit.toLowerCase() !== 'pieces') {
          warnings.push(`Ingredient "${ingredient.name}": Unit "${ingredient.unit}" may not be recognized`);
        }
      }
    });

    // Check for reasonable number of ingredients
    if (recipe.ingredients.length < 2) {
      warnings.push('Recipe has very few ingredients - consider if this is complete');
    } else if (recipe.ingredients.length > 20) {
      warnings.push('Recipe has many ingredients - consider if all are necessary');
    }

    // Check for ingredient variety
    const uniqueIngredients = ingredientNames.size;
    if (uniqueIngredients < recipe.ingredients.length * 0.8) {
      warnings.push('Recipe has many similar ingredients - consider consolidating');
    }
  }

  /**
   * Validate content quality
   * @param {Object} recipe - Recipe object
   * @param {Array} warnings - Warning array to populate
   */
  validateContentQuality(recipe, warnings) {
    // Check description quality
    if (!recipe.description || recipe.description.trim().length < 10) {
      warnings.push('Description is missing or too short');
    } else if (recipe.description.length > 500) {
      warnings.push('Description is very long - consider shortening');
    }

    // Check instruction quality
    if (recipe.instructions) {
      const instructionLength = recipe.instructions.trim().length;
      const stepCount = (recipe.instructions.match(/\./g) || []).length + 1;

      if (instructionLength < 50) {
        warnings.push('Instructions seem too brief - consider adding more detail');
      } else if (instructionLength > 2000) {
        warnings.push('Instructions are very long - consider breaking into smaller steps');
      }

      if (stepCount < 3) {
        warnings.push('Instructions seem to have very few steps - consider if complete');
      } else if (stepCount > 15) {
        warnings.push('Instructions have many steps - consider if too complex');
      }
    }

    // Check tags
    if (!recipe.tags || recipe.tags.trim().length === 0) {
      warnings.push('No tags provided - consider adding cuisine, meal type, or dietary tags');
    }

    // Check for image
    if (!recipe.image_url) {
      warnings.push('No image provided - consider adding a photo of the dish');
    }
  }

  /**
   * Validate cooking times
   * @param {Object} recipe - Recipe object
   * @param {Array} warnings - Warning array to populate
   */
  validateTimes(recipe, warnings) {
    // Validate prep time
    if (recipe.prep_time !== undefined) {
      if (typeof recipe.prep_time !== 'number' || recipe.prep_time < 0) {
        warnings.push('Invalid prep time - must be a non-negative number');
      } else if (recipe.prep_time > 480) { // 8 hours
        warnings.push('Prep time seems unusually long (over 8 hours)');
      }
    }

    // Validate cook time
    if (recipe.cook_time !== undefined) {
      if (typeof recipe.cook_time !== 'number' || recipe.cook_time < 0) {
        warnings.push('Invalid cook time - must be a non-negative number');
      } else if (recipe.cook_time > 1440) { // 24 hours
        warnings.push('Cook time seems unusually long (over 24 hours)');
      }
    }

    // Validate total time
    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    if (totalTime === 0) {
      warnings.push('No cooking times provided');
    } else if (totalTime > 1920) { // 32 hours
      warnings.push('Total cooking time seems unrealistic');
    }
  }

  /**
   * Validate servings
   * @param {Object} recipe - Recipe object
   * @param {Array} warnings - Warning array to populate
   */
  validateServings(recipe, warnings) {
    if (recipe.servings !== undefined) {
      if (typeof recipe.servings !== 'number' || recipe.servings < 1) {
        warnings.push('Servings must be a positive number');
      } else if (recipe.servings > 50) {
        warnings.push('Servings count seems unusually high');
      }
    }
  }

  /**
   * Validate difficulty
   * @param {Object} recipe - Recipe object
   * @param {Array} warnings - Warning array to populate
   */
  validateDifficulty(recipe, warnings) {
    if (recipe.difficulty && !['easy', 'medium', 'hard'].includes(recipe.difficulty.toLowerCase())) {
      warnings.push('Difficulty should be "easy", "medium", or "hard"');
    }
  }

  /**
   * Calculate quality score (0-1)
   * @param {Object} recipe - Recipe object
   * @param {Array} errors - Validation errors
   * @param {Array} warnings - Validation warnings
   * @returns {number} - Quality score
   */
  calculateQualityScore(recipe, errors, warnings) {
    let score = 1.0;

    // Deduct for errors (more severe)
    score -= errors.length * 0.2;

    // Deduct for warnings (less severe)
    score -= warnings.length * 0.05;

    // Bonus points for complete information
    if (recipe.description && recipe.description.length >= 50) score += 0.1;
    if (recipe.image_url) score += 0.1;
    if (recipe.tags && recipe.tags.length > 0) score += 0.05;
    if (recipe.prep_time && recipe.cook_time) score += 0.05;
    if (recipe.difficulty && ['easy', 'medium', 'hard'].includes(recipe.difficulty.toLowerCase())) score += 0.05;

    // Bonus for good ingredient variety
    if (recipe.ingredients && recipe.ingredients.length >= 5 && recipe.ingredients.length <= 15) score += 0.1;

    // Bonus for good instruction quality
    if (recipe.instructions && recipe.instructions.length >= 100 && recipe.instructions.length <= 1000) score += 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Get detailed validation information
   * @param {Object} recipe - Recipe object
   * @param {Array} errors - Validation errors
   * @param {Array} warnings - Validation warnings
   * @returns {Object} - Detailed validation information
   */
  getValidationDetails(recipe, errors, warnings) {
    return {
      hasTitle: !!recipe.title,
      hasDescription: !!recipe.description,
      hasImage: !!recipe.image_url,
      hasTags: !!recipe.tags,
      hasTimes: !!(recipe.prep_time || recipe.cook_time),
      hasDifficulty: !!recipe.difficulty,
      ingredientCount: recipe.ingredients ? recipe.ingredients.length : 0,
      instructionLength: recipe.instructions ? recipe.instructions.length : 0,
      errorCount: errors.length,
      warningCount: warnings.length,
      completeness: this.calculateCompleteness(recipe)
    };
  }

  /**
   * Calculate recipe completeness percentage
   * @param {Object} recipe - Recipe object
   * @returns {number} - Completeness percentage (0-100)
   */
  calculateCompleteness(recipe) {
    const fields = [
      'title', 'description', 'instructions', 'ingredients',
      'prep_time', 'cook_time', 'servings', 'difficulty', 'tags', 'image_url'
    ];

    let completedFields = 0;
    fields.forEach(field => {
      if (field === 'ingredients') {
        if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
          completedFields++;
        }
      } else if (recipe[field] && recipe[field].toString().trim().length > 0) {
        completedFields++;
      }
    });

    return Math.round((completedFields / fields.length) * 100);
  }

  /**
   * Validate recipe for import (stricter validation)
   * @param {Object} recipe - Recipe object
   * @param {number} minQualityScore - Minimum quality score required
   * @returns {Object} - Import validation result
   */
  validateForImport(recipe, minQualityScore = 0.7) {
    const validation = this.validateRecipe(recipe);
    
    return {
      ...validation,
      canImport: validation.valid && validation.score >= minQualityScore,
      importable: validation.valid && validation.score >= minQualityScore,
      reasons: validation.valid ? 
        (validation.score >= minQualityScore ? [] : [`Quality score ${validation.score} below minimum ${minQualityScore}`]) :
        validation.errors
    };
  }

  /**
   * Get validation suggestions for improvement
   * @param {Object} recipe - Recipe object
   * @returns {Array} - Array of improvement suggestions
   */
  getImprovementSuggestions(recipe) {
    const suggestions = [];
    const validation = this.validateRecipe(recipe);

    if (!recipe.description) {
      suggestions.push('Add a description to help users understand the dish');
    }

    if (!recipe.image_url) {
      suggestions.push('Add an image to make the recipe more appealing');
    }

    if (!recipe.tags) {
      suggestions.push('Add tags for cuisine type, meal type, or dietary restrictions');
    }

    if (!recipe.prep_time && !recipe.cook_time) {
      suggestions.push('Add cooking times to help users plan their meal');
    }

    if (recipe.ingredients && recipe.ingredients.length < 3) {
      suggestions.push('Consider if all necessary ingredients are included');
    }

    if (recipe.instructions && recipe.instructions.length < 100) {
      suggestions.push('Add more detailed instructions for better results');
    }

    return suggestions;
  }
}

module.exports = new RecipeValidator();
