import type { Pattern } from "../types";

export const graphs: Pattern[] = [
  {
    slug: "graph-representation",
    title: "Graph Representation",
    category: "graphs",
    description: "Choose the structure before the algorithm — adjacency list, matrix, or implicit.",
    concepts: ["Adjacency list", "Matrix", "Implicit"],
    usedFor: ["modelling any graph problem", "converting edge lists", "grid and state-space graphs"],
    signals: ["edges", "connections", "n nodes", "grid", "prerequisites", "relationships", "network"],
    recognition: [
      "objects with pairwise relationships — that is a graph, even if the word is absent",
      "a grid is a graph with four implicit edges per cell",
      "states with transitions form an implicit graph you never materialise",
      "the input is an edge list that must become an adjacency list first",
    ],
    typicalQuestion: "Given n nodes and an edge list, determine reachability.",
    mentalModel: {
      lines: [
        "Adjacency list: [][]int, O(V+E) space — the default.",
        "Adjacency matrix: [][]bool, O(V²) — only for dense graphs or O(1) edge tests.",
        "Implicit: a neighbours(state) function — grids, word ladders, puzzles.",
      ],
      diagram: `  edges [[0,1],[1,2],[0,3]]

  adj   0 → 1, 3
        1 → 0, 2
        2 → 1
        3 → 0

  undirected: append BOTH directions`,
      key: "Build the adjacency list first, then the algorithm is the easy half.",
    },
    templates: [
      {
        name: "Adjacency list",
        filename: "adjacency.go",
        note: "The three lines that start most graph solutions.",
        code: `func buildAdj(n int, edges [][]int, directed bool) [][]int {
    adj := make([][]int, n)
    for _, e := range edges {
        adj[e[0]] = append(adj[e[0]], e[1])
        if !directed {
            adj[e[1]] = append(adj[e[1]], e[0])
        }
    }
    return adj
}`,
      },
      {
        name: "Weighted",
        filename: "weighted.go",
        note: "A small struct is clearer than parallel slices.",
        code: `type Edge struct {
    To, Weight int
}

func buildWeighted(n int, edges [][]int) [][]Edge {
    adj := make([][]Edge, n)
    for _, e := range edges {
        u, v, w := e[0], e[1], e[2]
        adj[u] = append(adj[u], Edge{v, w})
        adj[v] = append(adj[v], Edge{u, w}) // drop for a directed graph
    }
    return adj
}`,
      },
      {
        name: "Grid as a graph",
        filename: "grid_graph.go",
        note: "Four directions in a table keeps the bounds check in exactly one place.",
        code: `var dirs = [4][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}

func neighbours(grid [][]int, r, c int) [][2]int {
    var out [][2]int
    for _, d := range dirs {
        nr, nc := r+d[0], c+d[1]
        if nr >= 0 && nr < len(grid) && nc >= 0 && nc < len(grid[0]) {
            out = append(out, [2]int{nr, nc})
        }
    }
    return out
}

// 8 directions when diagonals count
var dirs8 = [8][2]int{
    {1, 0}, {-1, 0}, {0, 1}, {0, -1},
    {1, 1}, {1, -1}, {-1, 1}, {-1, -1},
}`,
      },
      {
        name: "Implicit state graph",
        filename: "implicit.go",
        note: "Never materialise the graph — generate neighbours on demand.",
        code: `// word ladder: neighbours are words one letter apart
func wordNeighbours(word string, dict map[string]bool) []string {
    var out []string
    b := []byte(word)

    for i := range b {
        orig := b[i]
        for c := byte('a'); c <= 'z'; c++ {
            if c == orig {
                continue
            }
            b[i] = c
            if cand := string(b); dict[cand] {
                out = append(out, cand)
            }
        }
        b[i] = orig
    }
    return out
}`,
      },
    ],
    complexity: [
      { label: "Adjacency list space", value: "O(V + E)" },
      { label: "Matrix space", value: "O(V²)" },
      { label: "Edge existence (list)", value: "O(deg)" },
      { label: "Edge existence (matrix)", value: "O(1)" },
    ],
    variations: [
      { name: "Reverse graph", detail: "Build both directions when you need in-edges — Kosaraju, safe-states, and similar." },
      { name: "Node as a struct key", detail: "map[State][]State when nodes are not integers; keep the key comparable." },
      { name: "Layered graph", detail: "Duplicate nodes per resource level to encode constraints like fuel or stops." },
    ],
    mistakes: [
      { title: "Adding only one direction for an undirected graph", detail: "Half the edges silently vanish." },
      { title: "Assuming nodes are 0-indexed", detail: "Many problems number from 1 — size the slice n+1 or subtract." },
      { title: "Using a matrix for a sparse graph", detail: "1e5 nodes means 1e10 cells." },
      { title: "Rebuilding the graph inside a loop", detail: "Build once, outside." },
    ],
    related: ["graph-bfs", "graph-dfs", "union-find", "topological-sort"],
    problems: [133, 207, 210, 1462],
  },
  {
    slug: "graph-bfs",
    title: "Graph BFS",
    category: "graphs",
    description: "Explore in rings of equal distance — the shortest path when every edge costs the same.",
    concepts: ["Shortest path", "Levels", "Frontier"],
    usedFor: ["unweighted shortest paths", "minimum moves", "reachability with distance", "spreading"],
    signals: ["shortest path", "minimum steps", "fewest moves", "nearest", "spread", "levels"],
    recognition: [
      "all edges have the same cost, so distance equals the number of hops",
      "the question asks for a minimum count of transitions",
      "the state space is finite and enumerable",
    ],
    typicalQuestion: "What is the minimum number of transformations from beginWord to endWord?",
    mentalModel: {
      lines: [
        "BFS dequeues nodes in non-decreasing distance order.",
        "So the first time a node is reached, it is via a shortest path — mark it then.",
        "Each level is one unit further from the source.",
      ],
      diagram: `  dist 0  ●
  dist 1  ● ● ●
  dist 2  ● ● ● ●

  visited on ENQUEUE, never on dequeue`,
      key: "Equal edge weights are the precondition. Unequal weights need Dijkstra.",
    },
    templates: [
      {
        name: "Shortest path",
        filename: "bfs_shortest.go",
        note: "dist doubles as the visited set, which removes a whole class of bugs.",
        code: `func shortestPath(adj [][]int, src, dst int) int {
    dist := make([]int, len(adj))
    for i := range dist {
        dist[i] = -1
    }
    dist[src] = 0
    queue := []int{src}

    for len(queue) > 0 {
        u := queue[0]
        queue = queue[1:]
        if u == dst {
            return dist[u]
        }
        for _, v := range adj[u] {
            if dist[v] == -1 {
                dist[v] = dist[u] + 1
                queue = append(queue, v)
            }
        }
    }
    return -1
}`,
      },
      {
        name: "Word ladder",
        filename: "word_ladder.go",
        note: "Neighbours are generated, not stored — the graph is never built.",
        code: `func ladderLength(begin, end string, wordList []string) int {
    dict := map[string]bool{}
    for _, w := range wordList {
        dict[w] = true
    }
    if !dict[end] {
        return 0
    }

    queue := []string{begin}
    delete(dict, begin)
    steps := 1

    for len(queue) > 0 {
        size := len(queue)
        for i := 0; i < size; i++ {
            cur := queue[0]
            queue = queue[1:]
            if cur == end {
                return steps
            }
            b := []byte(cur)
            for j := range b {
                orig := b[j]
                for c := byte('a'); c <= 'z'; c++ {
                    b[j] = c
                    cand := string(b)
                    if dict[cand] {
                        delete(dict, cand) // visit on enqueue
                        queue = append(queue, cand)
                    }
                }
                b[j] = orig
            }
        }
        steps++
    }
    return 0
}`,
      },
      {
        name: "0-1 BFS",
        filename: "zero_one_bfs.go",
        note: "Weights of only 0 and 1: a deque replaces the heap, giving O(V+E).",
        code: `func zeroOneBFS(adj [][]Edge, src int) []int {
    dist := make([]int, len(adj))
    for i := range dist {
        dist[i] = math.MaxInt
    }
    dist[src] = 0
    dq := []int{src}

    for len(dq) > 0 {
        u := dq[0]
        dq = dq[1:]
        for _, e := range adj[u] {
            if nd := dist[u] + e.Weight; nd < dist[e.To] {
                dist[e.To] = nd
                if e.Weight == 0 {
                    dq = append([]int{e.To}, dq...) // front
                } else {
                    dq = append(dq, e.To) // back
                }
            }
        }
    }
    return dist
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(V + E)" },
      { label: "Grid", value: "O(rows · cols)" },
      { label: "Space", value: "O(V)" },
    ],
    variations: [
      { name: "Multi-source", detail: "Seed the queue with every source at distance 0." },
      { name: "Bidirectional", detail: "Search from both ends; the frontier grows roughly as the square root." },
      { name: "BFS on states", detail: "The node can be a tuple — (cell, keysMask) for key-and-door grids." },
      { name: "Counting shortest paths", detail: "Carry a path count and reset it when a strictly shorter distance is found." },
    ],
    mistakes: [
      { title: "Marking visited on dequeue", detail: "Nodes get enqueued repeatedly and the complexity degrades badly." },
      { title: "Using BFS with weighted edges", detail: "Level order no longer corresponds to distance." },
      { title: "Regenerating neighbours expensively", detail: "In word ladder, generating patterns beats comparing against every word." },
    ],
    related: ["bfs-queue", "multi-source-bfs", "dijkstra", "shortest-path"],
    problems: [127, 752, 815, 1091, 994, 542, 785, 847],
  },
  {
    slug: "graph-dfs",
    title: "Graph DFS",
    category: "graphs",
    description: "Go deep first — the right tool for reachability, components, cycles and structure.",
    concepts: ["Recursion", "Visited", "Backtrack"],
    usedFor: ["connectivity", "flood fill", "cycle detection", "path enumeration", "bridges"],
    signals: ["connected", "reachable", "flood fill", "islands", "all paths", "detect a cycle", "regions"],
    recognition: [
      "you need to know what is reachable, not how far away it is",
      "regions of a grid must be identified or filled",
      "structural questions: cycles, bridges, articulation points",
      "all paths must be enumerated — that is DFS with backtracking",
    ],
    typicalQuestion: "How many islands are there in this grid?",
    mentalModel: {
      lines: [
        "Mark on entry, recurse into each neighbour, and (for reachability) never unmark.",
        "Unmark on exit only when enumerating paths — that is backtracking, and it is exponential.",
        "Entry and exit times give you the structure: cycles, bridges, topological order.",
      ],
      diagram: `  dfs(u):
      seen[u] = true
      for v in adj[u]:
          if !seen[v]: dfs(v)

  reachability → never unmark
  path enumeration → unmark on the way out`,
      key: "Whether you unmark decides between linear and exponential.",
    },
    templates: [
      {
        name: "Recursive DFS",
        filename: "dfs.go",
        note: "Closure recursion is the idiomatic Go form.",
        code: `func dfsAll(adj [][]int) []bool {
    seen := make([]bool, len(adj))

    var dfs func(int)
    dfs = func(u int) {
        seen[u] = true
        for _, v := range adj[u] {
            if !seen[v] {
                dfs(v)
            }
        }
    }

    for u := range adj {
        if !seen[u] {
            dfs(u)
        }
    }
    return seen
}`,
      },
      {
        name: "Flood fill",
        filename: "flood_fill.go",
        note: "Mutating the grid is the cheapest visited set — say so if asked about side effects.",
        code: `func numIslands(grid [][]byte) int {
    var fill func(r, c int)
    fill = func(r, c int) {
        if r < 0 || r >= len(grid) || c < 0 || c >= len(grid[0]) || grid[r][c] != '1' {
            return
        }
        grid[r][c] = '0' // sink it
        fill(r+1, c)
        fill(r-1, c)
        fill(r, c+1)
        fill(r, c-1)
    }

    count := 0
    for r := range grid {
        for c := range grid[r] {
            if grid[r][c] == '1' {
                count++
                fill(r, c)
            }
        }
    }
    return count
}`,
      },
      {
        name: "Iterative DFS",
        filename: "dfs_iterative.go",
        note: "When recursion depth is a risk — 1e5 nodes in a chain.",
        code: `func dfsIterative(adj [][]int, src int) []bool {
    seen := make([]bool, len(adj))
    stack := []int{src}
    seen[src] = true

    for len(stack) > 0 {
        u := stack[len(stack)-1]
        stack = stack[:len(stack)-1]

        for _, v := range adj[u] {
            if !seen[v] {
                seen[v] = true
                stack = append(stack, v)
            }
        }
    }
    return seen
}`,
      },
      {
        name: "Bridges (Tarjan)",
        filename: "bridges.go",
        note: "low[v] > disc[u] means the edge u–v is the only way into v's subtree.",
        code: `func criticalConnections(n int, connections [][]int) [][]int {
    adj := buildAdj(n, connections, false)
    disc := make([]int, n)
    low := make([]int, n)
    for i := range disc {
        disc[i] = -1
    }
    timer := 0
    var out [][]int

    var dfs func(u, parent int)
    dfs = func(u, parent int) {
        disc[u], low[u] = timer, timer
        timer++

        for _, v := range adj[u] {
            if v == parent {
                continue
            }
            if disc[v] == -1 {
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if low[v] > disc[u] {
                    out = append(out, []int{u, v}) // bridge
                }
            } else {
                low[u] = min(low[u], disc[v]) // back edge
            }
        }
    }

    dfs(0, -1)
    return out
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(V + E)" },
      { label: "Space", value: "O(V)", note: "recursion stack plus visited" },
      { label: "Path enumeration", value: "O(2^V)", note: "exponential by nature" },
    ],
    variations: [
      { name: "Three-colour DFS", detail: "white/grey/black distinguishes a back edge (cycle) from a cross edge." },
      { name: "Entry and exit times", detail: "Tarjan's bridges, articulation points and SCCs all key off these." },
      { name: "Backtracking DFS", detail: "Unmark on the way out when enumerating paths or arrangements." },
      { name: "Iterative with explicit frames", detail: "Needed for post-order work without recursion." },
    ],
    mistakes: [
      { title: "Forgetting the visited check on undirected graphs", detail: "You walk straight back where you came from, forever." },
      { title: "Skipping the parent by value instead of by edge", detail: "With parallel edges, skipping by node id wrongly ignores a real second edge." },
      { title: "Recursion depth on a chain", detail: "Go's stack grows, but 1e6-deep recursion is still a real risk." },
      { title: "Unmarking when you only need reachability", detail: "Turns O(V+E) into exponential." },
    ],
    related: ["connected-components", "cycle-detection", "graph-bfs", "strongly-connected-components"],
    problems: [200, 695, 130, 417, 133, 79, 1192, 332, 802],
  },
  {
    slug: "connected-components",
    title: "Connected Components",
    category: "graphs",
    description: "Count or label the maximal groups of mutually reachable nodes.",
    concepts: ["Flood fill", "Labelling", "DSU"],
    usedFor: ["counting islands or regions", "grouping related items", "checking full connectivity"],
    signals: ["islands", "provinces", "groups", "regions", "how many components", "all connected"],
    recognition: [
      "the question counts groups of things that touch or relate",
      "you must decide whether everything is reachable from everything else",
      "items need to be merged transitively — accounts, emails, friends",
    ],
    typicalQuestion: "How many separate provinces are there in this connectivity matrix?",
    mentalModel: {
      lines: [
        "Start a search from each unvisited node; each start is one new component.",
        "DFS/BFS labels components in O(V+E) when the graph is static.",
        "Union-Find is better when edges arrive incrementally.",
      ],
      diagram: `  ● ● ●    ● ●      ●
  └─┬─┘    └─┘
    1        2       3

  components = number of search starts`,
      key: "The number of components is the number of times the outer loop starts a fresh search.",
    },
    templates: [
      {
        name: "Count components",
        filename: "components.go",
        note: "The outer loop is the counter.",
        code: `func countComponents(n int, edges [][]int) int {
    adj := buildAdj(n, edges, false)
    seen := make([]bool, n)

    var dfs func(int)
    dfs = func(u int) {
        seen[u] = true
        for _, v := range adj[u] {
            if !seen[v] {
                dfs(v)
            }
        }
    }

    count := 0
    for u := 0; u < n; u++ {
        if !seen[u] {
            count++
            dfs(u)
        }
    }
    return count
}`,
      },
      {
        name: "Label + size",
        filename: "label_components.go",
        note: "Storing the component id per node answers 'are u and v connected' in O(1) afterwards.",
        code: `func labelComponents(adj [][]int) (comp []int, sizes []int) {
    comp = make([]int, len(adj))
    for i := range comp {
        comp[i] = -1
    }

    for u := range adj {
        if comp[u] != -1 {
            continue
        }
        id := len(sizes)
        size := 0
        queue := []int{u}
        comp[u] = id

        for len(queue) > 0 {
            x := queue[0]
            queue = queue[1:]
            size++
            for _, v := range adj[x] {
                if comp[v] == -1 {
                    comp[v] = id
                    queue = append(queue, v)
                }
            }
        }
        sizes = append(sizes, size)
    }
    return comp, sizes
}`,
      },
      {
        name: "Grid regions",
        filename: "max_area.go",
        note: "Flood fill returning a size rather than a flag.",
        code: `func maxAreaOfIsland(grid [][]int) int {
    var fill func(r, c int) int
    fill = func(r, c int) int {
        if r < 0 || r >= len(grid) || c < 0 || c >= len(grid[0]) || grid[r][c] == 0 {
            return 0
        }
        grid[r][c] = 0
        return 1 + fill(r+1, c) + fill(r-1, c) + fill(r, c+1) + fill(r, c-1)
    }

    best := 0
    for r := range grid {
        for c := range grid[r] {
            best = max(best, fill(r, c))
        }
    }
    return best
}`,
      },
    ],
    complexity: [
      { label: "DFS / BFS", value: "O(V + E)" },
      { label: "Union-Find", value: "O(E · α(V))", note: "effectively linear" },
      { label: "Space", value: "O(V)" },
    ],
    variations: [
      { name: "Union-Find", detail: "Preferable when edges arrive over time or you only need counts." },
      { name: "Border-anchored regions", detail: "Surrounded-regions inverts the search: mark what touches the border first." },
      { name: "Components in a directed graph", detail: "Weak components ignore direction; strong components need Tarjan or Kosaraju." },
      { name: "Component of an implicit relation", detail: "Stones sharing a row or column: union by row and column keys." },
    ],
    mistakes: [
      { title: "Counting inside the search instead of outside", detail: "The component count increments once per start, not once per node." },
      { title: "Treating a directed graph as undirected", detail: "Reachability is not symmetric — you may need SCCs." },
      { title: "Forgetting isolated nodes", detail: "A node with no edges is still a component." },
    ],
    related: ["union-find", "graph-dfs", "graph-bfs", "strongly-connected-components"],
    problems: [200, 695, 547, 130, 721, 947, 1319],
  },
  {
    slug: "cycle-detection",
    title: "Cycle Detection",
    category: "graphs",
    description: "Directed graphs need a recursion-stack colour; undirected graphs only need a parent check.",
    concepts: ["Three colours", "Back edge", "Parent skip"],
    usedFor: ["dependency validation", "deadlock detection", "tree verification", "safe-state analysis"],
    signals: ["cycle", "circular dependency", "can finish all", "is it a tree", "deadlock", "valid ordering"],
    recognition: [
      "prerequisites or dependencies that must not loop",
      "you must verify the input is actually a tree — connected and acyclic",
      "a topological order exists if and only if there is no cycle",
    ],
    typicalQuestion: "Can all courses be finished given these prerequisites?",
    mentalModel: {
      lines: [
        "Directed: white (unvisited), grey (on the current path), black (done).",
        "An edge into a grey node is a back edge — a cycle.",
        "Undirected: any visited neighbour that is not the parent closes a cycle.",
      ],
      diagram: `  directed
  white ──▶ grey ──▶ black
             │
             └─ edge into grey = CYCLE

  undirected
  seen[v] && v != parent = CYCLE`,
      key: "Grey means 'on the stack right now'. Black means 'finished, and safe'.",
    },
    templates: [
      {
        name: "Directed (colours)",
        filename: "cycle_directed.go",
        note: "Marking black on exit is what separates a back edge from a cross edge.",
        code: `func hasCycleDirected(adj [][]int) bool {
    const (
        white = 0
        grey  = 1
        black = 2
    )
    colour := make([]int, len(adj))

    var dfs func(int) bool
    dfs = func(u int) bool {
        colour[u] = grey
        for _, v := range adj[u] {
            if colour[v] == grey {
                return true // back edge
            }
            if colour[v] == white && dfs(v) {
                return true
            }
        }
        colour[u] = black
        return false
    }

    for u := range adj {
        if colour[u] == white && dfs(u) {
            return true
        }
    }
    return false
}`,
      },
      {
        name: "Undirected",
        filename: "cycle_undirected.go",
        note: "Pass the parent down; every other visited neighbour means a cycle.",
        code: `func hasCycleUndirected(n int, adj [][]int) bool {
    seen := make([]bool, n)

    var dfs func(u, parent int) bool
    dfs = func(u, parent int) bool {
        seen[u] = true
        for _, v := range adj[u] {
            if v == parent {
                continue
            }
            if seen[v] || dfs(v, u) {
                return true
            }
        }
        return false
    }

    for u := 0; u < n; u++ {
        if !seen[u] && dfs(u, -1) {
            return true
        }
    }
    return false
}`,
      },
      {
        name: "Kahn's check",
        filename: "kahn_cycle.go",
        note: "If the queue drains fewer than n nodes, the remainder is inside a cycle.",
        code: `func canFinish(n int, prerequisites [][]int) bool {
    adj := make([][]int, n)
    indeg := make([]int, n)
    for _, p := range prerequisites {
        adj[p[1]] = append(adj[p[1]], p[0])
        indeg[p[0]]++
    }

    queue := []int{}
    for u := 0; u < n; u++ {
        if indeg[u] == 0 {
            queue = append(queue, u)
        }
    }

    done := 0
    for len(queue) > 0 {
        u := queue[0]
        queue = queue[1:]
        done++
        for _, v := range adj[u] {
            indeg[v]--
            if indeg[v] == 0 {
                queue = append(queue, v)
            }
        }
    }
    return done == n
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(V + E)" },
      { label: "Space", value: "O(V)" },
    ],
    variations: [
      { name: "Find the cycle itself", detail: "Keep a parent array and walk back from the grey node that closed it." },
      { name: "Safe states", detail: "Nodes that reach no cycle — reverse topological sort, or black-marking DFS." },
      { name: "Functional graph", detail: "One out-edge per node: use fast/slow pointers instead." },
      { name: "Union-Find on undirected", detail: "An edge whose endpoints already share a root closes a cycle." },
    ],
    mistakes: [
      { title: "Using a single visited flag on a directed graph", detail: "It cannot distinguish a back edge from an already-finished branch, producing false positives." },
      { title: "Not skipping the parent on undirected graphs", detail: "Every edge looks like a 2-cycle." },
      { title: "Forgetting disconnected components", detail: "Loop over every node as a potential start." },
    ],
    related: ["topological-sort", "graph-dfs", "union-find", "fast-slow-pointers"],
    problems: [207, 802, 684, 210],
  },
  {
    slug: "topological-sort",
    title: "Topological Sort",
    category: "graphs",
    description: "Linearise a DAG so every edge points forward — dependency order.",
    concepts: ["Kahn", "In-degree", "DAG"],
    usedFor: ["build and task ordering", "course scheduling", "DP over a DAG", "longest path in a DAG"],
    signals: ["prerequisites", "build order", "dependencies", "before", "valid ordering", "schedule"],
    recognition: [
      "one thing must happen before another — that is a directed edge",
      "the question asks for an order, or whether one exists",
      "you want DP over a DAG and need a processing order",
    ],
    typicalQuestion: "Return an order in which all courses can be taken.",
    mentalModel: {
      lines: [
        "Kahn: repeatedly take a node with in-degree zero and remove its edges.",
        "If the queue empties before all nodes are output, a cycle exists.",
        "DFS alternative: push each node after its descendants, then reverse.",
      ],
      diagram: `  indeg  A:0  B:1  C:2

  queue [A] → output A, B:0
  queue [B] → output B, C:1 … C:0
  queue [C] → output C

  order A B C`,
      key: "Kahn's algorithm detects cycles for free — count what you emit.",
    },
    templates: [
      {
        name: "Kahn (BFS)",
        filename: "topo_kahn.go",
        note: "Returns nil when a cycle exists — the count check is the detector.",
        code: `func topoSort(n int, edges [][]int) []int {
    adj := make([][]int, n)
    indeg := make([]int, n)
    for _, e := range edges { // e = [from, to]
        adj[e[0]] = append(adj[e[0]], e[1])
        indeg[e[1]]++
    }

    queue := []int{}
    for u := 0; u < n; u++ {
        if indeg[u] == 0 {
            queue = append(queue, u)
        }
    }

    order := make([]int, 0, n)
    for len(queue) > 0 {
        u := queue[0]
        queue = queue[1:]
        order = append(order, u)

        for _, v := range adj[u] {
            indeg[v]--
            if indeg[v] == 0 {
                queue = append(queue, v)
            }
        }
    }

    if len(order) != n {
        return nil // cycle
    }
    return order
}`,
      },
      {
        name: "DFS post-order",
        filename: "topo_dfs.go",
        note: "Append on the way out, then reverse. Needs a separate cycle check.",
        code: `func topoDFS(n int, adj [][]int) []int {
    colour := make([]int, n)
    order := make([]int, 0, n)
    ok := true

    var dfs func(int)
    dfs = func(u int) {
        colour[u] = 1
        for _, v := range adj[u] {
            if colour[v] == 1 {
                ok = false
                return
            }
            if colour[v] == 0 {
                dfs(v)
            }
        }
        colour[u] = 2
        order = append(order, u) // post-order
    }

    for u := 0; u < n && ok; u++ {
        if colour[u] == 0 {
            dfs(u)
        }
    }
    if !ok {
        return nil
    }
    slices.Reverse(order)
    return order
}`,
      },
      {
        name: "Lexicographically smallest",
        filename: "topo_lex.go",
        note: "Swap the queue for a min-heap when ties must break in a defined order.",
        code: `func topoSmallest(n int, adj [][]int, indeg []int) []int {
    h := &IntHeap{}
    for u := 0; u < n; u++ {
        if indeg[u] == 0 {
            heap.Push(h, u)
        }
    }

    order := make([]int, 0, n)
    for h.Len() > 0 {
        u := heap.Pop(h).(int)
        order = append(order, u)
        for _, v := range adj[u] {
            indeg[v]--
            if indeg[v] == 0 {
                heap.Push(h, v)
            }
        }
    }
    return order
}`,
      },
      {
        name: "DP over a DAG",
        filename: "dag_dp.go",
        note: "Process in topological order and every dependency is already final.",
        code: `func longestPathDAG(n int, adj [][]int, order []int) int {
    dp := make([]int, n)
    for _, u := range order {
        for _, v := range adj[u] {
            dp[v] = max(dp[v], dp[u]+1)
        }
    }
    return slices.Max(dp)
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(V + E)" },
      { label: "With a heap", value: "O(V log V + E)" },
      { label: "Space", value: "O(V + E)" },
    ],
    variations: [
      { name: "All topological orders", detail: "Backtracking over every zero in-degree choice — exponential." },
      { name: "Leaf peeling", detail: "Undirected trees: repeatedly strip degree-1 nodes to find the centroids." },
      { name: "Longest path in a DAG", detail: "Trivial in topological order; NP-hard on a general graph." },
      { name: "Transitive closure", detail: "Propagate reachability bitsets in topological order." },
    ],
    mistakes: [
      { title: "Reversing the edge direction", detail: "'a before b' is an edge a → b. Getting this backwards yields a valid-looking but wrong order." },
      { title: "Forgetting the completeness check", detail: "Without len(order) == n, a cycle produces a silently truncated answer." },
      { title: "Not reversing the DFS post-order", detail: "Post-order is the reverse topological order." },
    ],
    related: ["cycle-detection", "graph-bfs", "linear-dp", "graph-dfs"],
    problems: [207, 210, 269, 802, 310, 1462],
  },
  {
    slug: "union-find",
    title: "Union Find (DSU)",
    category: "graphs",
    description: "Near-constant-time merging and membership tests for a partition of elements.",
    concepts: ["Path compression", "Union by rank", "Merge"],
    usedFor: ["dynamic connectivity", "Kruskal's MST", "grouping equivalences", "cycle detection while adding edges"],
    signals: ["connected", "merge", "same group", "accounts merge", "redundant connection", "equations", "friend circles"],
    recognition: [
      "edges arrive one at a time and you must answer connectivity as you go",
      "items must be grouped by a transitive relation",
      "you need to detect the first edge that creates a cycle",
      "Kruskal's algorithm — DSU is its core",
    ],
    typicalQuestion: "Find the edge that, when added, creates a cycle.",
    mentalModel: {
      lines: [
        "Every set is a tree; the root is the set's identity.",
        "Find walks to the root and flattens the path on the way back.",
        "Union attaches the smaller tree under the larger.",
      ],
      diagram: `  before          after find(d)
      a               a
     / \\            / | \\
    b   c          b  c  d
    │
    d

  path compression flattens as it goes`,
      key: "Two elements are connected exactly when they share a root.",
    },
    templates: [
      {
        name: "DSU",
        filename: "dsu.go",
        note: "Path compression plus union by size. Count tracks the number of components.",
        code: `type DSU struct {
    parent []int
    size   []int
    Count  int
}

func NewDSU(n int) *DSU {
    d := &DSU{
        parent: make([]int, n),
        size:   make([]int, n),
        Count:  n,
    }
    for i := range d.parent {
        d.parent[i] = i
        d.size[i] = 1
    }
    return d
}

func (d *DSU) Find(x int) int {
    for d.parent[x] != x {
        d.parent[x] = d.parent[d.parent[x]] // path halving
        x = d.parent[x]
    }
    return x
}

// returns false if they were already connected
func (d *DSU) Union(a, b int) bool {
    ra, rb := d.Find(a), d.Find(b)
    if ra == rb {
        return false
    }
    if d.size[ra] < d.size[rb] {
        ra, rb = rb, ra
    }
    d.parent[rb] = ra
    d.size[ra] += d.size[rb]
    d.Count--
    return true
}

func (d *DSU) Connected(a, b int) bool { return d.Find(a) == d.Find(b) }`,
      },
      {
        name: "Non-integer keys",
        filename: "dsu_map.go",
        note: "A map-backed DSU for strings, emails, coordinates.",
        code: `type MapDSU struct {
    parent map[string]string
}

func (d *MapDSU) Find(x string) string {
    if _, ok := d.parent[x]; !ok {
        d.parent[x] = x
    }
    for d.parent[x] != x {
        d.parent[x] = d.parent[d.parent[x]]
        x = d.parent[x]
    }
    return x
}

func (d *MapDSU) Union(a, b string) {
    ra, rb := d.Find(a), d.Find(b)
    if ra != rb {
        d.parent[rb] = ra
    }
}`,
      },
      {
        name: "Grid DSU",
        filename: "dsu_grid.go",
        note: "Flatten (r, c) to r*cols + c; union right and down only, to avoid double work.",
        code: `func numIslandsDSU(grid [][]byte) int {
    rows, cols := len(grid), len(grid[0])
    dsu := NewDSU(rows * cols)

    water := 0
    for r := 0; r < rows; r++ {
        for c := 0; c < cols; c++ {
            if grid[r][c] == '0' {
                water++
                continue
            }
            if r+1 < rows && grid[r+1][c] == '1' {
                dsu.Union(r*cols+c, (r+1)*cols+c)
            }
            if c+1 < cols && grid[r][c+1] == '1' {
                dsu.Union(r*cols+c, r*cols+c+1)
            }
        }
    }
    return dsu.Count - water
}`,
      },
    ],
    complexity: [
      { label: "Find", value: "O(α(n))", note: "inverse Ackermann — under 5 for any realistic n" },
      { label: "Union", value: "O(α(n))" },
      { label: "m operations", value: "O(m α(n))", note: "effectively linear" },
      { label: "Space", value: "O(n)" },
    ],
    why: "Path compression flattens trees during lookups and union by size keeps them shallow. Together they give an amortised inverse-Ackermann bound — for every input that fits in memory, that constant is at most four.",
    variations: [
      { name: "Weighted DSU", detail: "Store an offset to the parent for problems about relative values or ratios." },
      { name: "DSU with rollback", detail: "Skip path compression and keep a change log to undo unions — needed for offline dynamic connectivity." },
      { name: "Bipartite DSU", detail: "Double the universe: node u and 'not u' — union enforces opposite sides." },
      { name: "DSU on time", detail: "Sort edges by weight and union incrementally for bottleneck path queries." },
    ],
    mistakes: [
      { title: "Forgetting path compression", detail: "Without it, Find degrades to O(n) on adversarial input." },
      { title: "Comparing parent[a] == parent[b]", detail: "Compare roots, via Find, not immediate parents." },
      { title: "Uniting by index rather than by root", detail: "parent[b] = a instead of parent[rb] = ra breaks the structure." },
      { title: "Expecting to split a set", detail: "DSU merges only. Undoing requires rollback or an offline approach." },
    ],
    related: ["connected-components", "minimum-spanning-tree", "cycle-detection", "bipartite-graph"],
    problems: [684, 721, 990, 1319, 947, 547, 200, 1584, 785],
  },
  {
    slug: "strongly-connected-components",
    title: "Strongly Connected Components",
    category: "graphs",
    description: "Maximal groups where every node reaches every other — and the DAG they condense into.",
    concepts: ["Tarjan", "Kosaraju", "Condensation"],
    usedFor: ["mutual reachability", "2-SAT", "condensing a directed graph into a DAG", "bridges and articulation points"],
    signals: ["strongly connected", "mutually reachable", "both directions", "condense", "2-SAT"],
    recognition: [
      "reachability must hold in both directions, not just one",
      "a directed graph needs to become a DAG before you can DP over it",
      "the problem is a 2-SAT instance in disguise",
    ],
    typicalQuestion: "Find all strongly connected components of a directed graph.",
    mentalModel: {
      lines: [
        "Kosaraju: DFS to get finish times, then DFS the reversed graph in that order.",
        "Tarjan: one DFS with disc/low values and a stack — components pop when low[u] == disc[u].",
        "Contracting each SCC gives a DAG, which you can then topologically sort.",
      ],
      diagram: `  a ⇄ b     c ⇄ d
      ↓         ↑
      └─────────┘

  SCC1 {a,b}  SCC2 {c,d}
  condensation: SCC1 → SCC2  (a DAG)`,
      key: "Every directed graph is a DAG of its strongly connected components.",
    },
    templates: [
      {
        name: "Tarjan SCC",
        filename: "tarjan.go",
        note: "One pass. low[u] == disc[u] marks the root of a component.",
        code: `func tarjanSCC(n int, adj [][]int) [][]int {
    disc := make([]int, n)
    low := make([]int, n)
    onStack := make([]bool, n)
    for i := range disc {
        disc[i] = -1
    }
    stack := []int{}
    timer := 0
    var comps [][]int

    var dfs func(int)
    dfs = func(u int) {
        disc[u], low[u] = timer, timer
        timer++
        stack = append(stack, u)
        onStack[u] = true

        for _, v := range adj[u] {
            if disc[v] == -1 {
                dfs(v)
                low[u] = min(low[u], low[v])
            } else if onStack[v] {
                low[u] = min(low[u], disc[v])
            }
        }

        if low[u] == disc[u] { // root of an SCC
            var comp []int
            for {
                w := stack[len(stack)-1]
                stack = stack[:len(stack)-1]
                onStack[w] = false
                comp = append(comp, w)
                if w == u {
                    break
                }
            }
            comps = append(comps, comp)
        }
    }

    for u := 0; u < n; u++ {
        if disc[u] == -1 {
            dfs(u)
        }
    }
    return comps
}`,
      },
      {
        name: "Kosaraju",
        filename: "kosaraju.go",
        note: "Two passes, easier to remember, needs the reversed graph.",
        code: `func kosaraju(n int, adj, radj [][]int) []int {
    seen := make([]bool, n)
    order := make([]int, 0, n)

    var dfs1 func(int)
    dfs1 = func(u int) {
        seen[u] = true
        for _, v := range adj[u] {
            if !seen[v] {
                dfs1(v)
            }
        }
        order = append(order, u) // finish time
    }
    for u := 0; u < n; u++ {
        if !seen[u] {
            dfs1(u)
        }
    }

    comp := make([]int, n)
    for i := range comp {
        comp[i] = -1
    }
    var dfs2 func(u, id int)
    dfs2 = func(u, id int) {
        comp[u] = id
        for _, v := range radj[u] {
            if comp[v] == -1 {
                dfs2(v, id)
            }
        }
    }

    id := 0
    for i := len(order) - 1; i >= 0; i-- {
        if u := order[i]; comp[u] == -1 {
            dfs2(u, id)
            id++
        }
    }
    return comp
}`,
      },
    ],
    complexity: [
      { label: "Tarjan", value: "O(V + E)", note: "one DFS" },
      { label: "Kosaraju", value: "O(V + E)", note: "two DFS plus graph reversal" },
      { label: "Space", value: "O(V)" },
    ],
    variations: [
      { name: "Bridges and articulation points", detail: "Same disc/low machinery on an undirected graph." },
      { name: "2-SAT", detail: "Build the implication graph; the formula is satisfiable iff no variable shares an SCC with its negation." },
      { name: "Condensation DAG", detail: "Contract components, then run topological DP over the result." },
    ],
    mistakes: [
      { title: "Updating low from a non-stack node", detail: "In Tarjan, only update from disc[v] when v is still on the stack — otherwise it is a cross edge." },
      { title: "Using low[v] for back edges", detail: "Back edges use disc[v]; tree edges use low[v]." },
      { title: "Processing Kosaraju's second pass in the wrong order", detail: "It must follow decreasing finish time." },
    ],
    related: ["graph-dfs", "topological-sort", "cycle-detection", "connected-components"],
    problems: [1192, 802],
  },
  {
    slug: "minimum-spanning-tree",
    title: "Minimum Spanning Tree",
    category: "graphs",
    description: "Connect every node at the lowest total edge cost — Kruskal with DSU, or Prim with a heap.",
    concepts: ["Kruskal", "Prim", "Cut property"],
    usedFor: ["cheapest network connection", "clustering", "bottleneck path bounds"],
    signals: ["connect all", "minimum cost to connect", "network", "spanning tree", "cheapest wiring"],
    recognition: [
      "every node must end up connected, and the total edge cost is minimised",
      "the graph is undirected and weighted",
      "the answer is a tree: exactly V-1 edges, no cycles",
    ],
    typicalQuestion: "What is the minimum cost to connect all the points?",
    mentalModel: {
      lines: [
        "Kruskal: sort edges by weight and add any that does not create a cycle.",
        "Prim: grow one tree, always taking the cheapest edge that leaves it.",
        "Both rest on the cut property: the lightest edge across any cut is safe.",
      ],
      diagram: `  edges sorted: 1, 2, 2, 3, 5, 7

  take 1 ✓   take 2 ✓   take 2 ✗ (cycle)
  take 3 ✓   … until V−1 edges

  DSU answers "would this create a cycle?"`,
      key: "Kruskal for sparse edge lists; Prim for dense or implicit complete graphs.",
    },
    templates: [
      {
        name: "Kruskal",
        filename: "kruskal.go",
        note: "Sort plus DSU. Stop as soon as V-1 edges are taken.",
        code: `func kruskal(n int, edges [][]int) (cost int, ok bool) {
    sort.Slice(edges, func(i, j int) bool { return edges[i][2] < edges[j][2] })
    dsu := NewDSU(n)
    used := 0

    for _, e := range edges {
        if dsu.Union(e[0], e[1]) {
            cost += e[2]
            used++
            if used == n-1 {
                return cost, true
            }
        }
    }
    return cost, used == n-1
}`,
      },
      {
        name: "Prim (dense)",
        filename: "prim_dense.go",
        note: "O(n²) with no heap — the right choice for a complete graph like problem 1584.",
        code: `func minCostConnectPoints(points [][]int) int {
    n := len(points)
    minEdge := make([]int, n)
    inTree := make([]bool, n)
    for i := range minEdge {
        minEdge[i] = math.MaxInt
    }
    minEdge[0] = 0
    total := 0

    for iter := 0; iter < n; iter++ {
        u := -1
        for v := 0; v < n; v++ {
            if !inTree[v] && (u == -1 || minEdge[v] < minEdge[u]) {
                u = v
            }
        }
        inTree[u] = true
        total += minEdge[u]

        for v := 0; v < n; v++ {
            if inTree[v] {
                continue
            }
            d := abs(points[u][0]-points[v][0]) + abs(points[u][1]-points[v][1])
            minEdge[v] = min(minEdge[v], d)
        }
    }
    return total
}`,
      },
      {
        name: "Prim (heap)",
        filename: "prim_heap.go",
        note: "For sparse graphs: lazy deletion by skipping nodes already in the tree.",
        code: `func primHeap(n int, adj [][]Edge) int {
    inTree := make([]bool, n)
    pq := &PQ{{Node: 0, Dist: 0}}
    heap.Init(pq)
    total, taken := 0, 0

    for pq.Len() > 0 && taken < n {
        it := heap.Pop(pq).(Item)
        if inTree[it.Node] {
            continue // stale entry
        }
        inTree[it.Node] = true
        total += it.Dist
        taken++

        for _, e := range adj[it.Node] {
            if !inTree[e.To] {
                heap.Push(pq, Item{Node: e.To, Dist: e.Weight})
            }
        }
    }
    return total
}`,
      },
    ],
    complexity: [
      { label: "Kruskal", value: "O(E log E)", note: "dominated by the sort" },
      { label: "Prim (heap)", value: "O(E log V)" },
      { label: "Prim (dense)", value: "O(V²)", note: "better when E ≈ V²" },
      { label: "Space", value: "O(V + E)" },
    ],
    why: "The cut property: for any partition of the vertices, the minimum-weight edge crossing it belongs to some MST. Kruskal applies it globally by weight order; Prim applies it to the cut between the growing tree and everything else.",
    variations: [
      { name: "Maximum spanning tree", detail: "Sort descending — everything else is identical." },
      { name: "Bottleneck path", detail: "The MST path between two nodes minimises the maximum edge, which is why MSTs solve minimum-effort problems." },
      { name: "Critical and pseudo-critical edges", detail: "Compare the MST weight with each edge forced in and forced out." },
      { name: "Second-best MST", detail: "Replace one tree edge with the best non-tree alternative across its cut." },
    ],
    mistakes: [
      { title: "Not checking connectivity", detail: "If fewer than V-1 edges are taken, the graph was disconnected — the answer is impossible, not the partial sum." },
      { title: "Building all edges on a huge complete graph", detail: "n = 1000 means half a million edges; dense Prim avoids materialising them." },
      { title: "Using MST for shortest paths", detail: "The MST path between two nodes is not generally the shortest path." },
    ],
    related: ["union-find", "dijkstra", "greedy-sorting", "heap"],
    problems: [1584, 1135, 1489, 1631],
  },
  {
    slug: "bipartite-graph",
    title: "Bipartite Graph",
    category: "graphs",
    description: "Two-colour the graph — possible exactly when there is no odd cycle.",
    concepts: ["Two colours", "Odd cycle", "Conflict"],
    usedFor: ["splitting into two groups", "conflict graphs", "matching preconditions"],
    signals: ["two groups", "dislikes", "opposite sides", "bipartite", "can be split", "no two adjacent"],
    recognition: [
      "items must be split into two mutually exclusive sets",
      "edges represent conflict — endpoints must differ",
      "the question asks whether such a split is possible at all",
    ],
    typicalQuestion: "Can these people be split into two groups so that nobody dislikes someone in their group?",
    mentalModel: {
      lines: [
        "Colour a start node, then colour every neighbour the opposite colour.",
        "A conflict — an edge joining two same-coloured nodes — means an odd cycle.",
        "Run it from every unvisited node: the graph may be disconnected.",
      ],
      diagram: `  ●───○───●       ok (alternating)

  ●───○
  │   │
  └─●─┘           odd cycle → not bipartite`,
      key: "Bipartite ⟺ no odd cycle. Two-colouring is the constructive proof.",
    },
    templates: [
      {
        name: "BFS two-colour",
        filename: "bipartite_bfs.go",
        note: "colour: 0 unvisited, 1 and -1 the two sides.",
        code: `func isBipartite(graph [][]int) bool {
    colour := make([]int, len(graph))

    for start := range graph {
        if colour[start] != 0 {
            continue
        }
        colour[start] = 1
        queue := []int{start}

        for len(queue) > 0 {
            u := queue[0]
            queue = queue[1:]
            for _, v := range graph[u] {
                if colour[v] == colour[u] {
                    return false // same side: odd cycle
                }
                if colour[v] == 0 {
                    colour[v] = -colour[u]
                    queue = append(queue, v)
                }
            }
        }
    }
    return true
}`,
      },
      {
        name: "DSU variant",
        filename: "bipartite_dsu.go",
        note: "Union each node's neighbours together; if a node shares a set with its neighbour, it fails.",
        code: `func possibleBipartition(n int, dislikes [][]int) bool {
    adj := make([][]int, n+1)
    for _, d := range dislikes {
        adj[d[0]] = append(adj[d[0]], d[1])
        adj[d[1]] = append(adj[d[1]], d[0])
    }

    dsu := NewDSU(n + 1)
    for u := 1; u <= n; u++ {
        for _, v := range adj[u] {
            if dsu.Connected(u, v) {
                return false
            }
            dsu.Union(adj[u][0], v) // all of u's enemies share a side
        }
    }
    return true
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(V + E)" },
      { label: "Space", value: "O(V)" },
    ],
    variations: [
      { name: "DFS colouring", detail: "Identical logic with recursion instead of a queue." },
      { name: "Bipartite matching", detail: "Once you know the graph is bipartite, Hopcroft–Karp or Hungarian algorithms find maximum matchings." },
      { name: "Odd cycle extraction", detail: "Keep parents to reconstruct the conflicting cycle." },
    ],
    mistakes: [
      { title: "Only starting from node 0", detail: "Disconnected components each need their own start." },
      { title: "Treating 0 as a colour", detail: "Use 0 for 'unvisited' and ±1 for the two sides, or a separate visited array." },
      { title: "Checking the colour after enqueueing", detail: "Compare before assigning, or conflicts slip through." },
    ],
    related: ["graph-bfs", "union-find", "cycle-detection", "graph-dfs"],
    problems: [785, 886],
  },
  {
    slug: "shortest-path",
    title: "Shortest Path",
    category: "graphs",
    description: "Pick the algorithm from the weights: BFS, Dijkstra, Bellman-Ford or Floyd-Warshall.",
    concepts: ["Relaxation", "Negative weights", "All pairs"],
    usedFor: ["minimum cost routes", "constrained paths", "all-pairs distances", "negative cycles"],
    signals: ["shortest", "minimum cost", "cheapest", "fastest", "at most k stops", "any pair"],
    recognition: [
      "unweighted or all-equal weights → BFS",
      "non-negative weights → Dijkstra",
      "negative weights, or a hop limit → Bellman-Ford",
      "all pairs and n is small (≤ 400) → Floyd-Warshall",
    ],
    typicalQuestion: "What is the cheapest route from src to dst with at most k stops?",
    mentalModel: {
      lines: [
        "Every shortest-path algorithm is relaxation: if dist[u] + w < dist[v], improve dist[v].",
        "They differ only in the order relaxations happen.",
        "Dijkstra needs non-negative weights so that a settled node is final.",
      ],
      diagram: `  weights all equal    → BFS          O(V+E)
  weights >= 0         → Dijkstra     O(E log V)
  negative / k hops    → Bellman-Ford O(V·E)
  all pairs, n <= 400  → Floyd        O(V³)`,
      key: "Read the weights before choosing. That decision is the whole problem.",
    },
    templates: [
      {
        name: "Bellman-Ford",
        filename: "bellman_ford.go",
        note: "V-1 rounds. A further improvement on round V means a negative cycle.",
        code: `func bellmanFord(n int, edges [][]int, src int) ([]int, bool) {
    dist := make([]int, n)
    for i := range dist {
        dist[i] = math.MaxInt
    }
    dist[src] = 0

    for round := 0; round < n-1; round++ {
        changed := false
        for _, e := range edges {
            u, v, w := e[0], e[1], e[2]
            if dist[u] != math.MaxInt && dist[u]+w < dist[v] {
                dist[v] = dist[u] + w
                changed = true
            }
        }
        if !changed {
            break
        }
    }

    for _, e := range edges { // one more round detects negative cycles
        if dist[e[0]] != math.MaxInt && dist[e[0]]+e[2] < dist[e[1]] {
            return dist, false
        }
    }
    return dist, true
}`,
      },
      {
        name: "Bounded hops",
        filename: "k_stops.go",
        note: "Relax from a SNAPSHOT of the previous round, or one edge leaks two hops.",
        code: `func findCheapestPrice(n int, flights [][]int, src, dst, k int) int {
    dist := make([]int, n)
    for i := range dist {
        dist[i] = math.MaxInt
    }
    dist[src] = 0

    for round := 0; round <= k; round++ {
        prev := append([]int(nil), dist...) // snapshot
        for _, f := range flights {
            u, v, w := f[0], f[1], f[2]
            if prev[u] != math.MaxInt && prev[u]+w < dist[v] {
                dist[v] = prev[u] + w
            }
        }
    }

    if dist[dst] == math.MaxInt {
        return -1
    }
    return dist[dst]
}`,
      },
      {
        name: "Floyd-Warshall",
        filename: "floyd.go",
        note: "k must be the OUTERMOST loop — it is the set of allowed intermediates.",
        code: `func floydWarshall(dist [][]int) {
    n := len(dist)
    for k := 0; k < n; k++ { // intermediate node
        for i := 0; i < n; i++ {
            for j := 0; j < n; j++ {
                if dist[i][k] != math.MaxInt && dist[k][j] != math.MaxInt {
                    dist[i][j] = min(dist[i][j], dist[i][k]+dist[k][j])
                }
            }
        }
    }
}`,
      },
    ],
    complexity: [
      { label: "BFS", value: "O(V + E)", note: "unweighted only" },
      { label: "Dijkstra", value: "O(E log V)", note: "non-negative weights" },
      { label: "Bellman-Ford", value: "O(V · E)", note: "handles negatives" },
      { label: "Floyd-Warshall", value: "O(V³)", note: "all pairs" },
    ],
    variations: [
      { name: "SPFA", detail: "Queue-based Bellman-Ford; fast in practice, still O(VE) in the worst case." },
      { name: "A*", detail: "Dijkstra with an admissible heuristic added to the priority." },
      { name: "Johnson's algorithm", detail: "Reweight with Bellman-Ford, then run Dijkstra from each node." },
      { name: "Layered state", detail: "A hop or fuel limit becomes an extra dimension: dist[node][hops]." },
    ],
    mistakes: [
      { title: "Using Dijkstra with negative weights", detail: "A settled node may later be improved — the core invariant fails." },
      { title: "Relaxing in place with a hop limit", detail: "Without the snapshot, one round can traverse several edges." },
      { title: "Wrong loop order in Floyd-Warshall", detail: "k must be outermost; any other order silently computes the wrong answer." },
      { title: "Overflow with MaxInt sentinels", detail: "Guard with a check before adding a weight to a sentinel." },
    ],
    related: ["dijkstra", "graph-bfs", "multi-source-bfs", "linear-dp"],
    problems: [787, 743, 1091, 127, 1514, 1631],
  },
  {
    slug: "dijkstra",
    title: "Dijkstra",
    category: "graphs",
    description: "Greedy shortest paths on non-negative weights — settle the closest unvisited node, repeat.",
    concepts: ["Priority queue", "Settled", "Relaxation"],
    usedFor: ["weighted shortest paths", "minimum effort or cost", "bottleneck paths", "maximum probability"],
    signals: ["weighted graph", "minimum cost path", "shortest time", "non-negative", "network delay", "minimum effort"],
    recognition: [
      "edges have different non-negative costs",
      "you need the cheapest route, not the fewest hops",
      "the objective can be made monotone along a path (sum, max, product of probabilities)",
    ],
    typicalQuestion: "How long until every node receives the signal?",
    mentalModel: {
      lines: [
        "Keep a frontier in a min-heap keyed by tentative distance.",
        "Pop the closest node — because weights are non-negative, that distance is final.",
        "Relax its edges and push improvements.",
      ],
      diagram: `  heap: (0,s) (4,a) (7,b)

  pop (0,s) → settle s, relax edges
  pop (4,a) → settle a  ← cannot improve later
                          because all weights >= 0`,
      key: "Skip stale heap entries with an if d > dist[u] guard instead of trying to decrease keys.",
    },
    templates: [
      {
        name: "Dijkstra",
        filename: "dijkstra.go",
        note: "Lazy deletion: push duplicates and skip outdated pops.",
        code: `func dijkstra(n int, adj [][]Edge, src int) []int {
    dist := make([]int, n)
    for i := range dist {
        dist[i] = math.MaxInt
    }
    dist[src] = 0

    pq := &PQ{{Node: src, Dist: 0}}
    heap.Init(pq)

    for pq.Len() > 0 {
        it := heap.Pop(pq).(Item)
        if it.Dist > dist[it.Node] {
            continue // stale entry
        }
        for _, e := range adj[it.Node] {
            if nd := it.Dist + e.Weight; nd < dist[e.To] {
                dist[e.To] = nd
                heap.Push(pq, Item{Node: e.To, Dist: nd})
            }
        }
    }
    return dist
}`,
      },
      {
        name: "Minimise the maximum",
        filename: "min_effort.go",
        note: "Swap sum for max in the relaxation and Dijkstra solves bottleneck paths.",
        code: `func minimumEffortPath(h [][]int) int {
    rows, cols := len(h), len(h[0])
    effort := make([][]int, rows)
    for i := range effort {
        effort[i] = make([]int, cols)
        for j := range effort[i] {
            effort[i][j] = math.MaxInt
        }
    }
    effort[0][0] = 0

    pq := &CellPQ{{0, 0, 0}}
    heap.Init(pq)

    for pq.Len() > 0 {
        c := heap.Pop(pq).(Cell)
        if c.Cost > effort[c.R][c.C] {
            continue
        }
        if c.R == rows-1 && c.C == cols-1 {
            return c.Cost
        }
        for _, d := range dirs {
            nr, nc := c.R+d[0], c.C+d[1]
            if nr < 0 || nr >= rows || nc < 0 || nc >= cols {
                continue
            }
            // path cost is the largest step, not the sum
            step := max(c.Cost, abs(h[nr][nc]-h[c.R][c.C]))
            if step < effort[nr][nc] {
                effort[nr][nc] = step
                heap.Push(pq, Cell{nr, nc, step})
            }
        }
    }
    return 0
}`,
      },
      {
        name: "With a state dimension",
        filename: "dijkstra_state.go",
        note: "When a constraint like remaining stops matters, make it part of the node.",
        code: `// dist[node][usedStops]
func dijkstraLayered(n, maxStops int, adj [][]Edge, src, dst int) int {
    dist := make([][]int, n)
    for i := range dist {
        dist[i] = make([]int, maxStops+2)
        for j := range dist[i] {
            dist[i][j] = math.MaxInt
        }
    }
    dist[src][0] = 0

    pq := &LayerPQ{{src, 0, 0}}
    heap.Init(pq)

    for pq.Len() > 0 {
        s := heap.Pop(pq).(Layer)
        if s.Node == dst {
            return s.Cost
        }
        if s.Stops > maxStops || s.Cost > dist[s.Node][s.Stops] {
            continue
        }
        for _, e := range adj[s.Node] {
            if nc := s.Cost + e.Weight; nc < dist[e.To][s.Stops+1] {
                dist[e.To][s.Stops+1] = nc
                heap.Push(pq, Layer{e.To, s.Stops + 1, nc})
            }
        }
    }
    return -1
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(E log V)", note: "binary heap" },
      { label: "With a Fibonacci heap", value: "O(E + V log V)", note: "theoretical; not worth implementing" },
      { label: "Space", value: "O(V + E)" },
    ],
    why: "When every weight is non-negative, the smallest tentative distance in the frontier cannot be improved by any longer route — extending any path only adds cost. That makes popping the minimum a safe, permanent decision, which is exactly the greedy-choice property.",
    variations: [
      { name: "Bottleneck (minimax) paths", detail: "Relax with max instead of sum." },
      { name: "Maximum probability", detail: "Multiply probabilities and use a max-heap." },
      { name: "Counting shortest paths", detail: "Carry a count; reset on a strict improvement, add on a tie." },
      { name: "0-1 weights", detail: "Use a deque instead of a heap for O(V+E)." },
    ],
    mistakes: [
      { title: "Running it with negative weights", detail: "Silently wrong. Use Bellman-Ford." },
      { title: "Not skipping stale entries", detail: "Without the guard you re-expand nodes and lose the complexity bound." },
      { title: "Marking visited on push", detail: "A node must be settled on pop, when its distance is final." },
      { title: "Using it for a hop-limited path", detail: "The hop count must become part of the state, or Dijkstra prunes a valid answer." },
    ],
    related: ["shortest-path", "heap", "graph-bfs", "parametric-search"],
    problems: [743, 787, 1631, 778, 1514, 1976],
  },
  {
    slug: "multi-source-bfs",
    title: "Multi-source BFS",
    category: "graphs",
    description: "Seed the queue with every source at once — one pass gives the distance to the nearest.",
    concepts: ["Virtual source", "Simultaneous", "Nearest"],
    usedFor: ["distance to the nearest special cell", "simultaneous spreading", "border-anchored searches"],
    signals: ["nearest", "distance to the closest", "all at once", "rotting", "spread simultaneously", "from any"],
    recognition: [
      "several starting points spread at the same time",
      "each cell's answer is the distance to the closest source",
      "running one BFS per source would be O(sources × V)",
    ],
    typicalQuestion: "How many minutes until every orange is rotten?",
    mentalModel: {
      lines: [
        "Imagine a virtual node connected to every source with a zero-cost edge.",
        "One BFS from that node gives every cell the distance to its nearest source.",
        "In code: push all sources before the loop starts.",
      ],
      diagram: `  sources ●   ●        ●

  level 0 ●   ●        ●
  level 1 ●●● ●●●    ●●●
  level 2 ...

  one queue, one pass`,
      key: "Push every source first, then run an ordinary BFS.",
    },
    templates: [
      {
        name: "Multi-source",
        filename: "multi_source.go",
        note: "The only difference from a normal BFS is the seeding loop.",
        code: `func nearestDistance(grid [][]int) [][]int {
    rows, cols := len(grid), len(grid[0])
    dist := make([][]int, rows)
    queue := [][2]int{}

    for r := range dist {
        dist[r] = make([]int, cols)
        for c := range dist[r] {
            if grid[r][c] == 1 { // a source
                dist[r][c] = 0
                queue = append(queue, [2]int{r, c})
            } else {
                dist[r][c] = -1
            }
        }
    }

    for len(queue) > 0 {
        cur := queue[0]
        queue = queue[1:]
        r, c := cur[0], cur[1]

        for _, d := range dirs {
            nr, nc := r+d[0], c+d[1]
            if nr < 0 || nr >= rows || nc < 0 || nc >= cols || dist[nr][nc] != -1 {
                continue
            }
            dist[nr][nc] = dist[r][c] + 1
            queue = append(queue, [2]int{nr, nc})
        }
    }
    return dist
}`,
      },
      {
        name: "Rounds until done",
        filename: "rotting_oranges.go",
        note: "Count levels, then verify nothing was left unreachable.",
        code: `func orangesRotting(grid [][]int) int {
    queue := [][2]int{}
    fresh := 0

    for r := range grid {
        for c := range grid[r] {
            switch grid[r][c] {
            case 2:
                queue = append(queue, [2]int{r, c})
            case 1:
                fresh++
            }
        }
    }
    if fresh == 0 {
        return 0
    }

    minutes := 0
    for len(queue) > 0 && fresh > 0 {
        size := len(queue)
        for i := 0; i < size; i++ {
            cur := queue[0]
            queue = queue[1:]
            for _, d := range dirs {
                nr, nc := cur[0]+d[0], cur[1]+d[1]
                if nr < 0 || nr >= len(grid) || nc < 0 || nc >= len(grid[0]) {
                    continue
                }
                if grid[nr][nc] != 1 {
                    continue
                }
                grid[nr][nc] = 2
                fresh--
                queue = append(queue, [2]int{nr, nc})
            }
        }
        minutes++
    }

    if fresh > 0 {
        return -1 // unreachable cells remain
    }
    return minutes
}`,
      },
      {
        name: "Reverse the search",
        filename: "reverse_bfs.go",
        note: "Search from the destinations instead of the sources — Pacific Atlantic, surrounded regions.",
        code: `// which cells can reach the border? search inward FROM the border
func reachableFromBorder(heights [][]int) [][]bool {
    rows, cols := len(heights), len(heights[0])
    ok := make([][]bool, rows)
    for i := range ok {
        ok[i] = make([]bool, cols)
    }

    queue := [][2]int{}
    for r := 0; r < rows; r++ {
        ok[r][0] = true
        queue = append(queue, [2]int{r, 0})
    }
    for c := 0; c < cols; c++ {
        ok[0][c] = true
        queue = append(queue, [2]int{0, c})
    }

    for len(queue) > 0 {
        cur := queue[0]
        queue = queue[1:]
        r, c := cur[0], cur[1]
        for _, d := range dirs {
            nr, nc := r+d[0], c+d[1]
            if nr < 0 || nr >= rows || nc < 0 || nc >= cols || ok[nr][nc] {
                continue
            }
            if heights[nr][nc] >= heights[r][c] { // flows downhill to here
                ok[nr][nc] = true
                queue = append(queue, [2]int{nr, nc})
            }
        }
    }
    return ok
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(V + E)", note: "same as a single-source BFS" },
      { label: "Grid", value: "O(rows · cols)" },
      { label: "Space", value: "O(V)" },
    ],
    why: "Adding a virtual super-source with zero-weight edges to every real source turns k searches into one. BFS from that node visits each real source at level 0, so every other node's level is its distance to the nearest source.",
    variations: [
      { name: "Multi-source Dijkstra", detail: "Same idea with weights: push every source into the heap at distance 0." },
      { name: "Reverse search", detail: "When many starts share one target, search backwards from the target instead." },
      { name: "Meeting in the middle", detail: "Two multi-source searches from opposite sets, combined per cell." },
    ],
    mistakes: [
      { title: "Running one BFS per source", detail: "Correct but k times slower; interviewers look for the multi-source insight." },
      { title: "Forgetting unreachable cells", detail: "Anything still at -1 was never reached — usually the failure case." },
      { title: "Counting an extra level", detail: "Guard the loop with fresh > 0, or you count one round too many." },
    ],
    related: ["graph-bfs", "bfs-queue", "dijkstra", "connected-components"],
    problems: [994, 542, 417, 130, 1091],
  },
];
