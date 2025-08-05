import { describe, it, expect } from "vitest";
import useDFS from "../algorithms/useDFS"; // assuming you have useDFS implemented
import { CellType, type Cell } from "../util/types";

const createGrid = (rows: number, cols: number): Cell[][] => {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      type: CellType.EMPTY,
      row,
      col,
    }))
  );
};

describe("useDFS", () => {
  it("returns true when path exists", async () => {
    const grid = createGrid(3, 3);
    grid[2][2].type = CellType.END;

    const dfs = useDFS({
      start: { type: CellType.START, row: 0, col: 0 },
      grid,
      setGrid: () => {},
    });

    expect(await dfs()).toBe(true);
  });

  it("returns false when path is blocked", async () => {
    const grid = createGrid(3, 3);
    grid[0][1].type = CellType.WALL;
    grid[1][0].type = CellType.WALL;
    grid[2][2].type = CellType.END;

    const dfs = useDFS({
      start: { type: CellType.START, row: 0, col: 0 },
      grid,
      setGrid: () => {},
    });

    expect(await dfs()).toBe(false);
  });

  it("returns true if start is END", async () => {
    const grid = createGrid(3, 3);
    grid[0][0].type = CellType.END;

    const dfs = useDFS({
      start: { type: CellType.START, row: 0, col: 0 },
      grid,
      setGrid: () => {},
    });

    expect(await dfs()).toBe(true);
  });

  it("handles large grid with no walls", async () => {
    const grid = createGrid(10, 10);
    grid[9][9].type = CellType.END;

    const dfs = useDFS({
      start: { type: CellType.START, row: 0, col: 0 },
      grid,
      setGrid: () => {},
    });

    expect(await dfs()).toBe(true);
  });

  it("returns false if END is unreachable due to walls", async () => {
    const grid = createGrid(4, 4);
    grid[3][3].type = CellType.END;

    // Block the entire last row and column except start
    for (let i = 0; i < 4; i++) {
      grid[3][i].type = CellType.WALL;
      grid[i][3].type = CellType.WALL;
    }
    // Keep start open
    grid[0][0].type = CellType.START;

    const dfs = useDFS({
      start: { type: CellType.START, row: 0, col: 0 },
      grid,
      setGrid: () => {},
    });

    expect(await dfs()).toBe(false);
  });
});
