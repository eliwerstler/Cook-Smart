import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, ChefHat, Plus, X, Save, Globe, FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { recipesApi } from '../services/api';

interface RecipeFormData {
  title: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  ingredients: Array<{name: string, quantity: string, unit: string}>;
  instructions: string[];
  tags: string[];
  image_url: string;
  source_url: string;
}

const AVAILABLE_TAGS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'low-carb', 'high-protein',
  'quick', 'easy', 'healthy', 'comfort-food', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert',
  'appetizer', 'main-course', 'side-dish', 'soup', 'salad', 'pasta', 'rice', 'chicken', 'beef',
  'pork', 'seafood', 'vegetables', 'fruits', 'baking', 'grilling', 'slow-cooker', 'one-pot',
  'meal-prep', 'kid-friendly', 'spicy', 'mild', 'sweet', 'savory'
];

const AddRecipe: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [url, setUrl] = useState('');
  const [showImportForm, setShowImportForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    difficulty: 'easy',
    ingredients: [{name: '', quantity: '', unit: 'pieces'}],
    instructions: [''],
    tags: [],
    image_url: '',
    source_url: ''
  });

  const handleInputChange = (field: keyof RecipeFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'instructions', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const handleIngredientChange = (index: number, field: 'name' | 'quantity' | 'unit', value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  const addArrayItem = (field: 'instructions') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removeArrayItem = (field: 'instructions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_: string, i: number) => i !== index)
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_: any, i: number) => i !== index)
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, {name: '', quantity: '', unit: 'pieces'}]
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, image_url: '' }));
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
    if (url) {
      setImageFile(null);
      setImagePreview('');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const extractRecipeFromUrl = async (url: string): Promise<RecipeFormData> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock recipe extraction - in a real app, this would be a backend service
    return {
      title: "Imported Recipe",
      description: "This recipe was imported from an online source. Please review and edit the details before saving.",
      ingredients: [
        { name: "Flour", quantity: "2", unit: "cups" },
        { name: "Sugar", quantity: "1", unit: "cup" },
        { name: "Eggs", quantity: "2", unit: "pieces" },
        { name: "Butter", quantity: "1/2", unit: "cup" }
      ],
      instructions: [
        "Preheat oven to 350°F (175°C)",
        "Mix flour and sugar in a large bowl",
        "Add eggs and butter, mix until combined",
        "Pour into greased pan and bake for 25-30 minutes"
      ],
      prep_time: 15,
      cook_time: 30,
      servings: 8,
      difficulty: "easy",
      image_url: "",
      tags: ["baking", "dessert"],
      source_url: url
    };
  };

  const handleUrlImport = async () => {
    if (!url.trim()) {
      setErrors({ url: 'Please enter a recipe URL' });
      return;
    }

    setImporting(true);
    setErrors({});

    try {
      const importedRecipe = await extractRecipeFromUrl(url);
      setFormData(importedRecipe);
      setShowImportForm(true);
    } catch (err) {
      console.error('Error importing recipe:', err);
      setErrors({ import: 'Failed to import recipe from this URL. Please try a different source.' });
    } finally {
      setImporting(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Recipe title is required';
    }

    if (!formData.instructions.some(instruction => instruction.trim())) {
      newErrors.instructions = 'At least one instruction is required';
    }

    if (!formData.ingredients.some(ingredient => ingredient.name.trim())) {
      newErrors.ingredients = 'At least one ingredient is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const recipeData = {
        ...formData,
        ingredients: formData.ingredients.filter(ingredient => ingredient.name.trim()),
        instructions: formData.instructions.filter(instruction => instruction.trim()).join('\n'),
        tags: formData.tags.join(',')
      };

      await recipesApi.createRecipe(recipeData);
      navigate('/cook');
    } catch (err) {
      console.error('Error creating recipe:', err);
      setErrors({ submit: 'Failed to save recipe. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderIngredientsField = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-primary-700">
          Ingredients
        </label>
        <button
          type="button"
          onClick={addIngredient}
          className="flex items-center gap-1 px-3 py-1 text-sage-600 hover:text-sage-700 bg-sage-50 hover:bg-sage-100 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Ingredient
        </button>
      </div>
      
      {formData.ingredients.map((ingredient, index) => (
        <div key={index} className="flex gap-2">
          <div className="flex items-center justify-center w-10 h-10 bg-sage-100 rounded-lg">
            <ChefHat className="w-4 h-4 text-sage-600" />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              value={ingredient.name}
              onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
              placeholder="Ingredient name"
              className="input-field"
            />
            <input
              type="text"
              value={ingredient.quantity}
              onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
              placeholder="Quantity"
              className="input-field"
            />
            <input
              type="text"
              value={ingredient.unit}
              onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
              placeholder="Unit"
              className="input-field"
            />
          </div>
          <button
            type="button"
            onClick={() => removeIngredient(index)}
            className="flex items-center justify-center w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      {errors.ingredients && (
        <p className="text-sm text-red-600">{errors.ingredients}</p>
      )}
    </div>
  );

  const renderInstructionsField = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-primary-700">
          Instructions
        </label>
        <button
          type="button"
          onClick={() => addArrayItem('instructions')}
          className="flex items-center gap-1 px-3 py-1 text-sage-600 hover:text-sage-700 bg-sage-50 hover:bg-sage-100 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Step
        </button>
      </div>
      
      {formData.instructions.map((instruction, index) => (
        <div key={index} className="flex gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-sage-100 rounded-lg text-sm font-medium text-sage-600">
            {index + 1}
          </div>
          <div className="flex-1">
            <textarea
              value={instruction}
              onChange={(e) => handleArrayChange('instructions', index, e.target.value)}
              placeholder="Add cooking step..."
              rows={2}
              className="input-field resize-none"
            />
          </div>
          <button
            type="button"
            onClick={() => removeArrayItem('instructions', index)}
            className="flex items-center justify-center w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      {errors.instructions && (
        <p className="text-sm text-red-600">{errors.instructions}</p>
      )}
    </div>
  );

  const renderTagsField = () => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-primary-700">Tags (optional)</label>
      {formData.tags.length > 0 && (
        <div className="mb-3">
          <p className="text-sm text-primary-600 mb-2">Selected tags:</p>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-sm">
                {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                <button type="button" onClick={() => handleTagToggle(tag)} className="ml-1 hover:text-sage-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setTagsDropdownOpen(!tagsDropdownOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-greige-300 rounded-xl hover:bg-greige-50 transition-colors"
        >
          <span className="text-primary-600">
            {formData.tags.length > 0 ? `${formData.tags.length} tag${formData.tags.length > 1 ? 's' : ''} selected` : 'Select tags...'}
          </span>
          <ChefHat className={`w-5 h-5 text-primary-400 transition-transform ${tagsDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {tagsDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-greige-300 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
            <div className="p-4">
              <p className="text-sm text-primary-500 mb-3">Select tags that describe your recipe:</p>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 text-left ${
                      formData.tags.includes(tag)
                        ? 'bg-sage-500 text-white border-sage-500 shadow-sm'
                        : 'bg-white text-primary-600 border-greige-300 hover:bg-sage-50 hover:border-sage-300'
                    }`}
                  >
                    {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {tagsDropdownOpen && (
        <div className="fixed inset-0 z-5" onClick={() => setTagsDropdownOpen(false)} />
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-cream-100 rounded-2xl shadow-lg border border-greige-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-greige-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sage-100 rounded-xl">
              <ChefHat className="w-6 h-6 text-sage-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-700">Add Recipe</h1>
              <p className="text-primary-500">Create a new recipe or import from online</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/cook')}
            className="p-2 hover:bg-greige-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-primary-500" />
          </button>
        </div>

        <div className="p-6">
          {!showImportForm ? (
            /* Import vs Create Choice */
            <div className="space-y-6">
              <div className="text-center py-8">
                <ChefHat className="w-16 h-16 text-sage-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-primary-700 mb-2">
                  How would you like to add your recipe?
                </h2>
                <p className="text-primary-600 max-w-2xl mx-auto">
                  Choose between importing from a URL or creating a recipe from scratch.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Import Option */}
                <div className="border border-greige-200 rounded-xl p-6 hover:border-sage-300 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
                      <Globe className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-700">Import from URL</h3>
                      <p className="text-sm text-primary-500">Import recipes from online sources</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        Recipe URL
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            setUrl(e.target.value);
                            if (errors.url) setErrors({});
                          }}
                          placeholder="https://example.com/recipe"
                          className={`flex-1 input-field ${errors.url ? 'border-red-300 focus:ring-red-500' : ''}`}
                        />
                        <button
                          onClick={handleUrlImport}
                          disabled={importing}
                          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {importing ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            <>
                              <Globe className="w-4 h-4" />
                              Import
                            </>
                          )}
                        </button>
                      </div>
                      {errors.url && (
                        <p className="text-sm text-red-600 mt-1">{errors.url}</p>
                      )}
                    </div>

                    {errors.import && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <p className="text-red-600 text-sm">{errors.import}</p>
                        </div>
                      </div>
                    )}

                    <div className="bg-greige-50 rounded-lg p-3">
                      <p className="text-xs text-primary-600">
                        Works with AllRecipes, Food Network, BBC Good Food, and many others.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Create Option */}
                <div 
                  onClick={() => setShowImportForm(true)}
                  className="border border-greige-200 rounded-xl p-6 hover:border-sage-300 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-sage-100 rounded-xl group-hover:bg-sage-200 transition-colors">
                      <FileText className="w-6 h-6 text-sage-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-700">Create from Scratch</h3>
                      <p className="text-sm text-primary-500">Build your recipe step by step</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-primary-600">
                      <Plus className="w-4 h-4" />
                      <span>Add ingredients and instructions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary-600">
                      <Plus className="w-4 h-4" />
                      <span>Set cooking times and difficulty</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary-600">
                      <Plus className="w-4 h-4" />
                      <span>Add tags and images</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button className="w-full px-4 py-2 bg-sage-500 hover:bg-sage-600 text-white rounded-xl font-medium transition-colors">
                      Start Creating
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Recipe Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Recipe Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`input-field ${errors.title ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Enter recipe name"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Servings
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.servings}
                    onChange={(e) => handleInputChange('servings', parseInt(e.target.value) || 1)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Describe your recipe..."
                />
              </div>

              {/* Time and Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Prep Time (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.prep_time}
                    onChange={(e) => handleInputChange('prep_time', parseInt(e.target.value) || 0)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Cook Time (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cook_time}
                    onChange={(e) => handleInputChange('cook_time', parseInt(e.target.value) || 0)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="input-field"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Ingredients */}
              {renderIngredientsField()}

              {/* Instructions */}
              {renderInstructionsField()}

              {/* Tags */}
              {renderTagsField()}

              {/* Image Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-primary-700">
                  Recipe Image
                </label>
                
                {imagePreview && (
                  <div className="w-full max-w-xs">
                    <img 
                      src={imagePreview} 
                      alt="Recipe preview" 
                      className="w-full h-32 object-cover rounded-xl border border-greige-200"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="flex items-center gap-2 px-4 py-2 bg-sage-100 hover:bg-sage-200 text-sage-700 rounded-xl transition-colors"
                  >
                    <ChefHat className="w-4 h-4" />
                    Choose File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="text-primary-500">or</span>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="Enter image URL"
                    className="flex-1 input-field"
                  />
                </div>
              </div>

              {/* Source URL (for imported recipes) */}
              {formData.source_url && (
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Source URL
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-greige-50 rounded-lg">
                    <Globe className="w-4 h-4 text-primary-500" />
                    <a 
                      href={formData.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sage-600 hover:text-sage-700 text-sm truncate"
                    >
                      {formData.source_url}
                    </a>
                  </div>
                </div>
              )}

              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t border-greige-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-sage-500 hover:bg-sage-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Recipe'}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/cook')}
                  className="px-6 py-3 text-primary-600 hover:text-primary-700 hover:bg-greige-100 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddRecipe;
