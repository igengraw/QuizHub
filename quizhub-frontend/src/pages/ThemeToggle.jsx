import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-yellow-400 transition-all hover:scale-110"
      title={isDark ? "Включить свет" : "Включить тьму"}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;