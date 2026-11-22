const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === 'production';
// Comma-separated list of allowed browser origins (only needed when the client is hosted separately)
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

// Security middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const pantryRoutes = require('./routes/pantry');
const recipeRoutes = require('./routes/recipes');
const recommendationRoutes = require('./routes/recommendations');
const importRoutes = require('./routes/import');

// Routes
app.use('/api/pantry', pantryRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/import', importRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Cook Smart API is running' });
});

// In production, serve the built React client from the same server
if (isProduction) {
  const clientBuild = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(clientBuild));
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const { initializeDatabase } = require('./database/init');

// Load the bundled sample recipes on first run so a fresh deploy isn't empty
async function seedRecipesIfEmpty() {
  const { getDatabase } = require('./database/init');
  const db = getDatabase();
  const row = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) AS count FROM recipes', (err, r) => (err ? reject(err) : resolve(r)));
  });
  if (row.count > 0) return;
  const JsonRecipeImporter = require('./services/jsonRecipeImporter');
  const results = await new JsonRecipeImporter().importFromDirectory(path.join(__dirname, 'recipes'));
  console.log(`Seeded ${results.imported} sample recipes`);
}

async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    await seedRecipesIfEmpty();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
