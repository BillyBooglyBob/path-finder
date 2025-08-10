export const CellType = {
  EMPTY: 0,
  WALL: 1,
  START: 2,
  END: 3,
  VISITED: 4,
  PATH: 5,
} as const;

export type CellType = (typeof CellType)[keyof typeof CellType];

export interface Cell {
  type: CellType;
  row: number;
  col: number;
  depth?: number;
  parent?: Cell;
}

export interface PathfindingInput {
  start: Cell;
  // end: Cell;  // Add this - you'll need it
  grid: Cell[][];
}

export interface PathfindingResult {
  found: boolean;
  endCell?: Cell;
  visited: Cell[];
  // path: Cell[];  // Add this - the actual solution path
}
