const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure database directory exists
const dbDir = path.dirname(config.DATABASE_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(config.DATABASE_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create pantry_items table
      db.run(`
        CREATE TABLE IF NOT EXISTS pantry_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          quantity REAL NOT NULL DEFAULT 0,
          unit TEXT NOT NULL DEFAULT 'pieces',
          expiration_date TEXT,
          purchase_date TEXT DEFAULT (datetime('now')),
          notes TEXT,
          dietary_tags TEXT,
          allergens TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create categories table
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          color TEXT DEFAULT '#3B82F6',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create recipes table
      db.run(`
        CREATE TABLE IF NOT EXISTS recipes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          instructions TEXT NOT NULL,
          prep_time INTEGER DEFAULT 0,
          cook_time INTEGER DEFAULT 0,
          servings INTEGER DEFAULT 1,
          difficulty TEXT DEFAULT 'easy',
          image_url TEXT,
          source_url TEXT,
          rating REAL DEFAULT 0,
          tags TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create recipe_ingredients table
      db.run(`
        CREATE TABLE IF NOT EXISTS recipe_ingredients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipe_id INTEGER NOT NULL,
          ingredient_name TEXT NOT NULL,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          optional BOOLEAN DEFAULT 0,
          FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
        )
      `);

      // Create user_preferences table (for future user system)
      db.run(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dietary_restrictions TEXT,
          allergies TEXT,
          disliked_ingredients TEXT,
          preferred_cuisines TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default categories
      const defaultCategories = [
        'Fruits', 'Vegetables', 'Meat & Poultry', 'Seafood', 'Dairy & Eggs',
        'Grains & Pasta', 'Baking', 'Spices & Herbs', 'Condiments & Sauces',
        'Frozen Foods', 'Canned Goods', 'Beverages', 'Snacks', 'Other'
      ];

      const stmt = db.prepare(`
        INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)
      `);

      const categoryColors = [
        '#EF4444', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6',
        '#F97316', '#EC4899', '#06B6D4', '#84CC16', '#6366F1',
        '#F43F5E', '#14B8A6', '#F59E0B', '#6B7280'
      ];

      defaultCategories.forEach((category, index) => {
        stmt.run(category, categoryColors[index] || '#6B7280');
      });

      stmt.finalize();

      // Insert sample recipes
      insertSampleRecipes();

      console.log('Database tables created successfully');
      resolve();
    });

    db.on('error', (err) => {
      console.error('Database error:', err);
      reject(err);
    });
  });
};

const insertSampleRecipes = () => {
  const sampleRecipes = [
    {
      title: 'Spaghetti Carbonara',
      description: 'Classic Italian pasta dish with eggs, cheese, and pancetta',
      instructions: '1. Cook pasta according to package directions\n2. Cook pancetta until crispy\n3. Beat eggs with cheese\n4. Combine hot pasta with pancetta, then egg mixture\n5. Serve immediately',
      prep_time: 10,
      cook_time: 15,
      servings: 4,
      difficulty: 'medium',
      tags: 'italian,pasta,quick',
      ingredients: [
        { name: 'spaghetti', quantity: 400, unit: 'g' },
        { name: 'eggs', quantity: 3, unit: 'pieces' },
        { name: 'parmesan cheese', quantity: 100, unit: 'g' },
        { name: 'pancetta', quantity: 150, unit: 'g' },
        { name: 'black pepper', quantity: 1, unit: 'tsp' }
      ]
    },
    {
      title: 'Chicken Stir Fry',
      description: 'Quick and healthy chicken stir fry with vegetables',
      instructions: '1. Cut chicken into strips\n2. Heat oil in wok or large pan\n3. Cook chicken until golden\n4. Add vegetables and stir fry\n5. Add sauce and cook until vegetables are tender',
      prep_time: 15,
      cook_time: 10,
      servings: 4,
      difficulty: 'easy',
      tags: 'asian,chicken,healthy',
      ingredients: [
        { name: 'chicken breast', quantity: 500, unit: 'g' },
        { name: 'bell peppers', quantity: 2, unit: 'pieces' },
        { name: 'broccoli', quantity: 200, unit: 'g' },
        { name: 'soy sauce', quantity: 3, unit: 'tbsp' },
        { name: 'garlic', quantity: 3, unit: 'cloves' },
        { name: 'ginger', quantity: 1, unit: 'tbsp' }
      ]
    },
    {
      title: 'Vegetarian Chili',
      description: 'Hearty vegetarian chili with beans and vegetables',
      instructions: '1. Sauté onions and garlic\n2. Add spices and cook until fragrant\n3. Add vegetables and cook until soft\n4. Add beans and tomatoes\n5. Simmer for 30 minutes',
      prep_time: 20,
      cook_time: 45,
      servings: 6,
      difficulty: 'easy',
      tags: 'vegetarian,healthy,comfort food',
      ingredients: [
        { name: 'black beans', quantity: 400, unit: 'g' },
        { name: 'kidney beans', quantity: 400, unit: 'g' },
        { name: 'diced tomatoes', quantity: 400, unit: 'g' },
        { name: 'onions', quantity: 2, unit: 'pieces' },
        { name: 'bell peppers', quantity: 2, unit: 'pieces' },
        { name: 'chili powder', quantity: 2, unit: 'tbsp' },
        { name: 'cumin', quantity: 1, unit: 'tsp' }
      ]
    }
  ];

  // Check if recipes already exist to avoid duplicates
  db.get('SELECT COUNT(*) as count FROM recipes', (err, row) => {
    if (err || row.count > 0) {
      return; // Skip insertion if error or recipes already exist
    }

    const recipeStmt = db.prepare(`
      INSERT OR IGNORE INTO recipes (title, description, instructions, prep_time, cook_time, servings, difficulty, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const ingredientStmt = db.prepare(`
      INSERT OR IGNORE INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit)
      VALUES (?, ?, ?, ?)
    `);

    let completed = 0;
    const total = sampleRecipes.length;

    sampleRecipes.forEach((recipe) => {
      recipeStmt.run(
        recipe.title,
        recipe.description,
        recipe.instructions,
        recipe.prep_time,
        recipe.cook_time,
        recipe.servings,
        recipe.difficulty,
        recipe.tags,
        function(err) {
          if (err) {
            console.error('Error inserting recipe:', err);
          } else {
            const recipeId = this.lastID;
            recipe.ingredients.forEach((ingredient) => {
              ingredientStmt.run(
                recipeId,
                ingredient.name,
                ingredient.quantity,
                ingredient.unit
              );
            });
          }

          completed++;
          if (completed === total) {
            recipeStmt.finalize();
            ingredientStmt.finalize();
          }
        }
      );
    });
  });
};

const getDatabase = () => db;

module.exports = {
  initializeDatabase,
  getDatabase
};
