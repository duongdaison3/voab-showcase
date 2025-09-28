

import React, { useState } from 'react';
import type { ShowcaseTopic } from '../types';

interface PlayerSetupViewProps {
  topic: ShowcaseTopic;
  onGameStart: (player1Name: string, player2Name: string, totalTimeInMinutes: number) => void;
  onBack: () => void;
}

export const PlayerSetupView: React.FC<PlayerSetupViewProps> = ({ topic, onGameStart, onBack }) => {
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [gameTime, setGameTime] = useState(2); // Default 2 minutes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(player1Name.trim() && player2Name.trim() && gameTime > 0) {
        onGameStart(player1Name, player2Name, gameTime);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-brand-dark p-8 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold text-brand-accent mb-2">Get Ready!</h1>
            <p className="text-lg text-gray-300 mb-6">Showcase: <span className="font-semibold">{topic.name}</span></p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="player1" className="block text-sm font-medium text-gray-300 text-left">Player 1 Name</label>
                    <input 
                        type="text" 
                        id="player1"
                        value={player1Name}
                        onChange={(e) => setPlayer1Name(e.target.value)}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="player2" className="block text-sm font-medium text-gray-300 text-left">Player 2 Name</label>
                    <input 
                        type="text" 
                        id="player2"
                        value={player2Name}
                        onChange={(e) => setPlayer2Name(e.target.value)}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                        required 
                    />
                </div>
                <div>
                  <label htmlFor="game-time" className="block text-sm font-medium text-gray-300 text-left">Game Time (minutes)</label>
                  <input
                    type="number"
                    id="game-time"
                    value={gameTime}
                    onChange={(e) => setGameTime(parseInt(e.target.value, 10))}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                    min="1"
                    max="10"
                    required
                  />
                </div>
                <div className="flex gap-4">
                    <button type="button" onClick={onBack} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        Back
                    </button>
                    <button type="submit" className="w-full bg-brand-secondary hover:bg-brand-primary text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        Start Game
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};