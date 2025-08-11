import { CellType } from "./types";

export const DIRECTIONS = [
  [0, 1], // Right
  [0, -1], // Left
  [-1, 0], // Up
  [1, 0], // Down
];

export type CellTypeKey = keyof typeof CellType;

export const ColorType: Record<(typeof CellType)[CellTypeKey], string> = {
  [CellType.EMPTY]: "#eaedf3",
  [CellType.WALL]: "#000000",
  [CellType.START]: "#eaab18de",
  [CellType.END]: "#d60b0bff",
  [CellType.VISITED]: "#87cefa",
  [CellType.PATH]: "#f3f37dff",
};
