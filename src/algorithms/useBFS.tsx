import { CellType, type Cell } from "../util/types";

interface useBFSProps {
  start: {
    row: number;
    col: number;
  };
  grid: Cell[][];
  setGrid: (grid: Cell[][]) => void;
}

const DIRECTIONS = [
  [0, -1],
  [0, 1],
  [1, 0],
  [-1, 0],
];

const useBFS = ({ start, grid, setGrid }: useBFSProps) => {
  const bfsSearch = () => {
    // Queue
    // While q
    // - Pop
    // - Found, return true
    // - Visit neighbors, add if unvisited. Mark new as visited (push to stack)
    // Return false

    const queue: { row: number; col: number }[] = [];
    const visited = new Set<string>();

    const getKey = (row: number, col: number) => `${row} ${col}`;

    queue.push(start);
    visited.add(getKey(start.row, start.col));

    while (queue.length > 0) {
      const currCell = queue.shift();
      if (!currCell) return;

      const row = currCell.row;
      const col = currCell.col;
      if (grid[row][col].type === CellType.END) return true;
      if (grid[row][col].type === CellType.WALL) continue;
      if (grid[row][col].type === CellType.START) continue;

      DIRECTIONS.forEach(([rowChange, colChange]) => {
        const newRow = row + rowChange;
        const newCol = col + colChange;

        if (
          newRow < 0 ||
          newRow >= grid.length ||
          newCol < 0 ||
          newCol >= grid[0].length
        )
          return;

        const key = getKey(newRow, newCol);
        if (!visited.has(key)) {
          queue.push({ row: newRow, col: newCol });
          visited.add(key);
        }
      });
    }

    return false;
  };

  return bfsSearch;
};

export default useBFS;
