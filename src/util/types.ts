export const CellType = {
  EMPTY: 0,
  WALL: 1,
  START: 2,
  END: 3,
} as const;

export type CellType = (typeof CellType)[keyof typeof CellType];

export interface Cell {
  type: CellType;
  row: number;
  col: number;
}

export interface CellActions {}
