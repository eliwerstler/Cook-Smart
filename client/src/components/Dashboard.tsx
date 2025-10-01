import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, AlertTriangle, ShoppingCart, BookOpen, Lightbulb } from 'lucide-react';
import { pantryApi, recipesApi, recommendationsApi } from '../services/api';

interface PantryStats {
  totalItems: { count: number };
  categories: Array<{ category: string; count: number }>;
  expiring: { count: number };
  lowStock: { count: number };
}

interface RecipeStats {
  totalRecipes: { count: number };
  avgRating: { average: number };
  difficulty: Array<{ difficulty: string; count: number }>;
  avgCookTime: { average: number };
}

interface Recommendation {
  id: number;
  title: string;
  matchPercentage: number;
  matchScore: number;
  prep_time: number;
  cook_time: number;
  difficulty: string;
  rating: number;
}

const Dashboard: React.FC = () => {
  const [pantryStats, setPantryStats] = useState<PantryStats | null>(null);
  const [recipeStats, setRecipeStats] = useState<RecipeStats | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [pantryResponse, recipeResponse, recommendationsResponse] = await Promise.all([
        pantryApi.getStats(),
        recipesApi.getStats(),
        recommendationsApi.getRecommendations({ limit: 5 })
      ]);

      setPantryStats(pantryResponse.data);
      setRecipeStats(recipeResponse.data);
      setRecommendations(recommendationsResponse.data.recommendations || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={loadDashboardData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Cook Smart</h1>
        <p className="text-xl text-gray-600">Your intelligent pantry and recipe assistant</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-3xl font-bold text-gray-900">{pantryStats?.totalItems.count || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recipes Available</p>
              <p className="text-3xl font-bold text-gray-900">{recipeStats?.totalRecipes.count || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-3xl font-bold text-orange-600">{pantryStats?.expiring.count || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-3xl font-bold text-red-600">{pantryStats?.lowStock.count || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/pantry"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <ShoppingCart className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Pantry</h3>
              <p className="text-gray-600">Add, edit, or organize your ingredients</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/recipes"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Browse Recipes</h3>
              <p className="text-gray-600">Discover new recipes and cooking ideas</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/recommendations"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Get Recommendations</h3>
              <p className="text-gray-600">Find recipes based on your pantry</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Top Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Top Recommendations</h2>
            <Link 
              to="/recommendations"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recommendations.map((recipe) => (
              <div key={recipe.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{recipe.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.prep_time + recipe.cook_time} min</span>
                      </span>
                      <span className="capitalize">{recipe.difficulty}</span>
                      {recipe.rating > 0 && (
                        <span>⭐ {recipe.rating.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">{recipe.matchPercentage}%</div>
                  <div className="text-sm text-gray-600">match</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pantry Categories */}
      {pantryStats?.categories && pantryStats.categories.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pantry Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pantryStats.categories.map((category, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{category.count}</div>
                <div className="text-sm text-gray-600 capitalize">{category.category}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
