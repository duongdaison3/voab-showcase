

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Player, ShowcaseTopic } from '../types';
import { useTimer } from '../hooks/useTimer';
import { PlayerPanel } from './PlayerPanel';

const PASS_PENALTY = 5; // 5 seconds

interface GameViewProps {
  topic: ShowcaseTopic;
  initialPlayers: [Player, Player];
  onGameOver: (players: [Player, Player]) => void;
  onStopGame: () => void;
  totalTime: number; // Total time in seconds
}

export const GameView: React.FC<GameViewProps> = ({ topic, initialPlayers, onGameOver, onStopGame, totalTime }) => {
  const [players, setPlayers] = useState<[Player, Player]>(initialPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [revealedState, setRevealedState] = useState<{ answer: string; type: 'correct' | 'pass' } | null>(null);
  
  const [player1TimeUp, setPlayer1TimeUp] = useState(false);
  const [player2TimeUp, setPlayer2TimeUp] = useState(false);

  const [isStopConfirmVisible, setIsStopConfirmVisible] = useState(false);
  const [wasTimerRunning, setWasTimerRunning] = useState<number | null>(null);


  const shuffledImages = useMemo(() => [...topic.images].sort(() => Math.random() - 0.5), [topic.images]);

  const handleTimeUp = useCallback((playerIndex: number) => {
    if (playerIndex === 0) setPlayer1TimeUp(true);
    if (playerIndex === 1) setPlayer2TimeUp(true);
  }, []);

  const { time: p1Time, isRunning: p1IsRunning, start: p1Start, pause: p1Pause, deductTime: p1DeductTime } = useTimer(totalTime, () => handleTimeUp(0));
  const { time: p2Time, isRunning: p2IsRunning, start: p2Start, pause: p2Pause, deductTime: p2DeductTime } = useTimer(totalTime, () => handleTimeUp(1));

  useEffect(() => {
    // Start game for player 1
    if (!player1TimeUp) {
      p1Start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (player1TimeUp && player2TimeUp) {
      onGameOver(players);
    }
  }, [player1TimeUp, player2TimeUp, onGameOver, players]);

  const switchTurn = useCallback(() => {
    const nextPlayerIndex = (currentPlayerIndex + 1) % 2;
    
    // Pause current player
    if (currentPlayerIndex === 0) p1Pause();
    else p2Pause();
    
    // Start next player if they have time
    if (nextPlayerIndex === 0 && !player1TimeUp) {
      p1Start();
    } else if (nextPlayerIndex === 1 && !player2TimeUp) {
      p2Start();
    } else {
       // If next player's time is up, try the other one again
       if (nextPlayerIndex === 0 && player1TimeUp && !player2TimeUp) {
         p2Start();
         setCurrentPlayerIndex(1);
         return;
       }
       if (nextPlayerIndex === 1 && player2TimeUp && !player1TimeUp) {
         p1Start();
         setCurrentPlayerIndex(0);
         return;
       }
    }
    
    setCurrentPlayerIndex(nextPlayerIndex);

  }, [currentPlayerIndex, p1Pause, p2Pause, p1Start, p2Start, player1TimeUp, player2TimeUp]);


  const handleCorrectAnswer = () => {
    if ((currentPlayerIndex === 0 && player1TimeUp) || (currentPlayerIndex === 1 && player2TimeUp)) return;

    setRevealedState({ answer: shuffledImages[currentImageIndex].name, type: 'correct' });

    const newPlayers = players.map((p, index) =>
      index === currentPlayerIndex ? { ...p, score: p.score + 1 } : p
    ) as [Player, Player];
    
    setPlayers(newPlayers);

    setTimeout(() => {
      setRevealedState(null);
      
      if (currentImageIndex === shuffledImages.length - 1) {
        onGameOver(newPlayers);
      } else {
        setCurrentImageIndex(prev => (prev + 1) % shuffledImages.length);
        switchTurn();
      }
    }, 1500);
  };
  
  const handlePass = () => {
    if ((currentPlayerIndex === 0 && player1TimeUp) || (currentPlayerIndex === 1 && player2TimeUp)) return;

    setRevealedState({ answer: shuffledImages[currentImageIndex].name, type: 'pass' });

    if (currentPlayerIndex === 0) {
      p1DeductTime(PASS_PENALTY);
    } else {
      p2DeductTime(PASS_PENALTY);
    }

    setTimeout(() => {
      setRevealedState(null);
      if (currentImageIndex === shuffledImages.length - 1) {
        onGameOver(players);
      } else {
        setCurrentImageIndex(prev => (prev + 1) % shuffledImages.length);
        switchTurn();
      }
    }, 1500);
  };

  const handleRequestStop = () => {
    if (p1IsRunning) {
      p1Pause();
      setWasTimerRunning(0);
    } else if (p2IsRunning) {
      p2Pause();
      setWasTimerRunning(1);
    } else {
      setWasTimerRunning(null);
    }
    setIsStopConfirmVisible(true);
  };

  const handleCancelStop = () => {
    setIsStopConfirmVisible(false);
    if (wasTimerRunning === 0) {
      p1Start();
    } else if (wasTimerRunning === 1) {
      p2Start();
    }
    setWasTimerRunning(null);
  };

  const currentImage = shuffledImages[currentImageIndex];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen p-4 bg-brand-darker gap-8">
      <PlayerPanel player={players[0]} time={p1Time} totalTime={totalTime} isActive={p1IsRunning} onCorrectAnswer={handleCorrectAnswer} onPass={handlePass} isTimeUp={player1TimeUp}/>

      <div className="flex flex-col items-center justify-center w-full max-w-2xl">
        {currentImage ? (
            <div className="relative w-full aspect-video bg-black rounded-lg shadow-lg overflow-hidden">
                 <img src={currentImage.dataUrl} alt="Vocabulary item" className="w-full h-full object-contain" />
                 {revealedState && (
                     <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                         <p className={`text-4xl font-bold animate-pulse ${revealedState.type === 'correct' ? 'text-green-400' : 'text-red-500'}`}>{revealedState.answer}</p>
                     </div>
                 )}
            </div>
        ) : (
            <p>Loading image...</p>
        )}
        <div className="mt-6">
          <button 
            onClick={handleRequestStop}
            className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 shadow-lg"
            aria-label="Stop Showcase"
          >
            Stop Showcase
          </button>
        </div>
      </div>

      <PlayerPanel player={players[1]} time={p2Time} totalTime={totalTime} isActive={p2IsRunning} onCorrectAnswer={handleCorrectAnswer} onPass={handlePass} isTimeUp={player2TimeUp} />
      
      {isStopConfirmVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="stop-dialog-title">
          <div className="bg-brand-dark p-8 rounded-lg shadow-2xl text-center max-w-sm w-full mx-4">
            <h2 id="stop-dialog-title" className="text-2xl font-bold text-brand-accent mb-4">Stop Game?</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to end the current showcase? All progress will be lost.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancelStop}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={onStopGame}
                className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                Confirm Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
