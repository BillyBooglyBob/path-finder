export const wait = async (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export const getKey = (row: number, col: number) => `${row} ${col}`;
