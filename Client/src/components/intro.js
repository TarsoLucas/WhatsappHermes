import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const Intro = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className={`flex ${
      darkMode 
        ? 'bg-gradient-to-r from-gray-900 to-transparent' 
        : 'bg-gradient-to-r from-white to-transparent'
    } max-h-3/4`}>
      <img
        src={require('../images/hermes2.png')}
        alt="Hermes"
        className="animate-image opacity-1 right-0 w-2/5 object-cover self-end"
      />
      <div className="ml-32 mt-40 text-animate">
        <h1 className={`text-2xl font-bold opacity-1 animate-fade-in-out ${
          darkMode ? 'text-emerald-400' : 'text-gray-900'
        }`}>
          Você chegou ao...
        </h1>
        <h1 className={`mt-12 text-6xl text-center font-bold opacity-1 animate-fade-in-out ${
          darkMode ? 'text-emerald-300' : 'text-gray-900'
        }`}>
          Whatsapp-Hermes
        </h1>
        <h3 className={`text-xl mt-8 opacity-1 animate-fade-in-out ${
          darkMode ? 'text-emerald-400' : 'text-gray-700'
        }`}>
          O maior centro de telecomunicações que essa filial já viu...
        </h3>
      </div>
    </div>
  );
};

export default Intro;
