import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { RankPage } from './pages/RankPage';
import { Statistics } from './pages/Statistics';
import { Calendar } from './pages/Calendar';
import { Quests } from './pages/Quests';
import { MatchHistory } from './pages/MatchHistory';
import { Profile } from './pages/Profile';
import { Timeline } from './pages/Timeline';
import { Layout } from './components/Layout';
import { PostGameLobby } from './components/PostGameLobby';

const AppContent = () => {
  const { hasOnboarded } = useGame();
  const [activeTab, setActiveTab] = useState('home');
  const [showSettings, setShowSettings] = useState(false);

  if (!hasOnboarded) {
    return <Onboarding />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home onNavigate={setActiveTab} />;
      case 'rank': return <RankPage onNavigate={setActiveTab} />;
      case 'quests': return <Quests />;
      case 'stats': return <Statistics />;
      case 'calendar': return <Calendar />;
      case 'history': return <MatchHistory />;
      case 'profile': return <Profile />;
      case 'timeline': return <Timeline />;
      default: return <Home onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      showSettings={showSettings}
      onSettingsToggle={() => setShowSettings(!showSettings)}
    >
      {renderContent()}
      <PostGameLobby />
    </Layout>
  );
};

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}