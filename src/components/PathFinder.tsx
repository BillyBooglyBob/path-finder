import { useEffect, useRef, useState } from "react";
import { CellType, type Cell } from "../util/types";
import Dropdown from "./Dropdown";
import useBFS from "../algorithms/useBFS";
import useDFS from "../algorithms/useDFS";
import { wait } from "../util/util";
import "./PathFinder.css";
import {
  ALGORITHMS,
  ColorType,
  DEFAULT_END_POSITION,
  DEFAULT_START_POSITION,
  GRID_COLS,
  GRID_ROWS,
  SPEED,
  SPEED_NAME_MAP,
  WEIGHTS,
  type AlgorithmType,
} from "../util/constant";
import { createMaze } from "../algorithms/randomisedDfsMazeGeneration";
import Tooltip from "./Tooltip";
import useDijkstra from "../algorithms/useDijkstra";

const PathFinder = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [startPosition, setStartPosition] = useState(DEFAULT_START_POSITION);
  const [endPosition, setEndPosition] = useState(DEFAULT_END_POSITION);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [draggingType, setDraggingType] = useState<CellType | null>(null); // START, END, or null
  const lastDraggedPosition = useRef<{ row: number; col: number } | null>(null);
  const [algorithmToRun, setAlgorithmToRun] = useState<AlgorithmType>(
    ALGORITHMS.BFS
  );
  const cellsRef = useRef<(HTMLDivElement | null)[][]>([]);
  const [traversing, setTraversing] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEED)[keyof typeof SPEED]>(
    SPEED.medium
  );
  const speedRef = useRef(SPEED.medium);
  // WALL, WEIGHTED, or null
  const [paintingType, setPaintingType] = useState<CellType>(CellType.WALL);

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

  const resetGrid = () => {
    const newGrid: Cell[][] = Array.from({ length: GRID_ROWS }, (_, row) =>
      Array.from({ length: GRID_COLS }, (_, col) => ({
        type: CellType.EMPTY,
        row,
        col,
        weight: WEIGHTS.NORMAL,
      }))
    );

    newGrid[DEFAULT_START_POSITION.row][DEFAULT_START_POSITION.col].type =
      CellType.START;
    newGrid[DEFAULT_END_POSITION.row][DEFAULT_END_POSITION.col].type =
      CellType.END;

    setGrid(newGrid);
    syncDOMWithReactState(newGrid);
  };

  useEffect(() => {
    resetGrid();
  }, []);

  const syncDOMWithReactState = (grid: Cell[][]) => {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const cell = grid[row][col];
        const domElement = cellsRef.current[row][col];

        if (!domElement) continue;

        // Update DOM element to match React state
        let backgroundColor;
        let className;

        switch (cell.type) {
          case CellType.EMPTY:
            backgroundColor = ColorType[CellType.EMPTY];
            className = "cell";
            break;
          case CellType.WALL:
            backgroundColor = ColorType[CellType.WALL];
            className = "cell wall";
            break;
          case CellType.START:
            backgroundColor = ColorType[CellType.START];
            className = "cell";
            break;
          case CellType.END:
            backgroundColor = ColorType[CellType.END];
            className = "cell";
            break;
          default:
            backgroundColor = ColorType[CellType.EMPTY];
            className = "cell";
        }

        domElement.style.backgroundColor = backgroundColor;
        domElement.className = className;
      }
    }
  };

  const clearAnimationFromDOM = () => {
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
              domElement.style.backgroundColor = ColorType[CellType.EMPTY];
              domElement.className = "cell";
              break;
            case CellType.WALL:
              domElement.style.backgroundColor = ColorType[CellType.WALL];
              domElement.className = "cell wall";
              break;
            case CellType.START:
              domElement.style.backgroundColor = ColorType[CellType.START];
              domElement.className = "cell";
              break;
            case CellType.END:
              domElement.style.backgroundColor = ColorType[CellType.END];
              domElement.className = "cell";
              break;
            case CellType.WEIGHTED:
              domElement.style.backgroundColor = ColorType[CellType.EMPTY];
              break;
          }
        }
      }
    }
  };

  // TODO:
  // - When visiting weighted node, just color background. Keep the cell normal.
  // - When clearing path, reset all the weighted nodes (colour back to normal, not remain as visited or path).
  // - When replacing wall with weight, the colour gets reset to none (fix it)

  const handlePaintCell = (cell: Cell) => {
    const { row, col, type } = cell;

    if (type === CellType.START || type === CellType.END) return;

    const newType =
      type === CellType.WALL || type === CellType.WEIGHTED
        ? CellType.EMPTY
        : paintingType;

    const newGrid = grid.map((r) => [...r]);
    newGrid[row][col] = {
      ...newGrid[row][col],
      weight:
        paintingType === CellType.WEIGHTED ? WEIGHTS.WEIGHTED : WEIGHTS.NORMAL,
      type: newType,
    };

    setGrid(newGrid);
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
        oldElement.style.backgroundColor = ColorType[CellType.EMPTY];
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
            backgroundColor = ColorType[CellType.START];
            break;
          case CellType.END:
            backgroundColor = ColorType[CellType.END];
            break;
          default:
            backgroundColor = ColorType[CellType.PATH];
        }
        domElement.style.backgroundColor = backgroundColor;
        domElement.className = "cell path";
      }

      if (i % 5 === 0) {
        await wait(speedRef.current);
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
            backgroundColor = ColorType[CellType.START];
            break;
          case CellType.END:
            backgroundColor = ColorType[CellType.END];
            className = "cell found";
            break;
          default:
            const lightness = Math.max(
              50,
              99 - Math.floor(depth ? depth : 0) / 2
            );
            backgroundColor = `hsl(220, 70%, ${lightness}%)`;
        }
        domElement.style.backgroundColor = backgroundColor;
        domElement.className = className;
      }

      if (i % 5 === 0) {
        await wait(speedRef.current);
      }
    }
  };

  const runAlgorithm = async () => {
    if (!algorithmToRun) return;
    setTraversing(true);
    clearAnimationFromDOM();

    try {
      let result;

      switch (algorithmToRun) {
        case "bfs":
          const handleBFS = useBFS({
            start: startPosition,
            grid: grid,
          });
          result = await handleBFS();
          break;
        case "dfs":
          const handleDFS = useDFS({
            start: startPosition,
            grid: grid,
          });
          result = await handleDFS();
          break;
        case "dijkstra":
          const handleDijkstra = useDijkstra({
            start: startPosition,
            grid: grid,
          });
          result = await handleDijkstra();
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
      setTraversing(false);
    }
  };

  const runBFS = () => {
    setAlgorithmToRun(ALGORITHMS.BFS);
  };

  const runDFS = () => {
    setAlgorithmToRun(ALGORITHMS.DFS);
  };

  const runDijkstra = () => {
    setAlgorithmToRun(ALGORITHMS.DIJKSTRA);
  };

  const handleSpeedChange = (speed: (typeof SPEED)[keyof typeof SPEED]) => {
    speedRef.current = speed;
    setSpeed(speed);
  };

  const handlerandomisedDfsMazeGeneration = () => {
    const { grid } = createMaze(GRID_ROWS, GRID_COLS, {
      start: { row: startPosition.row, col: startPosition.col },
      end: { row: endPosition.row, col: endPosition.col },
    });

    for (let i = 0; i <= grid.length; i++) {
      for (let j = 0; j <= grid[0].length; j++) {
        grid[i][j].weight = WEIGHTS.NORMAL;
      }
    }

    setGrid(grid);
    syncDOMWithReactState(grid);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        backgroundColor: "#1f223d",
        color: "white",
      }}
    >
      <header
        style={{
          display: "flex",
          flex: "1",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0px 20px",
          gap: "10px",
        }}
      >
        <h1 className="title">Path Finder</h1>
        <div
          style={{
            display: "flex",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "1rem",
            }}
          >
            <Tooltip content="Wall">
              <button
                className="tooltip-button"
                onClick={() => setPaintingType(CellType.WALL)}
                style={{
                  filter: `${
                    paintingType === CellType.WALL ? "brightness(80%)" : "none"
                  }`,
                }}
              >
                <div
                  className="cell"
                  style={{ backgroundColor: ColorType[CellType.WALL] }}
                />
              </button>
            </Tooltip>
            <Tooltip content="Weight">
              <button
                className="tooltip-button"
                onClick={() => setPaintingType(CellType.WEIGHTED)}
                style={{
                  filter: `${
                    paintingType === CellType.WEIGHTED
                      ? "brightness(80%)"
                      : "none"
                  }`,
                }}
              >
                <div
                  className="cell weighted"
                  style={{ backgroundColor: ColorType[CellType.WEIGHTED] }}
                />
              </button>
            </Tooltip>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className="button"
            disabled={traversing}
            onClick={runAlgorithm}
          >
            Run
          </button>
          <Dropdown
            title={SPEED_NAME_MAP[speed]}
            buttons={[
              {
                name: "Slow",
                action: () => handleSpeedChange(SPEED.slow),
              },
              {
                name: "Medium",
                action: () => handleSpeedChange(SPEED.medium),
              },
              {
                name: "Fast",
                action: () => handleSpeedChange(SPEED.fast),
              },
            ]}
          />
          <Dropdown
            title={algorithmToRun}
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
                action: runDijkstra,
              },
            ]}
          />
          <Dropdown
            title="Generate maze"
            disabled={traversing}
            buttons={[
              {
                name: "Recursive maze",
                action: handlerandomisedDfsMazeGeneration,
              },
              // {
              //   name: "Big curve",
              //   action: () => console.log("Generating big curve"),
              // },
            ]}
          />
          <button className="button" disabled={traversing} onClick={resetGrid}>
            Reset Grid
          </button>
          <button
            className="button"
            disabled={traversing}
            onClick={clearAnimationFromDOM}
          >
            Clear Path
          </button>
        </div>
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
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            backgroundColor: "#eaedf3",
          }}
        >
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} style={{ display: "flex", gap: "1px" }}>
              {row.map((cell, cellIdx) => {
                let backgroundColor;
                let cellClass;

                switch (cell.type) {
                  case CellType.EMPTY:
                    backgroundColor = ColorType[CellType.EMPTY];
                    cellClass = "cell";
                    break;
                  case CellType.WALL:
                    backgroundColor = ColorType[CellType.WALL];
                    cellClass = "cell wall";
                    break;
                  case CellType.START:
                    backgroundColor = ColorType[CellType.START];
                    cellClass = "cell";
                    break;
                  case CellType.END:
                    backgroundColor = ColorType[CellType.END];
                    cellClass = "cell";
                    break;
                  case CellType.WEIGHTED:
                    backgroundColor = ColorType[CellType.WEIGHTED];
                    cellClass = "cell weighted";
                    break;
                  default:
                    backgroundColor = ColorType[CellType.EMPTY];
                    cellClass = "cell";
                }

                return (
                  <div
                    key={cellIdx}
                    className={cellClass}
                    style={{ backgroundColor }}
                    ref={(el) => {
                      cellsRef.current[rowIdx][cellIdx] = el;
                    }}
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
                    // />
                  >
                    <div
                      className={
                        cell.type === CellType.WEIGHTED ? "cell weighted" : ""
                      }
                    >
                      {/* {cell.weight} */}
                    </div>
                  </div>
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
