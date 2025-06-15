import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StudentProfile from './pages/StudentProfile';
import InactiveStudents from './pages/InactiveStudents';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';

function setThemeClass(theme) {
  // Remove any previous theme- classes from body
  document.body.classList.remove('theme-light', 'theme-dark');
  document.body.classList.add(`theme-${theme}`);
  // Also set theme class on main Bootstrap containers for card, modal, table, btn
  const themedClasses = ['card', 'modal-content', 'table', 'btn'];
  themedClasses.forEach(cls => {
    document.querySelectorAll(`.${cls}`).forEach(el => {
      el.classList.remove('theme-light', 'theme-dark');
      el.classList.add(`theme-${theme}`);
    });
  });
}

function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setThemeClass(theme);
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
