import { DIRECTIONS } from "../util/constant";
import {
  CellType,
  type Cell,
  type PathfindingInput,
  type PathfindingResult,
} from "../util/types";
import { getKey } from "../util/util";

const useDijkstra = ({ start, grid }: PathfindingInput) => {
  const DijkstraSearch = async (): Promise<PathfindingResult> => {
    // Initialise cost for all cells
    const newGrid = grid.map((r) =>
      r.map((cell) => ({
        ...cell,
        costFromStart: Infinity,
      }))
    );
    newGrid[start.row][start.col].costFromStart = 0;

    const visited = new Set();
    const visitedNodes: Cell[] = [];
    const queue: Cell[] = [];
    queue.push(start);

    // Look at all available cells, visit one with lowest cost (use PQ)
    while (queue.length > 0) {
      // Get cell at front with lowest cost
      queue.sort((a, b) => (a.costFromStart ?? 0) - (b.costFromStart ?? 0));
      const currCell = queue.shift();
      if (!currCell) continue;

      const row = currCell.row;
      const col = currCell.col;
      const depth = currCell.depth ?? 0;
      const type = currCell.type;
      const key = getKey(row, col);
      const cellType = newGrid[row][col].type;

      if (cellType === CellType.WALL) continue;
      if (visited.has(key)) continue;
      visited.add(key);
      visitedNodes.push({
        ...currCell,
        type: type === CellType.EMPTY ? CellType.VISITED : type,
        depth: depth,
      });

      if (cellType === CellType.END)
        return {
          found: true,
          visited: visitedNodes,
          endCell: { ...currCell, type: CellType.END },
        };

      // Get neighbours to visit
      const cost = currCell.costFromStart ?? 0;
      const newDepth = depth + 1;

      for (const [rowChange, colChange] of DIRECTIONS) {
        const newRow = row + rowChange;
        const newCol = col + colChange;

        if (
          newRow < 0 ||
          newRow >= grid.length ||
          newCol < 0 ||
          newCol >= grid[0].length
        ) {
          continue;
        }

        const newCell = newGrid[newRow][newCol];
        if (newCell.type === CellType.WALL) continue;

        const currCost = newCell.costFromStart;
        const newCost = cost + (newCell.weight ?? 0);
        const finalCost = currCost <= newCost ? currCost : newCost;
        queue.push({
          row: newRow,
          col: newCol,
          type: CellType.VISITED,
          depth: newDepth,
          parent: { ...currCell },
          costFromStart: finalCost,
        });
        newGrid[newRow][newCol].costFromStart = finalCost;
      }
    }

    // Else, return false
    return { found: false, visited: visitedNodes };
  };

  return DijkstraSearch;
};

export default useDijkstra;
