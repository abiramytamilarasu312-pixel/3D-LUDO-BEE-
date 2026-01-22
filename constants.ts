
import { Color } from './types';

export const COLORS: Record<Color, string> = {
  RED: '#ef4444',
  GREEN: '#22c55e',
  YELLOW: '#eab308',
  BLUE: '#3b82f6',
};

export const BOARD_SIZE = 15;
export const CELL_SIZE = 1;

/**
 * Shared Path (52 steps)
 * Defined in (x, z) coordinates from 0-14 grid.
 * Starting from Red's entry point area.
 */
const generateSharedPath = (): [number, number][] => {
  const path: [number, number][] = [];
  
  // 1. Red Wing (Bottom Left moving Right then Up)
  // Indices 0-5
  for (let z = 6; z >= 6; z--) { for (let x = 0; x <= 5; x++) path.push([x, z]); } // Error in logic, manual is better
  
  const manualPath: [number, number][] = [
    // Red wing entry to Green wing
    [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
    [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
    [7, 0], // Green start
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
    [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
    [14, 7], // Yellow start
    [14, 8], [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
    [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
    [7, 14], // Blue start
    [6, 14], [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
    [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
    [0, 7], // Red entry
    [0, 6],
  ];

  return manualPath;
};

export const SHARED_PATH = generateSharedPath();

// Starting offset in SHARED_PATH for each color
export const START_OFFSETS: Record<Color, number> = {
  RED: 0,    // Starts at [1, 6]
  GREEN: 13, // Starts at [8, 1]
  YELLOW: 26, // Starts at [13, 8]
  BLUE: 39,   // Starts at [6, 13]
};

/**
 * Maps a path index to 3D board coordinates.
 */
export const getPosition = (color: Color, pathIndex: number): [number, number, number] => {
  const OFFSET = 7; // To center 0-14 grid at 0,0,0
  const HEIGHT = 0.35;

  // 1. Base Positions
  if (pathIndex === -1) {
    const bases: Record<Color, [number, number]> = {
      RED: [2.5, 2.5],
      GREEN: [11.5, 2.5],
      YELLOW: [11.5, 11.5],
      BLUE: [2.5, 11.5],
    };
    const [bx, bz] = bases[color];
    return [bx - OFFSET, HEIGHT, bz - OFFSET];
  }

  // 2. Finished
  if (pathIndex === 57) return [0, HEIGHT + 0.1, 0];

  // 3. Home Stretch (52 to 56)
  if (pathIndex >= 52) {
    const step = pathIndex - 51; // 1 to 5
    const homeCoords: Record<Color, [number, number]> = {
      RED: [step, 7],
      GREEN: [7, step],
      YELLOW: [14 - step, 7],
      BLUE: [7, 14 - step],
    };
    const [hx, hz] = homeCoords[color];
    return [hx - OFFSET, HEIGHT, hz - OFFSET];
  }

  // 4. Shared Track
  const globalIdx = (pathIndex + START_OFFSETS[color]) % 52;
  const [sx, sz] = SHARED_PATH[globalIdx];
  return [sx - OFFSET, HEIGHT, sz - OFFSET];
};
