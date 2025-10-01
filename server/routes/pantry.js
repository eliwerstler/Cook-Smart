const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const ingredientNormalizer = require('../services/ingredientNormalizer');

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

// Search ingredient names (autocomplete) with metadata
router.get('/ingredients/search', (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return res.json([]);
  }

  const searchTerm = q.trim().toLowerCase();

  // Search in recipe ingredients and pantry items for autocomplete suggestions
  const recipeQuery = `
    SELECT DISTINCT ri.ingredient_name as name, ri.unit
    FROM recipe_ingredients ri
    WHERE LOWER(ri.ingredient_name) LIKE ?
  `;

  const pantryQuery = `
    SELECT DISTINCT pi.name, pi.unit, pi.category
    FROM pantry_items pi
    WHERE LOWER(pi.name) LIKE ?
  `;

  const searchPattern = `%${searchTerm}%`;

  db.all(recipeQuery, [searchPattern], (err, recipeRows) => {
    if (err) {
      console.error('Error searching recipe ingredients:', err);
      return res.status(500).json({ error: 'Failed to search ingredients' });
    }

    db.all(pantryQuery, [searchPattern], (err, pantryRows) => {
      if (err) {
        console.error('Error searching pantry items:', err);
        return res.status(500).json({ error: 'Failed to search ingredients' });
      }

      // Combine results
      const allRows = [...recipeRows, ...pantryRows];

      // Group ingredients by their normalized form with metadata
      const groupedMap = new Map();
      
      allRows.forEach(row => {
        const normalized = ingredientNormalizer.normalize(row.name);
        
        if (!groupedMap.has(normalized)) {
          groupedMap.set(normalized, {
            normalized,
            displayName: ingredientNormalizer.getDisplayName(row.name),
            variations: [],
            frequency: 0,
            units: new Map(),
            categories: new Map()
          });
        }
        
        const group = groupedMap.get(normalized);
        group.variations.push(row.name);
        group.frequency++;
        
        // Track units and categories with frequency
        if (row.unit) {
          const unitCount = group.units.get(row.unit) || 0;
          group.units.set(row.unit, unitCount + 1);
        }
        
        if (row.category) {
          const categoryCount = group.categories.get(row.category) || 0;
          group.categories.set(row.category, categoryCount + 1);
        }
      });

      // Convert to array and determine best category/unit
      const suggestions = Array.from(groupedMap.values())
        .map(group => {
          // Get most common unit
          let mostCommonUnit = 'pieces';
          let maxUnitCount = 0;
          for (const [unit, count] of group.units.entries()) {
            if (count > maxUnitCount) {
              maxUnitCount = count;
              mostCommonUnit = unit;
            }
          }

          // Get most common category or infer from ingredient name
          let mostCommonCategory = null;
          let maxCategoryCount = 0;
          for (const [category, count] of group.categories.entries()) {
            if (count > maxCategoryCount) {
              maxCategoryCount = count;
              mostCommonCategory = category;
            }
          }

          // If no category found, infer from ingredient name
          if (!mostCommonCategory) {
            mostCommonCategory = inferCategory(group.displayName);
          }

          return {
            name: group.displayName,
            frequency: group.frequency,
            category: mostCommonCategory,
            unit: mostCommonUnit,
            variations: group.variations.length > 1 ? group.variations : undefined
          };
        })
        .sort((a, b) => {
          // Prioritize exact or close matches
          const aExact = a.name.toLowerCase().startsWith(searchTerm) ? 1 : 0;
          const bExact = b.name.toLowerCase().startsWith(searchTerm) ? 1 : 0;
          
          if (aExact !== bExact) return bExact - aExact;
          return b.frequency - a.frequency;
        })
        .slice(0, 10);

      res.json(suggestions);
    });
  });
});

// Helper function to infer category from ingredient name
function inferCategory(ingredientName) {
  const name = ingredientName.toLowerCase();
  
  // Meat & Poultry
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || 
      name.includes('turkey') || name.includes('lamb') || name.includes('duck') ||
      name.includes('bacon') || name.includes('sausage') || name.includes('ham')) {
    return 'Meat & Poultry';
  }
  
  // Seafood
  if (name.includes('fish') || name.includes('salmon') || name.includes('tuna') || 
      name.includes('shrimp') || name.includes('prawn') || name.includes('crab') ||
      name.includes('lobster') || name.includes('cod') || name.includes('sardine')) {
    return 'Seafood';
  }
  
  // Dairy & Eggs
  if (name.includes('milk') || name.includes('cheese') || name.includes('cream') || 
      name.includes('butter') || name.includes('yogurt') || name.includes('egg')) {
    return 'Dairy & Eggs';
  }
  
  // Fruits
  if (name.includes('apple') || name.includes('banana') || name.includes('orange') || 
      name.includes('berry') || name.includes('grape') || name.includes('lemon') ||
      name.includes('lime') || name.includes('peach') || name.includes('pear') ||
      name.includes('plum') || name.includes('cherry') || name.includes('mango')) {
    return 'Fruits';
  }
  
  // Vegetables
  if (name.includes('tomato') || name.includes('onion') || name.includes('pepper') || 
      name.includes('lettuce') || name.includes('carrot') || name.includes('potato') ||
      name.includes('broccoli') || name.includes('spinach') || name.includes('celery') ||
      name.includes('cucumber') || name.includes('zucchini') || name.includes('garlic') ||
      name.includes('mushroom') || name.includes('cabbage') || name.includes('bean')) {
    return 'Vegetables';
  }
  
  // Grains & Pasta
  if (name.includes('rice') || name.includes('pasta') || name.includes('bread') || 
      name.includes('flour') || name.includes('oat') || name.includes('wheat') ||
      name.includes('noodle') || name.includes('cereal') || name.includes('quinoa')) {
    return 'Grains & Pasta';
  }
  
  // Condiments & Sauces
  if (name.includes('sauce') || name.includes('oil') || name.includes('vinegar') || 
      name.includes('mustard') || name.includes('ketchup') || name.includes('mayo') ||
      name.includes('soy') || name.includes('dressing')) {
    return 'Condiments & Sauces';
  }
  
  // Spices & Herbs
  if (name.includes('salt') || name.includes('pepper') || name.includes('spice') || 
      name.includes('herb') || name.includes('basil') || name.includes('oregano') ||
      name.includes('thyme') || name.includes('rosemary') || name.includes('cumin') ||
      name.includes('paprika') || name.includes('cinnamon') || name.includes('ginger')) {
    return 'Spices & Herbs';
  }
  
  // Default
  return 'Other';
}

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
