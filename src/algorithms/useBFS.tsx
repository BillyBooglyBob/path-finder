import { CellType, type Cell } from "../util/types";
import { wait } from "../util/util";

interface useBFSProps {
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

const useBFS = ({ start, grid, setGrid }: useBFSProps) => {
  const bfsSearch = async (): Promise<{ found: boolean; endCell?: Cell }> => {
    const newGrid = grid.map((r) => [...r]);

    const queue: Cell[] = [];
    const visited = new Set<string>();

    const getKey = (row: number, col: number) => `${row} ${col}`;

    queue.push({ ...start, depth: 0 });
    visited.add(getKey(start.row, start.col));

    while (queue.length > 0) {
      const currCell = queue.shift();
      if (!currCell) continue;

      const row = currCell.row;
      const col = currCell.col;
      const depth = currCell.depth;
      const cellType = grid[row][col].type;
      if (cellType === CellType.END) {
        console.log("Return end cell");
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
          queue.push({
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

          const updatedGrid = newGrid.map((r) => [...r]);
          await wait(0.2);
          setGrid(updatedGrid);
          console.log("Visiting");
        }
      }
    }
    console.log("Return end cell when false");
    return { found: false };
  };

  return bfsSearch;
};

export default useBFS;
