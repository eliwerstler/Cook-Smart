import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Clock, Users, Star, ChefHat, Eye, TrendingUp, AlertCircle } from 'lucide-react';
import { recommendationsApi } from '../services/api';

interface Recommendation {
  id: number;
  title: string;
  description: string;
  instructions: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  rating: number;
  tags: string;
  matchScore: number;
  matchPercentage: number;
  availableIngredients: Array<{
    name: string;
    required: string;
    available: string;
    sufficient: boolean;
  }>;
  missingIngredients: Array<{
    name: string;
    required: string;
    optional: boolean;
  }>;
}

const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pantryItemCount, setPantryItemCount] = useState(0);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [strictMode, setStrictMode] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [strictMode]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await recommendationsApi.getRecommendations({ 
        limit: 20, 
        strict: strictMode 
      });
      
      setRecommendations(response.data.recommendations || []);
      setPantryItemCount(response.data.pantryItems || 0);
      setTotalRecipes(response.data.totalRecipes || 0);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (pantryItemCount === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Lightbulb className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Pantry Items Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add some ingredients to your pantry to get personalized recipe recommendations!
          </p>
          <div className="mt-6">
            <Link
              to="/pantry"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Manage Pantry
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipe Recommendations</h1>
          <p className="text-gray-600 mt-1">
            Personalized suggestions based on your pantry ({pantryItemCount} items)
          </p>
        </div>
        
        {/* Strict Mode Toggle */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={strictMode}
              onChange={(e) => setStrictMode(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Strict matching</span>
          </label>
          <button
            onClick={loadRecommendations}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pantry Items</p>
              <p className="text-3xl font-bold text-gray-900">{pantryItemCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Recipes</p>
              <p className="text-3xl font-bold text-gray-900">{totalRecipes}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recommendations</p>
              <p className="text-3xl font-bold text-gray-900">{recommendations.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendations found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your pantry items or switching between strict and flexible matching modes.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                {/* Recipe Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{recipe.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                    {recipe.description && (
                      <p className="text-gray-600 mb-3">{recipe.description}</p>
                    )}
                  </div>
                  
                  {/* Match Score */}
                  <div className="text-right ml-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(recipe.matchPercentage)}`}>
                      {recipe.matchPercentage}% match
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Score: {recipe.matchScore.toFixed(1)}
                    </p>
                  </div>
                </div>

                {/* Recipe Info */}
                <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(recipe.prep_time + recipe.cook_time)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{recipe.servings} servings</span>
                  </div>
                  {recipe.rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{recipe.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <Link
                    to={`/recipe/${recipe.id}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Recipe
                  </Link>
                </div>

                {/* Ingredients Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Available Ingredients */}
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2">
                      Available Ingredients ({recipe.availableIngredients.length})
                    </h4>
                    <div className="space-y-2">
                      {recipe.availableIngredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-green-50 rounded-lg">
                          <span className="font-medium text-gray-900">{ingredient.name}</span>
                          <div className="text-right">
                            <div className="text-gray-600">{ingredient.required}</div>
                            <div className={`text-xs ${ingredient.sufficient ? 'text-green-600' : 'text-orange-600'}`}>
                              {ingredient.available} {ingredient.sufficient ? '✓' : '⚠'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing Ingredients */}
                  {recipe.missingIngredients.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-2">
                        Missing Ingredients ({recipe.missingIngredients.length})
                      </h4>
                      <div className="space-y-2">
                        {recipe.missingIngredients.map((ingredient, index) => (
                          <div key={index} className="flex items-center justify-between text-sm p-2 bg-red-50 rounded-lg">
                            <span className="font-medium text-gray-900">{ingredient.name}</span>
                            <div className="text-right">
                              <div className="text-gray-600">{ingredient.required}</div>
                              {ingredient.optional && (
                                <div className="text-xs text-blue-600">Optional</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {recipe.tags && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
