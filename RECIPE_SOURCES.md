# Recipe Sources Guide

This document outlines all available sources for importing quality recipes into Cook Smart.

## 🌟 Currently Integrated

### 1. TheMealDB (Free, No API Key Required)
- **Status**: ✅ Fully Integrated
- **Recipes**: 250+ high-quality recipes
- **Cost**: Free forever
- **Coverage**: International cuisines
- **Usage**:
  ```bash
  node server/scripts/importRecipes.js --source themealdb --limit 20
  ```

### 2. JSON Files (Manual Curation)
- **Status**: ✅ Fully Integrated
- **Recipes**: 11 curated recipes (expandable)
- **Cost**: Free
- **Quality**: 100/100 (manually curated)
- **Usage**:
  ```bash
  node server/scripts/importRecipes.js --source json
  ```

## 🚀 Ready to Integrate (Requires API Key)

### 3. Spoonacular API
- **Status**: ⚡ Code Ready (needs API key)
- **Recipes**: 360,000+ recipes
- **Cost**: FREE tier - 150 requests/day
- **Paid**: $0.004/request after free tier
- **Features**:
  - Detailed nutrition information
  - Ingredient substitutions
  - Recipe analysis
  - Meal planning
  - Wine pairing
- **Quality**: Excellent
- **Sign Up**: https://spoonacular.com/food-api
- **Setup**:
  1. Get API key from Spoonacular
  2. Add to `.env`: `SPOONACULAR_API_KEY=your_key_here`
  3. Run: `node server/scripts/importSpoonacular.js`

### 4. Edamam Recipe API
- **Recipes**: 2.3+ million recipes
- **Cost**: FREE tier - 10,000 calls/month
- **Features**:
  - Comprehensive nutrition data
  - Dietary labels
  - Health labels
  - Allergen information
- **Sign Up**: https://developer.edamam.com/
- **Implementation**: Similar to Spoonacular (30 min to implement)

### 5. Recipe Puppy API
- **Recipes**: 1+ million recipes
- **Cost**: FREE (no key required)
- **Quality**: Variable
- **Endpoint**: `http://www.recipepuppy.com/api/`
- **Implementation**: Very simple (15 min to implement)

## 📚 Open Datasets (Bulk Download)

### 6. Recipe1M+ Dataset
- **Source**: MIT Research
- **Recipes**: 1+ million recipes with images
- **Cost**: Free for research/educational use
- **Format**: JSON/CSV
- **Download**: http://pic2recipe.csail.mit.edu/
- **Size**: ~20GB
- **Quality**: Academic-grade, well-structured
- **Best For**: One-time bulk import

### 7. Food.com Recipes Dataset (Kaggle)
- **Recipes**: 500,000+ recipes
- **Cost**: Free
- **Format**: CSV
- **Download**: https://www.kaggle.com/shuyangli94/food-com-recipes-and-user-interactions
- **Features**: Includes ratings, reviews, nutrition
- **Quality**: Community-rated

### 8. Epicurious Recipes Dataset
- **Recipes**: 20,000+ recipes
- **Cost**: Free
- **Format**: JSON
- **Download**: https://www.kaggle.com/hugodarwood/epirecipes
- **Quality**: High (professional source)

## 🔧 Web Scraping (Ethical & Legal)

### Guidelines for Ethical Scraping:
1. ✅ Always check `robots.txt` first
2. ✅ Add delays (2-5 seconds between requests)
3. ✅ Use official APIs when available
4. ✅ Respect copyright and provide attribution
5. ✅ Cache results to minimize requests
6. ❌ Never overload servers
7. ❌ Don't scrape if explicitly prohibited

### Recommended Sites with RSS/API:
- **Allrecipes.com**: Has RSS feeds
- **Food Network**: Public recipe data
- **BBC Good Food**: RSS feeds available
- **Serious Eats**: Well-structured HTML

## 💡 Recommended Strategy

### Phase 1: Free APIs (Current)
```bash
# Already done!
- TheMealDB: 250+ recipes ✅
- JSON files: 11 curated recipes ✅
```

### Phase 2: Spoonacular Free Tier
```bash
# Get 150 recipes/day for free
1. Sign up for Spoonacular API key
2. Run daily imports: 150 recipes/day = 4,500/month
3. After 2 months: 9,000+ high-quality recipes
```

### Phase 3: Bulk Dataset Import
```bash
# One-time import of large dataset
1. Download Recipe1M+ or Food.com dataset
2. Create import script for CSV/JSON format
3. Import 100,000+ recipes in one go
4. Filter by quality score (keep only 80+)
```

### Phase 4: Additional APIs
```bash
# Add more variety
- Edamam: 10,000 calls/month
- Recipe Puppy: Unlimited (simple API)
```

## 📊 Estimated Timeline & Results

### Week 1 (Current)
- **Recipes**: 253
- **Sources**: TheMealDB, JSON
- **Cost**: $0

### Week 2 (Add Spoonacular)
- **Recipes**: 1,303 (+1,050)
- **Sources**: TheMealDB, JSON, Spoonacular
- **Cost**: $0 (free tier)

### Month 1 (Daily Spoonacular imports)
- **Recipes**: 4,753 (+4,500)
- **Sources**: TheMealDB, JSON, Spoonacular
- **Cost**: $0 (free tier)

### Month 2 (Add bulk dataset)
- **Recipes**: 54,753 (+50,000 filtered)
- **Sources**: All above + Recipe1M+
- **Cost**: $0

## 🛠️ Quick Start Scripts

### Import from Spoonacular (after getting API key):
```bash
# Set your API key
export SPOONACULAR_API_KEY="your_key_here"

# Import 50 random recipes
node server/scripts/importSpoonacular.js --count 50

# Import by cuisine
node server/scripts/importSpoonacular.js --cuisine italian --count 20

# Import by diet
node server/scripts/importSpoonacular.js --diet vegetarian --count 30
```

### Import from Recipe Puppy:
```bash
# Simple, no API key needed
node server/scripts/importRecipePuppy.js --count 100
```

### Import from CSV dataset:
```bash
# After downloading dataset
node server/scripts/importCSV.js --file recipes.csv --quality-min 80
```

## 🎯 Quality Control

All imports go through:
1. **Validation**: Check for required fields
2. **Standardization**: Normalize ingredients and units
3. **Quality Scoring**: Rate recipe completeness (0-100)
4. **Deduplication**: Skip existing recipes
5. **Error Tracking**: Log validation issues

Minimum recommended quality score: **70/100**

## 📝 Next Steps

1. **Get Spoonacular API Key** (5 minutes)
   - Sign up at https://spoonacular.com/food-api
   - Add to `.env` file
   - Start importing 150 recipes/day

2. **Download Recipe1M+ Dataset** (optional, for bulk)
   - Visit http://pic2recipe.csail.mit.edu/
   - Download JSON format
   - Create import script (I can help with this)

3. **Set up automated daily imports**
   - Create cron job for daily Spoonacular imports
   - Gradually build to 10,000+ recipes

## 🤝 Contributing Recipes

You can also:
- Add your own recipes as JSON files
- Accept user-submitted recipes (future feature)
- Curate recipes from family/friends
- Import from personal recipe collections

---

**Need help implementing any of these sources?** Just let me know which one you'd like to add next!
