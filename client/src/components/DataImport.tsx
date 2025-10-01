import React, { useState, useEffect } from 'react';
import { Download, Database, Coffee, ChefHat, Beef, Fish, Salad, Cake, Hash, RefreshCw, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { importApi } from '../services/api';

interface ImportStats {
  totalRecipes: { count: number };
  totalCategories: { count: number };
  totalIngredients: { count: number };
  recipesByDifficulty: Array<{ difficulty: string; count: number }>;
  recentImports: Array<{ title: string; created_at: string }>;
}

const DataImport: React.FC = () => {
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await importApi.getStatus();
      setStats(response.data.statistics);
    } catch (error) {
      console.error('Error loading import stats:', error);
      setMessage({ type: 'error', text: 'Failed to load import statistics' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportSampleData = async () => {
    try {
      setImporting(true);
      setMessage({ type: 'info', text: 'Importing sample data from TheMealDB...' });

      const response = await importApi.importSampleData();

      setMessage({
        type: 'success',
        text: `Successfully imported ${response.data.data.recipes} recipes and ${response.data.data.categories} categories!`
      });

      await loadStats();
    } catch (error: any) {
      console.error('Error importing sample data:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.details || 'Failed to import sample data'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleImportRandomRecipes = async () => {
    try {
      setImporting(true);
      setMessage({ type: 'info', text: 'Importing 10 random recipes...' });

      const response = await importApi.importRandomRecipes(10);

      setMessage({
        type: 'success',
        text: `Successfully imported ${response.data.count} random recipes!`
      });

      await loadStats();
    } catch (error: any) {
      console.error('Error importing random recipes:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.details || 'Failed to import random recipes'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleImportByCategory = async (category: string) => {
    try {
      setImporting(true);
      setMessage({ type: 'info', text: `Importing ${category} recipes...` });

      const response = await importApi.importByCategory(category, 5);

      setMessage({
        type: 'success',
        text: `Successfully imported ${response.data.count} ${category} recipes!`
      });

      await loadStats();
    } catch (error: any) {
      console.error(`Error importing ${category} recipes:`, error);
      setMessage({
        type: 'error',
        text: error.response?.data?.details || `Failed to import ${category} recipes`
      });
    } finally {
      setImporting(false);
    }
  };

  const categories = [
    { name: 'Chicken', icon: ChefHat, color: 'bg-orange-500' },
    { name: 'Beef', icon: Beef, color: 'bg-red-500' },
    { name: 'Seafood', icon: Fish, color: 'bg-blue-500' },
    { name: 'Vegetarian', icon: Salad, color: 'bg-green-500' },
    { name: 'Dessert', icon: Cake, color: 'bg-pink-500' },
    { name: 'Breakfast', icon: Coffee, color: 'bg-yellow-500' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Import</h1>
          <p className="text-gray-600 mt-1">Import recipes and ingredients from TheMealDB</p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
          <span>Refresh</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? <CheckCircle size={20} /> :
             message.type === 'error' ? <AlertCircle size={20} /> :
             <Database size={20} />}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {stats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-2" size={24} />
            Import Statistics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Recipes</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalRecipes.count}</p>
                </div>
                <ChefHat className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Categories</p>
                  <p className="text-2xl font-bold text-green-900">{stats.totalCategories.count}</p>
                </div>
                <Hash className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Unique Ingredients</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.totalIngredients.count}</p>
                </div>
                <Database className="text-purple-500" size={32} />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Recipe Difficulty Distribution</h3>
            <div className="flex flex-wrap gap-2">
              {stats.recipesByDifficulty.map((diff) => (
                <span
                  key={diff.difficulty}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(diff.difficulty)}`}
                >
                  {diff.difficulty}: {diff.count}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Imports</h3>
            <div className="space-y-2">
              {stats.recentImports.slice(0, 5).map((recipe, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{recipe.title}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(recipe.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Download className="mr-2" size={24} />
          Import Data
        </h2>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sample Data</h3>
            <p className="text-gray-600 mb-3">
              Import a curated selection of recipes from multiple categories (5 recipes per category)
            </p>
            <button
              onClick={handleImportSampleData}
              disabled={importing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Database size={16} />
              <span>{importing ? 'Importing...' : 'Import Sample Data'}</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Random Recipes</h3>
            <p className="text-gray-600 mb-3">
              Import 10 random recipes from TheMealDB
            </p>
            <button
              onClick={handleImportRandomRecipes}
              disabled={importing}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>{importing ? 'Importing...' : 'Import Random Recipes'}</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Import by Category</h3>
            <p className="text-gray-600 mb-3">
              Import 5 recipes from a specific category
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.name}
                    onClick={() => handleImportByCategory(category.name)}
                    disabled={importing}
                    className={`${category.color} text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
                  >
                    <Icon size={16} />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataImport;