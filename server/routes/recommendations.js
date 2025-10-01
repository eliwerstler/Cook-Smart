const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

const db = getDatabase();

// Get recipe recommendations based on pantry items
router.get('/recipes', (req, res) => {
  const { limit = 10, strict = false } = req.query;
  
  // Get all pantry items
  const pantryQuery = 'SELECT name, quantity, unit FROM pantry_items WHERE quantity > 0';
  
  db.all(pantryQuery, [], (err, pantryItems) => {
    if (err) {
      console.error('Error fetching pantry items:', err);
      return res.status(500).json({ error: 'Failed to fetch pantry items' });
    }
    
    if (pantryItems.length === 0) {
      return res.json({
        recommendations: [],
        message: 'No items in pantry. Add some ingredients to get recommendations!'
      });
    }
    
    // Get all recipes with their ingredients
    const recipesQuery = `
      SELECT r.*, 
             ri.ingredient_name, ri.quantity as req_quantity, ri.unit as req_unit, ri.optional
      FROM recipes r
      LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
      ORDER BY r.id
    `;
    
    db.all(recipesQuery, [], (err, recipeData) => {
      if (err) {
        console.error('Error fetching recipes:', err);
        return res.status(500).json({ error: 'Failed to fetch recipes' });
      }
      
      // Group ingredients by recipe
      const recipes = {};
      recipeData.forEach(row => {
        if (!recipes[row.id]) {
          recipes[row.id] = {
            id: row.id,
            title: row.title,
            description: row.description,
            instructions: row.instructions,
            prep_time: row.prep_time,
            cook_time: row.cook_time,
            servings: row.servings,
            difficulty: row.difficulty,
            image_url: row.image_url,
            rating: row.rating,
            tags: row.tags,
            ingredients: []
          };
        }
        
        if (row.ingredient_name) {
          recipes[row.id].ingredients.push({
            name: row.ingredient_name,
            quantity: row.req_quantity,
            unit: row.req_unit,
            optional: row.optional
          });
        }
      });
      
      // Calculate recommendation scores
      const recommendations = Object.values(recipes).map(recipe => {
        const score = calculateRecipeScore(recipe, pantryItems, strict === 'true');
        return {
          ...recipe,
          matchScore: score.matchScore,
          availableIngredients: score.availableIngredients,
          missingIngredients: score.missingIngredients,
          matchPercentage: score.matchPercentage
        };
      });
      
      // Filter and sort recommendations
      const filteredRecommendations = recommendations
        .filter(recipe => recipe.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, parseInt(limit));
      
      res.json({
        recommendations: filteredRecommendations,
        pantryItems: pantryItems.length,
        totalRecipes: Object.keys(recipes).length
      });
    });
  });
});

// Calculate how well a recipe matches available pantry items
function calculateRecipeScore(recipe, pantryItems, strict = false) {
  const pantryMap = new Map();
  pantryItems.forEach(item => {
    const normalizedName = normalizeIngredientName(item.name);
    pantryMap.set(normalizedName, {
      quantity: item.quantity,
      unit: item.unit,
      originalName: item.name
    });
  });
  
  let totalIngredients = recipe.ingredients.length;
  let availableIngredients = [];
  let missingIngredients = [];
  let matchScore = 0;
  
  recipe.ingredients.forEach(ingredient => {
    const normalizedName = normalizeIngredientName(ingredient.name);
    const pantryItem = pantryMap.get(normalizedName);
    
    if (pantryItem) {
      // Check if we have enough quantity
      const hasEnough = checkQuantityMatch(pantryItem, ingredient, strict);
      
      availableIngredients.push({
        name: ingredient.name,
        required: `${ingredient.quantity} ${ingredient.unit}`,
        available: `${pantryItem.quantity} ${pantryItem.unit}`,
        sufficient: hasEnough
      });
      
      if (hasEnough) {
        matchScore += ingredient.optional ? 0.5 : 1;
      } else if (!ingredient.optional) {
        // Partial credit for having the ingredient but not enough
        matchScore += 0.3;
      }
    } else if (ingredient.optional) {
      // Optional ingredients don't count against the score
      missingIngredients.push({
        name: ingredient.name,
        required: `${ingredient.quantity} ${ingredient.unit}`,
        optional: true
      });
    } else {
      missingIngredients.push({
        name: ingredient.name,
        required: `${ingredient.quantity} ${ingredient.unit}`,
        optional: false
      });
    }
  });
  
  const matchPercentage = totalIngredients > 0 ? (matchScore / totalIngredients) * 100 : 0;
  
  return {
    matchScore,
    availableIngredients,
    missingIngredients,
    matchPercentage: Math.round(matchPercentage)
  };
}

// Normalize ingredient names for better matching
function normalizeIngredientName(name) {
  return name.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')    // Normalize spaces
    .trim();
}

// Check if pantry quantity is sufficient for recipe requirement
function checkQuantityMatch(pantryItem, recipeIngredient, strict = false) {
  if (strict) {
    // Strict mode: exact unit matching required
    return pantryItem.unit === recipeIngredient.unit && 
           pantryItem.quantity >= recipeIngredient.quantity;
  }
  
  // Flexible mode: try to convert units or estimate
  const pantryQty = pantryItem.quantity;
  const requiredQty = recipeIngredient.quantity;
  
  // If units match, direct comparison
  if (pantryItem.unit === recipeIngredient.unit) {
    return pantryQty >= requiredQty;
  }
  
  // Handle common unit conversions
  const conversions = {
    'g': { 'kg': 0.001, 'oz': 0.035274, 'lb': 0.002205 },
    'kg': { 'g': 1000, 'oz': 35.274, 'lb': 2.205 },
    'ml': { 'l': 0.001, 'cup': 0.004227, 'tbsp': 0.067628, 'tsp': 0.202884 },
    'l': { 'ml': 1000, 'cup': 4.227, 'tbsp': 67.628, 'tsp': 202.884 },
    'cup': { 'ml': 236.588, 'l': 0.236588, 'tbsp': 16, 'tsp': 48 },
    'tbsp': { 'ml': 14.7868, 'l': 0.0147868, 'cup': 0.0625, 'tsp': 3 },
    'tsp': { 'ml': 4.92892, 'l': 0.00492892, 'cup': 0.0208333, 'tbsp': 0.333333 },
    'pieces': { 'piece': 1, 'pcs': 1 },
    'piece': { 'pieces': 1, 'pcs': 1 },
    'pcs': { 'pieces': 1, 'piece': 1 }
  };
  
  // Try to convert pantry unit to required unit
  if (conversions[pantryItem.unit] && conversions[pantryItem.unit][recipeIngredient.unit]) {
    const convertedQty = pantryQty * conversions[pantryItem.unit][recipeIngredient.unit];
    return convertedQty >= requiredQty;
  }
  
  // Try reverse conversion
  if (conversions[recipeIngredient.unit] && conversions[recipeIngredient.unit][pantryItem.unit]) {
    const convertedQty = requiredQty * conversions[recipeIngredient.unit][pantryItem.unit];
    return pantryQty >= convertedQty;
  }
  
  // If no conversion available, assume they don't match
  return false;
}

// Get suggestions for missing ingredients
router.get('/suggestions/:recipeId', (req, res) => {
  const { recipeId } = req.params;
  
  // Get recipe ingredients
  const recipeQuery = 'SELECT * FROM recipe_ingredients WHERE recipe_id = ?';
  const pantryQuery = 'SELECT name, quantity, unit FROM pantry_items WHERE quantity > 0';
  
  db.all(recipeQuery, [recipeId], (err, recipeIngredients) => {
    if (err) {
      console.error('Error fetching recipe ingredients:', err);
      return res.status(500).json({ error: 'Failed to fetch recipe ingredients' });
    }
    
    db.all(pantryQuery, [], (err, pantryItems) => {
      if (err) {
        console.error('Error fetching pantry items:', err);
        return res.status(500).json({ error: 'Failed to fetch pantry items' });
      }
      
      const pantryMap = new Map();
      pantryItems.forEach(item => {
        pantryMap.set(normalizeIngredientName(item.name), item);
      });
      
      const suggestions = recipeIngredients
        .filter(ingredient => !pantryMap.has(normalizeIngredientName(ingredient.ingredient_name)))
        .map(ingredient => ({
          name: ingredient.ingredient_name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          optional: ingredient.optional
        }));
      
      res.json({
        recipeId: parseInt(recipeId),
        suggestions,
        totalMissing: suggestions.length
      });
    });
  });
});

// Get alternative recipes with fewer missing ingredients
router.get('/alternatives/:recipeId', (req, res) => {
  const { recipeId } = req.params;
  const { limit = 5 } = req.query;
  
  // Get the original recipe's ingredients
  const originalRecipeQuery = 'SELECT * FROM recipe_ingredients WHERE recipe_id = ?';
  
  db.all(originalRecipeQuery, [recipeId], (err, originalIngredients) => {
    if (err) {
      console.error('Error fetching original recipe:', err);
      return res.status(500).json({ error: 'Failed to fetch original recipe' });
    }
    
    // Get pantry items
    const pantryQuery = 'SELECT name, quantity, unit FROM pantry_items WHERE quantity > 0';
    
    db.all(pantryQuery, [], (err, pantryItems) => {
      if (err) {
        console.error('Error fetching pantry items:', err);
        return res.status(500).json({ error: 'Failed to fetch pantry items' });
      }
      
      // Get all other recipes
      const recipesQuery = `
        SELECT r.*, ri.ingredient_name, ri.quantity as req_quantity, ri.unit as req_unit, ri.optional
        FROM recipes r
        LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        WHERE r.id != ?
        ORDER BY r.id
      `;
      
      db.all(recipesQuery, [recipeId], (err, recipeData) => {
        if (err) {
          console.error('Error fetching recipes:', err);
          return res.status(500).json({ error: 'Failed to fetch recipes' });
        }
        
        // Group ingredients by recipe and find alternatives
        const recipes = {};
        recipeData.forEach(row => {
          if (!recipes[row.id]) {
            recipes[row.id] = {
              id: row.id,
              title: row.title,
              description: row.description,
              prep_time: row.prep_time,
              cook_time: row.cook_time,
              servings: row.servings,
              difficulty: row.difficulty,
              rating: row.rating,
              ingredients: []
            };
          }
          
          if (row.ingredient_name) {
            recipes[row.id].ingredients.push({
              name: row.ingredient_name,
              quantity: row.req_quantity,
              unit: row.req_unit,
              optional: row.optional
            });
          }
        });
        
        // Find recipes that share ingredients with the original
        const alternatives = Object.values(recipes)
          .map(recipe => {
            const sharedIngredients = recipe.ingredients.filter(ingredient =>
              originalIngredients.some(orig => 
                normalizeIngredientName(orig.ingredient_name) === normalizeIngredientName(ingredient.name)
              )
            );
            
            const score = calculateRecipeScore(recipe, pantryItems);
            
            return {
              ...recipe,
              sharedIngredients: sharedIngredients.length,
              sharedPercentage: Math.round((sharedIngredients.length / originalIngredients.length) * 100),
              matchScore: score.matchScore,
              matchPercentage: score.matchPercentage
            };
          })
          .filter(recipe => recipe.sharedIngredients > 0)
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, parseInt(limit));
        
        res.json({
          originalRecipeId: parseInt(recipeId),
          alternatives
        });
      });
    });
  });
});

module.exports = router;
