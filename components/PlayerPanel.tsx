
import React from 'react';
import type { Player } from '../types';
import { TimerDisplay } from './TimerDisplay';

interface PlayerPanelProps {
  player: Player;
  time: number;
  totalTime: number;
  isActive: boolean;
  onCorrectAnswer: () => void;
  onPass: () => void;
  isTimeUp: boolean;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({ player, time, totalTime, isActive, onCorrectAnswer, onPass, isTimeUp }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = time > 0 ? time / totalTime : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const getProgressColor = () => {
    if (progress > 0.5) return 'stroke-green-500';
    if (progress > 0.25) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };
  
  return (
    <div className={`flex flex-col items-center p-6 rounded-lg transition-all duration-500 ${isActive ? 'bg-brand-primary shadow-2xl scale-105' : 'bg-brand-dark'}`}>
      <h2 className="text-3xl font-bold text-brand-accent mb-4">{player.name}</h2>
      <div className="mb-6">
        <p className="text-lg text-gray-400">Score</p>
        <p className="text-6xl font-bold">{player.score}</p>
      </div>
      
      {/* Container for Timer and Progress Circle */}
      <div className="relative mb-6 w-48 h-48 flex items-center justify-center">
        {/* SVG for the circular progress bar */}
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            strokeWidth="10"
            className="stroke-gray-700"
            fill="transparent"
          />
          {/* Progress indicator */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-[stroke-dashoffset] duration-1000 ease-linear ${getProgressColor()}`}
            fill="transparent"
          />
        </svg>
        {/* The original TimerDisplay component */}
        <TimerDisplay time={time} />
      </div>

      <div className="w-full space-y-3">
        <button 
          onClick={onCorrectAnswer} 
          disabled={!isActive || isTimeUp}
          className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-green-500"
        >
          Correct Answer
        </button>
        <button 
          onClick={onPass}
          disabled={!isActive || isTimeUp}
          className="w-full bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-amber-500"
        >
          Pass (-5s)
        </button>
      </div>
      {isTimeUp && <p className="mt-4 text-red-500 font-semibold">Time's Up!</p>}
    </div>
  );
};
