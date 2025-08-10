import type { Cell } from "./types";

export const wait = async (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export const deepCloneGrid = (grid: Cell[][]): Cell[][] =>
  grid.map((row) => row.map((cell) => ({ ...cell })));

export const finishUpdate = async (
  grid: Cell[][],
  setGrid: (grid: Cell[][]) => void,
  waitTime = 0.01
) => {
  const updatedGrid = deepCloneGrid(grid);
  await wait(waitTime);
  setGrid(updatedGrid);
};
