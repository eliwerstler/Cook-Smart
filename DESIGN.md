# Cook Smart - Design Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Frontend Design](#frontend-design)
4. [Backend Design](#backend-design)
5. [Database Schema](#database-schema)
6. [API Design](#api-design)
7. [Data Flow](#data-flow)
8. [Key Algorithms](#key-algorithms)

---

## Architecture Overview

Cook Smart follows a **client-server architecture** with clear separation between the frontend and backend:

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  React 18 + TypeScript + Tailwind CSS (Port 3000)          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    HTTP/REST API
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                       Server Layer                           │
│         Node.js + Express.js (Port 5000/5001)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                      SQL Queries
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                     Database Layer                           │
│                   SQLite Database                            │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles
- **Separation of Concerns**: Frontend, backend, and database are loosely coupled
- **RESTful API**: Clean, predictable API endpoints
- **Component-Based UI**: Reusable React components
- **Type Safety**: TypeScript for frontend type checking
- **Security**: CORS, rate limiting, and helmet middleware
- **Scalable Recipe Management**: External recipe sources with quality validation
- **Ingredient Standardization**: Automatic normalization and unit conversion

---

## Project Structure

```
Cook-Smart/
├── client/                      # React frontend application
│   ├── public/                  # Static assets
│   │   ├── index.html          # HTML template
│   │   ├── favicon.ico         # App icon
│   │   └── manifest.json       # PWA manifest
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Dashboard.tsx       # Main dashboard view
│   │   │   ├── Navbar.tsx          # Navigation bar
│   │   │   ├── Pantry.tsx          # Pantry management
│   │   │   ├── Recipes.tsx         # Recipe browser
│   │   │   ├── Recommendations.tsx # Recipe recommendations
│   │   │   ├── RecipeDetail.tsx    # Single recipe view
│   │   │   ├── AddItemModal.tsx    # Add pantry item modal
│   │   │   ├── BulkImportModal.tsx # Bulk import modal
│   │   │   └── DataImport.tsx      # Data import component
│   │   ├── services/           # API and utility services
│   │   │   ├── api.ts              # Axios API client
│   │   │   └── ingredientRecognition.ts  # Ingredient parsing
│   │   ├── App.tsx             # Main application component
│   │   ├── index.tsx           # Application entry point
│   │   └── index.css           # Global styles (Tailwind)
│   ├── package.json            # Frontend dependencies
│   └── tailwind.config.js      # Tailwind CSS configuration
│
├── server/                      # Node.js backend application
│   ├── database/               # Database layer
│   │   ├── init.js                 # Database initialization & schema
│   │   └── cooksmart.db            # SQLite database file (gitignored)
│   ├── routes/                 # API route handlers
│   │   ├── pantry.js               # Pantry CRUD operations
│   │   ├── recipes.js              # Recipe CRUD operations
│   │   ├── recommendations.js      # Recommendation algorithms
│   │   └── import.js               # Data import routes
│   ├── services/               # Business logic services
│   │   └── mealDbImporter.js       # TheMealDB API integration
│   ├── config.js               # Server configuration
│   ├── index.js                # Server entry point
│   └── package.json            # Backend dependencies
│
├── package.json                 # Root package scripts
├── .gitignore                  # Git ignore rules
├── README.md                   # Project documentation
├── DESIGN.md                   # This file
├── start.sh                    # Startup script
└── stop-dev.sh                 # Shutdown script
```

---

## Frontend Design

### Component Hierarchy

```
App (Router)
├── Navbar
└── Routes
    ├── Dashboard
    │   ├── Stats Cards
    │   ├── Expiring Items List
    │   └── Top Recommendations
    ├── Pantry
    │   ├── Search/Filter Bar
    │   ├── Item Grid
    │   └── AddItemModal
    ├── Recipes
    │   ├── Search/Filter Bar
    │   ├── Recipe Grid
    │   └── RecipeDetail
    ├── Recommendations
    │   ├── Match Mode Toggle
    │   ├── Recipe Cards (with match %)
    │   └── Missing Ingredients
    └── DataImport
        └── BulkImportModal
```

### Key Components

#### 1. **Dashboard.tsx**
- **Purpose**: Main landing page showing overview statistics
- **Features**:
  - Total items count
  - Items expiring soon (< 7 days)
  - Low stock items (quantity < 5)
  - Top recipe recommendations
- **State**: Pantry stats, expiring items, recommendations
- **API Calls**: `/api/pantry/stats`, `/api/recommendations/recipes`

#### 2. **Pantry.tsx**
- **Purpose**: Manage pantry inventory
- **Features**:
  - Add/Edit/Delete items
  - Search and filter by category
  - Sort by expiration date, name, etc.
  - Visual category tags with colors
- **State**: Pantry items, categories, search/filter values
- **API Calls**: `/api/pantry/items`, `/api/pantry/categories`

#### 3. **Recipes.tsx**
- **Purpose**: Browse all available recipes
- **Features**:
  - Search by title/description
  - Filter by difficulty
  - Paginated results
  - Recipe cards with images
- **State**: Recipes list, search/filter criteria
- **API Calls**: `/api/recipes`

#### 4. **Recommendations.tsx**
- **Purpose**: Show personalized recipe recommendations
- **Features**:
  - Strict vs. Flexible matching modes
  - Match percentage display
  - Missing ingredients list
  - Alternative recipe suggestions
- **State**: Recommendations, match mode
- **API Calls**: `/api/recommendations/recipes`, `/api/recommendations/suggestions/:id`

#### 5. **RecipeDetail.tsx**
- **Purpose**: Display full recipe information
- **Features**:
  - Complete ingredient list
  - Step-by-step instructions
  - Prep/cook time, difficulty, servings
  - Match percentage (if from recommendations)
- **State**: Recipe details, user rating
- **API Calls**: `/api/recipes/:id`, `/api/recipes/:id/rate`

### Service Layer

#### api.ts
```typescript
- Base Axios configuration
- API endpoint definitions
- Request/response interceptors
- Error handling
```

#### ingredientRecognition.ts
```typescript
- Parse ingredient text into structured data
- Extract quantity, unit, and name
- Fuzzy matching for ingredient names
```

### Styling Approach
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Color Scheme**: 
  - Primary: Blue tones
  - Success: Green
  - Warning: Yellow/Orange
  - Danger: Red
- **Component Patterns**: Cards, modals, forms, buttons

---

## Backend Design

### Server Architecture

```
index.js (Entry Point)
├── Middleware Stack
│   ├── Helmet (Security headers)
│   ├── CORS (Cross-origin requests)
│   ├── Rate Limiter (100 req/15min)
│   └── Body Parser (JSON/URL-encoded)
├── Routes
│   ├── /api/pantry → pantry.js
│   ├── /api/recipes → recipes.js
│   ├── /api/recommendations → recommendations.js
│   └── /api/import → import.js
└── Error Handlers
    ├── Custom error handler
    └── 404 handler
```

### Route Handlers

#### 1. **pantry.js**
Manages pantry inventory operations:

- `GET /api/pantry/items` - Get all pantry items
- `POST /api/pantry/items` - Add new pantry item
- `PUT /api/pantry/items/:id` - Update pantry item
- `DELETE /api/pantry/items/:id` - Delete pantry item
- `GET /api/pantry/categories` - Get all categories
- `GET /api/pantry/stats` - Get pantry statistics

**Key Logic**:
- Input validation for required fields
- Date parsing and validation
- Category existence checking
- Expiration tracking calculations

#### 2. **recipes.js**
Handles recipe data management:

- `GET /api/recipes` - Get recipes (with search/filter)
- `GET /api/recipes/:id` - Get single recipe with ingredients
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `POST /api/recipes/:id/rate` - Rate a recipe

**Key Logic**:
- Search functionality (title, description, tags)
- Difficulty filtering
- Join operations for recipe ingredients
- Rating calculations and updates

#### 3. **recommendations.js**
Smart recipe recommendation engine:

- `GET /api/recommendations/recipes` - Get recommended recipes
- `GET /api/recommendations/suggestions/:recipeId` - Get missing ingredients
- `GET /api/recommendations/alternatives/:recipeId` - Get similar recipes

**Key Logic** (See Algorithms section):
- Ingredient matching algorithm
- Match score calculation
- Strict vs. flexible matching
- Ingredient substitution suggestions

#### 4. **import.js**
Data import from external sources:

- `POST /api/import/mealdb/sample` - Import sample data
- `POST /api/import/mealdb/random` - Import random recipes
- `POST /api/import/mealdb/category/:category` - Import by category
- `POST /api/import/mealdb/categories` - Import categories
- `GET /api/import/status` - Get import statistics

### Services

#### mealDbImporter.js
Integration with TheMealDB API:

**Methods**:
- `importCategories()` - Fetch and store meal categories
- `importRecipesByCategory(category, limit)` - Import recipes by category
- `importRecipeDetails(mealId)` - Import single recipe
- `importSampleData()` - Import curated sample dataset
- `importRandomRecipes(count)` - Import random recipes
- `parseIngredients(meal)` - Parse TheMealDB ingredient format
- `estimateCookingTimes(category, ingredientCount)` - Estimate prep/cook times
- `getDifficulty(instructions, ingredientCount)` - Calculate difficulty level

**Key Features**:
- Duplicate detection (by title and source URL)
- Ingredient parsing and unit normalization
- Automatic difficulty classification
- Batch import with error handling

---

## Database Schema

### Tables

#### 1. **categories**
Stores pantry item categories with visual styling.

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Default Categories**:
- Fruits, Vegetables, Grains, Meat & Poultry, Seafood
- Dairy & Eggs, Condiments & Sauces, Spices & Herbs
- Canned & Jarred, Frozen, Beverages, Snacks, Other

#### 2. **pantry_items**
Stores user's pantry inventory.

```sql
CREATE TABLE pantry_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER,
  quantity REAL DEFAULT 1,
  unit TEXT,
  purchase_date DATE,
  expiration_date DATE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
)
```

**Key Fields**:
- `quantity` & `unit`: Track amounts (e.g., 2 cups, 500g)
- `expiration_date`: Used for expiration alerts
- `notes`: Additional user notes

#### 3. **recipes**
Stores recipe information.

```sql
CREATE TABLE recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  prep_time INTEGER,           -- minutes
  cook_time INTEGER,            -- minutes
  servings INTEGER DEFAULT 4,
  difficulty TEXT DEFAULT 'medium',  -- easy, medium, hard
  image_url TEXT,
  source_url TEXT,
  tags TEXT,
  rating REAL DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### 4. **recipe_ingredients**
Links recipes to their ingredients (many-to-many relationship).

```sql
CREATE TABLE recipe_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL,
  ingredient_name TEXT NOT NULL,
  quantity REAL,
  unit TEXT,
  notes TEXT,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
)
```

**Design Decision**: Ingredients are stored as text (not normalized) for flexibility with TheMealDB imports and ingredient variations.

#### 5. **user_preferences**
Stores user dietary preferences (future feature).

```sql
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT 1,
  preference_type TEXT NOT NULL,
  preference_value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Database Indexes

```sql
-- Performance optimization for common queries
CREATE INDEX idx_pantry_category ON pantry_items(category_id);
CREATE INDEX idx_pantry_expiration ON pantry_items(expiration_date);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
```

---

## API Design

### RESTful Conventions

- **GET**: Retrieve resources
- **POST**: Create new resources
- **PUT**: Update existing resources
- **DELETE**: Remove resources

### Response Format

**Success Response**:
```json
{
  "success": true,
  "data": { /* resource data */ },
  "message": "Optional success message"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details"
}
```

### Pagination (Recipes)
```
GET /api/recipes?page=1&limit=20
```

### Search & Filter (Recipes)
```
GET /api/recipes?search=chicken&difficulty=easy
```

### Authentication
Currently: No authentication (single-user application)
Future: JWT-based authentication for multi-user support

---

## Data Flow

### Adding a Pantry Item

```
User Input (AddItemModal)
    ↓
Form Validation
    ↓
POST /api/pantry/items
    ↓
Backend Validation
    ↓
INSERT INTO pantry_items
    ↓
Return Created Item
    ↓
Update UI (Re-fetch items)
```

### Getting Recipe Recommendations

```
User Navigates to Recommendations
    ↓
GET /api/pantry/items (fetch user's pantry)
    ↓
GET /api/recommendations/recipes?mode=flexible
    ↓
Backend: Fetch all recipes with ingredients
    ↓
For each recipe:
    - Count matching ingredients
    - Calculate match percentage
    - Identify missing ingredients
    ↓
Sort by match percentage (DESC)
    ↓
Return top recommendations
    ↓
Display in UI with match scores
```

### Importing Recipes from TheMealDB

```
POST /api/import/mealdb/random (count=100)
    ↓
MealDbImporter Service
    ↓
Loop N times:
    - GET https://themealdb.com/api/json/v1/1/random.php
    - Check if recipe exists (by title/URL)
    - Parse ingredients and measurements
    - Estimate cooking times and difficulty
    - INSERT INTO recipes
    - INSERT INTO recipe_ingredients (bulk)
    ↓
Return import statistics
```

---

## Key Algorithms

### 1. Recipe Recommendation Algorithm

**Objective**: Match recipes to user's pantry items with ingredient standardization and unit conversion

**Algorithm**:
```javascript
function recommendRecipes(pantryItems, matchMode) {
  const recipes = getAllRecipesWithIngredients();
  const recommendations = [];
  
  for (const recipe of recipes) {
    const recipeIngredients = recipe.ingredients;
    let matchCount = 0;
    const missingIngredients = [];
    
    for (const recipeIng of recipeIngredients) {
      // Standardize ingredient name
      const normalizedRecipeIngredient = ingredientNormalizer.normalize(recipeIng.name);
      
      // Find matching pantry item with standardized names
      const found = pantryItems.find(pantryItem => {
        const normalizedPantryIngredient = ingredientNormalizer.normalize(pantryItem.name);
        
        if (normalizedPantryIngredient === normalizedRecipeIngredient) {
          // Check quantity sufficiency with unit conversion
          return unitConverter.checkSufficientQuantity(
            { quantity: pantryItem.quantity, unit: pantryItem.unit },
            { quantity: recipeIng.quantity, unit: recipeIng.unit },
            normalizedRecipeIngredient
          ).sufficient;
        }
        return false;
      });
      
      if (found) {
        matchCount++;
      } else {
        missingIngredients.push(recipeIng);
      }
    }
    
    const matchPercentage = (matchCount / recipeIngredients.length) * 100;
    
    // Strict mode: Only recommend if 100% match
    // Flexible mode: Recommend if >= 50% match
    const threshold = matchMode === 'strict' ? 100 : 50;
    
    if (matchPercentage >= threshold) {
      recommendations.push({
        ...recipe,
        matchPercentage,
        matchCount,
        totalIngredients: recipeIngredients.length,
        missingIngredients
      });
    }
  }
  
  // Sort by match percentage (descending)
  return recommendations.sort((a, b) => 
    b.matchPercentage - a.matchPercentage
  );
}
```

**Key Improvements**:
- **Ingredient Standardization**: Uses `ingredientNormalizer` to match "cherry tomatoes" with "tomato"
- **Unit Conversion**: Automatically converts between units (cups, grams, ml, etc.)
- **Quantity Checking**: Verifies sufficient quantities after unit conversion

### 2. Ingredient Standardization Algorithm

**Objective**: Normalize ingredient names and units across recipes and pantry items

**Ingredient Normalization**:
```javascript
function normalizeIngredient(ingredientName) {
  // Apply standard mappings (cherry tomato → tomato)
  const standardMappings = {
    'cherry tomato': 'tomato',
    'beef mince': 'ground beef',
    'minced beef': 'ground beef'
  };
  
  // Normalize case and remove plurals
  let normalized = ingredientName.toLowerCase()
    .replace(/s$/, '') // Remove trailing 's'
    .trim();
  
  // Apply standard mappings
  return standardMappings[normalized] || normalized;
}
```

**Unit Conversion**:
```javascript
function convertUnits(fromUnit, toUnit, ingredient, quantity) {
  // Get unit types (mass, volume, count)
  const fromType = getUnitType(fromUnit);
  const toType = getUnitType(toUnit);
  
  // Handle special ingredient conversions (flour, butter, etc.)
  if (hasSpecialConversion(ingredient)) {
    return applySpecialConversion(ingredient, quantity, fromUnit, toUnit);
  }
  
  // Standard unit conversion
  const conversionFactor = getConversionFactor(fromUnit, toUnit);
  return quantity * conversionFactor;
}
```

### 3. Recipe Quality Validation Algorithm

**Objective**: Validate and score recipe quality during import

**Quality Scoring**:
```javascript
function calculateQualityScore(recipe) {
  let score = 0;
  const maxScore = 100;
  
  // Title quality (10 points)
  if (recipe.title && recipe.title.length > 5) score += 10;
  
  // Description quality (15 points)
  if (recipe.description && recipe.description.length > 20) score += 15;
  
  // Instructions quality (25 points)
  if (recipe.instructions && recipe.instructions.length > 50) score += 25;
  
  // Ingredient completeness (20 points)
  if (recipe.ingredients && recipe.ingredients.length >= 3) score += 20;
  
  // Time information (15 points)
  if (recipe.prep_time > 0 || recipe.cook_time > 0) score += 15;
  
  // Additional metadata (15 points)
  if (recipe.servings > 0) score += 5;
  if (recipe.difficulty) score += 5;
  if (recipe.tags && recipe.tags.length > 0) score += 5;
  
  return Math.min(score, maxScore);
}
```

### 2. Difficulty Classification

Based on instruction length and ingredient count:

```javascript
function getDifficulty(instructions, ingredientCount) {
  const instructionLength = instructions.length;
  const stepCount = instructions.split('.').length;
  
  if (ingredientCount <= 5 && instructionLength < 500 && stepCount <= 5) {
    return 'easy';
  } else if (ingredientCount <= 10 && instructionLength < 1000 && stepCount <= 10) {
    return 'medium';
  } else {
    return 'hard';
  }
}
```

### 3. Cooking Time Estimation

Based on recipe category and complexity:

```javascript
function estimateCookingTimes(category, ingredientCount) {
  const baseTimes = {
    'Dessert': { prep: 20, cook: 40 },
    'Beef': { prep: 15, cook: 60 },
    'Chicken': { prep: 15, cook: 45 },
    'Seafood': { prep: 10, cook: 25 },
    'Vegetarian': { prep: 15, cook: 30 },
    'Pasta': { prep: 10, cook: 20 },
    'Breakfast': { prep: 10, cook: 15 }
  };
  
  const defaultTimes = { prep: 15, cook: 30 };
  const times = baseTimes[category] || defaultTimes;
  
  // Adjust based on ingredient count (complexity multiplier)
  const complexityMultiplier = Math.min(1 + (ingredientCount - 5) * 0.1, 2);
  
  return {
    prep: Math.round(times.prep * complexityMultiplier),
    cook: Math.round(times.cook * complexityMultiplier)
  };
}
```

---

## Security Considerations

### Current Implementation
- **Helmet.js**: Sets secure HTTP headers
- **CORS**: Restricts origins to localhost in development
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Required field checking and type validation
- **SQL Injection Prevention**: Parameterized queries (SQLite prepared statements)

### Future Enhancements
- User authentication (JWT)
- Password hashing (bcrypt)
- HTTPS enforcement in production
- Input sanitization for XSS prevention
- CSRF tokens for state-changing operations
- API key for TheMealDB requests (if available)

---

## Performance Optimizations

### Database
- Indexes on frequently queried columns (category_id, expiration_date, recipe_id)
- Prepared statements for repeated queries
- Batch inserts for recipe ingredients

### Frontend
- Lazy loading for recipe images
- Debounced search inputs
- Pagination for large recipe lists
- Local state management (avoiding unnecessary re-renders)

### Backend
- Connection pooling (future: switch to PostgreSQL for production)
- Response caching for static data (categories)
- Efficient SQL joins for recipe recommendations

---

## Future Enhancements

### Planned Features
1. **User Authentication**: Multi-user support with personal pantries
2. **Shopping Lists**: Generate shopping lists from missing ingredients
3. **Meal Planning**: Weekly meal planner with calendar
4. **Nutrition Info**: Calorie and nutrient tracking
5. **Barcode Scanner**: Mobile app with barcode scanning
6. **Recipe Sharing**: Social features for sharing recipes
7. **Smart Notifications**: Push notifications for expiring items
8. **Recipe Collections**: Save favorite recipes to collections
9. **Ingredient Substitutions**: AI-powered ingredient alternatives
10. **Voice Commands**: Alexa/Google Home integration

### Technical Improvements
- Migration to PostgreSQL for better scalability
- GraphQL API for flexible data fetching
- Real-time updates with WebSockets
- Progressive Web App (PWA) features
- Docker containerization
- CI/CD pipeline
- Comprehensive test suite (Jest, React Testing Library)
- Analytics and monitoring (Sentry, Google Analytics)

---

## Contributing Guidelines

### Code Style
- **Frontend**: ESLint + Prettier
- **Backend**: StandardJS or ESLint
- **Git Commits**: Conventional commits format

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches

### Testing
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows

---

**Last Updated**: October 1, 2025
**Version**: 1.0.0

