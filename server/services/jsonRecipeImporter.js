/**
 * JSON Recipe Importer Service
 * Imports recipes from JSON files with validation and standardization
 */

const fs = require('fs').promises;
const path = require('path');
const { getDatabase } = require('../database/init');
const recipeValidator = require('./recipeValidator');
const ingredientNormalizer = require('./ingredientNormalizer');
const unitConverter = require('./unitConverter');

class JsonRecipeImporter {
  constructor() {
    this.db = getDatabase();
    this.validator = recipeValidator;
    this.ingredientNormalizer = ingredientNormalizer;
    this.unitConverter = unitConverter;
  }

  /**
   * Import recipe from JSON file
   * @param {string} filePath - Path to JSON file
   * @param {Object} options - Import options
   * @returns {Object} - Import result
   */
  async importFromFile(filePath, options = {}) {
    const {
      validate = true,
      standardize = true,
      minQualityScore = 0.7,
      overwrite = false
    } = options;

    try {
      // Read and parse JSON file
      const data = await fs.readFile(filePath, 'utf8');
      const recipe = JSON.parse(data);

      if (!recipe) {
        throw new Error('Invalid JSON file - no recipe data found');
      }

      // Validate recipe if requested
      if (validate) {
        const validation = this.validator.validateForImport(recipe, minQualityScore);
        if (!validation.canImport) {
          return {
            success: false,
            error: 'Recipe failed validation',
            validation,
            recipe: recipe.title || 'Unknown'
          };
        }
      }

      // Standardize recipe if requested
      const processedRecipe = standardize ? 
        await this.standardizeRecipe(recipe) : recipe;

      // Save to database
      const recipeId = await this.saveRecipe(processedRecipe, overwrite);

      return {
        success: true,
        recipeId,
        recipe: processedRecipe.title,
        standardized: standardize,
        validated: validate
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        recipe: 'Unknown'
      };
    }
  }

  /**
   * Import multiple recipes from JSON file
   * @param {string} filePath - Path to JSON file
   * @param {Object} options - Import options
   * @returns {Object} - Import results
   */
  async importMultipleFromFile(filePath, options = {}) {
    const {
      validate = true,
      standardize = true,
      minQualityScore = 0.7,
      overwrite = false
    } = options;

    try {
      // Read and parse JSON file
      const data = await fs.readFile(filePath, 'utf8');
      const recipes = JSON.parse(data);

      if (!Array.isArray(recipes)) {
        throw new Error('JSON file must contain an array of recipes');
      }

      const results = {
        total: recipes.length,
        imported: 0,
        skipped: 0,
        errors: []
      };

      for (const recipe of recipes) {
        try {
          const result = await this.importFromFile(
            filePath, 
            { validate, standardize, minQualityScore, overwrite, singleRecipe: recipe }
          );

          if (result.success) {
            results.imported++;
          } else {
            results.skipped++;
            results.errors.push(`${recipe.title || 'Unknown'}: ${result.error}`);
          }
        } catch (error) {
          results.skipped++;
          results.errors.push(`${recipe.title || 'Unknown'}: ${error.message}`);
        }
      }

      return results;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        total: 0,
        imported: 0,
        skipped: 0,
        errors: [error.message]
      };
    }
  }

  /**
   * Import recipes from directory
   * @param {string} directoryPath - Path to directory containing JSON files
   * @param {Object} options - Import options
   * @returns {Object} - Import results
   */
  async importFromDirectory(directoryPath, options = {}) {
    const {
      recursive = true,
      pattern = '*.json',
      validate = true,
      standardize = true,
      minQualityScore = 0.7,
      overwrite = false
    } = options;

    try {
      const files = await this.findJsonFiles(directoryPath, recursive);
      const results = {
        total: 0,
        imported: 0,
        skipped: 0,
        errors: [],
        files: {}
      };

      for (const filePath of files) {
        try {
          // Read the JSON file to check if it's an array or single recipe
          const data = await fs.readFile(filePath, 'utf8');
          const parsed = JSON.parse(data);
          
          let fileResult;
          if (Array.isArray(parsed)) {
            // Multiple recipes in one file
            fileResult = await this.importMultipleFromFile(filePath, {
              validate,
              standardize,
              minQualityScore,
              overwrite
            });
          } else {
            // Single recipe file
            const result = await this.importFromFile(filePath, {
              validate,
              standardize,
              minQualityScore,
              overwrite
            });
            fileResult = {
              total: 1,
              imported: result.success ? 1 : 0,
              skipped: result.success ? 0 : 1,
              errors: result.success ? [] : [result.error]
            };
          }

          results.files[filePath] = fileResult;
          results.total += fileResult.total || 1;
          results.imported += fileResult.imported || 0;
          results.skipped += fileResult.skipped || 0;
          results.errors.push(...(fileResult.errors || []));
        } catch (error) {
          results.errors.push(`${filePath}: ${error.message}`);
        }
      }

      return results;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        total: 0,
        imported: 0,
        skipped: 0,
        errors: [error.message]
      };
    }
  }

  /**
   * Standardize recipe ingredients and units
   * @param {Object} recipe - Recipe object
   * @returns {Object} - Standardized recipe
   */
  async standardizeRecipe(recipe) {
    const standardized = { ...recipe };

    // Standardize ingredients
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      standardized.ingredients = recipe.ingredients.map(ingredient => ({
        ...ingredient,
        name: this.ingredientNormalizer.getStandardName(ingredient.name),
        unit: this.unitConverter.normalizeUnit(ingredient.unit || 'pieces')
      }));
    }

    // Set source type
    standardized.source_type = 'json';

    // Add validation timestamp
    standardized.last_validated = new Date().toISOString();

    return standardized;
  }

  /**
   * Save recipe to database
   * @param {Object} recipe - Recipe object
   * @param {boolean} overwrite - Whether to overwrite existing recipes
   * @returns {number} - Recipe ID
   */
  async saveRecipe(recipe, overwrite = false) {
    return new Promise((resolve, reject) => {
      // Check if recipe already exists
      this.db.get(
        'SELECT id FROM recipes WHERE title = ? AND source_url = ?',
        [recipe.title, recipe.source_url || null],
        (err, existing) => {
          if (err) return reject(err);
          
          if (existing && !overwrite) {
            return reject(new Error('Recipe already exists (use overwrite=true to replace)'));
          }

          // Arrow function to preserve 'this' context
          const insertNewRecipe = () => {
            // Validate recipe before saving
            const validation = recipeValidator.validateRecipe(recipe);
            const db = this.db; // Capture db reference for callback
            
            // Insert recipe
            db.run(`
              INSERT INTO recipes (
                title, description, instructions, prep_time, cook_time, servings,
                difficulty, image_url, source_url, source_type, quality_score,
                last_validated, validation_errors, tags, rating
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              recipe.title,
              recipe.description || null,
              recipe.instructions,
              recipe.prep_time || 0,
              recipe.cook_time || 0,
              recipe.servings || 4,
              recipe.difficulty || 'easy',
              recipe.image_url || null,
              recipe.source_url || null,
              recipe.source_type || 'json',
              validation.score * 100, // Convert 0-1 to 0-100
              recipe.last_validated || new Date().toISOString(),
              validation.errors.length > 0 ? JSON.stringify(validation.errors) : null,
              recipe.tags || null,
              recipe.rating || 0
            ], function(err) {
              if (err) return reject(err);

              const recipeId = this.lastID;

              // Insert ingredients
              if (recipe.ingredients && recipe.ingredients.length > 0) {
                const ingredientStmt = db.prepare(`
                  INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, optional)
                  VALUES (?, ?, ?, ?, ?)
                `);

                recipe.ingredients.forEach(ingredient => {
                  ingredientStmt.run([
                    recipeId,
                    ingredient.name,
                    ingredient.quantity,
                    ingredient.unit || 'pieces',
                    ingredient.optional || false
                  ]);
                });

                ingredientStmt.finalize();
              }

              resolve(recipeId);
            });
          };

          // Delete existing recipe if overwriting
          if (existing && overwrite) {
            this.db.run('DELETE FROM recipes WHERE id = ?', [existing.id], (err) => {
              if (err) return reject(err);
              insertNewRecipe();
            });
          } else {
            insertNewRecipe();
          }
        }
      );
    });
  }

  /**
   * Find JSON files in directory
   * @param {string} directoryPath - Directory path
   * @param {boolean} recursive - Whether to search recursively
   * @returns {Array} - Array of file paths
   */
  async findJsonFiles(directoryPath, recursive = true) {
    const files = [];
    
    try {
      const entries = await fs.readdir(directoryPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(directoryPath, entry.name);
        
        if (entry.isDirectory() && recursive) {
          const subFiles = await this.findJsonFiles(fullPath, recursive);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${directoryPath}:`, error);
    }
    
    return files;
  }

  /**
   * Get import statistics
   * @returns {Object} - Import statistics
   */
  async getImportStatistics() {
    return new Promise((resolve, reject) => {
      const queries = {
        totalRecipes: 'SELECT COUNT(*) as count FROM recipes',
        recipesBySource: `
          SELECT source_type, COUNT(*) as count
          FROM recipes
          GROUP BY source_type
        `,
        averageQualityScore: 'SELECT AVG(quality_score) as average FROM recipes WHERE quality_score > 0',
        recentlyImported: `
          SELECT title, source_type, created_at
          FROM recipes
          ORDER BY created_at DESC
          LIMIT 10
        `,
        qualityDistribution: `
          SELECT 
            CASE 
              WHEN quality_score >= 0.9 THEN 'Excellent (0.9+)'
              WHEN quality_score >= 0.8 THEN 'Good (0.8-0.9)'
              WHEN quality_score >= 0.7 THEN 'Fair (0.7-0.8)'
              WHEN quality_score > 0 THEN 'Poor (<0.7)'
              ELSE 'Unvalidated'
            END as quality_range,
            COUNT(*) as count
          FROM recipes
          GROUP BY quality_range
        `
      };

      const results = {};
      let completed = 0;
      const total = Object.keys(queries).length;

      Object.entries(queries).forEach(([key, query]) => {
        if (key === 'recipesBySource' || key === 'recentlyImported' || key === 'qualityDistribution') {
          this.db.all(query, [], (err, rows) => {
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
          this.db.get(query, [], (err, row) => {
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
  }
}

module.exports = JsonRecipeImporter;
