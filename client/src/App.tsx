import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Pantry from './components/Pantry';
import Recipes from './components/Recipes';
import Recommendations from './components/Recommendations';
import RecipeDetail from './components/RecipeDetail';
import DataImport from './components/DataImport';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pantry" element={<Pantry />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/import" element={<DataImport />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
