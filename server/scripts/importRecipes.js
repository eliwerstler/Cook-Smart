#!/usr/bin/env node

/**
 * Recipe Import Script
 * 
 * This script imports recipes from various sources:
 * - TheMealDB API
 * - Local JSON files
 * - Future: Spoonacular, Edamam, etc.
 * 
 * Usage:
 *   node scripts/importRecipes.js [options]
 * 
 * Options:
 *   --source <name>    Import from specific source (themealdb, json, all)
 *   --limit <number>   Limit number of recipes per category
 *   --categories <cat> Specific categories to import (comma-separated)
 *   --quality <score>  Minimum quality score (0-100)
 */

const path = require('path');
const fs = require('fs');
const MealDbImporter = require('../services/mealDbImporter');
const JsonRecipeImporter = require('../services/jsonRecipeImporter');
const { getDatabase } = require('../database/init');

class RecipeImportManager {
  constructor() {
    this.mealDbImporter = new MealDbImporter();
    this.jsonImporter = new JsonRecipeImporter();
    this.db = getDatabase();
    this.stats = {
      totalAttempted: 0,
      totalImported: 0,
      totalSkipped: 0,
      totalFailed: 0,
      bySource: {},
      byQuality: { high: 0, medium: 0, low: 0 }
    };
  }

  async importFromMealDB(options = {}) {
    const defaultCategories = [
      'Beef', 'Chicken', 'Dessert', 'Lamb', 'Miscellaneous',
      'Pasta', 'Pork', 'Seafood', 'Side', 'Starter',
      'Vegan', 'Vegetarian', 'Breakfast', 'Goat'
    ];
    
    const {
      limit = 10,
      categories = defaultCategories
    } = options;

    const categoriesToUse = categories || defaultCategories;

    console.log('\n🌐 Importing from TheMealDB...');
    console.log(`Categories: ${categoriesToUse.join(', ')}`);
    console.log(`Limit per category: ${limit}\n`);

    let totalImported = 0;
    let totalAttempted = 0;

    for (const category of categoriesToUse) {
      try {
        console.log(`\n📂 Processing category: ${category}`);
        const count = await this.mealDbImporter.importRecipesByCategory(category, limit);
        totalImported += count;
        totalAttempted += limit;
        
        // Add a small delay to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error importing ${category}:`, error.message);
      }
    }

    this.stats.bySource.themealdb = totalImported;
    console.log(`\n✅ TheMealDB: Imported ${totalImported} out of ${totalAttempted} attempted recipes`);
    
    return { imported: totalImported, attempted: totalAttempted };
  }

  async importFromJSON(options = {}) {
    const { recipesDir = path.join(__dirname, '../recipes') } = options;

    console.log('\n📁 Importing from JSON files...');
    console.log(`Directory: ${recipesDir}\n`);

    const results = await this.jsonImporter.importFromDirectory(recipesDir);

    this.stats.bySource.json = results.imported;
    console.log(`\n✅ JSON: Imported ${results.imported} recipes`);
    
    if (results.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      results.errors.forEach(err => console.log(`  - ${err}`));
    }

    return results;
  }

  async importRandomRecipes(count = 20) {
    console.log(`\n🎲 Importing ${count} random recipes from TheMealDB...`);
    
    const imported = await this.mealDbImporter.importRandomRecipes(count);
    
    this.stats.bySource.random = imported;
    console.log(`\n✅ Random: Imported ${imported} recipes`);
    
    return imported;
  }

  async getQualityStats() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT 
          COUNT(*) as total,
          AVG(quality_score) as avg_score,
          MIN(quality_score) as min_score,
          MAX(quality_score) as max_score,
          SUM(CASE WHEN quality_score >= 80 THEN 1 ELSE 0 END) as high_quality,
          SUM(CASE WHEN quality_score >= 60 AND quality_score < 80 THEN 1 ELSE 0 END) as medium_quality,
          SUM(CASE WHEN quality_score < 60 THEN 1 ELSE 0 END) as low_quality
        FROM recipes
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0]);
      });
    });
  }

  async getSourceBreakdown() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT 
          source_type,
          COUNT(*) as count,
          AVG(quality_score) as avg_quality
        FROM recipes
        WHERE source_type IS NOT NULL
        GROUP BY source_type
        ORDER BY count DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async printFinalReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));

    const qualityStats = await this.getQualityStats();
    const sourceBreakdown = await this.getSourceBreakdown();

    console.log('\n📈 Overall Statistics:');
    console.log(`  Total Recipes: ${qualityStats.total}`);
    console.log(`  Average Quality Score: ${qualityStats.avg_score?.toFixed(1) || 'N/A'}`);
    console.log(`  Quality Range: ${qualityStats.min_score?.toFixed(1) || 'N/A'} - ${qualityStats.max_score?.toFixed(1) || 'N/A'}`);

    console.log('\n🎯 Quality Distribution:');
    console.log(`  High (80-100): ${qualityStats.high_quality} recipes`);
    console.log(`  Medium (60-79): ${qualityStats.medium_quality} recipes`);
    console.log(`  Low (0-59): ${qualityStats.low_quality} recipes`);

    console.log('\n📦 By Source:');
    if (sourceBreakdown.length > 0) {
      sourceBreakdown.forEach(source => {
        console.log(`  ${source.source_type}: ${source.count} recipes (avg quality: ${source.avg_quality?.toFixed(1)})`);
      });
    } else {
      console.log('  No sources found');
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  async importAll(options = {}) {
    const startTime = Date.now();
    
    console.log('🚀 Starting comprehensive recipe import...\n');

    try {
      // Import from JSON files first (curated high-quality recipes)
      await this.importFromJSON(options);

      // Import from TheMealDB
      await this.importFromMealDB({
        limit: options.mealDbLimit || 15,
        categories: options.categories
      });

      // Optionally import random recipes for variety
      if (options.includeRandom) {
        await this.importRandomRecipes(options.randomCount || 25);
      }

      // Print final report
      await this.printFinalReport();

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✨ Import completed in ${duration} seconds\n`);

    } catch (error) {
      console.error('\n❌ Import failed:', error);
      throw error;
    }
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    source: 'all',
    mealDbLimit: 15,
    randomCount: 25,
    includeRandom: false,
    categories: null
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--source':
        options.source = args[++i];
        break;
      case '--limit':
        options.mealDbLimit = parseInt(args[++i]);
        break;
      case '--random':
        options.includeRandom = true;
        options.randomCount = parseInt(args[++i]) || 25;
        break;
      case '--categories':
        options.categories = args[++i].split(',');
        break;
      case '--help':
        console.log(`
Recipe Import Script

Usage: node scripts/importRecipes.js [options]

Options:
  --source <name>       Import from specific source (themealdb, json, all)
  --limit <number>      Limit recipes per category (default: 15)
  --random <number>     Include N random recipes
  --categories <list>   Comma-separated list of categories
  --help                Show this help message

Examples:
  node scripts/importRecipes.js
  node scripts/importRecipes.js --source themealdb --limit 20
  node scripts/importRecipes.js --source json
  node scripts/importRecipes.js --random 50
  node scripts/importRecipes.js --categories Beef,Chicken,Seafood --limit 10
        `);
        process.exit(0);
    }
  }

  return options;
}

// Main execution
async function main() {
  const options = parseArgs();
  const manager = new RecipeImportManager();

  try {
    if (options.source === 'all') {
      await manager.importAll(options);
    } else if (options.source === 'themealdb') {
      await manager.importFromMealDB(options);
      await manager.printFinalReport();
    } else if (options.source === 'json') {
      await manager.importFromJSON(options);
      await manager.printFinalReport();
    } else if (options.source === 'random') {
      await manager.importRandomRecipes(options.randomCount);
      await manager.printFinalReport();
    } else {
      console.error(`Unknown source: ${options.source}`);
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = RecipeImportManager;

