const axios = require('axios');
const { getDatabase } = require('../database/init');
const ingredientNormalizer = require('./ingredientNormalizer');
const unitConverter = require('./unitConverter');
const recipeValidator = require('./recipeValidator');

class MealDbImporter {
  constructor() {
    this.baseUrl = 'https://www.themealdb.com/api/json/v1/1';
    this.db = getDatabase();
  }

  async importCategories() {
    try {
      console.log('Importing meal categories from TheMealDB...');
      const response = await axios.get(`${this.baseUrl}/categories.php`);
      const categories = response.data.categories;

      if (!categories) {
        console.log('No categories found');
        return;
      }

      const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)
      `);

      let importedCount = 0;
      const categoryColors = [
        '#EF4444', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6',
        '#F97316', '#EC4899', '#06B6D4', '#84CC16', '#6366F1',
        '#F43F5E', '#14B8A6', '#F59E0B', '#6B7280'
      ];

      categories.forEach((category, index) => {
        stmt.run(
          category.strCategory,
          categoryColors[index % categoryColors.length]
        );
        importedCount++;
      });

      stmt.finalize();
      console.log(`Imported ${importedCount} categories from TheMealDB`);
      return importedCount;
    } catch (error) {
      console.error('Error importing categories:', error.message);
      throw error;
    }
  }

  async importRecipesByCategory(categoryName, limit = 10) {
    try {
      console.log(`Importing recipes for category: ${categoryName}`);
      const response = await axios.get(`${this.baseUrl}/filter.php?c=${categoryName}`);
      const meals = response.data.meals;

      if (!meals) {
        console.log(`No meals found for category: ${categoryName}`);
        return 0;
      }

      // Limit the number of recipes to import per category
      const limitedMeals = meals.slice(0, limit);
      let importedCount = 0;

      for (const meal of limitedMeals) {
        try {
          await this.importRecipeDetails(meal.idMeal);
          importedCount++;
        } catch (error) {
          console.error(`Error importing recipe ${meal.idMeal}:`, error.message);
        }
      }

      console.log(`Imported ${importedCount} recipes for category: ${categoryName}`);
      return importedCount;
    } catch (error) {
      console.error(`Error importing recipes for category ${categoryName}:`, error.message);
      throw error;
    }
  }

  async importRecipeDetails(mealId) {
    try {
      const response = await axios.get(`${this.baseUrl}/lookup.php?i=${mealId}`);
      const meal = response.data.meals?.[0];

      if (!meal) {
        throw new Error(`Meal with ID ${mealId} not found`);
      }

      // Check if recipe already exists
      const existingRecipe = await new Promise((resolve, reject) => {
        this.db.get(
          'SELECT id FROM recipes WHERE title = ? OR source_url = ?',
          [meal.strMeal, `https://www.themealdb.com/meal/${mealId}`],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (existingRecipe) {
        console.log(`Recipe "${meal.strMeal}" already exists, skipping...`);
        return;
      }

      // Parse ingredients
      const ingredients = this.parseIngredients(meal);

      // Estimate cooking times based on category and ingredients
      const cookingTimes = this.estimateCookingTimes(meal.strCategory, ingredients.length);

      // Create recipe object for validation
      const recipeData = {
        title: meal.strMeal,
        description: meal.strCategory,
        instructions: meal.strInstructions,
        prep_time: cookingTimes.prep,
        cook_time: cookingTimes.cook,
        servings: 4,
        difficulty: this.getDifficulty(meal.strInstructions, ingredients.length),
        image_url: meal.strMealThumb,
        source_url: `https://www.themealdb.com/meal/${mealId}`,
        tags: meal.strTags || meal.strCategory,
        ingredients: ingredients
      };

      // Validate recipe
      const validation = recipeValidator.validateRecipe(recipeData);
      const qualityScore = validation.score * 100; // Convert 0-1 to 0-100

      // Insert recipe with validation data
      const recipeId = await new Promise((resolve, reject) => {
        this.db.run(`
          INSERT INTO recipes (
            title, description, instructions, prep_time, cook_time, servings,
            difficulty, image_url, source_url, tags, source_type, quality_score,
            last_validated, validation_errors
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          meal.strMeal,
          meal.strCategory,
          meal.strInstructions,
          cookingTimes.prep,
          cookingTimes.cook,
          4, // Default servings
          this.getDifficulty(meal.strInstructions, ingredients.length),
          meal.strMealThumb,
          `https://www.themealdb.com/meal/${mealId}`,
          meal.strTags || meal.strCategory,
          'themealdb',
          qualityScore,
          new Date().toISOString(),
          validation.isValid ? null : JSON.stringify(validation.errors)
        ], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });

      // Insert ingredients
      await this.insertRecipeIngredients(recipeId, ingredients);

      console.log(`Imported recipe: ${meal.strMeal}`);
    } catch (error) {
      console.error(`Error importing recipe details for ${mealId}:`, error.message);
      throw error;
    }
  }

  parseIngredients(meal) {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (ingredient && ingredient.trim()) {
        const rawUnit = this.parseUnit(measure);
        ingredients.push({
          name: ingredientNormalizer.getStandardName(ingredient.trim()),
          quantity: this.parseQuantity(measure),
          unit: unitConverter.normalizeUnit(rawUnit)
        });
      }
    }

    return ingredients;
  }

  parseQuantity(measure) {
    if (!measure) return 1;

    const cleaned = measure.trim().toLowerCase();
    const numberMatch = cleaned.match(/^(\d+(?:\.\d+)?)/);

    if (numberMatch) {
      return parseFloat(numberMatch[1]);
    }

    // Handle fractions
    const fractionMatch = cleaned.match(/^(\d+)\/(\d+)/);
    if (fractionMatch) {
      return parseFloat(fractionMatch[1]) / parseFloat(fractionMatch[2]);
    }

    return 1;
  }

  parseUnit(measure) {
    if (!measure) return 'pieces';

    const cleaned = measure.trim().toLowerCase();

    // Remove numbers and fractions
    const unitPart = cleaned.replace(/^\d+(?:\.\d+)?/, '').replace(/^\d+\/\d+/, '').trim();

    if (!unitPart) return 'pieces';

    // Map common TheMealDB units to our system
    const unitMappings = {
      'cups': 'cup',
      'cup': 'cup',
      'tablespoons': 'tbsp',
      'tablespoon': 'tbsp',
      'tbsp': 'tbsp',
      'teaspoons': 'tsp',
      'teaspoon': 'tsp',
      'tsp': 'tsp',
      'ounces': 'oz',
      'ounce': 'oz',
      'oz': 'oz',
      'pounds': 'lb',
      'pound': 'lb',
      'lb': 'lb',
      'grams': 'g',
      'gram': 'g',
      'g': 'g',
      'kilograms': 'kg',
      'kilogram': 'kg',
      'kg': 'kg',
      'millilitres': 'ml',
      'milliliters': 'ml',
      'ml': 'ml',
      'litres': 'l',
      'liters': 'l',
      'l': 'l',
      'cloves': 'cloves',
      'clove': 'cloves',
      'slices': 'slices',
      'slice': 'slices'
    };

    return unitMappings[unitPart] || 'pieces';
  }

  estimateCookingTimes(category, ingredientCount) {
    const baseTimes = {
      'Dessert': { prep: 20, cook: 40 },
      'Beef': { prep: 15, cook: 60 },
      'Chicken': { prep: 15, cook: 45 },
      'Seafood': { prep: 10, cook: 25 },
      'Vegetarian': { prep: 15, cook: 30 },
      'Vegan': { prep: 15, cook: 30 },
      'Pasta': { prep: 10, cook: 20 },
      'Breakfast': { prep: 10, cook: 15 }
    };

    const defaultTimes = { prep: 15, cook: 30 };
    const times = baseTimes[category] || defaultTimes;

    // Adjust based on ingredient count
    const complexityMultiplier = Math.min(1 + (ingredientCount - 5) * 0.1, 2);

    return {
      prep: Math.round(times.prep * complexityMultiplier),
      cook: Math.round(times.cook * complexityMultiplier)
    };
  }

  getDifficulty(instructions, ingredientCount) {
    if (!instructions) return 'easy';

    const instructionLength = instructions.length;
    const stepCount = instructions.split('.').length;

    if (ingredientCount <= 5 && instructionLength < 500 && stepCount <= 5) {
      return 'easy';
    } else if (ingredientCount <= 10 && instructionLength < 1000 && stepCount <= 10) {
      return 'medium';
    } else {
      return 'hard';
    }
  }

  async insertRecipeIngredients(recipeId, ingredients) {
    const stmt = this.db.prepare(`
      INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit)
      VALUES (?, ?, ?, ?)
    `);

    ingredients.forEach(ingredient => {
      stmt.run(recipeId, ingredient.name, ingredient.quantity, ingredient.unit);
    });

    stmt.finalize();
  }

  async importSampleData() {
    try {
      console.log('Starting TheMealDB data import...');

      // Import categories first
      await this.importCategories();

      // Import a few recipes from each major category
      const categoriesToImport = [
        'Chicken', 'Beef', 'Seafood', 'Vegetarian',
        'Pasta', 'Dessert', 'Breakfast'
      ];

      let totalRecipes = 0;
      for (const category of categoriesToImport) {
        const count = await this.importRecipesByCategory(category, 5); // 5 recipes per category
        totalRecipes += count;
      }

      console.log(`TheMealDB import completed! Total recipes imported: ${totalRecipes}`);
      return { categories: categoriesToImport.length, recipes: totalRecipes };
    } catch (error) {
      console.error('Error importing sample data:', error);
      throw error;
    }
  }

  async importRandomRecipes(count = 10) {
    try {
      console.log(`Importing ${count} random recipes...`);
      let importedCount = 0;

      for (let i = 0; i < count; i++) {
        try {
          const response = await axios.get(`${this.baseUrl}/random.php`);
          const meal = response.data.meals?.[0];

          if (meal) {
            await this.importRecipeDetails(meal.idMeal);
            importedCount++;
          }
        } catch (error) {
          console.error(`Error importing random recipe ${i + 1}:`, error.message);
        }
      }

      console.log(`Imported ${importedCount} random recipes`);
      return importedCount;
    } catch (error) {
      console.error('Error importing random recipes:', error);
      throw error;
    }
  }
}

module.exports = MealDbImporter;