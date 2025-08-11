import { describe, it, expect } from "vitest";
import useBFS from "../algorithms/useBFS";
import { CellType } from "../util/types";
import { createMaze } from "../algorithms/randomisedDfsMazeGeneration";
import useDFS from "../algorithms/useDFS";

describe("randomisedDfsMazeGeneration", () => {
  it("Grid should be solvable by BFS", async () => {
    const startRow = 5;
    const startCol = 5;
    const endRow = 5;
    const endCol = 5;

    const { grid } = createMaze(21, 21, {
      start: { row: startRow, col: startCol },
      end: { row: endRow, col: endCol },
    });

    const bfs = useBFS({
      start: { type: CellType.START, row: startRow, col: startCol },
      grid,
    });

    const { found } = await bfs();
    expect(found).toBe(true);
  });

  it("Grid should be solvable by DFS", async () => {
    const startRow = 5;
    const startCol = 5;
    const endRow = 5;
    const endCol = 5;

    const { grid } = createMaze(21, 21, {
      start: { row: startRow, col: startCol },
      end: { row: endRow, col: endCol },
    });

    const dfs = useDFS({
      start: { type: CellType.START, row: startRow, col: startCol },
      grid,
    });

    const { found } = await dfs();
    expect(found).toBe(true);
  });
});
