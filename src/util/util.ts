import type { Cell } from "./types";

export const wait = async (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export const deepCloneGrid = (grid: Cell[][]): Cell[][] =>
  grid.map((row) => row.map((cell) => ({ ...cell })));

export const getKey = (row: number, col: number) => `${row} ${col}`;
