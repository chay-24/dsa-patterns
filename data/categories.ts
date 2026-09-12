import type { Category } from "./types";

export const categories: Category[] = [
  {
    slug: "foundations",
    number: "01",
    title: "Foundations",
    description: "The primitives every other pattern is built from.",
    concepts: ["Arrays", "Hashing", "Prefix Sum", "Sorting"],
  },
  {
    slug: "two-pointers",
    number: "02",
    title: "Two Pointers & Windows",
    description: "Move two indices through a sequence instead of nesting loops.",
    concepts: ["Converging", "Fast/Slow", "Fixed", "Variable"],
  },
  {
    slug: "binary-search",
    number: "03",
    title: "Binary Search",
    description: "Halve a monotonic search space until one candidate remains.",
    concepts: ["Bounds", "On answer", "Rotated", "Parametric"],
  },
  {
    slug: "stacks-queues",
    number: "04",
    title: "Stacks & Queues",
    description: "Order-preserving containers — and the monotonic tricks built on them.",
    concepts: ["LIFO", "FIFO", "Monotonic", "Heap"],
  },
  {
    slug: "trees",
    number: "05",
    title: "Trees",
    description: "Recursion over hierarchy, plus the indexed structures that sit on arrays.",
    concepts: ["Traversal", "BST", "Trie", "Segment Tree"],
  },
  {
    slug: "graphs",
    number: "06",
    title: "Graphs",
    description: "Nodes and edges: reachability, ordering, connectivity, distance.",
    concepts: ["BFS", "DFS", "Topo Sort", "DSU"],
  },
  {
    slug: "dynamic-programming",
    number: "07",
    title: "Dynamic Programming",
    description: "Define a state, write the transition, pick an order.",
    concepts: ["1D", "2D", "State machine", "Knapsack"],
  },
  {
    slug: "greedy",
    number: "08",
    title: "Greedy",
    description: "Commit to the locally best move — and be able to argue why it is safe.",
    concepts: ["Sorting", "Heap", "Intervals", "Exchange argument"],
  },
  {
    slug: "backtracking",
    number: "09",
    title: "Backtracking",
    description: "Enumerate a decision tree, pruning branches that cannot work.",
    concepts: ["Subsets", "Permutations", "Constraints", "Pruning"],
  },
  {
    slug: "advanced",
    number: "10",
    title: "Advanced",
    description: "Strings, geometry, randomisation and the maths that shows up late in a round.",
    concepts: ["KMP", "Hashing", "Geometry", "Divide & Conquer"],
  },
];

export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
