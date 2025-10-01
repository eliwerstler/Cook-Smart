const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

const db = getDatabase();

// Get all pantry items
router.get('/items', (req, res) => {
  const query = `
    SELECT pi.*, c.color as category_color
    FROM pantry_items pi
    LEFT JOIN categories c ON pi.category = c.name
    ORDER BY pi.expiration_date ASC, pi.name ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching pantry items:', err);
      return res.status(500).json({ error: 'Failed to fetch pantry items' });
    }
    res.json(rows);
  });
});

// Get pantry items by category
router.get('/items/category/:category', (req, res) => {
  const { category } = req.params;
  
  const query = `
    SELECT pi.*, c.color as category_color
    FROM pantry_items pi
    LEFT JOIN categories c ON pi.category = c.name
    WHERE pi.category = ?
    ORDER BY pi.expiration_date ASC, pi.name ASC
  `;

  db.all(query, [category], (err, rows) => {
    if (err) {
      console.error('Error fetching pantry items by category:', err);
      return res.status(500).json({ error: 'Failed to fetch pantry items' });
    }
    res.json(rows);
  });
});

// Add new pantry item
router.post('/items', (req, res) => {
  const { name, category, quantity, unit, expiration_date, notes, dietary_tags, allergens } = req.body;

  if (!name || !category || quantity === undefined) {
    return res.status(400).json({
      error: 'Name, category, and quantity are required'
    });
  }

  const query = `
    INSERT INTO pantry_items (name, category, quantity, unit, expiration_date, notes, dietary_tags, allergens)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const dietaryTagsStr = Array.isArray(dietary_tags) ? dietary_tags.join(',') : dietary_tags || '';
  const allergensStr = Array.isArray(allergens) ? allergens.join(',') : allergens || '';

  db.run(query, [name, category, quantity, unit || 'pieces', expiration_date, notes, dietaryTagsStr, allergensStr], function(err) {
    if (err) {
      console.error('Error adding pantry item:', err);
      return res.status(500).json({ error: 'Failed to add pantry item' });
    }

    res.status(201).json({
      id: this.lastID,
      message: 'Pantry item added successfully'
    });
  });
});

// Update pantry item
router.put('/items/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, quantity, unit, expiration_date, notes, dietary_tags, allergens } = req.body;

  const query = `
    UPDATE pantry_items
    SET name = ?, category = ?, quantity = ?, unit = ?, expiration_date = ?, notes = ?, dietary_tags = ?, allergens = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const dietaryTagsStr = Array.isArray(dietary_tags) ? dietary_tags.join(',') : dietary_tags || '';
  const allergensStr = Array.isArray(allergens) ? allergens.join(',') : allergens || '';

  db.run(query, [name, category, quantity, unit, expiration_date, notes, dietaryTagsStr, allergensStr, id], function(err) {
    if (err) {
      console.error('Error updating pantry item:', err);
      return res.status(500).json({ error: 'Failed to update pantry item' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pantry item not found' });
    }

    res.json({ message: 'Pantry item updated successfully' });
  });
});

// Delete pantry item
router.delete('/items/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM pantry_items WHERE id = ?';

  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error deleting pantry item:', err);
      return res.status(500).json({ error: 'Failed to delete pantry item' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pantry item not found' });
    }
    
    res.json({ message: 'Pantry item deleted successfully' });
  });
});

// Get all categories
router.get('/categories', (req, res) => {
  const query = 'SELECT * FROM categories ORDER BY name';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
    res.json(rows);
  });
});

// Add new category
router.post('/categories', (req, res) => {
  const { name, color } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const query = 'INSERT INTO categories (name, color) VALUES (?, ?)';

  db.run(query, [name, color || '#6B7280'], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'Category already exists' });
      }
      console.error('Error adding category:', err);
      return res.status(500).json({ error: 'Failed to add category' });
    }
    
    res.status(201).json({
      id: this.lastID,
      message: 'Category added successfully'
    });
  });
});

// Bulk import pantry items
router.post('/items/bulk', (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  const insertQuery = `
    INSERT INTO pantry_items (name, category, quantity, unit, expiration_date, notes, dietary_tags, allergens)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const stmt = db.prepare(insertQuery);
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    items.forEach((item, index) => {
      const { name, category, quantity, unit, expiration_date, notes, dietary_tags, allergens } = item;

      if (!name || !category || quantity === undefined) {
        errorCount++;
        errors.push({
          index,
          item,
          error: 'Name, category, and quantity are required'
        });
        return;
      }

      const dietaryTagsStr = Array.isArray(dietary_tags) ? dietary_tags.join(',') : dietary_tags || '';
      const allergensStr = Array.isArray(allergens) ? allergens.join(',') : allergens || '';

      stmt.run(
        [name, category, quantity, unit || 'pieces', expiration_date, notes, dietaryTagsStr, allergensStr],
        function(err) {
          if (err) {
            errorCount++;
            errors.push({
              index,
              item,
              error: err.message
            });
          } else {
            successCount++;
          }
        }
      );
    });

    stmt.finalize((err) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Failed to finalize bulk import' });
      }

      db.run('COMMIT', (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to commit bulk import' });
        }

        res.json({
          message: 'Bulk import completed',
          successCount,
          errorCount,
          errors: errorCount > 0 ? errors : undefined
        });
      });
    });
  });
});

// Get expiring items
router.get('/items/expiring', (req, res) => {
  const days = parseInt(req.query.days) || 7;

  const query = `
    SELECT pi.*, c.color as category_color
    FROM pantry_items pi
    LEFT JOIN categories c ON pi.category = c.name
    WHERE pi.expiration_date IS NOT NULL
    AND pi.expiration_date <= date('now', '+${days} days')
    AND pi.expiration_date >= date('now')
    ORDER BY pi.expiration_date ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching expiring items:', err);
      return res.status(500).json({ error: 'Failed to fetch expiring items' });
    }
    res.json(rows);
  });
});

// Get low stock items
router.get('/items/low-stock', (req, res) => {
  const threshold = parseFloat(req.query.threshold) || 1;

  const query = `
    SELECT pi.*, c.color as category_color
    FROM pantry_items pi
    LEFT JOIN categories c ON pi.category = c.name
    WHERE pi.quantity <= ?
    ORDER BY pi.quantity ASC, pi.name ASC
  `;

  db.all(query, [threshold], (err, rows) => {
    if (err) {
      console.error('Error fetching low stock items:', err);
      return res.status(500).json({ error: 'Failed to fetch low stock items' });
    }
    res.json(rows);
  });
});

// Generate shopping list from low stock items
router.post('/shopping-list', (req, res) => {
  const { threshold = 1, categories = [] } = req.body;

  let query = `
    SELECT pi.name, pi.category, pi.quantity, pi.unit,
           COALESCE(pi.quantity * 2, 1) as suggested_quantity
    FROM pantry_items pi
    WHERE pi.quantity <= ?
  `;

  const params = [threshold];

  if (categories.length > 0) {
    query += ` AND pi.category IN (${categories.map(() => '?').join(',')})`;
    params.push(...categories);
  }

  query += ' ORDER BY pi.category, pi.name';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error generating shopping list:', err);
      return res.status(500).json({ error: 'Failed to generate shopping list' });
    }

    const shoppingList = rows.map(item => ({
      name: item.name,
      category: item.category,
      current_quantity: item.quantity,
      suggested_quantity: item.suggested_quantity,
      unit: item.unit,
      checked: false
    }));

    res.json({
      generated_at: new Date().toISOString(),
      items: shoppingList,
      total_items: shoppingList.length
    });
  });
});

// Smart ingredient suggestions endpoint
router.post('/suggest', (req, res) => {
  const { ingredient } = req.body;

  if (!ingredient || !ingredient.trim()) {
    return res.status(400).json({ error: 'Ingredient name is required' });
  }

  // Simple ingredient recognition logic (can be expanded)
  const ingredientLower = ingredient.toLowerCase().trim();

  // Comprehensive ingredient database with smart categorization
  const ingredientDatabase = {
    // Fruits
    'apple': { category: 'Fruits', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
    'banana': { category: 'Fruits', units: ['pieces', 'kg', 'bunch'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
    'orange': { category: 'Fruits', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
    'tomato': { category: 'Vegetables', units: ['pieces', 'kg', 'can'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
    'onion': { category: 'Vegetables', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
    'chicken': { category: 'Meat & Poultry', units: ['kg', 'lb', 'pieces'], dietaryTags: [], allergens: [] },
    'beef': { category: 'Meat & Poultry', units: ['kg', 'lb', 'g'], dietaryTags: [], allergens: [] },
    'salmon': { category: 'Seafood', units: ['kg', 'lb', 'fillet'], dietaryTags: ['pescatarian'], allergens: ['fish'] },
    'milk': { category: 'Dairy & Eggs', units: ['l', 'ml', 'cup'], dietaryTags: ['vegetarian'], allergens: ['dairy'] },
    'cheese': { category: 'Dairy & Eggs', units: ['g', 'block', 'slice'], dietaryTags: ['vegetarian'], allergens: ['dairy'] },
    'eggs': { category: 'Dairy & Eggs', units: ['pieces', 'dozen', 'carton'], dietaryTags: ['vegetarian'], allergens: ['eggs'] },
    'pasta': { category: 'Grains & Pasta', units: ['g', 'kg', 'box'], dietaryTags: ['vegetarian', 'vegan'], allergens: ['gluten'] },
    'rice': { category: 'Grains & Pasta', units: ['g', 'kg', 'cup'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
    'bread': { category: 'Grains & Pasta', units: ['slices', 'loaf', 'pieces'], dietaryTags: ['vegetarian'], allergens: ['gluten'] },
    'olive oil': { category: 'Condiments & Sauces', units: ['ml', 'l', 'bottle'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  };

  // Direct match
  let suggestion = ingredientDatabase[ingredientLower];

  if (!suggestion) {
    // Pattern matching for partial matches
    for (const [key, value] of Object.entries(ingredientDatabase)) {
      if (ingredientLower.includes(key) || key.includes(ingredientLower)) {
        suggestion = value;
        break;
      }
    }
  }

  // Default fallback
  if (!suggestion) {
    suggestion = {
      category: 'Other',
      units: ['pieces', 'g', 'kg'],
      dietaryTags: ['vegetarian', 'vegan', 'gluten-free'],
      allergens: [],
    };
  }

  res.json({
    ingredient,
    suggestions: suggestion
  });
});

// Get pantry statistics
router.get('/stats', (req, res) => {
  const queries = {
    totalItems: 'SELECT COUNT(*) as count FROM pantry_items',
    categories: 'SELECT category, COUNT(*) as count FROM pantry_items GROUP BY category',
    expiring: 'SELECT COUNT(*) as count FROM pantry_items WHERE expiration_date < date("now", "+7 days")',
    lowStock: 'SELECT COUNT(*) as count FROM pantry_items WHERE quantity < 1'
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
