import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Star, ChefHat, ShoppingCart, Lightbulb } from 'lucide-react';
import { recipesApi, recommendationsApi } from '../services/api';

interface RecipeIngredient {
  id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
  optional: boolean;
}

interface Recipe {
  id: number;
  title: string;
  description: string;
  instructions: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  image_url: string;
  rating: number;
  tags: string;
  ingredients: RecipeIngredient[];
}

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  useEffect(() => {
    if (id) {
      loadRecipe();
    }
  }, [id]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      const response = await recipesApi.getRecipe(parseInt(id!));
      setRecipe(response.data);
      
      // Load suggestions and alternatives in parallel
      const [suggestionsResponse, alternativesResponse] = await Promise.all([
        recommendationsApi.getSuggestions(parseInt(id!)),
        recommendationsApi.getAlternatives(parseInt(id!), { limit: 3 })
      ]);
      
      setSuggestions(suggestionsResponse.data.suggestions || []);
      setAlternatives(alternativesResponse.data.alternatives || []);
    } catch (err) {
      console.error('Error loading recipe:', err);
      setError('Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleRateRecipe = async (rating: number) => {
    if (!recipe) return;
    
    try {
      await recipesApi.rateRecipe(recipe.id, rating);
      setRecipe(prev => prev ? { ...prev, rating } : null);
    } catch (err) {
      console.error('Error rating recipe:', err);
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

  const formatInstructions = (instructions: string) => {
    return instructions.split('\n').map((step, index) => (
      <p key={index} className="mb-2">
        {step.trim()}
      </p>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="text-center py-12">
        <ChefHat className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Recipe not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {error || 'The recipe you\'re looking for doesn\'t exist.'}
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/recipes')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Recipe Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Recipe Image */}
        <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          {recipe.image_url ? (
            <img 
              src={recipe.image_url} 
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <ChefHat className="w-16 h-16 text-primary-600" />
          )}
        </div>

        {/* Recipe Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
              {recipe.description && (
                <p className="text-gray-600 text-lg">{recipe.description}</p>
              )}
            </div>
            
            {/* Rating */}
            <div className="ml-4">
              <div className="flex items-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRateRecipe(star)}
                    className="text-yellow-400 hover:text-yellow-500 transition-colors"
                  >
                    <Star 
                      size={24} 
                      className={star <= (recipe.rating || 0) ? 'fill-current' : ''} 
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 text-center">
                {recipe.rating > 0 ? `${recipe.rating.toFixed(1)}/5` : 'Rate this recipe'}
              </p>
            </div>
          </div>

          {/* Recipe Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="w-6 h-6 text-gray-600 mx-auto mb-1" />
              <div className="text-sm text-gray-600">Prep Time</div>
              <div className="font-semibold text-gray-900">{formatTime(recipe.prep_time)}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="w-6 h-6 text-gray-600 mx-auto mb-1" />
              <div className="text-sm text-gray-600">Cook Time</div>
              <div className="font-semibold text-gray-900">{formatTime(recipe.cook_time)}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Users className="w-6 h-6 text-gray-600 mx-auto mb-1" />
              <div className="text-sm text-gray-600">Servings</div>
              <div className="font-semibold text-gray-900">{recipe.servings}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <ChefHat className="w-6 h-6 text-gray-600 mx-auto mb-1" />
              <div className="text-sm text-gray-600">Difficulty</div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                {recipe.difficulty}
              </span>
            </div>
          </div>

          {/* Tags */}
          {recipe.tags && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {recipe.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ingredients and Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
          <div className="space-y-3">
            {recipe.ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-900">{ingredient.ingredient_name}</span>
                  {ingredient.optional && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Optional
                    </span>
                  )}
                </div>
                <span className="text-gray-600 font-medium">
                  {ingredient.quantity} {ingredient.unit}
                </span>
              </div>
            ))}
          </div>

          {/* Missing Ingredients Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium mb-3"
              >
                <ShoppingCart size={20} />
                <span>Missing Ingredients ({suggestions.length})</span>
              </button>
              
              {showSuggestions && (
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg text-sm">
                      <span className="font-medium text-gray-900">{suggestion.name}</span>
                      <span className="text-gray-600">{suggestion.quantity} {suggestion.unit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
          <div className="prose max-w-none">
            {formatInstructions(recipe.instructions)}
          </div>
        </div>
      </div>

      {/* Alternative Recipes */}
      {alternatives.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Similar Recipes</h2>
            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <Lightbulb size={20} />
              <span>{showAlternatives ? 'Hide' : 'Show'} Alternatives</span>
            </button>
          </div>

          {showAlternatives && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alternatives.map((alternative) => (
                <Link
                  key={alternative.id}
                  to={`/recipe/${alternative.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{alternative.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{formatTime(alternative.prep_time + alternative.cook_time)}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(alternative.difficulty)}`}>
                      {alternative.difficulty}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-primary-600">
                    {alternative.matchPercentage}% match
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;
