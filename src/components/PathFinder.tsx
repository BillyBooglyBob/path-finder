import { useEffect, useRef, useState } from "react";
import { CellType, type Cell } from "../util/types";
import Dropdown from "./Dropdown";
import useBFS from "../algorithms/useBFS";
import useDFS from "../algorithms/useDFS";
import { deepCloneGrid, wait } from "../util/util";
import "./PathFinder.css";

const GRID_ROWS = 30;
const GRID_COLS = 71;
const MID_ROW = Math.floor(GRID_ROWS / 2);
const MID_COL = Math.floor(GRID_COLS / 2);
const DEFAULT_START_POSITION: Cell = {
  type: CellType.START,
  row: MID_ROW,
  col: MID_COL - 5,
};
const DEFAULT_END_POSITION: Cell = {
  type: CellType.END,
  row: MID_ROW,
  col: MID_COL + 5,
};

const PathFinder = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [startPosition, setStartPosition] = useState(DEFAULT_START_POSITION);
  const [endPosition, setEndPosition] = useState(DEFAULT_END_POSITION);
  const [currentCellAction, setCurrentCellAction] = useState<CellType>(1);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const gridRef = useRef(grid);

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
  // - Track visited path (probably use class?)
  // - Add Dijkstra
  // - Make button UI better
  // - Add drop UI for walls
  //   - Elevate Y, drop Y

  const generateGrid = () => {
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
    gridRef.current = newGrid;
  };

  useEffect(() => {
    generateGrid();
  }, []);

  const clearVisitedCells = () => {
    const newGrid = grid.map((r) =>
      r.map((cell) => ({
        ...cell,
        type:
          cell.type === CellType.VISITED || cell.type === CellType.PATH
            ? CellType.EMPTY
            : cell.type,
        depth: 0,
      }))
    );

    newGrid[startPosition.row][startPosition.col].type = CellType.START;
    newGrid[endPosition.row][endPosition.col].type = CellType.END;

    return newGrid;
  };

  const handleCellAction = (row: number, col: number) => {
    if (
      currentCellAction !== CellType.START &&
      row === startPosition.row &&
      col === startPosition.col
    )
      return;
    if (
      currentCellAction !== CellType.END &&
      row === endPosition.row &&
      col === endPosition.col
    )
      return;

    let resultValue: CellType = CellType.EMPTY;

    switch (currentCellAction) {
      case CellType.START:
        resultValue = CellType.START;
        break;
      case CellType.END:
        resultValue = CellType.END;
        break;
      case CellType.WALL:
        resultValue = CellType.WALL;
        break;
    }

    const newGrid = grid.map((r) => [...r]);
    if (currentCellAction === CellType.START) {
      newGrid[startPosition.row][startPosition.col].type = CellType.EMPTY;
      setStartPosition({ ...startPosition, row, col });
    }
    if (currentCellAction === CellType.END) {
      newGrid[endPosition.row][endPosition.col].type = CellType.EMPTY;
      setEndPosition({ ...startPosition, row, col });
    }

    newGrid[row][col].type = resultValue;
    gridRef.current[row][col].type = resultValue;
    setGrid(newGrid);
  };

  const generatePath = async (endCell?: Cell) => {
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
        newGrid[cell.row][cell.col].type = CellType.PATH;
        return newGrid;
      });

      if (updates % 3 === 0) {
        await wait(50); // smooth animation
      }
    }
  };

  const runBFS = async () => {
    const clearedGrid = clearVisitedCells();

    setGrid(clearedGrid);
    const handleBFS = useBFS({
      start: startPosition,
      grid: clearedGrid,
      setGrid,
      gridRef: gridRef,
    });
    const { found, endCell } = await handleBFS();
    if (found) {
      generatePath(endCell);
    }
  };

  const runDFS = async () => {
    const clearedGrid = clearVisitedCells();

    setGrid(clearedGrid);
    const handleDFS = useDFS({
      start: startPosition,
      grid: clearedGrid,
      setGrid,
    });
    const { found, endCell } = await handleDFS();
    if (found) {
      generatePath(endCell);
    }
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
          <button onClick={() => setCurrentCellAction(CellType.WALL)}>
            Set wall
          </button>
          <button onClick={() => setCurrentCellAction(CellType.START)}>
            Set start
          </button>
          <button onClick={() => setCurrentCellAction(CellType.END)}>
            Set end
          </button>
          <button onClick={() => setCurrentCellAction(CellType.EMPTY)}>
            Erase
          </button>
          <button onClick={generateGrid}>Clear</button>
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
          backgroundColor: "lightseagreen",
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
                    backgroundColor = `hsl(220, 70%, ${lightness}%)`; // blue hue
                    break;
                  case CellType.PATH:
                    backgroundColor = "lightgreen";
                    break;
                }

                const cellClass =
                  cell.type === CellType.VISITED ? "cell visited" : "cell";

                return (
                  <div
                    key={cellIdx}
                    onMouseDown={() => handleCellAction(rowIdx, cellIdx)}
                    onMouseEnter={() => {
                      if (isMouseDown) handleCellAction(rowIdx, cellIdx);
                    }}
                    className={cellClass}
                    style={{ backgroundColor }}
                  />
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
