// Smart ingredient recognition service
export interface IngredientSuggestion {
  category: string;
  units: string[];
  dietaryTags: string[];
  allergens: string[];
  defaultQuantity?: number;
}

// Comprehensive ingredient database with smart categorization
const ingredientDatabase: Record<string, IngredientSuggestion> = {
  // Fruits
  'apple': { category: 'Fruits', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'apples': { category: 'Fruits', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'banana': { category: 'Fruits', units: ['pieces', 'kg', 'bunch'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'bananas': { category: 'Fruits', units: ['pieces', 'kg', 'bunch'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'orange': { category: 'Fruits', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'oranges': { category: 'Fruits', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'lemon': { category: 'Fruits', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'lemons': { category: 'Fruits', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'strawberry': { category: 'Fruits', units: ['g', 'punnet', 'kg'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'strawberries': { category: 'Fruits', units: ['g', 'punnet', 'kg'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'blueberry': { category: 'Fruits', units: ['g', 'punnet', 'cup'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'blueberries': { category: 'Fruits', units: ['g', 'punnet', 'cup'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },

  // Vegetables
  'tomato': { category: 'Vegetables', units: ['pieces', 'kg', 'can'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'tomatoes': { category: 'Vegetables', units: ['pieces', 'kg', 'can'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'onion': { category: 'Vegetables', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'onions': { category: 'Vegetables', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'garlic': { category: 'Vegetables', units: ['cloves', 'bulbs', 'pieces'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'carrot': { category: 'Vegetables', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'carrots': { category: 'Vegetables', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'broccoli': { category: 'Vegetables', units: ['head', 'g', 'kg'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'spinach': { category: 'Vegetables', units: ['g', 'bunch', 'bag'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'potato': { category: 'Vegetables', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'potatoes': { category: 'Vegetables', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'bell pepper': { category: 'Vegetables', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'bell peppers': { category: 'Vegetables', units: ['pieces', 'kg', 'lb'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },

  // Meat & Poultry
  'chicken': { category: 'Meat & Poultry', units: ['kg', 'lb', 'pieces'], dietaryTags: [], allergens: [] },
  'chicken breast': { category: 'Meat & Poultry', units: ['kg', 'lb', 'pieces'], dietaryTags: [], allergens: [] },
  'ground beef': { category: 'Meat & Poultry', units: ['kg', 'lb', 'g'], dietaryTags: [], allergens: [] },
  'beef': { category: 'Meat & Poultry', units: ['kg', 'lb', 'g'], dietaryTags: [], allergens: [] },
  'pork': { category: 'Meat & Poultry', units: ['kg', 'lb', 'g'], dietaryTags: [], allergens: [] },
  'bacon': { category: 'Meat & Poultry', units: ['g', 'pack', 'strips'], dietaryTags: [], allergens: [] },
  'turkey': { category: 'Meat & Poultry', units: ['kg', 'lb', 'pieces'], dietaryTags: [], allergens: [] },
  'lamb': { category: 'Meat & Poultry', units: ['kg', 'lb', 'g'], dietaryTags: [], allergens: [] },

  // Seafood
  'salmon': { category: 'Seafood', units: ['kg', 'lb', 'fillet'], dietaryTags: ['pescatarian'], allergens: ['fish'] },
  'tuna': { category: 'Seafood', units: ['can', 'kg', 'lb'], dietaryTags: ['pescatarian'], allergens: ['fish'] },
  'shrimp': { category: 'Seafood', units: ['kg', 'lb', 'g'], dietaryTags: ['pescatarian'], allergens: ['shellfish'] },
  'prawns': { category: 'Seafood', units: ['kg', 'lb', 'g'], dietaryTags: ['pescatarian'], allergens: ['shellfish'] },
  'cod': { category: 'Seafood', units: ['kg', 'lb', 'fillet'], dietaryTags: ['pescatarian'], allergens: ['fish'] },
  'crab': { category: 'Seafood', units: ['kg', 'lb', 'pieces'], dietaryTags: ['pescatarian'], allergens: ['shellfish'] },

  // Dairy & Eggs
  'milk': { category: 'Dairy & Eggs', units: ['l', 'ml', 'cup'], dietaryTags: ['vegetarian'], allergens: ['dairy'] },
  'cheese': { category: 'Dairy & Eggs', units: ['g', 'block', 'slice'], dietaryTags: ['vegetarian'], allergens: ['dairy'] },
  'cheddar': { category: 'Dairy & Eggs', units: ['g', 'block', 'slice'], dietaryTags: ['vegetarian'], allergens: ['dairy'] },
  'mozzarella': { category: 'Dairy & Eggs', units: ['g', 'ball', 'slice'], dietaryTags: ['vegetarian'], allergens: ['dairy'] },
  'parmesan': { category: 'Dairy & Eggs', units: ['g', 'block', 'tbsp'], dietaryTags: ['vegetarian'], allergens: ['dairy'] },
  'yogurt': { category: 'Dairy & Eggs', units: ['g', 'cup', 'container'], dietaryTags: ['vegetarian'], allergens: ['dairy'] },
  'butter': { category: 'Dairy & Eggs', units: ['g', 'stick', 'tbsp'], dietaryTags: ['vegetarian'], allergens: ['dairy'] },
  'eggs': { category: 'Dairy & Eggs', units: ['pieces', 'dozen', 'carton'], dietaryTags: ['vegetarian'], allergens: ['eggs'] },
  'cream': { category: 'Dairy & Eggs', units: ['ml', 'cup', 'carton'], dietaryTags: ['vegetarian'], allergens: ['dairy'] },

  // Grains & Pasta
  'rice': { category: 'Grains & Pasta', units: ['g', 'kg', 'cup'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'pasta': { category: 'Grains & Pasta', units: ['g', 'kg', 'box'], dietaryTags: ['vegetarian', 'vegan'], allergens: ['gluten'] },
  'spaghetti': { category: 'Grains & Pasta', units: ['g', 'kg', 'box'], dietaryTags: ['vegetarian', 'vegan'], allergens: ['gluten'] },
  'bread': { category: 'Grains & Pasta', units: ['slices', 'loaf', 'pieces'], dietaryTags: ['vegetarian'], allergens: ['gluten'] },
  'quinoa': { category: 'Grains & Pasta', units: ['g', 'kg', 'cup'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'oats': { category: 'Grains & Pasta', units: ['g', 'kg', 'cup'], dietaryTags: ['vegetarian', 'vegan'], allergens: ['gluten'] },
  'flour': { category: 'Baking', units: ['g', 'kg', 'cup'], dietaryTags: ['vegetarian', 'vegan'], allergens: ['gluten'] },

  // Beans & Legumes
  'black beans': { category: 'Canned Goods', units: ['can', 'g', 'cup'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'kidney beans': { category: 'Canned Goods', units: ['can', 'g', 'cup'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'chickpeas': { category: 'Canned Goods', units: ['can', 'g', 'cup'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'lentils': { category: 'Grains & Pasta', units: ['g', 'kg', 'cup'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },

  // Nuts & Seeds
  'almonds': { category: 'Snacks', units: ['g', 'cup', 'bag'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: ['nuts'] },
  'walnuts': { category: 'Snacks', units: ['g', 'cup', 'bag'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: ['nuts'] },
  'peanuts': { category: 'Snacks', units: ['g', 'cup', 'bag'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: ['peanuts'] },
  'sunflower seeds': { category: 'Snacks', units: ['g', 'cup', 'bag'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },

  // Oils & Condiments
  'olive oil': { category: 'Condiments & Sauces', units: ['ml', 'l', 'bottle'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'vegetable oil': { category: 'Condiments & Sauces', units: ['ml', 'l', 'bottle'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'soy sauce': { category: 'Condiments & Sauces', units: ['ml', 'bottle', 'tbsp'], dietaryTags: ['vegetarian', 'vegan'], allergens: ['soy', 'gluten'] },
  'ketchup': { category: 'Condiments & Sauces', units: ['ml', 'bottle', 'tbsp'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'mustard': { category: 'Condiments & Sauces', units: ['ml', 'jar', 'tbsp'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },

  // Spices & Herbs
  'salt': { category: 'Spices & Herbs', units: ['g', 'tbsp', 'tsp'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'pepper': { category: 'Spices & Herbs', units: ['g', 'tbsp', 'tsp'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'basil': { category: 'Spices & Herbs', units: ['g', 'bunch', 'tbsp'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'oregano': { category: 'Spices & Herbs', units: ['g', 'tbsp', 'tsp'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'cumin': { category: 'Spices & Herbs', units: ['g', 'tbsp', 'tsp'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'paprika': { category: 'Spices & Herbs', units: ['g', 'tbsp', 'tsp'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },

  // Beverages
  'coffee': { category: 'Beverages', units: ['g', 'kg', 'bag'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'tea': { category: 'Beverages', units: ['bags', 'box', 'g'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'orange juice': { category: 'Beverages', units: ['ml', 'l', 'carton'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'wine': { category: 'Beverages', units: ['ml', 'bottle', 'l'], dietaryTags: ['vegetarian', 'vegan'], allergens: [] },

  // Frozen Foods
  'frozen peas': { category: 'Frozen Foods', units: ['g', 'bag', 'cup'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'frozen corn': { category: 'Frozen Foods', units: ['g', 'bag', 'cup'], dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [] },
  'ice cream': { category: 'Frozen Foods', units: ['l', 'pint', 'container'], dietaryTags: ['vegetarian'], allergens: ['dairy', 'eggs'] },
};

// Common ingredient patterns and their categories
const categoryPatterns: Record<string, string> = {
  'oil': 'Condiments & Sauces',
  'sauce': 'Condiments & Sauces',
  'spice': 'Spices & Herbs',
  'herb': 'Spices & Herbs',
  'bean': 'Canned Goods',
  'milk': 'Dairy & Eggs',
  'cheese': 'Dairy & Eggs',
  'meat': 'Meat & Poultry',
  'fish': 'Seafood',
  'fruit': 'Fruits',
  'vegetable': 'Vegetables',
  'grain': 'Grains & Pasta',
  'pasta': 'Grains & Pasta',
  'bread': 'Grains & Pasta',
  'juice': 'Beverages',
  'tea': 'Beverages',
  'coffee': 'Beverages',
};

// Smart unit suggestions based on food type
const unitPreferences: Record<string, string[]> = {
  'liquid': ['ml', 'l', 'cup', 'fl oz'],
  'dry': ['g', 'kg', 'cup', 'oz'],
  'countable': ['pieces', 'items', 'units'],
  'canned': ['can', 'jar', 'bottle'],
  'packaged': ['pack', 'box', 'bag'],
  'meat': ['kg', 'lb', 'g', 'pieces'],
  'seafood': ['kg', 'lb', 'g', 'fillet'],
  'dairy': ['l', 'ml', 'g', 'cup'],
  'spices': ['g', 'tsp', 'tbsp', 'pinch'],
  'herbs': ['bunch', 'g', 'tbsp', 'tsp'],
};

// Allergen detection patterns
const allergenPatterns: Record<string, string[]> = {
  'dairy': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein'],
  'gluten': ['wheat', 'flour', 'bread', 'pasta', 'oats', 'barley', 'rye'],
  'nuts': ['almond', 'walnut', 'pecan', 'hazelnut', 'pistachio', 'cashew'],
  'peanuts': ['peanut', 'groundnut'],
  'eggs': ['egg', 'mayo', 'mayonnaise'],
  'soy': ['soy', 'soya', 'tofu', 'miso', 'tempeh'],
  'fish': ['salmon', 'tuna', 'cod', 'mackerel', 'sardine', 'anchovy'],
  'shellfish': ['shrimp', 'prawn', 'crab', 'lobster', 'mussel', 'oyster'],
};

// Dietary tag detection patterns
const dietaryPatterns: Record<string, string[]> = {
  'vegan': ['vegetable', 'fruit', 'grain', 'bean', 'lentil', 'quinoa', 'rice', 'pasta', 'oil', 'spice', 'herb'],
  'vegetarian': ['vegetable', 'fruit', 'grain', 'bean', 'lentil', 'quinoa', 'rice', 'pasta', 'dairy', 'egg', 'cheese', 'milk'],
  'pescatarian': ['fish', 'seafood', 'salmon', 'tuna', 'cod', 'shrimp', 'crab'],
  'gluten-free': ['rice', 'quinoa', 'potato', 'corn', 'meat', 'fish', 'vegetable', 'fruit', 'dairy'],
};

export function getIngredientSuggestions(input: string): IngredientSuggestion {
  const normalizedInput = input.toLowerCase().trim();

  // Direct match from database
  const directMatch = ingredientDatabase[normalizedInput];
  if (directMatch) {
    return directMatch;
  }

  // Partial matching
  for (const [key, suggestion] of Object.entries(ingredientDatabase)) {
    if (normalizedInput.includes(key) || key.includes(normalizedInput)) {
      return suggestion;
    }
  }

  // Pattern-based categorization
  let category = 'Other';
  let units = ['pieces', 'g', 'kg'];
  let dietaryTags: string[] = [];
  let allergens: string[] = [];

  // Check category patterns
  for (const [pattern, cat] of Object.entries(categoryPatterns)) {
    if (normalizedInput.includes(pattern)) {
      category = cat;
      break;
    }
  }

  // Determine appropriate units based on category and content
  if (category === 'Beverages' || normalizedInput.includes('juice') || normalizedInput.includes('milk')) {
    units = unitPreferences.liquid;
  } else if (category === 'Spices & Herbs') {
    units = unitPreferences.spices;
  } else if (category === 'Meat & Poultry') {
    units = unitPreferences.meat;
  } else if (category === 'Seafood') {
    units = unitPreferences.seafood;
  } else if (category === 'Canned Goods') {
    units = unitPreferences.canned;
  } else if (normalizedInput.includes('can') || normalizedInput.includes('jar')) {
    units = unitPreferences.canned;
  } else if (normalizedInput.includes('bag') || normalizedInput.includes('pack')) {
    units = unitPreferences.packaged;
  }

  // Detect allergens
  for (const [allergen, patterns] of Object.entries(allergenPatterns)) {
    if (patterns.some(pattern => normalizedInput.includes(pattern))) {
      allergens.push(allergen);
    }
  }

  // Detect dietary tags
  if (category === 'Meat & Poultry') {
    dietaryTags = [];
  } else if (category === 'Seafood') {
    dietaryTags = ['pescatarian'];
  } else if (category === 'Dairy & Eggs' || allergens.includes('eggs') || allergens.includes('dairy')) {
    dietaryTags = ['vegetarian'];
  } else {
    dietaryTags = ['vegetarian', 'vegan'];

    // Remove vegan if contains animal products
    if (allergens.includes('dairy') || allergens.includes('eggs')) {
      dietaryTags = ['vegetarian'];
    }

    // Add gluten-free if appropriate
    if (!allergens.includes('gluten')) {
      dietaryTags.push('gluten-free');
    }
  }

  return {
    category,
    units,
    dietaryTags,
    allergens,
    defaultQuantity: 1,
  };
}

// Get smart quantity suggestions
export function getDefaultQuantity(ingredient: string, unit: string): number {
  const normalizedIngredient = ingredient.toLowerCase();

  // Quantity suggestions based on common usage
  const quantitySuggestions: Record<string, Record<string, number>> = {
    'eggs': { 'pieces': 6, 'dozen': 1 },
    'milk': { 'l': 1, 'ml': 1000 },
    'bread': { 'loaf': 1, 'slices': 8 },
    'pasta': { 'g': 500, 'kg': 1 },
    'rice': { 'g': 500, 'kg': 1 },
    'chicken': { 'kg': 1, 'pieces': 2 },
    'ground beef': { 'kg': 0.5, 'g': 500 },
    'cheese': { 'g': 200, 'block': 1 },
  };

  for (const [key, quantities] of Object.entries(quantitySuggestions)) {
    if (normalizedIngredient.includes(key)) {
      return quantities[unit] || 1;
    }
  }

  // Default quantities by unit type
  const unitDefaults: Record<string, number> = {
    'ml': 500,
    'l': 1,
    'g': 250,
    'kg': 1,
    'pieces': 2,
    'can': 1,
    'bottle': 1,
    'pack': 1,
    'bag': 1,
    'cup': 1,
    'tbsp': 2,
    'tsp': 1,
  };

  return unitDefaults[unit] || 1;
}

export default {
  getIngredientSuggestions,
  getDefaultQuantity,
};