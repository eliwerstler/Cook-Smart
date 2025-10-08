#!/usr/bin/env node

/**
 * Spoonacular Recipe Import Script
 * 
 * Usage:
 *   node scripts/importSpoonacular.js [options]
 * 
 * Options:
 *   --count <number>      Number of recipes to import (default: 50)
 *   --cuisine <name>      Filter by cuisine (italian, mexican, asian, etc.)
 *   --diet <name>         Filter by diet (vegetarian, vegan, paleo, etc.)
 *   --help                Show this help message
 * 
 * Setup:
 *   1. Get free API key from https://spoonacular.com/food-api
 *   2. Set environment variable: export SPOONACULAR_API_KEY="your_key"
 *   3. Or add to .env file: SPOONACULAR_API_KEY=your_key
 */

const SpoonacularImporter = require('../services/spoonacularImporter');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    count: 50,
    cuisine: null,
    diet: null
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--count':
        options.count = parseInt(args[++i]) || 50;
        break;
      case '--cuisine':
        options.cuisine = args[++i];
        break;
      case '--diet':
        options.diet = args[++i];
        break;
      case '--help':
        console.log(`
Spoonacular Recipe Import Script

Usage: node scripts/importSpoonacular.js [options]

Options:
  --count <number>      Number of recipes to import (default: 50)
  --cuisine <name>      Filter by cuisine
  --diet <name>         Filter by diet
  --help                Show this help message

Cuisines:
  african, american, british, cajun, caribbean, chinese, eastern european,
  european, french, german, greek, indian, irish, italian, japanese, jewish,
  korean, latin american, mediterranean, mexican, middle eastern, nordic,
  southern, spanish, thai, vietnamese

Diets:
  gluten free, ketogenic, vegetarian, lacto-vegetarian, ovo-vegetarian,
  vegan, pescetarian, paleo, primal, low fodmap, whole30

Examples:
  node scripts/importSpoonacular.js --count 100
  node scripts/importSpoonacular.js --cuisine italian --count 50
  node scripts/importSpoonacular.js --diet vegetarian --count 30

Setup:
  1. Get free API key: https://spoonacular.com/food-api
  2. Free tier: 150 requests/day
  3. Set environment variable:
     export SPOONACULAR_API_KEY="your_key_here"
        `);
        process.exit(0);
    }
  }

  return options;
}

async function main() {
  console.log('🥄 Spoonacular Recipe Importer\n');

  // Check for API key
  const apiKey = process.env.SPOONACULAR_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Error: SPOONACULAR_API_KEY not set\n');
    console.log('Setup instructions:');
    console.log('1. Get free API key from: https://spoonacular.com/food-api');
    console.log('2. Set environment variable:');
    console.log('   export SPOONACULAR_API_KEY="your_key_here"');
    console.log('\nOr add to server/.env file:');
    console.log('   SPOONACULAR_API_KEY=your_key_here\n');
    process.exit(1);
  }

  const options = parseArgs();
  const importer = new SpoonacularImporter(apiKey);

  console.log('Configuration:');
  console.log(`  Count: ${options.count}`);
  if (options.cuisine) console.log(`  Cuisine: ${options.cuisine}`);
  if (options.diet) console.log(`  Diet: ${options.diet}`);
  console.log('');

  try {
    const startTime = Date.now();

    let results;
    if (options.cuisine) {
      results = await importer.importByCuisine(options.cuisine, options.count);
    } else if (options.diet) {
      results = await importer.importByDiet(options.diet, options.count);
    } else {
      results = await importer.importRandomRecipes(options.count);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Duration: ${duration}s`);
    console.log(`  Attempted: ${results.attempted}`);
    console.log(`  Imported: ${results.imported}`);
    console.log(`  Skipped: ${results.skipped}`);
    console.log(`  Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0 && results.errors.length <= 5) {
      console.log('\n  Error details:');
      results.errors.forEach(err => console.log(`    - ${err}`));
    }

    console.log('='.repeat(60) + '\n');

    // Get updated stats
    const { getDatabase } = require('../database/init');
    const db = getDatabase();

    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total,
          ROUND(AVG(quality_score), 1) as avg_quality,
          SUM(CASE WHEN source_type = 'spoonacular' THEN 1 ELSE 0 END) as spoonacular_count
        FROM recipes
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    console.log('📚 Database Statistics:');
    console.log(`  Total Recipes: ${stats.total}`);
    console.log(`  From Spoonacular: ${stats.spoonacular_count}`);
    console.log(`  Average Quality: ${stats.avg_quality}/100`);
    console.log('');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
