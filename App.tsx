
import React, { useState, useEffect } from 'react';
import { ViewType } from './types';
import LogisticsView from './components/LogisticsView';
import EncyclopediaView from './components/EncyclopediaView';
import Header from './components/Header';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.LOGISTICS);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleView = () => {
    setCurrentView(prev => 
      prev === ViewType.LOGISTICS ? ViewType.ENCYCLOPEDIA : ViewType.LOGISTICS
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header 
        currentView={currentView} 
        onViewToggle={toggleView}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
      />
      <main className="flex-1 relative overflow-hidden bg-background-light dark:bg-background-dark">
        {currentView === ViewType.LOGISTICS ? (
          <LogisticsView />
        ) : (
          <EncyclopediaView onClose={toggleView} />
        )}
      </main>
    </div>
  );
};

export default App;
