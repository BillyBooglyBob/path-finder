import { type Cell, CellType } from "../util/types";

export interface MazeGenerationStep {
  cell: Cell;
  step: number;
  action: "carve" | "backtrack" | "finish";
}

export interface MazeResult {
  grid: Cell[][];
  generationSteps: MazeGenerationStep[];
}

function initializeGrid(rows: number, cols: number): Cell[][] {
  const grid: Cell[][] = [];

  for (let row = 0; row < rows; row++) {
    grid[row] = [];
    for (let col = 0; col < cols; col++) {
      grid[row][col] = {
        type: CellType.WALL,
        row,
        col,
      };
    }
  }

  return grid;
}

function getNeighbors(
  grid: Cell[][],
  cell: Cell,
  rows: number,
  cols: number
): Cell[] {
  const neighbors: Cell[] = [];
  const directions = [
    [-2, 0], // Up
    [2, 0], // Down
    [0, -2], // Left
    [0, 2], // Right
  ];

  for (const [dRow, dCol] of directions) {
    const newRow = cell.row + dRow;
    const newCol = cell.col + dCol;

    if (
      newRow >= 1 &&
      newRow < rows - 1 &&
      newCol >= 1 &&
      newCol < cols - 1 &&
      grid[newRow][newCol].type === CellType.WALL
    ) {
      neighbors.push(grid[newRow][newCol]);
    }
  }

  return neighbors;
}

function shuffleArray<T>(array: T[], random: () => number = Math.random): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Pure function to carve a passage between two cells
function carvePassage(
  grid: Cell[][],
  from: Cell,
  to: Cell,
  generationSteps: MazeGenerationStep[],
  stepCounter: number
): number {
  // Carve the destination cell
  to.type = CellType.EMPTY;
  generationSteps.push({
    cell: { ...to },
    step: stepCounter++,
    action: "carve",
  });

  // Carve the wall between them
  const wallRow = (from.row + to.row) / 2;
  const wallCol = (from.col + to.col) / 2;
  grid[wallRow][wallCol].type = CellType.EMPTY;
  generationSteps.push({
    cell: { ...grid[wallRow][wallCol] },
    step: stepCounter++,
    action: "carve",
  });

  return stepCounter;
}

// Main pure function to generate a maze
export function generateMaze(
  rows: number,
  cols: number,
  start: { row: number; col: number },
  end: { row: number; col: number },
  randomSeed?: () => number
): MazeResult {
  // Use provided random function or Math.random
  const random = randomSeed || Math.random;

  // Initialize grid and tracking
  const grid = initializeGrid(rows, cols);
  const generationSteps: MazeGenerationStep[] = [];
  let stepCounter = 0;

  // Use exact start position provided
  const startCell = grid[start.row][start.col];
  startCell.type = CellType.EMPTY;

  generationSteps.push({
    cell: { ...startCell },
    step: stepCounter++,
    action: "carve",
  });

  // Recursive backtracking algorithm
  const stack: Cell[] = [startCell];

  while (stack.length > 0) {
    const currentCell = stack[stack.length - 1];
    const neighbors = shuffleArray(
      getNeighbors(grid, currentCell, rows, cols),
      random
    );

    if (neighbors.length > 0) {
      const nextCell = neighbors[0];
      stepCounter = carvePassage(
        grid,
        currentCell,
        nextCell,
        generationSteps,
        stepCounter
      );
      stack.push(nextCell);
    } else {
      const backtrackCell = stack.pop()!;
      if (stack.length > 0) {
        generationSteps.push({
          cell: { ...backtrackCell },
          step: stepCounter++,
          action: "backtrack",
        });
      }
    }
  }

  startCell.type = CellType.START;

  const endCell = grid[end.row][end.col];
  endCell.type = CellType.END;

  generationSteps.push({
    cell: { ...endCell },
    step: stepCounter++,
    action: "finish",
  });

  return {
    grid,
    generationSteps,
  };
}

export function createMaze(
  rows: number,
  cols: number,
  options: {
    start?: { row: number; col: number };
    end?: { row: number; col: number };
    randomSeed?: () => number;
  } = {}
): MazeResult {
  const defaultStart = { row: 1, col: 1 };
  const defaultEnd = { row: rows - 2, col: cols - 2 };

  return generateMaze(
    rows,
    cols,
    options.start || defaultStart,
    options.end || defaultEnd,
    options.randomSeed
  );
}

// // Helper function to visualize the maze as a string
// export function visualizeMaze(grid: Cell[][]): string {
//   const symbols = {
//     [CellType.EMPTY]: " ",
//     [CellType.WALL]: "█",
//     [CellType.START]: "S",
//     [CellType.END]: "E",
//     [CellType.VISITED]: "·",
//     [CellType.PATH]: "●",
//   };

//   return grid
//     .map((row) => row.map((cell) => symbols[cell.type]).join(""))
//     .join("\n");
// }

// // Example usage:
// const result = createMaze(21, 21);
// console.log("Generated maze with", result.generationSteps.length, "steps");

// // Example with custom parameters
// const customResult = generateMaze(
//   25,
//   25,
//   { row: 1, col: 1 }, // start
//   { row: 23, col: 23 }, // end
//   () => 0.5 // deterministic random for testing
// );

// console.log("\nGenerated Maze:");
// console.log(visualizeMaze(result.grid));
