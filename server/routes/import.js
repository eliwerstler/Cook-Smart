const express = require('express');
const router = express.Router();
const MealDbImporter = require('../services/mealDbImporter');

// Import sample data from TheMealDB
router.post('/mealdb/sample', async (req, res) => {
  try {
    const importer = new MealDbImporter();
    const result = await importer.importSampleData();

    res.json({
      success: true,
      message: 'Sample data imported successfully',
      data: result
    });
  } catch (error) {
    console.error('Error importing sample data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import sample data',
      details: error.message
    });
  }
});

// Import random recipes
router.post('/mealdb/random', async (req, res) => {
  try {
    const { count = 10 } = req.body;
    const importer = new MealDbImporter();
    const importedCount = await importer.importRandomRecipes(count);

    res.json({
      success: true,
      message: `Imported ${importedCount} random recipes`,
      count: importedCount
    });
  } catch (error) {
    console.error('Error importing random recipes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import random recipes',
      details: error.message
    });
  }
});

// Import recipes by category
router.post('/mealdb/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.body;
    const importer = new MealDbImporter();
    const importedCount = await importer.importRecipesByCategory(category, limit);

    res.json({
      success: true,
      message: `Imported ${importedCount} recipes from ${category} category`,
      category,
      count: importedCount
    });
  } catch (error) {
    console.error(`Error importing recipes for category ${req.params.category}:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to import recipes for category ${req.params.category}`,
      details: error.message
    });
  }
});

// Import categories only
router.post('/mealdb/categories', async (req, res) => {
  try {
    const importer = new MealDbImporter();
    const importedCount = await importer.importCategories();

    res.json({
      success: true,
      message: `Imported ${importedCount} categories`,
      count: importedCount
    });
  } catch (error) {
    console.error('Error importing categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import categories',
      details: error.message
    });
  }
});

// Get import status/statistics
router.get('/status', async (req, res) => {
  try {
    const { getDatabase } = require('../database/init');
    const db = getDatabase();

    const stats = await new Promise((resolve, reject) => {
      const queries = {
        totalRecipes: 'SELECT COUNT(*) as count FROM recipes',
        totalCategories: 'SELECT COUNT(*) as count FROM categories',
        totalIngredients: 'SELECT COUNT(DISTINCT ingredient_name) as count FROM recipe_ingredients',
        recipesByDifficulty: `
          SELECT difficulty, COUNT(*) as count
          FROM recipes
          GROUP BY difficulty
        `,
        recentImports: `
          SELECT title, created_at
          FROM recipes
          WHERE source_url LIKE '%themealdb.com%'
          ORDER BY created_at DESC
          LIMIT 10
        `
      };

      const results = {};
      let completed = 0;
      const total = Object.keys(queries).length;

      Object.entries(queries).forEach(([key, query]) => {
        if (key === 'recipesByDifficulty' || key === 'recentImports') {
          db.all(query, [], (err, rows) => {
            if (err) {
              results[key] = { error: err.message };
            } else {
              results[key] = rows;
            }
            completed++;
            if (completed === total) {
              resolve(results);
            }
          });
        } else {
          db.get(query, [], (err, row) => {
            if (err) {
              results[key] = { error: err.message };
            } else {
              results[key] = row;
            }
            completed++;
            if (completed === total) {
              resolve(results);
            }
          });
        }
      });
    });

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Error getting import status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get import status',
      details: error.message
    });
  }
});

module.exports = router;