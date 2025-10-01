import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, BookOpen, Lightbulb, Database } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'pantry', label: 'Pantry', icon: ShoppingCart, path: '/pantry' },
    { id: 'recipes', label: 'Recipes', icon: BookOpen, path: '/recipes' },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, path: '/recommendations' },
    { id: 'import', label: 'Data Import', icon: Database, path: '/import' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Cook Smart</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side - could add user menu, settings, etc. */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Smart Cooking Assistant
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
