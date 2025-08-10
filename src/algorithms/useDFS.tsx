import { DIRECTIONS } from "../util/constant";
import {
  CellType,
  type Cell,
  type PathfindingInput,
  type PathfindingResult,
} from "../util/types";
import { getKey } from "../util/util";

const useDFS = ({ start, grid }: PathfindingInput) => {
  const newGrid = grid.map((r) => [...r]);
  const DFSSearch = async (): Promise<PathfindingResult> => {
    const stack: Cell[] = [];
    const visited = new Set<string>();
    const visitedNodes: Cell[] = [];

    stack.push({ ...start, depth: 0 });
    visited.add(getKey(start.row, start.col));

    while (stack.length > 0) {
      const currCell = stack.pop();
      if (!currCell) continue;

      const row = currCell.row;
      const col = currCell.col;
      const depth = currCell.depth;
      const cellType = newGrid[row][col].type;
      if (cellType === CellType.END) {
        return { found: true, endCell: currCell, visited: visitedNodes };
      }
      if (cellType === CellType.WALL) continue;

      for (const [rowChange, colChange] of DIRECTIONS) {
        const newRow = row + rowChange;
        const newCol = col + colChange;

        if (
          newRow < 0 ||
          newRow >= grid.length ||
          newCol < 0 ||
          newCol >= grid[0].length
        )
          continue;

        const newDepth = (depth ?? 0) + 1;
        const newType = newGrid[newRow][newCol].type;

        const key = getKey(newRow, newCol);
        if (!visited.has(key)) {
          stack.push({
            type: CellType.VISITED,
            row: newRow,
            col: newCol,
            depth: newDepth,
            parent: { ...currCell },
          });
          visited.add(key);
          visitedNodes.push({
            ...newGrid[newRow][newCol],
            type: newType === CellType.EMPTY ? CellType.VISITED : newType,
            depth: newDepth,
          });
        }
      }
    }

    return { found: false, visited: visitedNodes };
  };

  return DFSSearch;
};

export default useDFS;
