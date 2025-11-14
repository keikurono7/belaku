import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MCQPage from './WelcomePage';
import AdminPage from './Admin';
import Discussion from './pages/Discussions';
import DashboardPage from './pages/Dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MCQPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/discuss" element={<Discussion />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
    </Router>
  );
};

export default App;
