import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}/>
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage/></ProtectedRoute>}/>
          <Route path="*" element={<div>Stránka nenalezena</div>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
