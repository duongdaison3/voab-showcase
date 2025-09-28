import { ShowcaseTopic } from '../types';
import { add, getAll } from './dbService';

const SHOWCASE_STORE = 'showcases';

export const getTopics = async (): Promise<ShowcaseTopic[]> => {
  try {
    return await getAll<ShowcaseTopic>(SHOWCASE_STORE);
  } catch (error) {
    console.error("Failed to get topics from DB", error);
    return [];
  }
};

export const saveTopic = async (newTopic: ShowcaseTopic): Promise<void> => {
  await add(SHOWCASE_STORE, newTopic);
};
