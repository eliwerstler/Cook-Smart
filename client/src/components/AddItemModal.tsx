import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Calendar, Package, Tag, FileText, Sparkles, ChevronDown } from 'lucide-react';
import { getIngredientSuggestions, getDefaultQuantity } from '../services/ingredientRecognition';
import { pantryApi } from '../services/api';

interface Category {
  id: number;
  name: string;
  color: string;
}

interface PantryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiration_date: string;
  purchase_date: string;
  notes: string;
  dietary_tags?: string;
  allergens?: string;
}

interface AddItemModalProps {
  categories: Category[];
  item?: PantryItem | null;
  onSubmit: (itemData: any) => void;
  onClose: () => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ categories, item, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 1,
    unit: 'pieces',
    expiration_date: '',
    purchase_date: '',
    notes: '',
    dietary_tags: [] as string[],
    allergens: [] as string[]
  });

  const [smartSuggestions, setSmartSuggestions] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState(false);

  // Autocomplete state
  const [autocompleteResults, setAutocompleteResults] = useState<any[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiration_date: item.expiration_date || '',
        purchase_date: item.purchase_date || '',
        notes: item.notes || '',
        dietary_tags: item.dietary_tags ? item.dietary_tags.split(',').filter(Boolean) : [],
        allergens: item.allergens ? item.allergens.split(',').filter(Boolean) : []
      });
    }
  }, [item]);

  // Debounced autocomplete search
  const searchIngredients = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await pantryApi.searchIngredients(query);
      setAutocompleteResults(response.data);
      setShowAutocomplete(response.data.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error searching ingredients:', error);
      setAutocompleteResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category) {
      alert('Please fill in the required fields');
      return;
    }

    const submitData = {
      ...formData,
      name: formData.name.trim(),
      quantity: Number(formData.quantity),
      expiration_date: formData.expiration_date || null,
      purchase_date: formData.purchase_date || null,
      notes: formData.notes.trim() || null
    };

    onSubmit(submitData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Trigger autocomplete search when name changes
    if (field === 'name') {
      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the search
      debounceTimerRef.current = setTimeout(() => {
        searchIngredients(value);
      }, 300);

      // Trigger smart suggestions when name changes
      if (value && value.trim().length > 2 && !appliedSuggestions) {
        const suggestions = getIngredientSuggestions(value);
        setSmartSuggestions(suggestions);
        setShowSuggestions(true);
      }
    }
  };

  const selectAutocompleteItem = (name: string) => {
    setFormData(prev => ({ ...prev, name }));
    setShowAutocomplete(false);
    setAutocompleteResults([]);
    setSelectedIndex(-1);

    // Trigger smart suggestions for the selected item
    if (!appliedSuggestions) {
      const suggestions = getIngredientSuggestions(name);
      setSmartSuggestions(suggestions);
      setShowSuggestions(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAutocomplete || autocompleteResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < autocompleteResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < autocompleteResults.length) {
          selectAutocompleteItem(autocompleteResults[selectedIndex].name);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowAutocomplete(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const applySuggestions = () => {
    if (smartSuggestions) {
      const suggestedUnits = smartSuggestions.units || ['pieces'];
      const defaultQuantity = getDefaultQuantity(formData.name, suggestedUnits[0]);

      setFormData(prev => ({
        ...prev,
        category: smartSuggestions.category || prev.category,
        unit: suggestedUnits[0],
        quantity: defaultQuantity,
        dietary_tags: smartSuggestions.dietaryTags || [],
        allergens: smartSuggestions.allergens || []
      }));

      setAppliedSuggestions(true);
      setShowSuggestions(false);
    }
  };

  const dismissSuggestions = () => {
    setShowSuggestions(false);
    setAppliedSuggestions(true);
  };

  const commonUnits = [
    'pieces', 'g', 'kg', 'oz', 'lb', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'can', 'bottle', 'bag', 'box'
  ];

  // Smart unit ordering - prioritize suggested units
  const getOrderedUnits = () => {
    if (!smartSuggestions?.units) return commonUnits;

    const suggestedUnits = smartSuggestions.units;
    const remainingUnits = commonUnits.filter(unit => !suggestedUnits.includes(unit));

    return [...suggestedUnits, ...remainingUnits];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" autoComplete="off">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
              <input
                ref={inputRef}
                type="text"
                required
                name="pantry-item-name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (formData.name.trim().length >= 2 && autocompleteResults.length > 0) {
                    setShowAutocomplete(true);
                  }
                }}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Organic Tomatoes"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                </div>
              )}
              {!isSearching && autocompleteResults.length > 0 && formData.name.trim().length >= 2 && (
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              )}

              {/* Autocomplete Dropdown */}
              {showAutocomplete && autocompleteResults.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {autocompleteResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectAutocompleteItem(result.name)}
                      className={`w-full text-left px-4 py-2 hover:bg-primary-50 transition-colors flex items-center justify-between ${
                        index === selectedIndex ? 'bg-primary-100' : ''
                      } ${index === 0 ? 'rounded-t-lg' : ''} ${
                        index === autocompleteResults.length - 1 ? 'rounded-b-lg' : ''
                      }`}
                    >
                      <span className="text-gray-900">{result.name}</span>
                      {result.frequency > 1 && (
                        <span className="text-xs text-gray-500 ml-2">
                          {result.frequency} recipes
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Smart Suggestions */}
          {showSuggestions && smartSuggestions && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="text-blue-600" size={16} />
                  <span className="text-sm font-medium text-blue-900">Smart Suggestions</span>
                </div>
                <button
                  type="button"
                  onClick={dismissSuggestions}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Dismiss
                </button>
              </div>

              <div className="text-sm text-blue-800 mb-3">
                <div><strong>Category:</strong> {smartSuggestions.category}</div>
                <div><strong>Recommended units:</strong> {smartSuggestions.units?.join(', ')}</div>
                {smartSuggestions.dietaryTags?.length > 0 && (
                  <div><strong>Dietary:</strong> {smartSuggestions.dietaryTags.join(', ')}</div>
                )}
                {smartSuggestions.allergens?.length > 0 && (
                  <div><strong>Allergens:</strong> {smartSuggestions.allergens.join(', ')}</div>
                )}
              </div>

              <button
                type="button"
                onClick={applySuggestions}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Apply Suggestions
              </button>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                required
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {getOrderedUnits().map((unit) => (
                  <option
                    key={unit}
                    value={unit}
                    className={smartSuggestions?.units?.includes(unit) ? 'font-semibold bg-blue-50' : ''}
                  >
                    {unit} {smartSuggestions?.units?.includes(unit) ? '⭐' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => handleChange('purchase_date', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={formData.expiration_date}
                onChange={(e) => handleChange('expiration_date', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          {/* Dietary Tags and Allergens */}
          {(formData.dietary_tags.length > 0 || formData.allergens.length > 0) && (
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Automatically Detected Tags</h4>

              {formData.dietary_tags.length > 0 && (
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">Dietary Information</label>
                  <div className="flex flex-wrap gap-1">
                    {formData.dietary_tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.allergens.length > 0 && (
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">Allergen Information</label>
                  <div className="flex flex-wrap gap-1">
                    {formData.allergens.map((allergen) => (
                      <span
                        key={allergen}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                      >
                        ⚠️ {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
