import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const Inicio = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className={`flex items-center justify-center h-full page-transition ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <h1 className={`text-4xl font-bold ${
        darkMode ? 'text-emerald-400' : 'text-emerald-900'
      }`}>
        Bem vindo
      </h1>
    </div>
  );
};

export default Inicio; 