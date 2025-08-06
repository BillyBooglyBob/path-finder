# Path Finder

### Visualise path finding algorithms

### UI

##### Header

- Algorithm dropdown (select which algorithm to use)
  - Colour the blocks visited, with deepening colour to signify depth
  - Achieve depth tracking by storing each block visited as (position, depth),
    and calculate current depth by adding 1 to prev block (parent's) depth
- Current mouse type
  - drag and drop to create walls
  - eraser
  - move start
  - move end
- Pre-made maze (Load random premade mazes, with varying difficulty)
  - Use algorithm to generate maze (needs to be solvable), should we preload?
  - When loading, use algorithm to generate from outside towards the inside
    - Like a spiral
- Clear (reset everything to one basic start and end)
  - Clear maze, replace with start and end at fixed position
    - Ripple effect from the centre, clearing everything.
    - At the end, make start and end pop up.

##### Body

- Grid containing the maze
  - Store as 2D array with state
- Cells
  - 4 types of cells
    - Empty
    - Wall
    - Start
    - End
  - Differentiate by colour or icon (e.g. flag)
  - Animation
    - When placing a wall, make it drop from top
    -

### Plan
- Create basic UI
- List out all buttons
- Create the grid
- Add ability to add start and end
  - Verify the grid types
- Add ability to add wall
  - Drag and drop (add some UI)
- Add ability to erase walls & start & end
- Add BFS (test it first)
- Keep track of the path taken
  - Parent children relationship, found the end, just traverse back along the parents to find the route
  - Add UI to animate it after finished search from start to finish (colour differently)
- Modify BFS with depth
- If all cells traversed and no path found, maybe return something like not possible animation
- Add UI, as cells are visited, colour them based on depth (permanent change to grid)
- Continue testing
- Add DFS
- Add Dijkstra
- Add generate maze
- Add speed?









### Difficulties
- Combine interactive UI with dynamic update
- Allow same maze to be solved repeatedly by different algorithms
- 