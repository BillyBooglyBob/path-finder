import { useEffect, useState } from "react";
import { CellType, type Cell } from "../util/types";
import Dropdown from "./Dropdown";

const GRID_ROWS = 30;
const GRID_COLS = 71;

const PathFinder = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [currentCellAction, setCurrentCellAction] = useState<CellType>(1);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const generateGrid = () => {
    setGrid(
      Array.from({ length: GRID_ROWS }, () =>
        Array.from({ length: GRID_COLS }, () => ({
          type: CellType.EMPTY,
        }))
      )
    );
  };

  useEffect(() => {
    generateGrid();
  }, []);

  const handleCellAction = (row: number, col: number) => {
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

    setGrid((prev) => {
      const newGrid = prev.map((r) => [...r]);
      newGrid[row][col] = {
        type: resultValue,
      };

      return newGrid;
    });
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
              action: () => console.log("BFS searching..."),
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
        <div>Action</div>
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
