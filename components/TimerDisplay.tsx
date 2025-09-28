
import React from 'react';

interface TimerDisplayProps {
  time: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ time }) => {
  const minutes = Math.floor(time / 60).toString().padStart(2, '0');
  const seconds = (time % 60).toString().padStart(2, '0');
  
  return (
    <span className="font-mono text-5xl font-bold">{minutes}:{seconds}</span>
  );
};
   