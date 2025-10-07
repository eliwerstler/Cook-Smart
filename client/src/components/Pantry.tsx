import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package, Upload, ShoppingCart, AlertTriangle, CheckSquare, Square, Download, Clock, Calendar, Tag } from 'lucide-react';
import { pantryApi } from '../services/api';
import AddItemModal from './AddItemModal';
import BulkImportModal from './BulkImportModal';
import ScrollAnimation from './ScrollAnimation';

interface PantryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiration_date: string;
  purchase_date: string;
  notes: string;
  category_color: string;
  dietary_tags?: string;
  allergens?: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

const Pantry: React.FC = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'expiration' | 'quantity'>('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showBatchActions, setShowBatchActions] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsResponse, categoriesResponse] = await Promise.all([
        pantryApi.getItems(),
        pantryApi.getCategories()
      ]);
      setItems(itemsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      console.error('Error loading pantry data:', err);
      setError('Failed to load pantry data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (itemData: any) => {
    try {
      await pantryApi.addItem(itemData);
      await loadData();
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item');
    }
  };

  const handleUpdateItem = async (itemData: any) => {
    if (!editingItem) return;
    
    try {
      await pantryApi.updateItem(editingItem.id, itemData);
      await loadData();
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await pantryApi.deleteItem(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    }
  };

  // Batch action handlers
  const handleSelectItem = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    setShowBatchActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredAndSortedItems.length) {
      setSelectedItems(new Set());
      setShowBatchActions(false);
    } else {
      const allIds = new Set(filteredAndSortedItems.map(item => item.id));
      setSelectedItems(allIds);
      setShowBatchActions(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedItems.size} item(s)?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await Promise.all(
        Array.from(selectedItems).map(id => pantryApi.deleteItem(id))
      );
      await loadData();
      setSelectedItems(new Set());
      setShowBatchActions(false);
    } catch (err) {
      console.error('Error bulk deleting items:', err);
      setError('Failed to delete some items');
    }
  };

  const handleBulkUpdateCategory = async (newCategory: string) => {
    if (selectedItems.size === 0 || !newCategory) return;

    try {
      const selectedItemsData = items.filter(item => selectedItems.has(item.id));

      await Promise.all(
        selectedItemsData.map(item =>
          pantryApi.updateItem(item.id, { ...item, category: newCategory })
        )
      );

      await loadData();
      setSelectedItems(new Set());
      setShowBatchActions(false);
    } catch (err) {
      console.error('Error bulk updating category:', err);
      setError('Failed to update some items');
    }
  };

  const handleBulkExport = () => {
    if (selectedItems.size === 0) return;

    const selectedItemsData = items.filter(item => selectedItems.has(item.id));

    const csvContent = [
      'Name,Category,Quantity,Unit,Expiration Date,Purchase Date,Notes,Dietary Tags,Allergens',
      ...selectedItemsData.map(item =>
        `"${item.name}","${item.category}",${item.quantity},"${item.unit}","${item.expiration_date || ''}","${item.purchase_date || ''}","${item.notes || ''}","${item.dietary_tags || ''}","${item.allergens || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pantry-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleGenerateShoppingList = async () => {
    try {
      const response = await pantryApi.generateShoppingList(1, selectedCategory !== 'all' ? [selectedCategory] : undefined);
      const shoppingList = response.data;

      if (shoppingList.items.length === 0) {
        alert('No low stock items found!');
        return;
      }

      // Create a downloadable shopping list
      const listText = [
        `Shopping List - Generated on ${new Date(shoppingList.generated_at).toLocaleDateString()}`,
        '='.repeat(50),
        '',
        ...shoppingList.items.map((item: any) =>
          `□ ${item.name} (${item.suggested_quantity} ${item.unit}) - ${item.category}`
        ),
        '',
        `Total items: ${shoppingList.total_items}`
      ].join('\n');

      const blob = new Blob([listText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shopping-list-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating shopping list:', err);
      setError('Failed to generate shopping list');
    }
  };

  const filteredAndSortedItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesExpiring = !showExpiringOnly || isExpiringSoon(item.expiration_date) || isExpired(item.expiration_date);
      const matchesLowStock = !showLowStockOnly || item.quantity < 1;
      return matchesSearch && matchesExpiring && matchesLowStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'expiration':
          return new Date(a.expiration_date || '9999-12-31').getTime() - 
                 new Date(b.expiration_date || '9999-12-31').getTime();
        case 'quantity':
          return a.quantity - b.quantity;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const isExpiringSoon = (expirationDate: string) => {
    if (!expirationDate) return false;
    const expiration = new Date(expirationDate);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 7 && daysUntilExpiration >= 0;
  };

  const isExpired = (expirationDate: string) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollAnimation direction="up" delay={0}>
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Package className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-primary-700">My Pantry</h1>
          </div>
          <p className="text-primary-600 text-lg max-w-2xl mx-auto">
            Keep track of your ingredients and never run out of what you need
          </p>
        </div>
      </ScrollAnimation>

      {/* Quick Actions */}
      <ScrollAnimation direction="up" delay={100}>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-sage-500 hover:bg-sage-600 text-white rounded-xl font-medium transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
          <button
            onClick={() => setShowBulkImportModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors shadow-sm hover:shadow-md"
          >
            <Upload className="w-5 h-5" />
            Bulk Import
          </button>
          <button
            onClick={handleGenerateShoppingList}
            className="flex items-center gap-2 px-6 py-3 bg-blush-500 hover:bg-blush-600 text-white rounded-xl font-medium transition-colors shadow-sm hover:shadow-md"
          >
            <ShoppingCart className="w-5 h-5" />
            Shopping List
          </button>
        </div>
      </ScrollAnimation>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>


          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'expiration' | 'quantity')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="expiration">Sort by Expiration</option>
            <option value="quantity">Sort by Quantity</option>
          </select>

          {/* Select All / Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 hover:text-gray-800 transition-colors"
            >
              {selectedItems.size === filteredAndSortedItems.length && filteredAndSortedItems.length > 0 ? (
                <CheckSquare size={16} className="text-blue-600" />
              ) : (
                <Square size={16} />
              )}
              <span>Select All</span>
            </button>
            <span>{filteredAndSortedItems.length} items</span>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowExpiringOnly(!showExpiringOnly)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors ${
              showExpiringOnly
                ? 'bg-orange-100 text-orange-800 border border-orange-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle size={14} />
            <span>Expiring Soon</span>
          </button>

          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors ${
              showLowStockOnly
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            <Package size={14} />
            <span>Low Stock</span>
          </button>

          {(showExpiringOnly || showLowStockOnly) && (
            <button
              onClick={() => {
                setShowExpiringOnly(false);
                setShowLowStockOnly(false);
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Batch Actions Toolbar */}
      {showBatchActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedItems.size} item(s) selected
              </span>
              <button
                onClick={() => {
                  setSelectedItems(new Set());
                  setShowBatchActions(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkExport}
                className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={14} />
                <span>Export</span>
              </button>
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkUpdateCategory(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Change Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Tag className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" size={14} />
              </div>
              <button
                onClick={handleBulkDelete}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items Grid */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first pantry item'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedItems.map((item) => (
            <div key={item.id} className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all ${
              selectedItems.has(item.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleSelectItem(item.id)}
                    className="flex-shrink-0 hover:scale-110 transition-transform"
                  >
                    {selectedItems.has(item.id) ? (
                      <CheckSquare size={18} className="text-blue-600" />
                    ) : (
                      <Square size={18} className="text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.category_color || '#6B7280' }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{item.quantity} {item.unit}</span>
                </div>
                
                {item.expiration_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Expires:</span>
                    <span className={`font-medium ${
                      isExpired(item.expiration_date) 
                        ? 'text-red-600' 
                        : isExpiringSoon(item.expiration_date)
                        ? 'text-orange-600'
                        : 'text-gray-900'
                    }`}>
                      {new Date(item.expiration_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {item.purchase_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Purchased:</span>
                    <span className="text-gray-900">{new Date(item.purchase_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {item.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 italic">{item.notes}</p>
                </div>
              )}

              {/* Status Badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                {isExpired(item.expiration_date) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Expired
                  </span>
                )}
                {isExpiringSoon(item.expiration_date) && !isExpired(item.expiration_date) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Expires Soon
                  </span>
                )}
                {item.quantity < 1 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Low Stock
                  </span>
                )}

                {/* Dietary Tags */}
                {item.dietary_tags && item.dietary_tags.split(',').filter(Boolean).map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    🌱 {tag.trim()}
                  </span>
                ))}

                {/* Allergen Warnings */}
                {item.allergens && item.allergens.split(',').filter(Boolean).map((allergen) => (
                  <span key={allergen} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    ⚠️ {allergen.trim()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddItemModal
          categories={categories}
          onSubmit={handleAddItem}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingItem && (
        <AddItemModal
          categories={categories}
          item={editingItem}
          onSubmit={handleUpdateItem}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <BulkImportModal
          categories={categories}
          onClose={() => setShowBulkImportModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default Pantry;
