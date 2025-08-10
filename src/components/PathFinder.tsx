import { useEffect, useRef, useState } from "react";
import { CellType, type Cell } from "../util/types";
import Dropdown from "./Dropdown";
import useBFS from "../algorithms/useBFS";
import useDFS from "../algorithms/useDFS";
import { wait } from "../util/util";
import "./PathFinder.css";

const GRID_ROWS = 29;
const GRID_COLS = 70;
const DEFAULT_START_POSITION: Cell = {
  type: CellType.START,
  row: 15,
  col: 30,
};
const DEFAULT_END_POSITION: Cell = {
  type: CellType.END,
  row: 15,
  col: 40,
};

const PathFinder = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [startPosition, setStartPosition] = useState(DEFAULT_START_POSITION);
  const [endPosition, setEndPosition] = useState(DEFAULT_END_POSITION);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [draggingType, setDraggingType] = useState<CellType | null>(null); // START, END, or null
  const lastDraggedPosition = useRef<{ row: number; col: number } | null>(null);
  const [algorithmToRun, setAlgorithmToRun] = useState<"BFS" | "DFS" | null>(
    null
  );
  const cellsRef = useRef<(HTMLDivElement | null)[][]>([]);
  const [traversing, setTraversing] = useState(false);

  useEffect(() => {
    cellsRef.current = Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => null)
    );
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsMouseDown(false);
      setDraggingType(null);
      lastDraggedPosition.current = null;
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // TODO:
  // - Disable buttons once finished solving, or reset the grid?
  //   - Problem is once solved, can solve again, which is covered by prev solve
  //   - Once solves and click solved again, 1st reset the grid, remove all visited
  // - Add Dijkstra
  // - Make button UI better

  const resetGrid = () => {
    const newGrid: Cell[][] = Array.from({ length: GRID_ROWS }, (_, row) =>
      Array.from({ length: GRID_COLS }, (_, col) => ({
        type: CellType.EMPTY,
        row,
        col,
      }))
    );

    newGrid[DEFAULT_START_POSITION.row][DEFAULT_START_POSITION.col].type =
      CellType.START;
    newGrid[DEFAULT_END_POSITION.row][DEFAULT_END_POSITION.col].type =
      CellType.END;

    setGrid(newGrid);
    // TODO: Do we need setTimeout?
    setTimeout(() => syncDOMWithReactState(newGrid), 0);
  };

  useEffect(() => {
    resetGrid();
  }, []);

  const syncDOMWithReactState = (grid: Cell[][]) => {
    console.log("🔄 Syncing DOM with React state...");

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const cell = grid[row][col];
        const domElement = cellsRef.current[row][col];

        if (!domElement) continue; // Skip if ref not set yet

        // Update DOM element to match React state
        let backgroundColor;
        let className;

        switch (cell.type) {
          case CellType.EMPTY:
            backgroundColor = "white";
            className = "cell";
            break;
          case CellType.WALL:
            backgroundColor = "black";
            className = "cell wall";
            break;
          case CellType.START:
            backgroundColor = "green";
            className = "cell";
            break;
          case CellType.END:
            backgroundColor = "red";
            className = "cell";
            break;
          default:
            backgroundColor = "white";
            className = "cell";
        }

        domElement.style.backgroundColor = backgroundColor;
        domElement.className = className;
      }
    }
  };

  // Clear only animation-related visual elements (visited/path) from DOM
  const clearAnimationFromDOM = () => {
    console.log("🧹 Clearing animation elements from DOM...");

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const domElement = cellsRef.current[row][col];
        if (!domElement) continue;

        // Only clear if it's a visited or path cell
        if (
          domElement.className.includes("visited") ||
          domElement.className.includes("path")
        ) {
          // Check what the React state says this cell should be
          const cell = grid[row][col];
          switch (cell.type) {
            case CellType.EMPTY:
              domElement.style.backgroundColor = "white";
              domElement.className = "cell";
              break;
            case CellType.WALL:
              domElement.style.backgroundColor = "black";
              domElement.className = "cell wall";
              break;
            case CellType.START:
              domElement.style.backgroundColor = "green";
              domElement.className = "cell";
              break;
            case CellType.END:
              domElement.style.backgroundColor = "red";
              domElement.className = "cell";
              break;
          }
        }
      }
    }
  };

  const handlePaintCell = (cell: Cell) => {
    const { row, col, type } = cell;

    if (type === CellType.START || type === CellType.END) return;
    console.log(`Painting cell of type: ${cell.type}`);

    const newType = type === CellType.WALL ? CellType.EMPTY : CellType.WALL;

    const newGrid = grid.map((r) => [...r]);
    newGrid[row][col].type = newType;
    setGrid(newGrid);

    // Immediate update DOM element
    const domElement = cellsRef.current[row][col];
    if (domElement) {
      if (newType === CellType.WALL) {
        domElement.style.backgroundColor = "black";
        domElement.className = "cell wall";
      } else {
        domElement.style.backgroundColor = "white";
        domElement.className = "cell";
      }
    }
  };

  const handleMoveSpecialCell = (cell: Cell) => {
    const { row, col } = cell;
    const newGrid = grid.map((r) => [...r]);

    // If new position is the other special cell. E.g. current draggingType is start
    // but we are going over the end, don't overwrite the end, just stop.
    if (
      (draggingType === CellType.START && cell.type === CellType.END) ||
      (draggingType === CellType.END && cell.type === CellType.START)
    )
      return;

    if (lastDraggedPosition.current) {
      // Remove old position
      const { row: prevRow, col: prevCol } = lastDraggedPosition.current;
      newGrid[prevRow][prevCol].type = CellType.EMPTY;

      // Update DOM for old position
      const oldElement = cellsRef.current[prevRow][prevCol];
      if (oldElement) {
        oldElement.style.backgroundColor = "white";
        oldElement.className = "cell";
      }
    }

    // Place new position
    if (!draggingType) return;
    newGrid[row][col].type = draggingType;
    lastDraggedPosition.current = { row, col };

    if (draggingType === CellType.START) {
      setStartPosition((prev) => ({ ...prev, row, col }));
    } else if (draggingType === CellType.END) {
      setEndPosition((prev) => ({ ...prev, row, col }));
    }

    // Update DOM for new position
    const newElement = cellsRef.current[row][col];
    if (newElement) {
      if (draggingType === CellType.START) {
        newElement.style.backgroundColor = "green";
        newElement.className = "cell";
        setStartPosition((prev) => ({ ...prev, row, col }));
      } else if (draggingType === CellType.END) {
        newElement.style.backgroundColor = "red";
        newElement.className = "cell";
        setEndPosition((prev) => ({ ...prev, row, col }));
      }
    }

    setGrid(newGrid);
  };

  const visualisePathDom = async (endCell?: Cell) => {
    if (!endCell) return;

    const path: Cell[] = [];
    let currCell: Cell | undefined = endCell;

    while (currCell) {
      path.push(currCell);
      currCell = currCell.parent;
    }

    path.reverse();

    for (let i = 0; i < path.length; i++) {
      const { row, col, type } = path[i];
      const domElement = cellsRef.current[row][col];

      if (domElement) {
        let backgroundColor;

        switch (type) {
          case CellType.START:
            backgroundColor = "green";
            break;
          case CellType.END:
            backgroundColor = "red";
            break;
          default:
            backgroundColor = "yellow";
        }
        domElement.style.backgroundColor = backgroundColor;
        domElement.className = "cell path";
      }

      if (i % 2 === 0) {
        await wait(30);
      }
    }
  };

  const visualiseVisitedDom = async (visitedNodes: Cell[]) => {
    for (let i = 0; i < visitedNodes.length; i++) {
      const { row, col, type, depth } = visitedNodes[i];
      const domElement = cellsRef.current[row][col];

      if (domElement) {
        let backgroundColor;
        let className = "cell visited";

        switch (type) {
          case CellType.START:
            backgroundColor = "green";
            break;
          case CellType.END:
            backgroundColor = "red";
            className = "cell found";
            break;
          default:
            const lightness = Math.max(60, 99 - (depth ? depth : 0));
            backgroundColor = `hsl(220, 70%, ${lightness}%)`;
        }
        domElement.style.backgroundColor = backgroundColor;
        domElement.className = className;
      }

      if (i % 5 === 0) {
        await wait(10);
      }
    }
  };

  useEffect(() => {
    if (!algorithmToRun) return;

    const runAlgorithm = async () => {
      console.log(`Running ${algorithmToRun} algorithm`);
      setTraversing(true);
      clearAnimationFromDOM();

      try {
        let result;

        switch (algorithmToRun) {
          case "BFS":
            const handleBFS = useBFS({
              start: startPosition,
              grid: grid,
            });
            result = await handleBFS();
            break;
          case "DFS":
            const handleDFS = useDFS({
              start: startPosition,
              grid: grid,
            });
            result = await handleDFS();
            break;
        }

        if (result) {
          const { found, endCell, visited } = result;
          await visualiseVisitedDom(visited);
          if (found) {
            await wait(300); // Wait for the visited animation to finish before showing the path
            await visualisePathDom(endCell);
          }
        }
      } finally {
        setAlgorithmToRun(null);
        setTraversing(false);
      }
    };

    runAlgorithm();
  }, [algorithmToRun]);

  const runBFS = () => {
    setAlgorithmToRun("BFS");
  };

  const runDFS = () => {
    setAlgorithmToRun("DFS");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
      }}
    >
      <header
        style={{
          display: "flex",
          flex: "1",
          backgroundColor: "lightgoldenrodyellow",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0px 20px",
        }}
      >
        <Dropdown
          title="Algorithms"
          disabled={traversing}
          buttons={[
            {
              name: "Breadth First Search",
              action: runBFS,
            },
            {
              name: "Depth First Search",
              action: runDFS,
            },
            {
              name: "Dijkstra Search",
              action: () => console.log("Dijkstra searching..."),
            },
          ]}
        />
        <div>
          <button disabled={traversing} onClick={resetGrid}>
            Reset Grid
          </button>
          <button disabled={traversing} onClick={clearAnimationFromDOM}>
            Clear Path
          </button>
        </div>
        <Dropdown
          title="Generate maze"
          disabled={traversing}
          buttons={[
            {
              name: "Big maze",
              action: () => console.log("Generating big maze"),
            },
            {
              name: "Big curve",
              action: () => console.log("Generating big curve"),
            },
          ]}
        />
      </header>

      <div
        style={{
          display: "flex",
          flex: "5",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          onMouseDown={() => setIsMouseDown(true)}
          onMouseUp={() => setIsMouseDown(false)}
          onMouseLeave={() => setIsMouseDown(false)}
          style={{
            padding: "0.3rem",
          }}
        >
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} style={{ display: "flex" }}>
              {row.map((cell, cellIdx) => {
                let backgroundColor;
                let cellClass;

                switch (cell.type) {
                  case CellType.EMPTY:
                    backgroundColor = "white";
                    cellClass = "cell";
                    break;
                  case CellType.WALL:
                    backgroundColor = "black";
                    cellClass = "cell wall";
                    break;
                  case CellType.START:
                    backgroundColor = "green";
                    cellClass = "cell";
                    break;
                  case CellType.END:
                    backgroundColor = "red";
                    cellClass = "cell";
                    break;
                  default:
                    backgroundColor = "white";
                    cellClass = "cell";
                }

                return (
                  <div
                    key={cellIdx}
                    ref={(el) => {
                      cellsRef.current[rowIdx][cellIdx] = el;
                    }}
                    className={cellClass}
                    style={{ backgroundColor }}
                    onMouseDown={() => {
                      if (
                        cell.type === CellType.START ||
                        cell.type === CellType.END
                      ) {
                        setDraggingType(cell.type);
                        setIsMouseDown(true);
                        lastDraggedPosition.current = {
                          row: cell.row,
                          col: cell.col,
                        };
                      } else {
                        setDraggingType(CellType.WALL);
                        handlePaintCell(cell);
                        setIsMouseDown(true);
                      }
                    }}
                    onMouseEnter={() => {
                      if (!isMouseDown) return;
                      if (
                        draggingType === CellType.START ||
                        draggingType === CellType.END
                      ) {
                        handleMoveSpecialCell(cell);
                      } else {
                        handlePaintCell(cell);
                      }
                    }}
                  />
                  // >{cell.type}</div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PathFinder;
