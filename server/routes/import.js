const express = require('express');
const router = express.Router();
const MealDbImporter = require('../services/mealDbImporter');
const JsonRecipeImporter = require('../services/jsonRecipeImporter');
const recipeValidator = require('../services/recipeValidator');

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

// Import recipes from JSON file
router.post('/json/file', async (req, res) => {
  try {
    const { filePath, validate = true, standardize = true, minQualityScore = 0.7, overwrite = false } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }

    const importer = new JsonRecipeImporter();
    const result = await importer.importFromFile(filePath, {
      validate,
      standardize,
      minQualityScore,
      overwrite
    });

    res.json(result);
  } catch (error) {
    console.error('Error importing from JSON file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import from JSON file',
      details: error.message
    });
  }
});

// Import recipes from JSON directory
router.post('/json/directory', async (req, res) => {
  try {
    const { 
      directoryPath, 
      recursive = true, 
      validate = true, 
      standardize = true, 
      minQualityScore = 0.7, 
      overwrite = false 
    } = req.body;

    if (!directoryPath) {
      return res.status(400).json({
        success: false,
        error: 'Directory path is required'
      });
    }

    const importer = new JsonRecipeImporter();
    const result = await importer.importFromDirectory(directoryPath, {
      recursive,
      validate,
      standardize,
      minQualityScore,
      overwrite
    });

    res.json(result);
  } catch (error) {
    console.error('Error importing from JSON directory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import from JSON directory',
      details: error.message
    });
  }
});

// Validate recipe without importing
router.post('/validate', async (req, res) => {
  try {
    const { recipe } = req.body;

    if (!recipe) {
      return res.status(400).json({
        success: false,
        error: 'Recipe data is required'
      });
    }

    const validation = recipeValidator.validateRecipe(recipe);
    const suggestions = recipeValidator.getImprovementSuggestions(recipe);

    res.json({
      success: true,
      validation,
      suggestions
    });
  } catch (error) {
    console.error('Error validating recipe:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate recipe',
      details: error.message
    });
  }
});

// Get enhanced import statistics
router.get('/statistics', async (req, res) => {
  try {
    const importer = new JsonRecipeImporter();
    const stats = await importer.getImportStatistics();

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Error getting import statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get import statistics',
      details: error.message
    });
  }
});

// Bulk import from multiple sources
router.post('/bulk', async (req, res) => {
  try {
    const { 
      sources = ['themealdb'], 
      categories = [], 
      limit = 50, 
      minQualityScore = 0.7,
      validate = true,
      standardize = true 
    } = req.body;

    const results = {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: [],
      sources: {}
    };

    // Import from TheMealDB if requested
    if (sources.includes('themealdb')) {
      try {
        const importer = new MealDbImporter();
        const mealdbResult = await importer.importSampleData();
        results.sources.themealdb = mealdbResult;
        results.imported += mealdbResult.recipes || 0;
      } catch (error) {
        results.errors.push(`TheMealDB: ${error.message}`);
      }
    }

    // Import from JSON files if requested
    if (sources.includes('json')) {
      try {
        const jsonImporter = new JsonRecipeImporter();
        const jsonResult = await jsonImporter.importFromDirectory('./server/recipes', {
          recursive: true,
          validate,
          standardize,
          minQualityScore
        });
        results.sources.json = jsonResult;
        results.imported += jsonResult.imported || 0;
        results.skipped += jsonResult.skipped || 0;
        results.errors.push(...(jsonResult.errors || []));
      } catch (error) {
        results.errors.push(`JSON: ${error.message}`);
      }
    }

    results.total = results.imported + results.skipped;

    res.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform bulk import',
      details: error.message
    });
  }
});

module.exports = router;