
import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialTime: number, onTimeUp: () => void) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            stopTimer();
            setIsRunning(false);
            onTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      stopTimer();
    }
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, stopTimer, onTimeUp]);

  const start = useCallback(() => {
    if (time > 0) {
      setIsRunning(true);
    }
  }, [time]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTime(initialTime);
  }, [initialTime]);
  
  const deductTime = useCallback((seconds: number) => {
    setTime(prevTime => {
      const newTime = prevTime - seconds;
      if (newTime <= 0) {
        stopTimer();
        setIsRunning(false);
        onTimeUp();
        return 0;
      }
      return newTime;
    });
  }, [onTimeUp, stopTimer]);

  return { time, isRunning, start, pause, reset, deductTime };
};
