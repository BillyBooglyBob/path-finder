import { useEffect, useState } from "react";
import { CellType, type Cell } from "../util/types";
import Dropdown from "./Dropdown";
import useBFS from "../algorithms/useBFS";

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

  // TODO:
  // - Replace start and end with flags?
  // - Add a search algorithm
  // - Test search algorithm first
  // - Implement path finding second
  // - To implement depth and dynamically show, needs to dynamically update the grid
  //  so pass in setGrid

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
  };

  useEffect(() => {
    generateGrid();
  }, []);

  const handleCellAction = (row: number, col: number) => {
    // If START or END already defined and want to set it,
    // just move the exisitng one by replacing it with empty, and
    // moving to new position.

    //
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
    newGrid[row][col].type = resultValue;

    if (currentCellAction === CellType.START) {
      newGrid[startPosition.row][startPosition.col].type = CellType.EMPTY;
      setStartPosition({ ...startPosition, row, col });
    }
    if (currentCellAction === CellType.END) {
      newGrid[endPosition.row][endPosition.col].type = CellType.EMPTY;
      setEndPosition({ ...startPosition, row, col });
    }

    setGrid(newGrid);
  };

  const handleBFS = useBFS({ start: startPosition, grid, setGrid });

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
              action: handleBFS,
            },
            {
              name: "Depth First Search",
              action: () => console.log("DFS searching..."),
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
                }

                return (
                  <div
                    key={cellIdx}
                    onMouseDown={() => handleCellAction(rowIdx, cellIdx)}
                    onMouseEnter={() => {
                      if (isMouseDown) handleCellAction(rowIdx, cellIdx);
                    }}
                    style={{
                      width: 20,
                      height: 20,
                      border: "1px solid #ccc",
                      backgroundColor,
                    }}
                  >
                    {/* {cell.depth} */}
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
