import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Board/Dashboard';
import { ToastProvider } from './components/Toast/ToastProvider'; // Import the provider

// We create a "Content" component so we can use useLocation() inside it
const AppContent = () => {
  const location = useLocation();
  const isDash = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      {isDash && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <ToastProvider> {/* 1. Wrap everything here */}
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  );
};

export default App;