import React, { useState, useEffect } from 'react';
import { X, Calendar, Package, Tag, FileText } from 'lucide-react';
import { pantryApi } from '../services/api';

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

interface Category {
  id: number;
  name: string;
  color: string;
}

interface AddItemModalProps {
  categories: Category[];
  item?: PantryItem | null;
  onSubmit: (itemData: any) => void;
  onClose: () => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ categories, item, onSubmit, onClose }) => {
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 1,
    unit: 'pieces',
    expiration_date: '',
    purchase_date: getTodayDate(),
    notes: '',
    dietary_tags: [] as string[],
    allergens: [] as string[]
  });

  const commonUnits = [
    'pieces', 'g', 'kg', 'oz', 'lb', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'can', 'bottle', 'bag', 'box'
  ];

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiration_date: item.expiration_date || '',
        purchase_date: item.purchase_date || getTodayDate(),
        notes: item.notes || '',
        dietary_tags: item.dietary_tags ? item.dietary_tags.split(',').map(tag => tag.trim()) : [],
        allergens: item.allergens ? item.allergens.split(',').map(allergen => allergen.trim()) : []
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter an ingredient name');
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
  };

  const handleTagChange = (field: 'dietary_tags' | 'allergens', value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      [field]: tags
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-cream-100 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-greige-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sage-100 rounded-xl">
              <Package className="w-6 h-6 text-sage-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-700">
                {item ? 'Edit Item' : 'Add New Item'}
              </h2>
              <p className="text-primary-500 text-sm">Add ingredients to your pantry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-greige-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-primary-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              <Package className="w-4 h-4 inline mr-1" />
              Item Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-greige-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              placeholder="e.g., Organic Tomatoes"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-4 py-3 border border-greige-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-greige-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full px-4 py-3 border border-greige-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                {commonUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Purchase Date
            </label>
            <input
              type="date"
              value={formData.purchase_date}
              onChange={(e) => handleChange('purchase_date', e.target.value)}
              className="w-full px-4 py-3 border border-greige-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Expiration Date (optional)
            </label>
            <input
              type="date"
              value={formData.expiration_date}
              onChange={(e) => handleChange('expiration_date', e.target.value)}
              className="w-full px-4 py-3 border border-greige-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-greige-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white"
              placeholder="Add any notes about this item..."
            />
          </div>

          {/* Dietary Tags */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Dietary Tags (optional)
            </label>
            <input
              type="text"
              value={formData.dietary_tags.join(', ')}
              onChange={(e) => handleTagChange('dietary_tags', e.target.value)}
              className="w-full px-4 py-3 border border-greige-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              placeholder="e.g., organic, gluten-free, vegan"
            />
            <p className="text-xs text-primary-500 mt-1">Separate multiple tags with commas</p>
          </div>

          {/* Allergens */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Allergens (optional)
            </label>
            <input
              type="text"
              value={formData.allergens.join(', ')}
              onChange={(e) => handleTagChange('allergens', e.target.value)}
              className="w-full px-4 py-3 border border-greige-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              placeholder="e.g., nuts, dairy, soy"
            />
            <p className="text-xs text-primary-500 mt-1">Separate multiple allergens with commas</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-sage-500 hover:bg-sage-600 text-white rounded-xl font-medium transition-colors"
            >
              <Package className="w-4 h-4" />
              {item ? 'Update Item' : 'Add Item'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-primary-600 hover:text-primary-700 hover:bg-greige-200 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;