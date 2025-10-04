import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, X } from 'lucide-react';

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Prevent body scroll when dropdown is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-white/80 hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <User className="w-6 h-6 text-primary-600" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu */}
      <div
        className={`fixed top-4 right-4 w-80 max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl z-50 transform transition-all duration-300 ${
          isOpen 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-[-20px] opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-greige-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sage-100 rounded-full">
              <User className="w-6 h-6 text-sage-600" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-700">Profile</h3>
              <p className="text-sm text-primary-500">Manage your account</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-greige-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-primary-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto profile-dropdown-scroll">
          {/* Data Import Section */}
          <div className="p-6 border-b border-greige-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-sage-100 rounded-full">
                <Settings className="w-5 h-5 text-sage-600" />
              </div>
              <h4 className="font-semibold text-primary-700">Data Import</h4>
            </div>
            
            <p className="text-sm text-primary-600 mb-4">
              Import recipes and ingredients from external sources to expand your cooking database.
            </p>

            <div className="space-y-3">
              <button className="w-full p-3 bg-sage-50 hover:bg-sage-100 rounded-xl border border-sage-200 transition-colors text-left">
                <div className="font-medium text-primary-700">Import from TheMealDB</div>
                <div className="text-sm text-primary-500">Add popular recipes from a comprehensive database</div>
              </button>
              
              <button className="w-full p-3 bg-sage-50 hover:bg-sage-100 rounded-xl border border-sage-200 transition-colors text-left">
                <div className="font-medium text-primary-700">Import from CSV</div>
                <div className="text-sm text-primary-500">Upload recipe data from spreadsheet files</div>
              </button>
            </div>
          </div>

          {/* Sustainability Tips Section */}
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-sage-100 rounded-full">
                <Settings className="w-5 h-5 text-sage-600" />
              </div>
              <h4 className="font-semibold text-primary-700">Sustainability Tips</h4>
            </div>
            
            <p className="text-sm text-primary-600 mb-4">
              Learn how to cook more sustainably and reduce food waste.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-sage-50 rounded-xl border border-sage-200">
                <h5 className="font-medium text-primary-700 mb-2">🍃 Meal Planning</h5>
                <p className="text-sm text-primary-600">
                  Plan your meals for the week to reduce food waste and save money.
                </p>
              </div>
              
              <div className="p-4 bg-sage-50 rounded-xl border border-sage-200">
                <h5 className="font-medium text-primary-700 mb-2">♻️ Ingredient Substitution</h5>
                <p className="text-sm text-primary-600">
                  Use what you have! Our app suggests alternatives for missing ingredients.
                </p>
              </div>
              
              <div className="p-4 bg-sage-50 rounded-xl border border-sage-200">
                <h5 className="font-medium text-primary-700 mb-2">🌱 Seasonal Cooking</h5>
                <p className="text-sm text-primary-600">
                  Cook with seasonal ingredients for better flavor and sustainability.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-greige-200 bg-greige-50 rounded-b-2xl">
          <p className="text-xs text-primary-500 text-center">
            Cook Smart • Sustainable Cooking Made Simple
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;
