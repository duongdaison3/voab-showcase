import React, { useState, useEffect, useCallback } from 'react';
import { GameState, ShowcaseTopic, Player, GameResult } from './types';
import { getTopics } from './services/showcaseService';
import { saveGameResult } from './services/historyService';
import { AdminView } from './components/AdminView';
import { PlayerSetupView } from './components/PlayerSetupView';
import { GameView } from './components/GameView';
import { GameOverView } from './components/GameOverView';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.ADMIN_VIEW);
  const [topics, setTopics] = useState<ShowcaseTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<ShowcaseTopic | null>(null);
  const [players, setPlayers] = useState<[Player, Player] | null>(null);
  const [finalScores, setFinalScores] = useState<[Player, Player] | null>(null);
  const [gameTimeInSeconds, setGameTimeInSeconds] = useState(120);

  const fetchTopics = useCallback(async () => {
    setIsLoading(true);
    const topicsFromDb = await getTopics();
    setTopics(topicsFromDb);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleStartShowcase = (topic: ShowcaseTopic) => {
    setSelectedTopic(topic);
    setGameState(GameState.PLAYER_SETUP);
  };
  
  const handleGameStart = (player1Name: string, player2Name: string, totalTimeInMinutes: number) => {
    if (selectedTopic) {
      setPlayers([
        { name: player1Name, score: 0 },
        { name: player2Name, score: 0 },
      ]);
      setGameTimeInSeconds(totalTimeInMinutes * 60);
      setGameState(GameState.GAME_VIEW);
    }
  };

  const handleGameOver = async (finalPlayers: [Player, Player]) => {
    if(selectedTopic) {
      const newResult: GameResult = {
        id: crypto.randomUUID(),
        topicName: selectedTopic.name,
        players: finalPlayers,
        date: new Date().toISOString(),
      };
      await saveGameResult(newResult);
    }
    setFinalScores(finalPlayers);
    setGameState(GameState.GAME_OVER);
  };

  const handlePlayAgain = () => {
    setSelectedTopic(null);
    setPlayers(null);
    setFinalScores(null);
    setGameState(GameState.ADMIN_VIEW);
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.ADMIN_VIEW:
        if (isLoading) {
          return <div className="flex items-center justify-center min-h-screen"><p className="text-xl">Loading Database...</p></div>;
        }
        return <AdminView topics={topics} onStartShowcase={handleStartShowcase} onTopicCreated={fetchTopics} />;
      case GameState.PLAYER_SETUP:
        if (selectedTopic) {
          return <PlayerSetupView topic={selectedTopic} onGameStart={handleGameStart} onBack={handlePlayAgain} />;
        }
        return null;
      case GameState.GAME_VIEW:
        if (selectedTopic && players) {
          return <GameView topic={selectedTopic} initialPlayers={players} onGameOver={handleGameOver} onStopGame={handlePlayAgain} totalTime={gameTimeInSeconds} />;
        }
        return null;
      case GameState.GAME_OVER:
        if (finalScores) {
          return <GameOverView players={finalScores} onPlayAgain={handlePlayAgain} />;
        }
        return null;
      default:
        return <div>Error: Unknown game state.</div>;
    }
  };

  return (
    <main className="min-h-screen bg-brand-darker font-sans">
      {renderContent()}
    </main>
  );
};

export default App;