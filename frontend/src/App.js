import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StudentProfile from './pages/StudentProfile';
import InactiveStudents from './pages/InactiveStudents';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';

function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/student/:id" element={<StudentProfile />} />
        <Route path="/inactive" element={<InactiveStudents />} />
      </Routes>
    </Router>
  );
}

export default App;
