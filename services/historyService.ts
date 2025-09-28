import { GameResult } from '../types';
import { add, getAllSorted } from './dbService';

const HISTORY_STORE = 'history';

export const getHistory = async (): Promise<GameResult[]> => {
    try {
        // Sort by date index, 'prev' for descending order (newest first)
        return await getAllSorted<GameResult>(HISTORY_STORE, 'date', 'prev');
    } catch (error) {
        console.error("Failed to get history from DB", error);
        return [];
    }
};

export const saveGameResult = async (result: GameResult): Promise<void> => {
    await add(HISTORY_STORE, result);
};
