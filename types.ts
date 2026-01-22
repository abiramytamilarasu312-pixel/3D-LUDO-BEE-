
import { ThreeElements } from '@react-three/fiber';

// Fix: Extend the global JSX namespace to include React Three Fiber intrinsic elements.
// This is the standard way to resolve "Property '...' does not exist on type 'JSX.IntrinsicElements'" in R3F projects.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

export type Color = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

export interface TokenState {
  id: string;
  color: Color;
  index: number; // -1 for base, 0-51 for shared path, 52-56 for home path, 57 for finish
  position: [number, number, number];
}

export interface Player {
  color: Color;
  name: string;
  tokens: TokenState[];
  isHuman: boolean;
  hasFinished: boolean;
  score: number;
}

export type GamePhase = 'AUTH' | 'START' | 'ROLLING' | 'MOVING' | 'WAITING_FOR_ROLL' | 'WAITING_FOR_MOVE' | 'FINISHED';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number;
  phase: GamePhase;
  winner: Color | null;
  history: string[];
}
