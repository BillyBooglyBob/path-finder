import { describe, it, expect } from "vitest";
import useDijkstra from "../algorithms/useDijkstra";
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

describe("useDijkstra", () => {
  it("returns true when path exists", async () => {
    const grid = createGrid(3, 3);
    grid[2][2].type = CellType.END;

    const Dijkstra = useDijkstra({
      start: { type: CellType.START, row: 0, col: 0 },
      grid,
    });

    const { found } = await Dijkstra();
    expect(found).toBe(true);
  });

  it("returns false when path is blocked", async () => {
    const grid = createGrid(3, 3);
    grid[0][1].type = CellType.WALL;
    grid[1][0].type = CellType.WALL;
    grid[2][2].type = CellType.END;

    const Dijkstra = useDijkstra({
      start: { type: CellType.START, row: 0, col: 0 },
      grid,
    });

    const { found } = await Dijkstra();
    expect(found).toBe(false);
  });

  it("returns true if start is END", async () => {
    const grid = createGrid(3, 3);
    grid[0][0].type = CellType.END;

    const Dijkstra = useDijkstra({
      start: { type: CellType.START, row: 0, col: 0 },
      grid,
    });

    const { found } = await Dijkstra();
    expect(found).toBe(true);
  });
});
