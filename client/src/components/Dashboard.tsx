import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, ChefHat, Plus } from 'lucide-react';
import { recipesApi } from '../services/api';
import AnimatedText from './AnimatedText';
import ScrollAnimation from './ScrollAnimation';
import AnimatedCard from './AnimatedCard';

interface Recipe {
  id: number;
  title: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  image_url: string;
  rating: number;
  tags: string;
  ingredients: string;
}

const Dashboard: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(true);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [visibleRecipes, setVisibleRecipes] = useState<number>(12); // Start with 12 visible recipes
  const [lastScrollY, setLastScrollY] = useState(0);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load both datasets in parallel
      const [featuredResponse, allResponse] = await Promise.all([
        recipesApi.getRecipes({ limit: 6 }),
        recipesApi.getRecipes({ limit: 50 })
      ]);
      
      // Cache both datasets
      setFeaturedRecipes(featuredResponse.data);
      setAllRecipes(allResponse.data);
      
      // Set initial display to featured recipes
      setRecipes(featuredResponse.data);
      
    } catch (err) {
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load both sets of recipes immediately on component mount
    loadAllData();
  }, []);

  useEffect(() => {
    // Switch between cached data instantly
    if (showAll) {
      setRecipes(allRecipes);
      setVisibleRecipes(Math.min(12, allRecipes.length)); // Reset visible count when switching
    } else {
      setRecipes(featuredRecipes);
      setVisibleRecipes(Math.min(12, featuredRecipes.length)); // Reset visible count when switching
    }
  }, [showAll, allRecipes, featuredRecipes]);

  // Scroll-based performance optimization
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      
      // Adjust visible recipes based on scroll direction
      if (scrollDirection === 'down' && currentScrollY > 500) {
        // Scrolling down - gradually show more recipes
        setVisibleRecipes(prev => Math.min(prev + 6, recipes.length));
      } else if (scrollDirection === 'up' && currentScrollY < 300) {
        // Scrolling up - reduce visible recipes for performance
        setVisibleRecipes(prev => Math.max(12, prev - 6));
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [lastScrollY, recipes.length]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <AnimatedText 
          text="Cook Smart, Waste Less"
          className="text-4xl font-bold text-primary-700 mb-4"
          delay={200}
        />
        <ScrollAnimation direction="up" delay={800}>
          <p className="text-lg text-primary-600 max-w-2xl mx-auto">
            Discover delicious recipes that make the most of your pantry. 
            Smart cooking for a sustainable kitchen.
          </p>
        </ScrollAnimation>
      </div>


      {/* Featured Recipes */}
      <div>
        <ScrollAnimation direction="up" delay={0}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary-700">
              {showAll ? 'All Recipes' : "Today's Recommendations"}
            </h2>
            <div className="flex items-center gap-4">
              <Link
                to="/recipe/new"
                className="flex items-center gap-2 px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-xl font-medium transition-colors shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Recipe
              </Link>
              <button 
                onClick={() => setShowAll(!showAll)}
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                {showAll ? 'Show Featured →' : 'View All →'}
              </button>
            </div>
          </div>
        </ScrollAnimation>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(showAll ? 12 : 6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-greige-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-greige-200 rounded mb-2"></div>
                <div className="h-3 bg-greige-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.slice(0, visibleRecipes).map((recipe, index) => (
              <ScrollAnimation 
                key={recipe.id} 
                direction="up" 
                delay={0}
              >
                <AnimatedCard href={`/recipe/${recipe.id}`}>
                  <div className="h-48 bg-gradient-to-br from-sage-100 to-blush-100 rounded-xl flex items-center justify-center mb-4">
                    {recipe.image_url ? (
                      <img 
                        src={recipe.image_url} 
                        alt={recipe.title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <ChefHat className="w-12 h-12 text-sage-500" />
                    )}
                  </div>

                  <h3 className="font-semibold text-primary-700 mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>

                  <div className="flex items-center justify-between text-sm text-primary-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(recipe.prep_time + recipe.cook_time)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{recipe.servings}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      recipe.difficulty === 'easy' ? 'bg-sage-100 text-sage-700' :
                      recipe.difficulty === 'medium' ? 'bg-blush-100 text-blush-700' :
                      'bg-primary-100 text-primary-700'
                    }`}>
                      {recipe.difficulty}
                    </span>
                    
                    {recipe.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{recipe.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              </ScrollAnimation>
            ))}
          </div>
        )}
        
        {/* Show indicator if there are more recipes */}
        {!loading && visibleRecipes < recipes.length && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center px-4 py-2 bg-sage-100 text-sage-700 rounded-full text-sm font-medium">
              <ChefHat className="w-4 h-4 mr-2" />
              {recipes.length - visibleRecipes} more recipes available
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;