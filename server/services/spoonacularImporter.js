const axios = require('axios');
const { getDatabase } = require('../database/init');
const ingredientNormalizer = require('./ingredientNormalizer');
const unitConverter = require('./unitConverter');
const recipeValidator = require('./recipeValidator');

/**
 * Spoonacular API Importer
 * 
 * Free tier: 150 requests/day
 * Sign up at: https://spoonacular.com/food-api
 * 
 * Features:
 * - 360,000+ recipes
 * - Detailed nutrition info
 * - Ingredient substitutions
 * - Recipe instructions
 */
class SpoonacularImporter {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.SPOONACULAR_API_KEY;
    this.baseUrl = 'https://api.spoonacular.com/recipes';
    this.db = getDatabase();
    this.requestCount = 0;
    this.maxRequestsPerDay = 150; // Free tier limit
  }

  /**
   * Search for recipes by query
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} - Array of recipe summaries
   */
  async searchRecipes(query, options = {}) {
    const {
      cuisine = null,
      diet = null,
      intolerances = null,
      number = 10,
      offset = 0
    } = options;

    try {
      const params = {
        apiKey: this.apiKey,
        query,
        number,
        offset,
        addRecipeInformation: true,
        fillIngredients: true
      };

      if (cuisine) params.cuisine = cuisine;
      if (diet) params.diet = diet;
      if (intolerances) params.intolerances = intolerances;

      const response = await axios.get(`${this.baseUrl}/complexSearch`, { params });
      this.requestCount++;

      return response.data.results || [];
    } catch (error) {
      console.error('Error searching recipes:', error.message);
      throw error;
    }
  }

  /**
   * Get detailed recipe information
   * @param {number} recipeId - Spoonacular recipe ID
   * @returns {Object} - Detailed recipe data
   */
  async getRecipeDetails(recipeId) {
    try {
      const response = await axios.get(`${this.baseUrl}/${recipeId}/information`, {
        params: {
          apiKey: this.apiKey,
          includeNutrition: false
        }
      });
      this.requestCount++;

      return response.data;
    } catch (error) {
      console.error(`Error getting recipe ${recipeId}:`, error.message);
      throw error;
    }
  }

  /**
   * Import a recipe from Spoonacular
   * @param {number} recipeId - Spoonacular recipe ID
   * @returns {number} - Imported recipe ID
   */
  async importRecipe(recipeId) {
    try {
      const recipe = await this.getRecipeDetails(recipeId);

      // Check if recipe already exists
      const existing = await new Promise((resolve, reject) => {
        this.db.get(
          'SELECT id FROM recipes WHERE source_url = ?',
          [recipe.sourceUrl || `https://spoonacular.com/recipes/${recipe.title}-${recipeId}`],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (existing) {
        console.log(`Recipe "${recipe.title}" already exists, skipping...`);
        return null;
      }

      // Parse ingredients
      const ingredients = this.parseIngredients(recipe.extendedIngredients || []);

      // Parse instructions
      const instructions = this.parseInstructions(recipe.analyzedInstructions || recipe.instructions);

      // Create recipe object for validation
      const recipeData = {
        title: recipe.title,
        description: recipe.summary ? this.stripHtml(recipe.summary).substring(0, 200) : '',
        instructions: instructions,
        prep_time: recipe.preparationMinutes || 0,
        cook_time: recipe.cookingMinutes || recipe.readyInMinutes || 0,
        servings: recipe.servings || 4,
        difficulty: this.estimateDifficulty(recipe),
        image_url: recipe.image,
        source_url: recipe.sourceUrl || `https://spoonacular.com/recipes/${recipe.title}-${recipeId}`,
        tags: this.parseTags(recipe),
        ingredients: ingredients
      };

      // Validate recipe
      const validation = recipeValidator.validateRecipe(recipeData);
      const qualityScore = validation.score * 100;

      // Insert recipe
      const insertedRecipeId = await new Promise((resolve, reject) => {
        this.db.run(`
          INSERT INTO recipes (
            title, description, instructions, prep_time, cook_time, servings,
            difficulty, image_url, source_url, tags, source_type, quality_score,
            last_validated, validation_errors
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          recipeData.title,
          recipeData.description,
          recipeData.instructions,
          recipeData.prep_time,
          recipeData.cook_time,
          recipeData.servings,
          recipeData.difficulty,
          recipeData.image_url,
          recipeData.source_url,
          recipeData.tags,
          'spoonacular',
          qualityScore,
          new Date().toISOString(),
          validation.errors.length > 0 ? JSON.stringify(validation.errors) : null
        ], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });

      // Insert ingredients
      await this.insertIngredients(insertedRecipeId, ingredients);

      console.log(`✅ Imported: ${recipe.title} (Quality: ${qualityScore.toFixed(1)})`);
      return insertedRecipeId;

    } catch (error) {
      console.error(`Error importing recipe ${recipeId}:`, error.message);
      throw error;
    }
  }

  /**
   * Parse ingredients from Spoonacular format
   * @param {Array} ingredients - Spoonacular ingredients
   * @returns {Array} - Standardized ingredients
   */
  parseIngredients(ingredients) {
    return ingredients.map(ing => ({
      name: ingredientNormalizer.getStandardName(ing.name || ing.original),
      quantity: ing.amount || 1,
      unit: unitConverter.normalizeUnit(ing.unit || 'pieces'),
      optional: false
    }));
  }

  /**
   * Parse instructions from Spoonacular format
   * @param {Array|string} instructions - Recipe instructions
   * @returns {string} - Formatted instructions
   */
  parseInstructions(instructions) {
    if (typeof instructions === 'string') {
      return this.stripHtml(instructions);
    }

    if (Array.isArray(instructions) && instructions.length > 0) {
      const steps = instructions[0].steps || [];
      return steps.map((step, index) => 
        `${index + 1}. ${step.step}`
      ).join('\n');
    }

    return '';
  }

  /**
   * Parse tags from recipe data
   * @param {Object} recipe - Recipe object
   * @returns {string} - Comma-separated tags
   */
  parseTags(recipe) {
    const tags = [];
    
    if (recipe.cuisines) tags.push(...recipe.cuisines);
    if (recipe.dishTypes) tags.push(...recipe.dishTypes);
    if (recipe.diets) tags.push(...recipe.diets);
    if (recipe.vegetarian) tags.push('vegetarian');
    if (recipe.vegan) tags.push('vegan');
    if (recipe.glutenFree) tags.push('gluten-free');
    if (recipe.dairyFree) tags.push('dairy-free');
    if (recipe.veryHealthy) tags.push('healthy');
    if (recipe.cheap) tags.push('budget-friendly');
    if (recipe.veryPopular) tags.push('popular');

    return tags.map(t => t.toLowerCase()).join(',');
  }

  /**
   * Estimate difficulty based on recipe data
   * @param {Object} recipe - Recipe object
   * @returns {string} - Difficulty level
   */
  estimateDifficulty(recipe) {
    const time = (recipe.preparationMinutes || 0) + (recipe.cookingMinutes || 0);
    const ingredientCount = (recipe.extendedIngredients || []).length;

    if (time <= 30 && ingredientCount <= 7) return 'easy';
    if (time <= 60 && ingredientCount <= 12) return 'medium';
    return 'hard';
  }

  /**
   * Strip HTML tags from text
   * @param {string} html - HTML string
   * @returns {string} - Plain text
   */
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }

  /**
   * Insert ingredients into database
   * @param {number} recipeId - Recipe ID
   * @param {Array} ingredients - Ingredients array
   */
  async insertIngredients(recipeId, ingredients) {
    const stmt = this.db.prepare(`
      INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, optional)
      VALUES (?, ?, ?, ?, ?)
    `);

    ingredients.forEach(ingredient => {
      stmt.run(
        recipeId,
        ingredient.name,
        ingredient.quantity,
        ingredient.unit,
        ingredient.optional || false
      );
    });

    stmt.finalize();
  }

  /**
   * Import random recipes
   * @param {number} count - Number of recipes to import
   * @param {Object} options - Search options
   * @returns {Object} - Import results
   */
  async importRandomRecipes(count = 10, options = {}) {
    console.log(`\n🥄 Importing ${count} recipes from Spoonacular...`);
    
    if (!this.apiKey) {
      throw new Error('Spoonacular API key not set. Get one at https://spoonacular.com/food-api');
    }

    const results = {
      attempted: 0,
      imported: 0,
      skipped: 0,
      errors: []
    };

    try {
      // Search for recipes
      const recipes = await this.searchRecipes('', {
        ...options,
        number: Math.min(count, 100),
        sort: 'random'
      });

      for (const recipe of recipes.slice(0, count)) {
        results.attempted++;
        
        try {
          const recipeId = await this.importRecipe(recipe.id);
          if (recipeId) {
            results.imported++;
          } else {
            results.skipped++;
          }

          // Rate limiting: wait 1 second between requests
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          results.errors.push(`Recipe ${recipe.id}: ${error.message}`);
        }

        // Check daily limit
        if (this.requestCount >= this.maxRequestsPerDay - 10) {
          console.log('\n⚠️  Approaching daily API limit, stopping...');
          break;
        }
      }

      console.log(`\n✅ Spoonacular import complete:`);
      console.log(`   Attempted: ${results.attempted}`);
      console.log(`   Imported: ${results.imported}`);
      console.log(`   Skipped: ${results.skipped}`);
      console.log(`   API Requests Used: ${this.requestCount}/${this.maxRequestsPerDay}`);

      return results;

    } catch (error) {
      console.error('Error importing from Spoonacular:', error.message);
      throw error;
    }
  }

  /**
   * Import recipes by cuisine
   * @param {string} cuisine - Cuisine type
   * @param {number} limit - Number of recipes
   * @returns {Object} - Import results
   */
  async importByCuisine(cuisine, limit = 10) {
    return this.importRandomRecipes(limit, { cuisine });
  }

  /**
   * Import recipes by diet
   * @param {string} diet - Diet type (vegetarian, vegan, etc.)
   * @param {number} limit - Number of recipes
   * @returns {Object} - Import results
   */
  async importByDiet(diet, limit = 10) {
    return this.importRandomRecipes(limit, { diet });
  }
}

module.exports = SpoonacularImporter;
