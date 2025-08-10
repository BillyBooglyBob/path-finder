import { useEffect, useRef, useState } from "react";
import { CellType, type Cell } from "../util/types";
import Dropdown from "./Dropdown";
import useBFS from "../algorithms/useBFS";
import useDFS from "../algorithms/useDFS";
import { deepCloneGrid, wait } from "../util/util";
import "./PathFinder.css";

const GRID_ROWS = 30;
const GRID_COLS = 71;
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
  const [isGridCleared, setIsGridCleared] = useState(false);

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

  // const gridRef = useRef(grid);

  // TODO:
  // - Cell visits not as smooth anymore, how to improve it? Was smooth because
  //   async nature
  //    - Update with useRef hook. So grid displayed is a separate ref. We update
  //      the ref. Whenever we run an algorithm, it is on the ref.
  //    - Original grid remains within the state. You can modify the walls, start,
  //      end, weighted walls. Actual visit, path are not created here.
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
  };

  useEffect(() => {
    resetGrid();
  }, []);

  const clearPath = () => {
    const clearedGrid = grid.map((r) =>
      r.map((cell) => ({
        ...cell,
        type:
          cell.type === CellType.VISITED || cell.type === CellType.PATH
            ? CellType.EMPTY
            : cell.type,
        depth: 0,
      }))
    );

    clearedGrid[startPosition.row][startPosition.col].type = CellType.START;
    clearedGrid[endPosition.row][endPosition.col].type = CellType.END;

    setGrid(clearedGrid);
    setIsGridCleared(true);
  };

  const visualisePath = async (endCell?: Cell) => {
    if (!endCell) return;
    const path: { row: number; col: number }[] = [];

    let currCell: Cell | undefined = endCell;
    while (currCell) {
      path.push({ row: currCell.row, col: currCell.col });
      currCell = currCell.parent;
    }

    path.reverse();

    let updates = 0;
    for (const cell of path) {
      updates++;
      setGrid((prev) => {
        const newGrid = deepCloneGrid(prev);
        const { row, col } = cell;
        const cellType = newGrid[row][col].type;

        if (cellType !== CellType.START && cellType !== CellType.END) {
          newGrid[row][col].type = CellType.PATH;
        }
        return newGrid;
      });

      if (updates % 3 === 0) {
        await wait(50); // smooth animation
      }
    }
  };

  const visualiseVisited = async (visitedNodes: Cell[]) => {
    for (let i = 0; i < visitedNodes.length; i++) {
      const currNode = visitedNodes[i];

      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row]);
        newGrid[currNode.row][currNode.col] = {
          ...currNode,
          type: currNode.type,
          depth: currNode.depth,
        };
        return newGrid;
      });

      await wait(100);
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

  // useEffect to run algorithm after grid is cleared and rendered
  useEffect(() => {
    if (!algorithmToRun || !isGridCleared) return;

    const runAlgorithm = async () => {
      console.log(`Running ${algorithmToRun} algorithm`);

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

          // TODO: Visited and path are both returned, so they can be handled together.
          // Perhaps good chance to use useRef to update the grid.
          await visualiseVisited(visited);
          if (found) {
            await visualisePath(endCell);
          }
        }
      } finally {
        setAlgorithmToRun(null);
        setIsGridCleared(false);
      }
    };

    runAlgorithm();
  }, [algorithmToRun, isGridCleared]);

  const runBFS = () => {
    clearPath();
    setAlgorithmToRun("BFS");
  };

  const runDFS = () => {
    clearPath();
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
          <button onClick={resetGrid}>Clear</button>
        </div>
        <Dropdown
          title="Generate maze"
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
        >
          {/* {gridRef.current.map((row, rowIdx) => ( */}
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} style={{ display: "flex" }}>
              {row.map((cell, cellIdx) => {
                let backgroundColor;

                switch (cell.type) {
                  case CellType.EMPTY:
                    backgroundColor = "white";
                    break;
                  case CellType.WALL:
                    backgroundColor = "black";
                    break;
                  case CellType.START:
                    backgroundColor = "green";
                    break;
                  case CellType.END:
                    backgroundColor = "red";
                    break;
                  case CellType.VISITED:
                    const depth = cell.depth || 0;
                    const lightness = Math.max(60, 99 - depth); // decreases with depth
                    backgroundColor = `hsl(220, 70%, ${lightness}%)`;
                    break;
                  case CellType.PATH:
                    backgroundColor = "lightgreen";
                    break;
                }

                let cellClass: string;
                switch (cell.type) {
                  case CellType.VISITED:
                    cellClass = "cell visited";
                    break;
                  case CellType.WALL:
                    cellClass = "cell wall";
                    break;
                  default:
                    cellClass = "cell";
                }

                return (
                  <div
                    key={cellIdx}
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
