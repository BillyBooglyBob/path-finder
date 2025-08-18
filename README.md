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
- Allow same maze to be solved repeatedly by different algorithms.
  - So clear the maze then pass the new maze to the solver.
  - Ran into problem with cleared maze not being used by solver, since it is only accessible
    in subsequent render. Solved by computing the cleared maze and assign to variable, then
    pass variable to setter and the solver separately. Both get updated version.
- Reconstruct the path, design decision between making parent a Cell or keep track of only coord.
  - Chose later.
    - More memory efficient.
    - Avoids potential ciruclar reference from the start.
- How to access the path? Make the search return the final node than have the parent visualiser
  handle the path visualisation?
  - Chose to return it, much easier to do. Reduce the complexity of the object since the path
    visualiation is shared amongst the algorithms.
- Path visualised prior to the visting cells.
  - Issue is using waiting with promise between each visit, but the async operation
    executes in random order due to using forEach, need to use for...of instead.
- Path not visualising due to not create new copies of the grid at each update.
  If update existing array and reassigning it, reference doesn't change. React
  only re-renders when reference change.
- Laggy animation if we update at every single cell, since cloning the grid
  is expensive. Solve by batching the update, only re-compute grid every 3 steps.
  Prevent any steps from being left out by adding any extra grid update prior
  to return.

  - Optimisation strategy:
    - Shallow cloning instead of deep cloning, so reusing as much existing cells as possible
    - Batch updating
    - Update DOM directly with useRef (fastest)

- Handle both drag and paint (wall/eraser) and drag and move (start/end)

  - Use separate handler for each cell
  - Set a global eventlListener to handle cases where the mouse exits the grid
  - When drag and move, keep track of which cell we're moving and the last cell visited
    to clear the last cell and prevent painting

- Should we add weighted traversal?

  - Add a filter for weighted nodes (only addable via )

- Add random maze generation

  - Algorithm given grid size, start and end, generates & returns a solvable maze
  - Visualiser to visualise the returned maze one by one (from top to bottom, from outside to in, e.g.)
    - Update via DOM manipulation
    - Then update the grid state once at the end, so keep track of the grid during DOM manipulation

- After adding weighted nodes, when visiting them, should keep the weight cell visible but current
  implementation wipes it with just the visited colour.
  - Did this by adding an additional div inside the cell, which renders the weight node.

TODO:

- Much better UI
  - Info bar with short description of each algorithm
  - Rounded edges for grid
  - Cleaner UI panel
- Add recompute visited & path on start/end move, no need for animation
- Add move start/end over other cells and not replace it
