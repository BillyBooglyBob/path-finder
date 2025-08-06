import { CellType, type Cell } from "../util/types";
import { wait } from "../util/util";

interface useDijkstraProps {
  start: Cell;
  grid: Cell[][];
  setGrid: (grid: Cell[][]) => void;
}

const DIRECTIONS = [
  [0, -1],
  [0, 1],
  [1, 0],
  [-1, 0],
];

const useDijkstra = ({ start, grid, setGrid }: useDijkstraProps) => {
  const DijkstraSearch = async () => {
    const newGrid = grid.map((r) => [...r]);

    const stack: Cell[] = [];
    const visited = new Set<string>();

    const getKey = (row: number, col: number) => `${row} ${col}`;

    stack.push({ ...start, depth: 0 });
    visited.add(getKey(start.row, start.col));

    while (stack.length > 0) {
      const currCell = stack.pop();
      if (!currCell) return;

      const row = currCell.row;
      const col = currCell.col;
      const depth = currCell.depth;
      const cellType = grid[row][col].type;
      if (cellType === CellType.END) return true;
      if (cellType === CellType.WALL) continue;

      DIRECTIONS.forEach(async ([rowChange, colChange]) => {
        const newRow = row + rowChange;
        const newCol = col + colChange;

        if (
          newRow < 0 ||
          newRow >= grid.length ||
          newCol < 0 ||
          newCol >= grid[0].length
        )
          return;

        const newDepth = (depth ?? 0) + 1;
        const newType = newGrid[newRow][newCol].type;

        const key = getKey(newRow, newCol);
        if (!visited.has(key)) {
          console.log("New depth:", newDepth);
          stack.push({
            type: CellType.VISITED,
            row: newRow,
            col: newCol,
            depth: newDepth,
          });
          visited.add(key);
          newGrid[newRow][newCol] = {
            ...newGrid[newRow][newCol],
            type: newType === CellType.EMPTY ? CellType.VISITED : newType,
            depth: newDepth,
          };
          const updatedGrid = newGrid.map((r) => [...r]);
          await wait(3);
          setGrid(updatedGrid);
        }
      });
    }

    return false;
  };

  return DijkstraSearch;
};

export default useDijkstra;
