import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className={`theme-toggle ${theme}`} 
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      title={theme === 'dark' ? 'Beralih ke Terang' : 'Beralih ke Gelap'}
    >
      <div className="theme-toggle__icon-wrapper">
        {theme === 'dark' ? (
          <Sun className="theme-toggle__icon sun-icon" size={24} />
        ) : (
          <Moon className="theme-toggle__icon moon-icon" size={24} />
        )}
      </div>
    </button>
  );
}
