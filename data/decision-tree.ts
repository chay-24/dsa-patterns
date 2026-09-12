import type { DecisionNode } from "./types";

/**
 * A yes/no walk from "I don't know how to start" to a named pattern.
 * Every leaf carries a pattern slug; alternates are worth a second look.
 */
export const decisionTree: DecisionNode[] = [
  // ── root ─────────────────────────────────────────────────────────────────
  {
    id: "start",
    question: "Is the input a sequence — an array, a string, or a list?",
    hint: "Anything you can index, or walk from one end to the other.",
    yes: "contiguous",
    no: "structured",
  },

  // ── sequences ────────────────────────────────────────────────────────────
  {
    id: "contiguous",
    question: "Must the answer be a contiguous run — a subarray or substring?",
    hint: "'Subarray' and 'substring' both mean contiguous. 'Subsequence' does not.",
    yes: "monotone-window",
    no: "is-sorted",
  },
  {
    id: "monotone-window",
    question:
      "Once a window breaks the constraint, does every larger window containing it also break it?",
    hint: "True for 'at most K distinct' and for sums of non-negative numbers. False once negatives appear.",
    yes: "fixed-length",
    no: "exact-target",
  },
  {
    id: "fixed-length",
    question: "Is the window length fixed and given in the statement?",
    hint: "'of size k' versus 'longest' or 'shortest'.",
    yes: "leaf-fixed-window",
    no: "leaf-variable-window",
  },
  {
    id: "leaf-fixed-window",
    pattern: "fixed-sliding-window",
    alternates: ["deque", "rolling-hash"],
  },
  {
    id: "leaf-variable-window",
    pattern: "variable-sliding-window",
    alternates: ["two-pointers", "subarray-substring"],
  },
  {
    id: "exact-target",
    question: "Is an exact sum or count required, with negative values in play?",
    hint: "Negatives kill the window. Prefix sums do not care about signs.",
    yes: "leaf-prefix-map",
    no: "max-sum",
  },
  {
    id: "leaf-prefix-map",
    pattern: "prefix-sum-hash-map",
    alternates: ["prefix-sum", "modular-arithmetic"],
  },
  {
    id: "max-sum",
    question: "Are you maximising a sum or product with no length restriction?",
    hint: "That is Kadane, not a window.",
    yes: "leaf-kadane",
    no: "leaf-subarray",
  },
  { id: "leaf-kadane", pattern: "linear-dp", alternates: ["subarray-substring", "divide-and-conquer"] },
  { id: "leaf-subarray", pattern: "subarray-substring", alternates: ["monotonic-stack", "prefix-sum"] },

  {
    id: "is-sorted",
    question: "Is the input sorted — or would sorting it cost you nothing?",
    hint: "Sorting is free whenever the output order is irrelevant.",
    yes: "lookup-or-pair",
    no: "check-candidate",
  },
  {
    id: "lookup-or-pair",
    question: "Are you looking up a value, a boundary, or an insertion point?",
    hint: "'First index at least x' and 'how many are below x' are both binary search.",
    yes: "leaf-binary-search",
    no: "pair-or-greedy",
  },
  {
    id: "leaf-binary-search",
    pattern: "classic-binary-search",
    alternates: ["lower-bound", "upper-bound", "rotated-array-search"],
  },
  {
    id: "pair-or-greedy",
    question: "Are you looking for a pair or triplet with a target relationship?",
    hint: "Sorted plus pairs is almost always converging two pointers.",
    yes: "leaf-two-pointers",
    no: "leaf-greedy-sort",
  },
  { id: "leaf-two-pointers", pattern: "two-pointers", alternates: ["sorting", "hash-map"] },
  {
    id: "leaf-greedy-sort",
    pattern: "greedy-sorting",
    alternates: ["interval-scheduling", "greedy-heap"],
  },

  {
    id: "check-candidate",
    question:
      "Can you cheaply test a candidate answer, where a bigger candidate is never harder to satisfy?",
    hint: "'Minimise the maximum' and 'maximise the minimum' are the giveaway phrasings.",
    yes: "leaf-search-answer",
    no: "nearest-element",
  },
  {
    id: "leaf-search-answer",
    pattern: "binary-search-on-answer",
    alternates: ["parametric-search", "greedy-sorting"],
  },
  {
    id: "nearest-element",
    question:
      "For each element, do you need the nearest larger or smaller element on one side?",
    hint: "Next greater, previous smaller, spans, histograms, and daily temperatures.",
    yes: "leaf-monotonic",
    no: "seen-before",
  },
  {
    id: "leaf-monotonic",
    pattern: "monotonic-stack",
    alternates: ["next-greater-element", "largest-rectangle", "deque"],
  },
  {
    id: "seen-before",
    question: "Is the inner loop only asking 'have I seen this?' or 'how many times?'",
    hint: "If so, a map removes the loop entirely.",
    yes: "leaf-hash-map",
    no: "sequential-choice",
  },
  { id: "leaf-hash-map", pattern: "hash-map", alternates: ["prefix-sum-hash-map", "trie"] },
  {
    id: "sequential-choice",
    question:
      "Does each position involve a choice whose best outcome depends on earlier choices?",
    hint: "If a greedy pick can block a better future, it is DP.",
    yes: "leaf-linear-dp",
    no: "leaf-sorting",
  },
  { id: "leaf-linear-dp", pattern: "linear-dp", alternates: ["state-machine-dp", "string-dp"] },
  { id: "leaf-sorting", pattern: "sorting", alternates: ["arrays", "strings"] },

  // ── graphs and trees ─────────────────────────────────────────────────────
  {
    id: "structured",
    question: "Are there entities with connections — a graph, a grid, or a tree?",
    hint: "A grid is a graph with four implicit edges per cell.",
    yes: "is-tree",
    no: "enumerate",
  },
  {
    id: "is-tree",
    question: "Is it a tree — connected, acyclic, one parent per node?",
    hint: "A binary tree, or an n-node graph with n-1 edges.",
    yes: "depth-matters",
    no: "weighted-edges",
  },
  {
    id: "depth-matters",
    question: "Does the answer depend on depth or levels?",
    hint: "Level order, right side view, minimum depth, widest row.",
    yes: "leaf-tree-bfs",
    no: "children-combine",
  },
  { id: "leaf-tree-bfs", pattern: "tree-bfs", alternates: ["bfs-queue", "tree-traversal"] },
  {
    id: "children-combine",
    question:
      "Does each node's answer combine its children's answers under a constraint?",
    hint: "'Cannot pick two adjacent nodes' and 'cover every node' are tree DP.",
    yes: "leaf-tree-dp",
    no: "leaf-tree-dfs",
  },
  { id: "leaf-tree-dp", pattern: "tree-dp", alternates: ["tree-diameter", "tree-dfs"] },
  {
    id: "leaf-tree-dfs",
    pattern: "tree-dfs",
    alternates: ["tree-traversal", "binary-search-tree", "lowest-common-ancestor"],
  },

  {
    id: "weighted-edges",
    question: "Do the edges carry different costs?",
    hint: "Equal costs mean BFS is already optimal.",
    yes: "non-negative",
    no: "ordering",
  },
  {
    id: "non-negative",
    question: "Are all the weights non-negative, with no hop limit?",
    hint: "Negative weights, or a 'at most k stops' constraint, break Dijkstra.",
    yes: "leaf-dijkstra",
    no: "leaf-bellman",
  },
  { id: "leaf-dijkstra", pattern: "dijkstra", alternates: ["heap", "shortest-path"] },
  {
    id: "leaf-bellman",
    pattern: "shortest-path",
    alternates: ["dijkstra", "linear-dp"],
  },
  {
    id: "ordering",
    question: "Do dependencies impose an order — X must come before Y?",
    hint: "Prerequisites, build order, task scheduling.",
    yes: "leaf-topo",
    no: "incremental",
  },
  { id: "leaf-topo", pattern: "topological-sort", alternates: ["cycle-detection", "graph-dfs"] },
  {
    id: "incremental",
    question: "Do connections arrive one at a time, or do you only need to count groups?",
    hint: "Dynamic connectivity, merging accounts, redundant edges.",
    yes: "leaf-dsu",
    no: "fewest-steps",
  },
  {
    id: "leaf-dsu",
    pattern: "union-find",
    alternates: ["connected-components", "minimum-spanning-tree"],
  },
  {
    id: "fewest-steps",
    question: "Do you need the fewest steps between two states?",
    hint: "Unweighted shortest path — and many sources means seed them all at once.",
    yes: "leaf-graph-bfs",
    no: "leaf-components",
  },
  {
    id: "leaf-graph-bfs",
    pattern: "graph-bfs",
    alternates: ["multi-source-bfs", "bfs-queue"],
  },
  {
    id: "leaf-components",
    pattern: "connected-components",
    alternates: ["graph-dfs", "union-find", "cycle-detection"],
  },

  // ── enumeration and optimisation ─────────────────────────────────────────
  {
    id: "enumerate",
    question: "Must you enumerate or count arrangements, selections or assignments?",
    hint: "'All possible', 'how many ways', 'every combination'.",
    yes: "small-n",
    no: "budget",
  },
  {
    id: "small-n",
    question: "Is n small — around 20 or fewer?",
    hint: "2^20 is a million. 2^30 is a billion.",
    yes: "list-them",
    no: "count-only",
  },
  {
    id: "list-them",
    question: "Do you have to output every arrangement, not just a count or an optimum?",
    hint: "Returning [][]int means enumeration; returning an int usually means DP.",
    yes: "order-matters",
    no: "leaf-bitmask",
  },
  {
    id: "order-matters",
    question: "Does the order of elements within one answer matter?",
    hint: "[1,2] and [2,1] being different answers means permutations.",
    yes: "leaf-permutations",
    no: "leaf-subsets",
  },
  {
    id: "leaf-permutations",
    pattern: "permutations",
    alternates: ["constraint-search", "n-queens"],
  },
  { id: "leaf-subsets", pattern: "subsets", alternates: ["combinations", "constraint-search"] },
  { id: "leaf-bitmask", pattern: "bitmask-dp", alternates: ["subset-sum", "meet-in-the-middle"] },
  {
    id: "count-only",
    question: "Do you only need a count or an optimum rather than the full list?",
    hint: "Counting almost always collapses into a DP.",
    yes: "leaf-count-dp",
    no: "leaf-mitm",
  },
  { id: "leaf-count-dp", pattern: "linear-dp", alternates: ["grid-dp", "knapsack-01", "digit-dp"] },
  { id: "leaf-mitm", pattern: "meet-in-the-middle", alternates: ["bitmask-dp", "subset-sum"] },

  {
    id: "budget",
    question: "Are you optimising a total under a capacity, budget or weight limit?",
    hint: "Maximise value within a limit, or hit an exact total.",
    yes: "reuse-items",
    no: "safe-greedy",
  },
  {
    id: "reuse-items",
    question: "Can an item be used more than once?",
    hint: "Unlimited coins versus each item exactly once.",
    yes: "leaf-unbounded",
    no: "leaf-knapsack",
  },
  {
    id: "leaf-unbounded",
    pattern: "unbounded-knapsack",
    alternates: ["bounded-knapsack", "linear-dp"],
  },
  { id: "leaf-knapsack", pattern: "knapsack-01", alternates: ["subset-sum", "bitmask-dp"] },
  {
    id: "safe-greedy",
    question:
      "Can you argue that the locally best choice is always part of some optimal answer?",
    hint: "If you cannot find the exchange argument in two minutes, write the DP.",
    yes: "leaf-greedy",
    no: "leaf-dp-fallback",
  },
  {
    id: "leaf-greedy",
    pattern: "greedy-sorting",
    alternates: ["activity-selection", "greedy-heap", "local-global"],
  },
  {
    id: "leaf-dp-fallback",
    pattern: "linear-dp",
    alternates: ["interval-dp", "state-machine-dp", "string-dp"],
  },
];

export const nodeById = new Map(decisionTree.map((n) => [n.id, n]));
export const rootNode = "start";
