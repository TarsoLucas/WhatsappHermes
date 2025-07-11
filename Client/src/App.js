import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/header';
import Footer from './components/footer';
import Inicio from './components/Inicio';
import Hermes from './components/Hermes';
import Athena from './components/Athena';
import Intro from './components/intro';
import './App.css';

function App() {
  const [showInitialScreen, setShowInitialScreen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialScreen(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      {showInitialScreen ? (
        <Intro />
      ) : (
        <Router>
          <div className="flex flex-col h-screen">
            <Header />
            <main className="flex-1 overflow-hidden">
              <Routes>
                <Route path="/" element={<Navigate to="/inicio" />} />
                <Route path="/inicio" element={<Inicio />} />
                <Route path="/hermes" element={<Hermes />} />
                <Route path="/athena" element={<Athena />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      )}
    </ThemeProvider>
  );
}

export default App;