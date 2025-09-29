import React from 'react';
import type { Player } from '../types';

interface GameOverViewProps {
  players: [Player, Player];
  onPlayAgain: () => void;
}

export const GameOverView: React.FC<GameOverViewProps> = ({ players, onPlayAgain }) => {
  const winner = players[0].score > players[1].score ? players[0] : players[1].score > players[0].score ? players[1] : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in">
        <div className="w-full max-w-lg bg-slate-900/50 backdrop-blur-sm border border-blue-500/30 rounded-xl shadow-2xl p-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-light to-brand-accent text-transparent bg-clip-text mb-4">Game Over!</h1>
            
            {winner ? (
                <p className="text-2xl text-yellow-400 mb-6">🏆 {winner.name} wins! 🏆</p>
            ) : (
                <p className="text-2xl text-gray-300 mb-6">It's a draw!</p>
            )}

            <div className="flex justify-around items-center mb-8">
                <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-200">{players[0].name}</h2>
                    <p className="text-5xl font-bold text-brand-accent">{players[0].score}</p>
                    <p className="text-gray-400">points</p>
                </div>
                <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-200">{players[1].name}</h2>
                    <p className="text-5xl font-bold text-brand-accent">{players[1].score}</p>
                    <p className="text-gray-400">points</p>
                </div>
            </div>

            <button 
                onClick={onPlayAgain}
                className="w-full bg-gradient-to-r from-brand-secondary to-brand-accent hover:scale-105 transform transition-transform duration-200 shadow-lg text-white font-bold py-3 px-6 rounded-lg"
            >
                Play Again
            </button>
        </div>
    </div>
  );
};