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
  const bfsSearch = async () => {
    const newGrid = grid.map((r) => [...r]);
    console.log("Started BFS");
    // Queue
    // While q
    // - Pop
    // - Found, return true
    // - Visit neighbors, add if unvisited. Mark new as visited (push to stack)
    // Return false

    const queue: Cell[] = [];
    const visited = new Set<string>();

    const getKey = (row: number, col: number) => `${row} ${col}`;

    queue.push({ ...start, depth: 0 });
    visited.add(getKey(start.row, start.col));

    while (queue.length > 0) {
      console.log("Inside while loop");
      const currCell = queue.shift();
      console.log("Current cell", currCell);
      if (!currCell) return;
      console.log("Made past the cell");

      const row = currCell.row;
      const col = currCell.col;
      const depth = currCell.depth;
      if (grid[row][col].type === CellType.END) {
        console.log("Found the end");
        return true;
      }
      if (grid[row][col].type === CellType.WALL) continue;
      // if (grid[row][col].type === CellType.START) continue;

      // Define new grid to store updated values
      console.log("Visitng neighbors");
      DIRECTIONS.forEach(([rowChange, colChange]) => {
        console.log("Inside directions");
        const newRow = row + rowChange;
        const newCol = col + colChange;
        const newDepth = depth ?? +1;

        if (
          newRow < 0 ||
          newRow >= grid.length ||
          newCol < 0 ||
          newCol >= grid[0].length
        )
          return;

        const key = getKey(newRow, newCol);
        if (!visited.has(key)) {
          queue.push({
            type: CellType.VISITED,
            row: newRow,
            col: newCol,
            depth: newDepth,
          });
          visited.add(key);
          newGrid[newRow][newCol] = {
            ...newGrid[newRow][newCol],
            type: CellType.VISITED,
            depth: newDepth,
          };

          console.log(
            `Visiting cell [${newRow}][${newCol}], marking as visited, depth: ${newDepth}`
          );
        }
      });

      console.log("Updates grid");
      const updatedGrid = newGrid.map((r) => [...r]);
      await wait(5);
      setGrid(updatedGrid);
    }

    console.log("returns false");
    return false;
  };

  return bfsSearch;
};

export default useBFS;
