import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Pantry API
export const pantryApi = {
  getItems: () => api.get('/pantry/items'),
  getItemsByCategory: (category: string) => api.get(`/pantry/items/category/${category}`),
  addItem: (item: any) => api.post('/pantry/items', item),
  updateItem: (id: number, item: any) => api.put(`/pantry/items/${id}`, item),
  deleteItem: (id: number) => api.delete(`/pantry/items/${id}`),
  bulkImport: (items: any[]) => api.post('/pantry/items/bulk', { items }),
  getExpiringItems: (days?: number) => api.get('/pantry/items/expiring', { params: { days } }),
  getLowStockItems: (threshold?: number) => api.get('/pantry/items/low-stock', { params: { threshold } }),
  generateShoppingList: (threshold?: number, categories?: string[]) =>
    api.post('/pantry/shopping-list', { threshold, categories }),
  getSmartSuggestions: (ingredient: string) => api.post('/pantry/suggest', { ingredient }),
  searchIngredients: (query: string) => api.get('/pantry/ingredients/search', { params: { q: query } }),
  getCategories: () => api.get('/pantry/categories'),
  addCategory: (category: any) => api.post('/pantry/categories', category),
  getStats: () => api.get('/pantry/stats'),
  // New standardization and conversion endpoints
  getSupportedUnits: () => api.get('/pantry/units'),
  convertUnits: (quantity: number, fromUnit: string, toUnit: string, ingredient?: string) =>
    api.post('/pantry/convert', { quantity, fromUnit, toUnit, ingredient }),
  checkQuantitySufficient: (pantryItem: any, recipeRequirement: any, ingredient?: string) =>
    api.post('/pantry/check-quantity', { pantryItem, recipeRequirement, ingredient }),
  getStandardIngredients: () => api.get('/pantry/standard-ingredients'),
  normalizeIngredient: (ingredient: string) => api.post('/pantry/normalize-ingredient', { ingredient }),
};

// Recipes API
export const recipesApi = {
  getRecipes: (params?: any) => api.get('/recipes', { params }),
  getRecipe: (id: number) => api.get(`/recipes/${id}`),
  addRecipe: (recipe: any) => api.post('/recipes', recipe),
  createRecipe: (recipe: any) => api.post('/recipes', recipe),
  updateRecipe: (id: number, recipe: any) => api.put(`/recipes/${id}`, recipe),
  deleteRecipe: (id: number) => api.delete(`/recipes/${id}`),
  rateRecipe: (id: number, rating: number) => api.post(`/recipes/${id}/rate`, { rating }),
  getStats: () => api.get('/recipes/stats/summary'),
};

// Recommendations API
export const recommendationsApi = {
  getRecommendations: (params?: any) => api.get('/recommendations/recipes', { params }),
  getSuggestions: (recipeId: number) => api.get(`/recommendations/suggestions/${recipeId}`),
  getAlternatives: (recipeId: number, params?: any) => api.get(`/recommendations/alternatives/${recipeId}`, { params }),
};

// Import API
export const importApi = {
  importSampleData: () => api.post('/import/mealdb/sample'),
  importRandomRecipes: (count?: number) => api.post('/import/mealdb/random', { count }),
  importByCategory: (category: string, limit?: number) => api.post(`/import/mealdb/category/${category}`, { limit }),
  importCategories: () => api.post('/import/mealdb/categories'),
  getStatus: () => api.get('/import/status'),
};

export default api;
