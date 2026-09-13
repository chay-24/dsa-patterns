export type ComplexityEntry = {
  name: string;
  rows: { op: string; value: string; note?: string }[];
};

export type ComplexityGroup = {
  slug: string;
  title: string;
  blurb: string;
  entries: ComplexityEntry[];
};

export const growthScale = [
  { label: "O(1)", n1e6: "1", verdict: "instant", tone: "good" },
  { label: "O(log n)", n1e6: "20", verdict: "instant", tone: "good" },
  { label: "O(√n)", n1e6: "1 000", verdict: "instant", tone: "good" },
  { label: "O(n)", n1e6: "10⁶", verdict: "fine", tone: "good" },
  { label: "O(n log n)", n1e6: "2 × 10⁷", verdict: "fine", tone: "good" },
  { label: "O(n √n)", n1e6: "10⁹", verdict: "borderline", tone: "warn" },
  { label: "O(n²)", n1e6: "10¹²", verdict: "too slow", tone: "bad" },
  { label: "O(n³)", n1e6: "10¹⁸", verdict: "hopeless", tone: "bad" },
  { label: "O(2ⁿ)", n1e6: "—", verdict: "n ≤ 22", tone: "bad" },
  { label: "O(n!)", n1e6: "—", verdict: "n ≤ 11", tone: "bad" },
] as const;

/** Rough guide: what complexity fits inside a typical 1-second limit. */
export const budgetTable = [
  { n: "n ≤ 10", target: "O(n!)", hint: "full permutations" },
  { n: "n ≤ 22", target: "O(2ⁿ · n)", hint: "bitmask DP, subset enumeration" },
  { n: "n ≤ 45", target: "O(2^(n/2))", hint: "meet in the middle" },
  { n: "n ≤ 500", target: "O(n³)", hint: "Floyd-Warshall, interval DP" },
  { n: "n ≤ 5 000", target: "O(n²)", hint: "two-string DP, all pairs" },
  { n: "n ≤ 10⁵", target: "O(n log n)", hint: "sort, heap, segment tree" },
  { n: "n ≤ 10⁷", target: "O(n)", hint: "single pass, counting" },
  { n: "n ≤ 10¹⁸", target: "O(log n)", hint: "binary search, fast power, matrix power" },
];

export const complexityGroups: ComplexityGroup[] = [
  {
    slug: "structures",
    title: "Data Structures",
    blurb: "Average case unless noted. Worst case matters for hash tables and unbalanced trees.",
    entries: [
      {
        name: "Slice / dynamic array",
        rows: [
          { op: "Index", value: "O(1)" },
          { op: "Append", value: "O(1)", note: "on average" },
          { op: "Insert / delete middle", value: "O(n)" },
          { op: "Search (unsorted)", value: "O(n)" },
          { op: "Space", value: "O(n)" },
        ],
      },
      {
        name: "Hash map",
        rows: [
          { op: "Lookup", value: "O(1)", note: "O(n) worst case" },
          { op: "Insert", value: "O(1)", note: "on average" },
          { op: "Delete", value: "O(1)" },
          { op: "Iterate", value: "O(n)", note: "order randomised in Go" },
          { op: "Space", value: "O(n)" },
        ],
      },
      {
        name: "Binary search tree",
        rows: [
          { op: "Search", value: "O(h)", note: "h = log n balanced, n degenerate" },
          { op: "Insert", value: "O(h)" },
          { op: "Delete", value: "O(h)" },
          { op: "Inorder (sorted)", value: "O(n)" },
          { op: "Space", value: "O(n)" },
        ],
      },
      {
        name: "Binary heap",
        rows: [
          { op: "Peek", value: "O(1)" },
          { op: "Push", value: "O(log n)" },
          { op: "Pop", value: "O(log n)" },
          { op: "Build (heapify)", value: "O(n)", note: "not O(n log n)" },
          { op: "Space", value: "O(n)" },
        ],
      },
      {
        name: "Trie",
        rows: [
          { op: "Insert", value: "O(L)", note: "L = word length" },
          { op: "Search", value: "O(L)" },
          { op: "Prefix query", value: "O(L)" },
          { op: "Space", value: "O(Σ L × alphabet)" },
        ],
      },
      {
        name: "Union-Find",
        rows: [
          { op: "Find", value: "O(α(n))", note: "effectively a constant" },
          { op: "Union", value: "O(α(n))" },
          { op: "Space", value: "O(n)" },
        ],
      },
      {
        name: "Fenwick tree",
        rows: [
          { op: "Point update", value: "O(log n)" },
          { op: "Prefix query", value: "O(log n)" },
          { op: "Build", value: "O(n)" },
          { op: "Space", value: "O(n)" },
        ],
      },
      {
        name: "Segment tree",
        rows: [
          { op: "Build", value: "O(n)" },
          { op: "Range query", value: "O(log n)" },
          { op: "Point update", value: "O(log n)" },
          { op: "Range update (lazy)", value: "O(log n)" },
          { op: "Space", value: "O(n)", note: "4n allocated" },
        ],
      },
      {
        name: "Prefix sum array",
        rows: [
          { op: "Build", value: "O(n)" },
          { op: "Range query", value: "O(1)" },
          { op: "Update", value: "O(n)", note: "use a Fenwick tree instead" },
          { op: "Space", value: "O(n)" },
        ],
      },
    ],
  },
  {
    slug: "sorting",
    title: "Sorting & Selection",
    blurb: "Comparison sorts cannot beat n log n. Counting sorts can, when the key range is small.",
    entries: [
      {
        name: "Merge sort",
        rows: [
          { op: "Best / average / worst", value: "O(n log n)" },
          { op: "Space", value: "O(n)" },
          { op: "Stable", value: "yes" },
        ],
      },
      {
        name: "Quicksort",
        rows: [
          { op: "Average", value: "O(n log n)" },
          { op: "Worst", value: "O(n²)", note: "avoided by a random pivot" },
          { op: "Space", value: "O(log n)" },
          { op: "Stable", value: "no" },
        ],
      },
      {
        name: "Heapsort",
        rows: [
          { op: "All cases", value: "O(n log n)" },
          { op: "Space", value: "O(1)" },
          { op: "Stable", value: "no" },
        ],
      },
      {
        name: "Counting / radix sort",
        rows: [
          { op: "Counting sort", value: "O(n + k)", note: "k = value range" },
          { op: "Radix sort", value: "O(d(n + k))", note: "d = digits" },
          { op: "Space", value: "O(n + k)" },
        ],
      },
      {
        name: "Selection",
        rows: [
          { op: "Quickselect (kth)", value: "O(n)", note: "expected" },
          { op: "Heap of size k", value: "O(n log k)" },
          { op: "Full sort", value: "O(n log n)" },
        ],
      },
      {
        name: "Go standard library",
        rows: [
          { op: "sort.Slice", value: "O(n log n)", note: "pdqsort, unstable" },
          { op: "sort.SliceStable", value: "O(n log n)", note: "stable, extra allocation" },
          { op: "sort.Search", value: "O(log n)" },
        ],
      },
    ],
  },
  {
    slug: "graphs",
    title: "Graph Algorithms",
    blurb: "V = vertices, E = edges. Choose from the weights, not from habit.",
    entries: [
      {
        name: "Traversal",
        rows: [
          { op: "BFS", value: "O(V + E)" },
          { op: "DFS", value: "O(V + E)" },
          { op: "Connected components", value: "O(V + E)" },
          { op: "Space", value: "O(V)" },
        ],
      },
      {
        name: "Shortest path",
        rows: [
          { op: "BFS (unweighted)", value: "O(V + E)" },
          { op: "Dijkstra (heap)", value: "O(E log V)", note: "non-negative weights" },
          { op: "Bellman-Ford", value: "O(V · E)", note: "handles negatives" },
          { op: "Floyd-Warshall", value: "O(V³)", note: "all pairs" },
          { op: "0-1 BFS", value: "O(V + E)", note: "weights in {0, 1}" },
        ],
      },
      {
        name: "Ordering & structure",
        rows: [
          { op: "Topological sort", value: "O(V + E)" },
          { op: "Cycle detection", value: "O(V + E)" },
          { op: "Tarjan SCC", value: "O(V + E)" },
          { op: "Bridges / articulation", value: "O(V + E)" },
        ],
      },
      {
        name: "Spanning trees",
        rows: [
          { op: "Kruskal", value: "O(E log E)" },
          { op: "Prim (heap)", value: "O(E log V)" },
          { op: "Prim (dense)", value: "O(V²)", note: "better when E ≈ V²" },
        ],
      },
    ],
  },
  {
    slug: "patterns",
    title: "Pattern Costs",
    blurb: "What each technique buys you, and what it costs.",
    entries: [
      {
        name: "Two pointers & windows",
        rows: [
          { op: "Two pointers", value: "O(n)" },
          { op: "Sliding window", value: "O(n)" },
          { op: "3Sum", value: "O(n²)" },
          { op: "Space", value: "O(1)" },
        ],
      },
      {
        name: "Binary search",
        rows: [
          { op: "Classic", value: "O(log n)" },
          { op: "On answer", value: "O(n log R)", note: "R = answer range" },
          { op: "Exponential", value: "O(log p)", note: "p = answer index" },
          { op: "Space", value: "O(1)" },
        ],
      },
      {
        name: "Monotonic stack / deque",
        rows: [
          { op: "Full scan", value: "O(n)" },
          { op: "Per element", value: "O(1)", note: "on average" },
          { op: "Space", value: "O(n)" },
        ],
      },
      {
        name: "Dynamic programming",
        rows: [
          { op: "1D linear", value: "O(n)" },
          { op: "2D grid / two strings", value: "O(m · n)" },
          { op: "Interval DP", value: "O(n³)" },
          { op: "Knapsack", value: "O(n · W)", note: "grows with W itself" },
          { op: "Bitmask DP", value: "O(2ⁿ · n)" },
        ],
      },
      {
        name: "Backtracking",
        rows: [
          { op: "Subsets", value: "O(n · 2ⁿ)" },
          { op: "Permutations", value: "O(n · n!)" },
          { op: "N-Queens", value: "O(n!)", note: "far less with pruning" },
          { op: "Space", value: "O(depth)" },
        ],
      },
      {
        name: "Strings",
        rows: [
          { op: "KMP", value: "O(n + m)" },
          { op: "Z algorithm", value: "O(n + m)" },
          { op: "Rabin-Karp", value: "O(n + m)", note: "expected" },
          { op: "Manacher", value: "O(n)" },
          { op: "Expand around centres", value: "O(n²)" },
        ],
      },
    ],
  },
];
