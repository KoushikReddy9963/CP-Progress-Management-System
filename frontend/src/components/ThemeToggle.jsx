import React from 'react';
import Button from 'react-bootstrap/Button';

const ThemeToggle = ({ theme, toggleTheme }) => (
  <Button variant="outline-secondary" onClick={toggleTheme} className="mb-2 float-end">
    {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
  </Button>
);

export default ThemeToggle;
