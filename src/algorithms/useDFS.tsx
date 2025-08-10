import { CellType, type Cell } from "../util/types";
import { finishUpdate, wait } from "../util/util";

interface useDFSProps {
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

const useDFS = ({ start, grid, setGrid }: useDFSProps) => {
  const DFSSearch = async (): Promise<{ found: boolean; endCell?: Cell }> => {
    const newGrid = grid.map((r) => [...r]);

    const stack: Cell[] = [];
    const visited = new Set<string>();

    const getKey = (row: number, col: number) => `${row} ${col}`;

    stack.push({ ...start, depth: 0 });
    visited.add(getKey(start.row, start.col));

    let updates = 0;

    while (stack.length > 0) {
      const currCell = stack.pop();
      if (!currCell) continue;

      const row = currCell.row;
      const col = currCell.col;
      const depth = currCell.depth;
      const cellType = newGrid[row][col].type;
      if (cellType === CellType.END) {
        finishUpdate(newGrid, setGrid);
        return { found: true, endCell: currCell };
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
          newGrid[newRow][newCol] = {
            ...newGrid[newRow][newCol],
            type: newType === CellType.EMPTY ? CellType.VISITED : newType,
            depth: newDepth,
          };

          updates++;

          if (updates % 3 === 0) {
            const updatedGrid = newGrid.map((r) => [...r]);
            await wait(50);
            setGrid(updatedGrid);
          }
        }
      }
    }

    finishUpdate(newGrid, setGrid);
    return { found: false };
  };

  return DFSSearch;
};

export default useDFS;
