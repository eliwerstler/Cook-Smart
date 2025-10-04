import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Pantry from './components/Pantry';
import RecipeDetail from './components/RecipeDetail';
import AddRecipe from './components/AddRecipe';
import ParticleBackground from './components/ParticleBackground';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('cook');

  return (
    <Router>
      <div className="min-h-screen bg-greige-100 relative">
        <ParticleBackground />
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="container mx-auto px-6 py-8 relative z-10">
          <Routes>
            {/* Redirect old routes to new simplified structure */}
            <Route path="/" element={<Navigate to="/cook" replace />} />
            <Route path="/dashboard" element={<Navigate to="/cook" replace />} />
            <Route path="/recipes" element={<Navigate to="/cook" replace />} />
            <Route path="/recommendations" element={<Navigate to="/cook" replace />} />
            
            {/* New simplified routes */}
            <Route path="/cook" element={<Dashboard />} />
            <Route path="/pantry" element={<Pantry />} />
            
            {/* Keep recipe detail route */}
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/recipe/new" element={<AddRecipe />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
