import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat, ShoppingCart } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const location = useLocation();

  const navItems = [
    { id: 'cook', label: 'Cook', icon: ChefHat, path: '/cook', color: 'sage' },
    { id: 'pantry', label: 'Pantry', icon: ShoppingCart, path: '/pantry', color: 'primary' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-greige-300">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/cook" 
            className="flex items-center space-x-3 text-primary-500 hover:text-primary-600 transition-colors duration-300"
            onClick={() => setActiveTab('cook')}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-sage-500 to-primary-500 rounded-xl flex items-center justify-center shadow-sm">
              <ChefHat className="text-white" size={20} />
            </div>
            <span className="text-xl font-semibold text-primary-700">Cook Smart</span>
          </Link>

          {/* Centered Navigation Items */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2 bg-greige-200 rounded-2xl p-1 shadow-md">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const colorClass = item.color === 'sage' ? 'sage' : 'primary';
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ease-in-out transform ${
                      active
                        ? `bg-${colorClass}-500 text-white shadow-lg scale-105 border-2 border-${colorClass}-600`
                        : `text-${colorClass}-700 hover:text-${colorClass}-800 hover:bg-white hover:shadow-md hover:scale-102 border-2 border-transparent`
                    }`}
                  >
                    <Icon size={18} className="transition-transform duration-300" />
                    <span className="font-semibold">{item.label}</span>
                    {active && (
                      <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-${colorClass}-300 rounded-full animate-pulse`}></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
