export const CellType = {
  EMPTY: 0,
  WALL: 1,
  START: 2,
  END: 3,
  VISITED: 4,
  PATH: 5,
  WEIGHTED: 6
} as const;

export type CellType = (typeof CellType)[keyof typeof CellType];

export interface Cell {
  type: CellType;
  row: number;
  col: number;
  depth?: number;
  parent?: Cell;
  weight?: number; // Used by Dijkstra & A*
  costFromStart?: number; // Used by Dijkstra & A*
  estimatedCostToEnd?: number; // Used by A*
  totalEstimatedCost?: number; // Used by A*
}

export interface PathfindingInput {
  start: Cell;
  end?: Cell;
  grid: Cell[][];
}

export interface PathfindingResult {
  found: boolean;
  endCell?: Cell;
  visited: Cell[];
}
