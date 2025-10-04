const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

const db = getDatabase();

// Get all recipes with ingredients
router.get('/', (req, res) => {
  const { search, category, difficulty, meal_type, limit = 50, offset = 0 } = req.query;
  
  let query = `
    SELECT r.*, 
           GROUP_CONCAT(ri.ingredient_name || ' (' || ri.quantity || ' ' || ri.unit || ')') as ingredients
    FROM recipes r
    LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
  `;
  
  const conditions = [];
  const params = [];
  
  if (search) {
    conditions.push('(r.title LIKE ? OR r.description LIKE ? OR r.tags LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (difficulty) {
    conditions.push('r.difficulty = ?');
    params.push(difficulty);
  }
  
  if (meal_type) {
    conditions.push('r.tags LIKE ?');
    params.push(`%${meal_type}%`);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' GROUP BY r.id ORDER BY r.rating DESC, r.title ASC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching recipes:', err);
      return res.status(500).json({ error: 'Failed to fetch recipes' });
    }
    res.json(rows);
  });
});

// Get recipe by ID with detailed ingredients
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  // Get recipe details
  const recipeQuery = 'SELECT * FROM recipes WHERE id = ?';
  
  db.get(recipeQuery, [id], (err, recipe) => {
    if (err) {
      console.error('Error fetching recipe:', err);
      return res.status(500).json({ error: 'Failed to fetch recipe' });
    }
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    // Get ingredients
    const ingredientsQuery = `
      SELECT * FROM recipe_ingredients 
      WHERE recipe_id = ? 
      ORDER BY ingredient_name
    `;
    
    db.all(ingredientsQuery, [id], (err, ingredients) => {
      if (err) {
        console.error('Error fetching recipe ingredients:', err);
        return res.status(500).json({ error: 'Failed to fetch recipe ingredients' });
      }
      
      res.json({
        ...recipe,
        ingredients
      });
    });
  });
});

// Add new recipe
router.post('/', (req, res) => {
  const { 
    title, description, instructions, prep_time, cook_time, 
    servings, difficulty, image_url, source_url, tags, ingredients 
  } = req.body;

  if (!title || !instructions || !ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ 
      error: 'Title, instructions, and ingredients are required' 
    });
  }

  const recipeQuery = `
    INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, difficulty, image_url, source_url, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(recipeQuery, [
    title, description, instructions, prep_time || 0, cook_time || 0,
    servings || 1, difficulty || 'easy', image_url, source_url, tags
  ], function(err) {
    if (err) {
      console.error('Error adding recipe:', err);
      return res.status(500).json({ error: 'Failed to add recipe' });
    }
    
    const recipeId = this.lastID;
    
    // Add ingredients
    const ingredientStmt = db.prepare(`
      INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, optional)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    ingredients.forEach(ingredient => {
      ingredientStmt.run([
        recipeId,
        ingredient.name,
        ingredient.quantity,
        ingredient.unit || 'pieces',
        ingredient.optional || false
      ]);
    });
    
    ingredientStmt.finalize();
    
    res.status(201).json({
      id: recipeId,
      message: 'Recipe added successfully'
    });
  });
});

// Update recipe
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { 
    title, description, instructions, prep_time, cook_time, 
    servings, difficulty, image_url, source_url, tags, ingredients 
  } = req.body;

  const recipeQuery = `
    UPDATE recipes 
    SET title = ?, description = ?, instructions = ?, prep_time = ?, cook_time = ?,
        servings = ?, difficulty = ?, image_url = ?, source_url = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(recipeQuery, [
    title, description, instructions, prep_time, cook_time,
    servings, difficulty, image_url, source_url, tags, id
  ], function(err) {
    if (err) {
      console.error('Error updating recipe:', err);
      return res.status(500).json({ error: 'Failed to update recipe' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    // Update ingredients if provided
    if (ingredients && Array.isArray(ingredients)) {
      // Delete existing ingredients
      db.run('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [id], (err) => {
        if (err) {
          console.error('Error deleting old ingredients:', err);
          return res.status(500).json({ error: 'Failed to update ingredients' });
        }
        
        // Add new ingredients
        const ingredientStmt = db.prepare(`
          INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, optional)
          VALUES (?, ?, ?, ?, ?)
        `);
        
        ingredients.forEach(ingredient => {
          ingredientStmt.run([
            id,
            ingredient.name,
            ingredient.quantity,
            ingredient.unit || 'pieces',
            ingredient.optional || false
          ]);
        });
        
        ingredientStmt.finalize();
      });
    }
    
    res.json({ message: 'Recipe updated successfully' });
  });
});

// Delete recipe
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM recipes WHERE id = ?';

  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error deleting recipe:', err);
      return res.status(500).json({ error: 'Failed to delete recipe' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json({ message: 'Recipe deleted successfully' });
  });
});

// Rate recipe
router.post('/:id/rate', (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const query = 'UPDATE recipes SET rating = ? WHERE id = ?';

  db.run(query, [rating, id], function(err) {
    if (err) {
      console.error('Error rating recipe:', err);
      return res.status(500).json({ error: 'Failed to rate recipe' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json({ message: 'Recipe rated successfully' });
  });
});

// Get recipe statistics
router.get('/stats/summary', (req, res) => {
  const queries = {
    totalRecipes: 'SELECT COUNT(*) as count FROM recipes',
    avgRating: 'SELECT AVG(rating) as average FROM recipes WHERE rating > 0',
    difficulty: 'SELECT difficulty, COUNT(*) as count FROM recipes GROUP BY difficulty',
    avgCookTime: 'SELECT AVG(cook_time) as average FROM recipes WHERE cook_time > 0'
  };

  const stats = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, [], (err, row) => {
      if (err) {
        console.error(`Error fetching ${key} stats:`, err);
        stats[key] = { error: 'Failed to fetch' };
      } else {
        stats[key] = row;
      }
      
      completed++;
      if (completed === total) {
        res.json(stats);
      }
    });
  });
});

module.exports = router;
