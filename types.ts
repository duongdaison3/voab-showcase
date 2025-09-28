export interface ShowcaseImage {
  id: string;
  name: string;
  dataUrl: string;
}

export interface ShowcaseTopic {
  id: string;
  name: string;
  category: string;
  description: string;
  images: ShowcaseImage[];
}

export interface Player {
  name: string;
  score: number;
}

export enum GameState {
  ADMIN_VIEW,
  PLAYER_SETUP,
  GAME_VIEW,
  GAME_OVER,
}

export interface GameResult {
  id: string;
  topicName: string;
  players: [Player, Player];
  date: string; // ISO string
}
