import { CellType, type Cell } from "./types";

export const ALGORITHMS = {
  BFS: "bfs",
  DFS: "dfs",
  DIJKSTRA: "dijkstra",
  ASTAR: "a*",
} as const;
export type AlgorithmType = (typeof ALGORITHMS)[keyof typeof ALGORITHMS];

export const ALGORITHM_DESCRIPTIONS: Record<AlgorithmType, string> = {
  bfs: "Breath First Search is NOT weighted but guarantees the shortest path",
  dfs: "Depth First Search is NOT weighted and DOES NOT guarantee the shortest path",
  dijkstra: "Dijkstra's Algorithm is weighted and guarantees the shortest path",
  "a*": "Uses heuristics to find the shortest path more efficiently than Dijkstra",
};

export const WEIGHTS = {
  NORMAL: 1,
  WEIGHTED: 2,
} as const;
export type WeightType = (typeof WEIGHTS)[keyof typeof WEIGHTS];

export const GRID_ROWS = 23;
export const GRID_COLS = 59;
export const DEFAULT_START_POSITION: Cell = {
  type: CellType.START,
  row: 12,
  col: 20,
};
export const DEFAULT_END_POSITION: Cell = {
  type: CellType.END,
  row: 12,
  col: 40,
};

export const DIRECTIONS = [
  [0, 1], // Right
  [0, -1], // Left
  [-1, 0], // Up
  [1, 0], // Down
];

export type CellTypeKey = keyof typeof CellType;
export const ColorType: Record<(typeof CellType)[CellTypeKey], string> = {
  [CellType.EMPTY]: "#eaedf3",
  [CellType.WALL]: "#545772",
  [CellType.START]: "#eaab18de",
  [CellType.END]: "#d60b0bff",
  [CellType.VISITED]: "#87cefa",
  [CellType.PATH]: "#dede10ff",
  [CellType.WEIGHTED]: "#c700a3ff",
};

export const SPEED = {
  slow: 200,
  medium: 50,
  fast: 10,
};

export const SPEED_NAME_MAP: Record<
  (typeof SPEED)[keyof typeof SPEED],
  string
> = {
  [SPEED.slow]: "Slow",
  [SPEED.medium]: "Medium",
  [SPEED.fast]: "Fast",
};
