#!/usr/bin/env node

/**
 * Database Migration Script
 * Adds new columns to the recipes table for quality tracking and source management
 */

const { getDatabase } = require('../database/init');

async function migrateDatabase() {
  const db = getDatabase();
  
  console.log('🔄 Starting database migration...\n');
  
  try {
    // Check current schema
    const schema = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(recipes)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const existingColumns = schema.map(col => col.name);
    console.log('Current columns:', existingColumns.join(', '));
    
    // Define new columns to add
    const newColumns = [
      { name: 'source_type', definition: 'TEXT DEFAULT \'manual\'' },
      { name: 'quality_score', definition: 'REAL DEFAULT 0.0' },
      { name: 'last_validated', definition: 'DATETIME' },
      { name: 'validation_errors', definition: 'TEXT' }
    ];
    
    // Add each column if it doesn't exist
    for (const column of newColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`\n➕ Adding column: ${column.name}`);
        
        await new Promise((resolve, reject) => {
          db.run(`ALTER TABLE recipes ADD COLUMN ${column.name} ${column.definition}`, (err) => {
            if (err) {
              console.error(`  ❌ Error: ${err.message}`);
              reject(err);
            } else {
              console.log(`  ✅ Successfully added ${column.name}`);
              resolve();
            }
          });
        });
      } else {
        console.log(`\n⏭️  Column ${column.name} already exists, skipping...`);
      }
    }
    
    // Update existing recipes to have default quality scores
    console.log('\n📊 Calculating quality scores for existing recipes...');
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE recipes 
        SET quality_score = 70.0,
            last_validated = CURRENT_TIMESTAMP
        WHERE quality_score IS NULL OR quality_score = 0
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('  ✅ Updated quality scores for existing recipes');
    
    // Verify migration
    const newSchema = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(recipes)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('\n✨ Migration completed successfully!');
    console.log('New schema columns:', newSchema.map(col => col.name).join(', '));
    
    // Get recipe count
    const count = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM recipes", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log(`\n📚 Total recipes in database: ${count}`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('\n✅ Migration script completed\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = migrateDatabase;

