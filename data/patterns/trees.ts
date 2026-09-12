import type { Pattern } from "../types";

export const trees: Pattern[] = [
  {
    slug: "tree-traversal",
    title: "Tree Traversal",
    category: "trees",
    description: "Three orders, one recursion — where you touch the node decides what the traversal computes.",
    concepts: ["Preorder", "Inorder", "Postorder"],
    usedFor: ["serialisation", "sorted output from a BST", "bottom-up aggregation", "structural copies"],
    signals: ["traverse", "print in order", "serialize", "copy the tree", "visit every node"],
    recognition: [
      "you need every node exactly once and the order matters",
      "inorder on a BST gives sorted values — that is often the whole trick",
      "preorder with nil markers uniquely encodes a tree",
      "results must combine children before the parent — that is postorder",
    ],
    typicalQuestion: "Return the inorder traversal of a binary tree.",
    mentalModel: {
      lines: [
        "One recursion, three positions to do work.",
        "Preorder: node, left, right — top-down, good for building and copying.",
        "Inorder: left, node, right — sorted order on a BST.",
        "Postorder: left, right, node — bottom-up, good for aggregating.",
      ],
      diagram: `        1
       / \\
      2   3

  pre   1 2 3    (act before descending)
  in    2 1 3    (act between children)
  post  2 3 1    (act after descending)`,
      key: "Ask: do I need information from my children before I decide? If yes, postorder.",
    },
    templates: [
      {
        name: "Recursive",
        filename: "traversals.go",
        note: "Move the visit line to switch orders — nothing else changes.",
        code: `type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

func inorder(root *TreeNode) []int {
    var out []int
    var walk func(*TreeNode)

    walk = func(n *TreeNode) {
        if n == nil {
            return
        }
        walk(n.Left)
        out = append(out, n.Val) // ← move this line to change the order
        walk(n.Right)
    }

    walk(root)
    return out
}`,
      },
      {
        name: "Serialise",
        filename: "serialize.go",
        note: "Preorder with explicit nil markers round-trips uniquely.",
        code: `func serialize(root *TreeNode) string {
    var sb strings.Builder
    var walk func(*TreeNode)

    walk = func(n *TreeNode) {
        if n == nil {
            sb.WriteString("#,")
            return
        }
        sb.WriteString(strconv.Itoa(n.Val) + ",")
        walk(n.Left)
        walk(n.Right)
    }

    walk(root)
    return sb.String()
}

func deserialize(data string) *TreeNode {
    tokens := strings.Split(data, ",")
    i := 0

    var build func() *TreeNode
    build = func() *TreeNode {
        tok := tokens[i]
        i++
        if tok == "#" {
            return nil
        }
        v, _ := strconv.Atoi(tok)
        n := &TreeNode{Val: v}
        n.Left = build()
        n.Right = build()
        return n
    }
    return build()
}`,
      },
      {
        name: "Morris traversal",
        filename: "morris.go",
        note: "O(1) space: thread each node to its inorder predecessor, then unthread.",
        code: `func morrisInorder(root *TreeNode) []int {
    var out []int
    cur := root

    for cur != nil {
        if cur.Left == nil {
            out = append(out, cur.Val)
            cur = cur.Right
            continue
        }

        pred := cur.Left
        for pred.Right != nil && pred.Right != cur {
            pred = pred.Right
        }

        if pred.Right == nil {
            pred.Right = cur // thread
            cur = cur.Left
        } else {
            pred.Right = nil // unthread: we are coming back
            out = append(out, cur.Val)
            cur = cur.Right
        }
    }
    return out
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n)" },
      { label: "Space", value: "O(h)", note: "recursion stack; h = n for a degenerate tree" },
      { label: "Morris", value: "O(1)", note: "space, at the cost of temporarily mutating the tree" },
    ],
    variations: [
      { name: "Level order", detail: "BFS with a queue rather than recursion." },
      { name: "Reverse preorder", detail: "node, right, left — reversed gives postorder, which simplifies the iterative version." },
      { name: "N-ary trees", detail: "Same shapes with a children slice instead of two pointers." },
    ],
    mistakes: [
      { title: "Missing the nil base case", detail: "Every recursive tree function starts with if n == nil." },
      { title: "Serialising without nil markers", detail: "Preorder alone does not determine the shape; you need the '#' placeholders." },
      { title: "Assuming inorder is sorted for any tree", detail: "That holds only for a valid BST." },
    ],
    related: ["iterative-traversal", "tree-dfs", "tree-bfs", "tree-construction"],
    problems: [94, 144, 145, 297, 102],
  },
  {
    slug: "tree-dfs",
    title: "Tree DFS",
    category: "trees",
    description: "Recurse down, return an answer up — the shape of almost every tree problem.",
    concepts: ["Top-down", "Bottom-up", "Return value"],
    usedFor: ["depths and heights", "path sums", "validation with bounds", "structural comparison"],
    signals: ["depth", "height", "path from root", "does a path exist", "check every subtree", "balanced"],
    recognition: [
      "the answer at a node is a function of the answers at its children",
      "you carry information down the tree (a bound, a running sum) and test at the leaves",
      "the tree must be validated against a rule at every node",
    ],
    typicalQuestion: "What is the maximum depth of this binary tree?",
    mentalModel: {
      lines: [
        "Decide two things: what flows DOWN as arguments, and what flows UP as the return.",
        "Top-down: pass the accumulated state and test at the leaf.",
        "Bottom-up: return the child answers and combine them here.",
        "When both are needed, return a struct or a tuple.",
      ],
      diagram: `        node
        ↓ args (bounds, running sum)
       / \\
      ↑   ↑  returns (height, sum, valid)
     combine here`,
      key: "Write down the return type first. Most tree bugs are a return type that carries too little.",
    },
    templates: [
      {
        name: "Bottom-up",
        filename: "depth.go",
        note: "Children return, parent combines. No shared mutable state.",
        code: `func maxDepth(root *TreeNode) int {
    if root == nil {
        return 0
    }
    return 1 + max(maxDepth(root.Left), maxDepth(root.Right))
}`,
      },
      {
        name: "Top-down with bounds",
        filename: "validate_bst.go",
        note: "Comparing a node only with its children is the classic wrong answer — carry the range.",
        code: `func isValidBST(root *TreeNode) bool {
    var check func(*TreeNode, int, int) bool

    check = func(n *TreeNode, low, high int) bool {
        if n == nil {
            return true
        }
        if n.Val <= low || n.Val >= high {
            return false
        }
        return check(n.Left, low, n.Val) && check(n.Right, n.Val, high)
    }

    return check(root, math.MinInt, math.MaxInt)
}`,
      },
      {
        name: "Two values up",
        filename: "balanced.go",
        note: "Return height and validity together so the whole check is one O(n) pass.",
        code: `func isBalanced(root *TreeNode) bool {
    var height func(*TreeNode) int // -1 means unbalanced

    height = func(n *TreeNode) int {
        if n == nil {
            return 0
        }
        l := height(n.Left)
        if l == -1 {
            return -1
        }
        r := height(n.Right)
        if r == -1 || abs(l-r) > 1 {
            return -1
        }
        return 1 + max(l, r)
    }

    return height(root) != -1
}`,
      },
      {
        name: "Path with backtracking",
        filename: "path_sum_ii.go",
        note: "Append before recursing, truncate after — and copy before storing.",
        code: `func pathSum(root *TreeNode, target int) [][]int {
    var out [][]int
    path := []int{}

    var dfs func(*TreeNode, int)
    dfs = func(n *TreeNode, remain int) {
        if n == nil {
            return
        }
        path = append(path, n.Val)
        remain -= n.Val

        if n.Left == nil && n.Right == nil && remain == 0 {
            out = append(out, append([]int(nil), path...)) // copy!
        }
        dfs(n.Left, remain)
        dfs(n.Right, remain)

        path = path[:len(path)-1] // backtrack
    }

    dfs(root, target)
    return out
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n)", note: "each node visited once" },
      { label: "Space", value: "O(h)", note: "h = log n balanced, n degenerate" },
    ],
    variations: [
      { name: "Return a struct", detail: "When a node needs several facts from its children — height, sum, count, validity." },
      { name: "Closure over a result", detail: "Record a global best inside the recursion while returning something narrower upward." },
      { name: "Early exit", detail: "Sentinel returns like -1 stop the recursion from doing pointless work." },
    ],
    mistakes: [
      { title: "Validating a BST with local comparisons", detail: "A node deep on the left can still violate an ancestor's bound." },
      { title: "Storing the path slice without copying", detail: "It is mutated afterwards, so every stored result ends up identical." },
      { title: "Treating a nil child as a leaf", detail: "In minimum-depth, a node with one nil child is not a leaf." },
      { title: "Forgetting to backtrack", detail: "The path slice must shrink on the way out." },
    ],
    related: ["tree-traversal", "tree-dp", "graph-dfs", "constraint-search"],
    problems: [104, 111, 110, 226, 100, 101, 572, 112, 113, 437, 199, 114],
  },
  {
    slug: "tree-bfs",
    title: "Tree BFS",
    category: "trees",
    description: "Level-order traversal — the answer depends on depth, not on structure.",
    concepts: ["Levels", "Queue", "Width"],
    usedFor: ["level aggregation", "minimum depth", "side views", "connecting siblings"],
    signals: ["level by level", "each row", "right side view", "minimum depth", "zigzag", "widest level"],
    recognition: [
      "the output is grouped by depth",
      "you need the first node at some depth — BFS finds it earliest",
      "the question is about rows, siblings or width",
    ],
    typicalQuestion: "Return the values of the nodes visible from the right side.",
    mentalModel: {
      lines: [
        "Push the root, then repeatedly process exactly one level.",
        "Snapshot len(queue) before the level loop — children appended during it belong to the next level.",
        "Depth is the number of levels processed.",
      ],
      diagram: `  queue: [ root ]          level 0
  queue: [ a  b ]          level 1
  queue: [ c  d  e ]       level 2

  size = len(queue) at the top of each round`,
      key: "The size snapshot is the entire technique.",
    },
    templates: [
      {
        name: "Level order",
        filename: "level_order.go",
        note: "The base shape every variant edits.",
        code: `func levelOrder(root *TreeNode) [][]int {
    if root == nil {
        return nil
    }
    var out [][]int
    queue := []*TreeNode{root}

    for len(queue) > 0 {
        size := len(queue)
        level := make([]int, 0, size)

        for i := 0; i < size; i++ {
            n := queue[0]
            queue = queue[1:]
            level = append(level, n.Val)

            if n.Left != nil {
                queue = append(queue, n.Left)
            }
            if n.Right != nil {
                queue = append(queue, n.Right)
            }
        }
        out = append(out, level)
    }
    return out
}`,
      },
      {
        name: "Right side view",
        filename: "right_view.go",
        note: "Only the last node of each level survives.",
        code: `func rightSideView(root *TreeNode) []int {
    if root == nil {
        return nil
    }
    var out []int
    queue := []*TreeNode{root}

    for len(queue) > 0 {
        size := len(queue)
        for i := 0; i < size; i++ {
            n := queue[0]
            queue = queue[1:]

            if i == size-1 {
                out = append(out, n.Val) // last of this level
            }
            if n.Left != nil {
                queue = append(queue, n.Left)
            }
            if n.Right != nil {
                queue = append(queue, n.Right)
            }
        }
    }
    return out
}`,
      },
      {
        name: "Zigzag",
        filename: "zigzag.go",
        note: "Reverse on write rather than traversing backwards.",
        code: `func zigzagLevelOrder(root *TreeNode) [][]int {
    if root == nil {
        return nil
    }
    var out [][]int
    queue := []*TreeNode{root}
    leftToRight := true

    for len(queue) > 0 {
        size := len(queue)
        level := make([]int, size)

        for i := 0; i < size; i++ {
            n := queue[0]
            queue = queue[1:]

            pos := i
            if !leftToRight {
                pos = size - 1 - i
            }
            level[pos] = n.Val

            if n.Left != nil {
                queue = append(queue, n.Left)
            }
            if n.Right != nil {
                queue = append(queue, n.Right)
            }
        }
        out = append(out, level)
        leftToRight = !leftToRight
    }
    return out
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n)" },
      { label: "Space", value: "O(w)", note: "w = maximum width, up to n/2 in a complete tree" },
    ],
    variations: [
      { name: "Minimum depth", detail: "BFS returns as soon as it meets the first leaf, which beats DFS on skewed trees." },
      { name: "Per-level aggregate", detail: "Max, average or sum instead of collecting values." },
      { name: "DFS with a depth index", detail: "Level grouping can also be done in DFS by indexing the result by depth." },
    ],
    mistakes: [
      { title: "Forgetting the size snapshot", detail: "Levels merge and every level-based answer breaks." },
      { title: "Enqueuing nil children", detail: "Guard the appends, or handle nil inside the loop — pick one." },
      { title: "Ignoring the empty tree", detail: "A nil root must return an empty result, not panic." },
    ],
    related: ["tree-traversal", "bfs-queue", "queue", "graph-bfs"],
    problems: [102, 103, 199, 515, 111, 104],
  },
  {
    slug: "iterative-traversal",
    title: "Iterative Traversal",
    category: "trees",
    description: "The same three orders with an explicit stack — needed for controlled, resumable walks.",
    concepts: ["Explicit stack", "Iterator", "Resumable"],
    usedFor: ["avoiding recursion depth limits", "BST iterators", "early exit after k elements"],
    signals: ["iterator", "next()", "without recursion", "kth smallest", "controlled traversal"],
    recognition: [
      "you need to stop mid-traversal and resume later — an iterator",
      "the answer is the k-th element in traversal order, so you want early exit",
      "recursion depth is a stated concern",
    ],
    typicalQuestion: "Implement an iterator over a BST returning values in ascending order.",
    mentalModel: {
      lines: [
        "The stack holds the nodes whose left subtrees are done but which have not been visited.",
        "Push left as far as possible, pop and visit, then move right and repeat.",
        "Postorder is easiest as reversed 'node, right, left'.",
      ],
      diagram: `  push all lefts
      ┌───┐
      │ 2 │ ← visit next
      │ 5 │
      │ 7 │
      └───┘
  pop → visit → go right → push all its lefts`,
      key: "The stack is exactly the recursion's call stack, made visible.",
    },
    templates: [
      {
        name: "Iterative inorder",
        filename: "iter_inorder.go",
        note: "The loop form of the recursion. Stop early whenever you like.",
        code: `func inorderIterative(root *TreeNode) []int {
    var out []int
    stack := []*TreeNode{}
    cur := root

    for cur != nil || len(stack) > 0 {
        for cur != nil { // dive left
            stack = append(stack, cur)
            cur = cur.Left
        }
        cur = stack[len(stack)-1]
        stack = stack[:len(stack)-1]

        out = append(out, cur.Val)
        cur = cur.Right
    }
    return out
}`,
      },
      {
        name: "BST iterator",
        filename: "bst_iterator.go",
        note: "Amortised O(1) per Next, O(h) space — the standard design answer.",
        code: `type BSTIterator struct {
    stack []*TreeNode
}

func NewBSTIterator(root *TreeNode) *BSTIterator {
    it := &BSTIterator{}
    it.pushLeft(root)
    return it
}

func (it *BSTIterator) pushLeft(n *TreeNode) {
    for n != nil {
        it.stack = append(it.stack, n)
        n = n.Left
    }
}

func (it *BSTIterator) Next() int {
    n := it.stack[len(it.stack)-1]
    it.stack = it.stack[:len(it.stack)-1]
    it.pushLeft(n.Right)
    return n.Val
}

func (it *BSTIterator) HasNext() bool { return len(it.stack) > 0 }`,
      },
      {
        name: "Iterative pre/post",
        filename: "iter_pre_post.go",
        note: "Preorder pushes right first. Postorder is preorder mirrored, then reversed.",
        code: `func preorderIterative(root *TreeNode) []int {
    if root == nil {
        return nil
    }
    var out []int
    stack := []*TreeNode{root}

    for len(stack) > 0 {
        n := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        out = append(out, n.Val)

        if n.Right != nil {
            stack = append(stack, n.Right) // right first: left pops first
        }
        if n.Left != nil {
            stack = append(stack, n.Left)
        }
    }
    return out
}

func postorderIterative(root *TreeNode) []int {
    // visit node, right, left — then reverse
    out := preorderMirrored(root)
    slices.Reverse(out)
    return out
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n)", note: "amortised O(1) per Next" },
      { label: "Space", value: "O(h)" },
    ],
    variations: [
      { name: "Kth smallest in a BST", detail: "Iterative inorder, stop after k pops — no need to walk the whole tree." },
      { name: "Morris traversal", detail: "O(1) space by threading, at the cost of temporarily rewriting pointers." },
      { name: "Two iterators", detail: "Merging two BSTs in sorted order uses two iterators advanced in step." },
    ],
    mistakes: [
      { title: "Pushing left before right in preorder", detail: "The stack reverses the order — push right first." },
      { title: "Losing the cursor in the inorder loop", detail: "The condition needs both cur != nil and a non-empty stack." },
      { title: "Trying to do postorder in one obvious pass", detail: "Use the mirrored-and-reversed trick, or track a 'last visited' node." },
    ],
    related: ["tree-traversal", "stack", "binary-search-tree"],
    problems: [94, 144, 145, 230, 173],
  },
  {
    slug: "binary-search-tree",
    title: "Binary Search Tree",
    category: "trees",
    description: "An ordering invariant that turns tree navigation into binary search.",
    concepts: ["Ordering", "Inorder sorted", "Bounds"],
    usedFor: ["ordered lookups", "insert and delete keeping order", "kth smallest", "range queries"],
    signals: ["binary search tree", "sorted order", "kth smallest", "validate", "successor", "insert into"],
    recognition: [
      "the statement says BST — every comparison halves the search",
      "an inorder traversal must come out sorted",
      "you need a predecessor, successor or rank",
    ],
    typicalQuestion: "Validate that a binary tree is a binary search tree.",
    mentalModel: {
      lines: [
        "Everything in the left subtree is smaller; everything in the right is larger.",
        "So descending compares the target with the node and picks a side.",
        "Inorder traversal emits values in ascending order — many BST problems are that fact in disguise.",
      ],
      diagram: `           8
        /     \\
       3       10
      / \\        \\
     1   6        14

  search 6: 6<8 → left, 6>3 → right, found
  inorder: 1 3 6 8 10 14`,
      key: "Validation needs an inherited (low, high) range, not a parent comparison.",
    },
    templates: [
      {
        name: "Search / insert",
        filename: "bst_ops.go",
        note: "Returning the subtree from recursion makes reattachment automatic.",
        code: `func searchBST(root *TreeNode, v int) *TreeNode {
    for root != nil && root.Val != v {
        if v < root.Val {
            root = root.Left
        } else {
            root = root.Right
        }
    }
    return root
}

func insertIntoBST(root *TreeNode, v int) *TreeNode {
    if root == nil {
        return &TreeNode{Val: v}
    }
    if v < root.Val {
        root.Left = insertIntoBST(root.Left, v)
    } else {
        root.Right = insertIntoBST(root.Right, v)
    }
    return root
}`,
      },
      {
        name: "Delete",
        filename: "bst_delete.go",
        note: "Two children: replace with the inorder successor, then delete that from the right subtree.",
        code: `func deleteNode(root *TreeNode, key int) *TreeNode {
    if root == nil {
        return nil
    }
    switch {
    case key < root.Val:
        root.Left = deleteNode(root.Left, key)
    case key > root.Val:
        root.Right = deleteNode(root.Right, key)
    default:
        if root.Left == nil {
            return root.Right
        }
        if root.Right == nil {
            return root.Left
        }
        succ := root.Right
        for succ.Left != nil {
            succ = succ.Left
        }
        root.Val = succ.Val
        root.Right = deleteNode(root.Right, succ.Val)
    }
    return root
}`,
      },
      {
        name: "Kth smallest",
        filename: "kth_smallest.go",
        note: "Iterative inorder with an early exit — no need to traverse the whole tree.",
        code: `func kthSmallest(root *TreeNode, k int) int {
    stack := []*TreeNode{}
    cur := root

    for cur != nil || len(stack) > 0 {
        for cur != nil {
            stack = append(stack, cur)
            cur = cur.Left
        }
        cur = stack[len(stack)-1]
        stack = stack[:len(stack)-1]

        k--
        if k == 0 {
            return cur.Val
        }
        cur = cur.Right
    }
    return -1
}`,
      },
    ],
    complexity: [
      { label: "Search / insert / delete", value: "O(h)", note: "h = log n balanced, n degenerate" },
      { label: "Inorder", value: "O(n)" },
      { label: "Kth smallest", value: "O(h + k)" },
      { label: "Space", value: "O(h)" },
    ],
    variations: [
      { name: "Balanced BST from a sorted array", detail: "Take the middle as the root and recurse — O(n) and perfectly balanced." },
      { name: "Successor / predecessor", detail: "Descend keeping the best candidate seen on the correct side." },
      { name: "Range sum", detail: "Prune whole subtrees that cannot intersect the range." },
      { name: "Self-balancing", detail: "AVL and red-black trees keep h = O(log n); rarely required in an interview." },
    ],
    mistakes: [
      { title: "Validating with parent comparisons only", detail: "The classic bug — carry (low, high) bounds down instead." },
      { title: "Ignoring duplicates", detail: "Decide up front whether equal keys go left, right, or are rejected." },
      { title: "Assuming O(log n)", detail: "An unbalanced BST is a linked list; say so when you state the complexity." },
      { title: "Forgetting to reattach after recursion", detail: "root.Left = insert(root.Left, v), not a bare call." },
    ],
    related: ["lowest-common-ancestor", "iterative-traversal", "tree-construction", "classic-binary-search"],
    problems: [98, 230, 700, 701, 450, 235, 108],
  },
  {
    slug: "lowest-common-ancestor",
    title: "Lowest Common Ancestor",
    category: "trees",
    description: "The deepest node with both targets in its subtree — found in one upward pass.",
    concepts: ["Post-order", "Split point", "Binary lifting"],
    usedFor: ["LCA queries", "path length between nodes", "subtree containment tests"],
    signals: ["lowest common ancestor", "distance between two nodes", "deepest node containing both", "common parent"],
    recognition: [
      "two nodes are given and you need where their paths merge",
      "the distance between two tree nodes is asked — that is depth(a)+depth(b)-2·depth(lca)",
      "many LCA queries on a static tree — precompute with binary lifting",
    ],
    typicalQuestion: "Find the lowest common ancestor of two nodes in a binary tree.",
    mentalModel: {
      lines: [
        "Return non-nil upward when you find either target.",
        "The first node that receives non-nil from both sides is the split point.",
        "In a BST it is simpler: walk down while both targets are on the same side.",
      ],
      diagram: `        3
       / \\
      5   1
     / \\
    6   2      LCA(6, 2) = 5

  left returns 6, right returns 2
  → this node is the answer`,
      key: "The LCA is where the two search paths diverge.",
    },
    templates: [
      {
        name: "Binary tree LCA",
        filename: "lca.go",
        note: "Assumes both nodes exist. Otherwise you must also return a found-count.",
        code: `func lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {
    if root == nil || root == p || root == q {
        return root
    }

    left := lowestCommonAncestor(root.Left, p, q)
    right := lowestCommonAncestor(root.Right, p, q)

    if left != nil && right != nil {
        return root // the split point
    }
    if left != nil {
        return left
    }
    return right
}`,
      },
      {
        name: "BST LCA",
        filename: "lca_bst.go",
        note: "Ordering removes the recursion entirely.",
        code: `func lcaBST(root, p, q *TreeNode) *TreeNode {
    for root != nil {
        switch {
        case p.Val < root.Val && q.Val < root.Val:
            root = root.Left
        case p.Val > root.Val && q.Val > root.Val:
            root = root.Right
        default:
            return root // they split here
        }
    }
    return nil
}`,
      },
      {
        name: "Binary lifting",
        filename: "binary_lifting.go",
        note: "For many queries on a static tree: O(n log n) preprocessing, O(log n) per query.",
        code: `const LOG = 17 // enough for n up to 131072

type LCA struct {
    up    [][LOG]int
    depth []int
}

func (l *LCA) Query(u, v int) int {
    if l.depth[u] < l.depth[v] {
        u, v = v, u
    }
    diff := l.depth[u] - l.depth[v]
    for k := 0; k < LOG; k++ {
        if diff>>k&1 == 1 {
            u = l.up[u][k]
        }
    }
    if u == v {
        return u
    }
    for k := LOG - 1; k >= 0; k-- {
        if l.up[u][k] != l.up[v][k] {
            u, v = l.up[u][k], l.up[v][k]
        }
    }
    return l.up[u][0]
}`,
      },
    ],
    complexity: [
      { label: "Single query", value: "O(n)" },
      { label: "BST", value: "O(h)" },
      { label: "Binary lifting build", value: "O(n log n)" },
      { label: "Binary lifting query", value: "O(log n)" },
    ],
    variations: [
      { name: "LCA with parent pointers", detail: "Walk both upwards to equal depth, then step in lock-step." },
      { name: "Existence not guaranteed", detail: "Return a count alongside the node so you can tell 'found one' from 'found the LCA'." },
      { name: "Euler tour + sparse table", detail: "O(1) queries after O(n log n) preprocessing." },
    ],
    mistakes: [
      { title: "Assuming both nodes are present", detail: "The clean recursion silently returns the one node it found." },
      { title: "Using the BST version on a general tree", detail: "Without the ordering invariant the descent is meaningless." },
      { title: "Forgetting a node can be its own ancestor", detail: "LCA(5, 6) where 6 is under 5 is 5." },
    ],
    related: ["tree-dfs", "binary-search-tree", "tree-diameter", "heavy-light-decomposition"],
    problems: [236, 235],
  },
  {
    slug: "tree-construction",
    title: "Tree Construction",
    category: "trees",
    description: "Rebuild a tree from traversals or ordered data — the root is always identifiable first.",
    concepts: ["Traversal pairs", "Index map", "Divide"],
    usedFor: ["rebuilding from traversals", "building balanced BSTs", "deserialisation"],
    signals: ["construct from", "preorder and inorder", "build a BST from sorted", "deserialize", "rebuild the tree"],
    recognition: [
      "you are given two traversals, one of which is inorder",
      "sorted data must become a balanced tree",
      "a serialised string must round-trip back into a tree",
    ],
    typicalQuestion: "Build the tree from its preorder and inorder traversals.",
    mentalModel: {
      lines: [
        "Preorder's first element is the root; postorder's last element is the root.",
        "Inorder tells you how many nodes lie in the left subtree.",
        "Recurse on the two sides with the sizes you just computed.",
      ],
      diagram: `  pre    [3 | 9 | 20 15 7]
          root  left   right

  in     [9 | 3 | 15 20 7]
          left root right

  leftSize = index of root in inorder`,
      key: "Index the inorder positions in a map, or every level costs an O(n) scan.",
    },
    templates: [
      {
        name: "Pre + in",
        filename: "build_pre_in.go",
        note: "The map lookup is what makes this O(n) instead of O(n²).",
        code: `func buildTree(preorder, inorder []int) *TreeNode {
    pos := make(map[int]int, len(inorder))
    for i, v := range inorder {
        pos[v] = i
    }
    pre := 0

    var build func(lo, hi int) *TreeNode
    build = func(lo, hi int) *TreeNode {
        if lo > hi {
            return nil
        }
        rootVal := preorder[pre]
        pre++

        mid := pos[rootVal]
        return &TreeNode{
            Val:   rootVal,
            Left:  build(lo, mid-1),
            Right: build(mid+1, hi),
        }
    }
    return build(0, len(inorder)-1)
}`,
      },
      {
        name: "In + post",
        filename: "build_in_post.go",
        note: "Consume postorder from the back, and build RIGHT before LEFT.",
        code: `func buildTreePost(inorder, postorder []int) *TreeNode {
    pos := make(map[int]int, len(inorder))
    for i, v := range inorder {
        pos[v] = i
    }
    post := len(postorder) - 1

    var build func(lo, hi int) *TreeNode
    build = func(lo, hi int) *TreeNode {
        if lo > hi {
            return nil
        }
        rootVal := postorder[post]
        post--

        mid := pos[rootVal]
        node := &TreeNode{Val: rootVal}
        node.Right = build(mid+1, hi) // right first!
        node.Left = build(lo, mid-1)
        return node
    }
    return build(0, len(inorder)-1)
}`,
      },
      {
        name: "Balanced from sorted",
        filename: "sorted_to_bst.go",
        note: "The middle element as the root gives a height-balanced tree by construction.",
        code: `func sortedArrayToBST(nums []int) *TreeNode {
    if len(nums) == 0 {
        return nil
    }
    mid := len(nums) / 2
    return &TreeNode{
        Val:   nums[mid],
        Left:  sortedArrayToBST(nums[:mid]),
        Right: sortedArrayToBST(nums[mid+1:]),
    }
}`,
      },
    ],
    complexity: [
      { label: "With an index map", value: "O(n)" },
      { label: "Without one", value: "O(n²)", note: "a linear scan per node" },
      { label: "Space", value: "O(n)" },
    ],
    variations: [
      { name: "Preorder + postorder", detail: "Does not determine a unique binary tree, but does for a full binary tree." },
      { name: "BST from preorder alone", detail: "The ordering supplies the missing inorder — use bounds while descending." },
      { name: "Level order construction", detail: "A queue-driven build from a level-order serialisation." },
    ],
    mistakes: [
      { title: "Building left before right in the postorder variant", detail: "Postorder is consumed backwards, so the right subtree must be built first." },
      { title: "Scanning inorder for the root each time", detail: "That is the O(n²) trap the map removes." },
      { title: "Assuming values are unique", detail: "The index map requires it; the problem usually guarantees it, so say so." },
    ],
    related: ["tree-traversal", "binary-search-tree", "divide-and-conquer"],
    problems: [105, 106, 108, 297, 114],
  },
  {
    slug: "tree-dp",
    title: "Tree DP",
    category: "trees",
    description: "DP where the recursion is the tree itself — combine children's states at each node.",
    concepts: ["States per node", "Rerooting", "Post-order"],
    usedFor: ["choose-or-skip on trees", "colouring and covering", "subtree aggregates", "rerooting"],
    signals: ["tree", "no two adjacent", "cover every node", "maximum over subtrees", "for every root"],
    recognition: [
      "the decision at a node constrains its children — that is a state",
      "the answer for a subtree only needs the answers for its children",
      "the same question must be answered for every possible root — rerooting",
    ],
    typicalQuestion: "Rob houses arranged in a tree without robbing two directly connected ones.",
    mentalModel: {
      lines: [
        "Give each node a small set of states — taken / not taken, covered / uncovered.",
        "Return one value per state from every node.",
        "The parent combines children's states under the constraint.",
      ],
      diagram: `        node
     take │ skip
         / \\
    child   child
    (skip)  (skip)      ← take forces children to skip

  take = val + Σ child.skip
  skip = Σ max(child.take, child.skip)`,
      key: "Return a tuple, one entry per state. Never a single number.",
    },
    templates: [
      {
        name: "Two states",
        filename: "house_robber_iii.go",
        note: "Return (robbed, skipped) together — one O(n) pass, no memo needed.",
        code: `func rob(root *TreeNode) int {
    var dfs func(*TreeNode) (int, int) // (take, skip)

    dfs = func(n *TreeNode) (int, int) {
        if n == nil {
            return 0, 0
        }
        lTake, lSkip := dfs(n.Left)
        rTake, rSkip := dfs(n.Right)

        take := n.Val + lSkip + rSkip
        skip := max(lTake, lSkip) + max(rTake, rSkip)
        return take, skip
    }

    return max(dfs(root))
}`,
      },
      {
        name: "Subtree aggregate",
        filename: "subtree_sum.go",
        note: "General shape for graph-shaped trees: recurse over children, skipping the parent.",
        code: `func subtreeSums(adj [][]int, vals []int) []int {
    sum := make([]int, len(adj))

    var dfs func(u, parent int)
    dfs = func(u, parent int) {
        sum[u] = vals[u]
        for _, v := range adj[u] {
            if v == parent {
                continue
            }
            dfs(v, u)
            sum[u] += sum[v]
        }
    }

    dfs(0, -1)
    return sum
}`,
      },
      {
        name: "Rerooting",
        filename: "rerooting.go",
        note: "Two passes: sums downward, then push the outside contribution down from each parent.",
        code: `// sum of distances from every node to all others
func sumOfDistances(n int, adj [][]int) []int {
    count := make([]int, n) // subtree sizes
    ans := make([]int, n)

    var down func(u, parent int)
    down = func(u, parent int) {
        count[u] = 1
        for _, v := range adj[u] {
            if v == parent {
                continue
            }
            down(v, u)
            count[u] += count[v]
            ans[u] += ans[v] + count[v]
        }
    }

    var up func(u, parent int)
    up = func(u, parent int) {
        for _, v := range adj[u] {
            if v == parent {
                continue
            }
            // move the root from u to v
            ans[v] = ans[u] - count[v] + (n - count[v])
            up(v, u)
        }
    }

    down(0, -1)
    up(0, -1)
    return ans
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n · S)", note: "S = number of states per node" },
      { label: "Rerooting", value: "O(n)", note: "two DFS passes" },
      { label: "Space", value: "O(h)", note: "recursion depth" },
    ],
    why: "A tree has no cycles, so each subtree's answer is independent once the parent's decision is fixed. That independence is exactly what DP needs — and it is why tree DP requires no explicit memo table: each node is visited once.",
    variations: [
      { name: "Three states", detail: "Covering problems (tree cameras) need covered-with-camera, covered-by-child, uncovered." },
      { name: "Knapsack on trees", detail: "Merge children's DP arrays; careful sizing keeps it O(n²) rather than O(n·k²)." },
      { name: "Rerooting", detail: "Compute for one root, then derive every other root in O(1) per edge." },
    ],
    mistakes: [
      { title: "Recursing back into the parent", detail: "On adjacency-list trees you must pass and skip the parent, or you loop forever." },
      { title: "Returning a single number", detail: "If the parent's choice constrains the child, one number cannot express the trade-off." },
      { title: "Stack overflow on a path graph", detail: "A 1e5-node chain is deep; consider an iterative post-order." },
    ],
    related: ["tree-dfs", "tree-diameter", "linear-dp", "graph-dfs"],
    problems: [337, 968, 124, 543, 310],
  },
  {
    slug: "tree-diameter",
    title: "Tree Diameter & Path Problems",
    category: "trees",
    description: "A path bends at exactly one node — so evaluate every node as the bend.",
    concepts: ["Bend point", "Two branches", "Return one"],
    usedFor: ["longest path in a tree", "maximum path sum", "tree centres", "eccentricity"],
    signals: ["diameter", "longest path", "maximum path sum", "path between any two nodes", "not necessarily through the root"],
    recognition: [
      "the path may pass through any node, not just the root",
      "at each node you combine the two best downward branches",
      "the value returned to the parent differs from the value recorded globally",
    ],
    typicalQuestion: "Find the length of the longest path between any two nodes in a tree.",
    mentalModel: {
      lines: [
        "Every path has a unique highest node — its bend.",
        "At that node, the path is leftBranch + node + rightBranch.",
        "But the parent can only use ONE branch, so return the better one and record the sum separately.",
      ],
      diagram: `        bend
       /    \\
   left      right      ← recorded globally
      ↑
   return max(left, right) + 1 to the parent`,
      key: "Record the two-branch answer; return the one-branch value.",
    },
    templates: [
      {
        name: "Diameter",
        filename: "diameter.go",
        note: "The closure captures best; the return value is the depth.",
        code: `func diameterOfBinaryTree(root *TreeNode) int {
    best := 0

    var depth func(*TreeNode) int
    depth = func(n *TreeNode) int {
        if n == nil {
            return 0
        }
        l := depth(n.Left)
        r := depth(n.Right)

        best = max(best, l+r) // path bending here, in edges
        return 1 + max(l, r)  // only one branch goes up
    }

    depth(root)
    return best
}`,
      },
      {
        name: "Maximum path sum",
        filename: "max_path_sum.go",
        note: "Negative branches are dropped with max(0, …) — taking nothing is always allowed.",
        code: `func maxPathSum(root *TreeNode) int {
    best := math.MinInt

    var gain func(*TreeNode) int
    gain = func(n *TreeNode) int {
        if n == nil {
            return 0
        }
        l := max(0, gain(n.Left)) // drop negative branches
        r := max(0, gain(n.Right))

        best = max(best, n.Val+l+r)
        return n.Val + max(l, r)
    }

    gain(root)
    return best
}`,
      },
      {
        name: "Diameter by double BFS",
        filename: "double_bfs.go",
        note: "On a general (unweighted) tree: farthest from any node, then farthest from that.",
        code: `func treeDiameter(adj [][]int) int {
    farthest := func(src int) (node, dist int) {
        d := make([]int, len(adj))
        for i := range d {
            d[i] = -1
        }
        d[src] = 0
        queue := []int{src}
        node, dist = src, 0

        for len(queue) > 0 {
            u := queue[0]
            queue = queue[1:]
            if d[u] > dist {
                node, dist = u, d[u]
            }
            for _, v := range adj[u] {
                if d[v] == -1 {
                    d[v] = d[u] + 1
                    queue = append(queue, v)
                }
            }
        }
        return node, dist
    }

    a, _ := farthest(0)
    _, diameter := farthest(a)
    return diameter
}`,
      },
    ],
    complexity: [
      { label: "Single DFS", value: "O(n)" },
      { label: "Double BFS", value: "O(n)", note: "two passes over a general tree" },
      { label: "Space", value: "O(h)", note: "O(n) for the BFS variant" },
    ],
    why: "The double-BFS trick works because the farthest node from any starting point is always an endpoint of some diameter. Once you have one endpoint, the farthest node from it is the other end.",
    variations: [
      { name: "Weighted edges", detail: "Same recursion, adding edge weights instead of one per level." },
      { name: "Tree centre", detail: "Peel leaves layer by layer; the last one or two nodes are the centres." },
      { name: "Longest path with a constraint", detail: "Add state, e.g. same-value paths or colour-restricted branches." },
    ],
    mistakes: [
      { title: "Returning l+r to the parent", detail: "That would form a Y in the path, which is not a path." },
      { title: "Confusing edges and nodes", detail: "Diameter in edges is l+r; in nodes it is l+r+1. Read the statement carefully." },
      { title: "Not clamping negative gains", detail: "In max-path-sum a negative branch must be dropped, not added." },
    ],
    related: ["tree-dp", "tree-dfs", "graph-bfs", "lowest-common-ancestor"],
    problems: [543, 124, 310, 337],
  },
  {
    slug: "trie",
    title: "Prefix Tree (Trie)",
    category: "trees",
    description: "A tree keyed by character position — prefix queries cost the length of the prefix, not the size of the set.",
    concepts: ["Prefix", "Node per char", "Binary trie"],
    usedFor: ["prefix search", "autocomplete", "word grids", "maximum XOR pairs"],
    signals: ["prefix", "starts with", "dictionary", "autocomplete", "word search", "maximum XOR", "wildcard match"],
    recognition: [
      "many strings share prefixes and you query by prefix",
      "you are searching a grid for many words at once — prune with a trie",
      "maximum XOR of a pair: a binary trie makes it greedy",
      "wildcards in the query mean the search must fork",
    ],
    typicalQuestion: "Implement insert, search and startsWith for a dictionary of words.",
    mentalModel: {
      lines: [
        "Each edge is a character; each node is a prefix.",
        "Lookup cost depends on the word length, never on the dictionary size.",
        "A terminal flag marks a node as the end of a real word.",
      ],
      diagram: `        (root)
        /    \\
       c      d
       │      │
       a      o
      / \\     │
     t   r    g●
     ●   ●

  ● = end of word`,
      key: "A trie turns 'does any word start with this?' into a walk, not a scan.",
    },
    templates: [
      {
        name: "Trie",
        filename: "trie.go",
        note: "A 26-slot array beats a map for lowercase input — no hashing, better locality.",
        code: `type Trie struct {
    children [26]*Trie
    isWord   bool
}

func (t *Trie) Insert(word string) {
    node := t
    for i := 0; i < len(word); i++ {
        c := word[i] - 'a'
        if node.children[c] == nil {
            node.children[c] = &Trie{}
        }
        node = node.children[c]
    }
    node.isWord = true
}

func (t *Trie) find(s string) *Trie {
    node := t
    for i := 0; i < len(s); i++ {
        node = node.children[s[i]-'a']
        if node == nil {
            return nil
        }
    }
    return node
}

func (t *Trie) Search(word string) bool {
    n := t.find(word)
    return n != nil && n.isWord
}

func (t *Trie) StartsWith(prefix string) bool {
    return t.find(prefix) != nil
}`,
      },
      {
        name: "Wildcard search",
        filename: "wildcard_trie.go",
        note: "A '.' forks into every existing child.",
        code: `func (t *Trie) SearchWild(word string) bool {
    var dfs func(node *Trie, i int) bool

    dfs = func(node *Trie, i int) bool {
        if node == nil {
            return false
        }
        if i == len(word) {
            return node.isWord
        }
        if word[i] != '.' {
            return dfs(node.children[word[i]-'a'], i+1)
        }
        for _, child := range node.children {
            if dfs(child, i+1) {
                return true
            }
        }
        return false
    }

    return dfs(t, 0)
}`,
      },
      {
        name: "Binary trie",
        filename: "xor_trie.go",
        note: "Insert the bits of each number; greedily take the opposite bit to maximise XOR.",
        code: `type BitTrie struct{ child [2]*BitTrie }

const BITS = 31

func (t *BitTrie) Insert(x int) {
    node := t
    for b := BITS; b >= 0; b-- {
        bit := x >> b & 1
        if node.child[bit] == nil {
            node.child[bit] = &BitTrie{}
        }
        node = node.child[bit]
    }
}

func (t *BitTrie) MaxXor(x int) int {
    node, best := t, 0
    for b := BITS; b >= 0; b-- {
        bit := x >> b & 1
        want := bit ^ 1 // the opposite bit maximises this position
        if node.child[want] != nil {
            best |= 1 << b
            node = node.child[want]
        } else {
            node = node.child[bit]
        }
    }
    return best
}`,
      },
      {
        name: "Trie + grid DFS",
        filename: "word_search_ii.go",
        note: "Walk the board and the trie together; a missing child prunes instantly.",
        code: `func findWords(board [][]byte, words []string) []string {
    root := &Trie{}
    for _, w := range words {
        root.Insert(w)
    }

    var out []string
    var dfs func(r, c int, node *Trie, path []byte)

    dfs = func(r, c int, node *Trie, path []byte) {
        if r < 0 || r >= len(board) || c < 0 || c >= len(board[0]) {
            return
        }
        ch := board[r][c]
        if ch == '#' || node.children[ch-'a'] == nil {
            return
        }
        node = node.children[ch-'a']
        path = append(path, ch)

        if node.isWord {
            out = append(out, string(path))
            node.isWord = false // de-duplicate
        }

        board[r][c] = '#' // mark visited
        dfs(r+1, c, node, path)
        dfs(r-1, c, node, path)
        dfs(r, c+1, node, path)
        dfs(r, c-1, node, path)
        board[r][c] = ch // restore
    }

    for r := range board {
        for c := range board[r] {
            dfs(r, c, root, nil)
        }
    }
    return out
}`,
      },
    ],
    complexity: [
      { label: "Insert", value: "O(L)", note: "L = word length" },
      { label: "Search", value: "O(L)" },
      { label: "Prefix query", value: "O(L)" },
      { label: "Space", value: "O(total chars × alphabet)", note: "a map per node trades speed for memory" },
    ],
    variations: [
      { name: "Map children", detail: "map[byte]*Trie for large or unknown alphabets." },
      { name: "Compressed trie", detail: "Radix tree: collapse single-child chains into one edge label." },
      { name: "Counting trie", detail: "Store a word count per node for 'how many words share this prefix'." },
      { name: "Suffix trie / automaton", detail: "Insert every suffix to answer substring queries; usually a suffix automaton in practice." },
    ],
    mistakes: [
      { title: "Forgetting the terminal flag", detail: "Without isWord, 'app' matches when only 'apple' was inserted." },
      { title: "Not de-duplicating results", detail: "In word-search-II, clear isWord after collecting so the same word is not added twice." },
      { title: "Using a map when the alphabet is 26", detail: "Array children are markedly faster and allocation-free per lookup." },
    ],
    related: ["tree-dfs", "hash-map", "constraint-search", "kmp"],
    problems: [208, 211, 212, 648, 421],
  },
  {
    slug: "segment-tree",
    title: "Segment Tree",
    category: "trees",
    description: "A binary tree over array ranges — arbitrary range queries with updates in O(log n).",
    concepts: ["Range query", "Point update", "Lazy"],
    usedFor: ["range min/max/sum with updates", "range assignment", "any associative range query"],
    signals: ["range query", "update an element", "range max", "range assign", "online queries", "mutable array"],
    recognition: [
      "you need range queries on an array that also changes",
      "the operation is associative but not invertible — min, max, gcd (prefix sums won't work)",
      "range updates as well as range queries — you need lazy propagation",
    ],
    typicalQuestion: "Support range sum queries and point updates on a mutable array.",
    mentalModel: {
      lines: [
        "Each node stores the aggregate of one contiguous range.",
        "A query splits into O(log n) maximal nodes that tile the range exactly.",
        "An update touches one root-to-leaf path.",
      ],
      diagram: `            [0..7]
          /        \\
      [0..3]        [4..7]
      /    \\        /    \\
  [0..1] [2..3] [4..5] [6..7]

  query [1..5] = [1] + [2..3] + [4..5]`,
      key: "Use a segment tree when prefix sums fail — because of updates, or because the operation has no inverse.",
    },
    templates: [
      {
        name: "Iterative sum tree",
        filename: "segment_tree.go",
        note: "The bottom-up form: shortest correct implementation, no recursion.",
        code: `type SegTree struct {
    n    int
    tree []int
}

func NewSegTree(a []int) *SegTree {
    n := len(a)
    t := make([]int, 2*n)
    copy(t[n:], a)
    for i := n - 1; i > 0; i-- {
        t[i] = t[2*i] + t[2*i+1]
    }
    return &SegTree{n, t}
}

func (s *SegTree) Update(i, v int) {
    i += s.n
    s.tree[i] = v
    for i > 1 {
        i /= 2
        s.tree[i] = s.tree[2*i] + s.tree[2*i+1]
    }
}

// sum over [l, r)
func (s *SegTree) Query(l, r int) int {
    sum := 0
    for l, r = l+s.n, r+s.n; l < r; l, r = l/2, r/2 {
        if l&1 == 1 {
            sum += s.tree[l]
            l++
        }
        if r&1 == 1 {
            r--
            sum += s.tree[r]
        }
    }
    return sum
}`,
      },
      {
        name: "Recursive with lazy",
        filename: "lazy_segment_tree.go",
        note: "Range add plus range max. push() applies and forwards the pending delta.",
        code: `type Lazy struct {
    n    int
    tree []int
    lazy []int
}

func NewLazy(n int) *Lazy {
    return &Lazy{n: n, tree: make([]int, 4*n), lazy: make([]int, 4*n)}
}

func (s *Lazy) push(node, lo, hi int) {
    if s.lazy[node] == 0 {
        return
    }
    s.tree[node] += s.lazy[node]
    if lo != hi {
        s.lazy[2*node] += s.lazy[node]
        s.lazy[2*node+1] += s.lazy[node]
    }
    s.lazy[node] = 0
}

func (s *Lazy) Add(node, lo, hi, l, r, v int) {
    s.push(node, lo, hi)
    if r < lo || hi < l {
        return
    }
    if l <= lo && hi <= r {
        s.lazy[node] += v
        s.push(node, lo, hi)
        return
    }
    mid := (lo + hi) / 2
    s.Add(2*node, lo, mid, l, r, v)
    s.Add(2*node+1, mid+1, hi, l, r, v)
    s.tree[node] = max(s.tree[2*node], s.tree[2*node+1])
}

func (s *Lazy) Max(node, lo, hi, l, r int) int {
    s.push(node, lo, hi)
    if r < lo || hi < l {
        return math.MinInt
    }
    if l <= lo && hi <= r {
        return s.tree[node]
    }
    mid := (lo + hi) / 2
    return max(s.Max(2*node, lo, mid, l, r), s.Max(2*node+1, mid+1, hi, l, r))
}`,
      },
    ],
    complexity: [
      { label: "Build", value: "O(n)" },
      { label: "Query", value: "O(log n)" },
      { label: "Point update", value: "O(log n)" },
      { label: "Range update", value: "O(log n)", note: "with lazy propagation" },
      { label: "Space", value: "O(n)", note: "4n for the recursive form" },
    ],
    variations: [
      { name: "Any associative merge", detail: "Swap + for min, max, gcd or matrix multiplication — only the combine function changes." },
      { name: "Lazy propagation", detail: "Needed for range updates; store the pending operation per node." },
      { name: "Merge sort tree", detail: "Each node keeps a sorted list, enabling 'count elements < x in range'." },
      { name: "Fenwick instead", detail: "For prefix sums with point updates, a BIT is shorter and faster." },
    ],
    mistakes: [
      { title: "Under-sizing the array", detail: "The recursive form needs 4n, not 2n." },
      { title: "Forgetting to push before reading", detail: "A stale lazy value silently corrupts every query below it." },
      { title: "Mixing inclusive and half-open ranges", detail: "The iterative template is half-open [l, r); the recursive one here is inclusive. Do not blend them." },
      { title: "Reaching for it when a BIT suffices", detail: "Prefix sums with point updates are a Fenwick tree — a third of the code." },
    ],
    related: ["fenwick-tree", "prefix-sum", "difference-array", "coordinate-compression"],
    problems: [307, 699, 732, 315],
  },
  {
    slug: "fenwick-tree",
    title: "Fenwick Tree (BIT)",
    category: "trees",
    description: "Prefix sums with updates, in twenty lines — the lowest-bit trick doing all the work.",
    concepts: ["Prefix sum", "Point update", "Inversions"],
    usedFor: ["prefix sums with updates", "counting inversions", "rank queries", "2D point counting"],
    signals: ["prefix sum with updates", "count smaller after self", "inversions", "rank", "count elements less than"],
    recognition: [
      "prefix sums are enough — you never need an arbitrary non-prefix range that is not a difference",
      "you are counting inversions or elements smaller than the current one",
      "values need compressing first, then counting by rank",
    ],
    typicalQuestion: "Support point updates and prefix sum queries on an array.",
    mentalModel: {
      lines: [
        "Node i covers a block of length (i & -i) ending at i.",
        "Query walks down by clearing the lowest set bit; update walks up by adding it.",
        "Both paths have at most log n steps.",
      ],
      diagram: `  i      binary   covers
  8      1000     [1..8]
  6      0110     [5..6]
  7      0111     [7..7]

  query(7) = tree[7] + tree[6] + tree[4]
  7 → 6 → 4 → 0   (clear the lowest bit)`,
      key: "1-indexed. Always. Index 0 has no lowest set bit and the loop never terminates.",
    },
    templates: [
      {
        name: "Fenwick tree",
        filename: "bit.go",
        note: "The whole structure. Note the 1-indexing in both loops.",
        code: `type BIT struct {
    n    int
    tree []int
}

func NewBIT(n int) *BIT {
    return &BIT{n: n, tree: make([]int, n+1)} // 1-indexed
}

// add v at position i (0-indexed input)
func (b *BIT) Add(i, v int) {
    for i++; i <= b.n; i += i & -i {
        b.tree[i] += v
    }
}

// sum of [0, i] (0-indexed input)
func (b *BIT) Query(i int) int {
    sum := 0
    for i++; i > 0; i -= i & -i {
        sum += b.tree[i]
    }
    return sum
}

func (b *BIT) Range(l, r int) int {
    return b.Query(r) - b.Query(l-1)
}`,
      },
      {
        name: "Counting inversions",
        filename: "inversions.go",
        note: "Compress values, then count how many larger values were already seen.",
        code: `func countInversions(nums []int) int {
    ranks, distinct := compress(nums)
    bit := NewBIT(len(distinct))

    total := 0
    for i := len(nums) - 1; i >= 0; i-- {
        total += bit.Query(ranks[i] - 1) // strictly smaller, already to the right
        bit.Add(ranks[i], 1)
    }
    return total
}`,
      },
      {
        name: "Find by prefix",
        filename: "bit_search.go",
        note: "Binary lifting on the BIT: the smallest index with prefix sum >= target, in O(log n).",
        code: `func (b *BIT) LowerBound(target int) int {
    pos, rest := 0, target
    for step := 1 << bits.Len(uint(b.n)); step > 0; step >>= 1 {
        if pos+step <= b.n && b.tree[pos+step] < rest {
            pos += step
            rest -= b.tree[pos]
        }
    }
    return pos // 0-indexed answer is pos
}`,
      },
    ],
    complexity: [
      { label: "Update", value: "O(log n)" },
      { label: "Prefix query", value: "O(log n)" },
      { label: "Build", value: "O(n log n)", note: "O(n) with an in-place construction" },
      { label: "Space", value: "O(n)", note: "one array, no tree nodes" },
    ],
    variations: [
      { name: "Range update, point query", detail: "Store a difference array in the BIT: add v at l, -v at r+1." },
      { name: "Range update, range query", detail: "Two BITs together give both." },
      { name: "2D BIT", detail: "Nested loops on both dimensions; O(log² n) per operation." },
      { name: "Segment tree instead", detail: "Needed when the operation has no inverse, such as min or max." },
    ],
    mistakes: [
      { title: "Using index 0", detail: "0 & -0 is 0, so the update loop never advances. Always shift to 1-indexed." },
      { title: "Trying to store min or max", detail: "Fenwick relies on subtraction; min has no inverse." },
      { title: "Forgetting to compress", detail: "Values up to 1e9 need ranks first, or the array is enormous." },
    ],
    related: ["segment-tree", "coordinate-compression", "prefix-sum", "divide-and-conquer"],
    problems: [307, 315, 493, 2179],
  },
  {
    slug: "heavy-light-decomposition",
    title: "Heavy-Light Decomposition",
    category: "trees",
    description: "Split a tree into chains so that any path crosses O(log n) of them — then use a segment tree.",
    concepts: ["Chains", "Path queries", "Log segments"],
    usedFor: ["path updates and queries on trees", "subtree plus path queries together"],
    signals: ["path queries on a tree", "update all edges on a path", "sum along the path from u to v", "many queries"],
    recognition: [
      "queries are over tree paths, not subtrees, and the tree changes",
      "the naive per-query walk is O(n) and there are 1e5 queries",
      "you already know LCA but need aggregation along the path",
    ],
    typicalQuestion: "Sum the values on the path between u and v, with updates in between.",
    mentalModel: {
      lines: [
        "From each node, the child with the largest subtree is 'heavy'; the rest are 'light'.",
        "Heavy edges form chains. Going down a light edge at least halves the subtree size.",
        "So any root-to-node path crosses at most log n chains.",
      ],
      diagram: `  chain 1: ●─●─●─●
                 └ light
  chain 2:       ●─●
                    └ light
  chain 3:          ●

  path u→v = O(log n) chain segments
  each segment = one segment tree range query`,
      key: "Flatten each chain into contiguous positions, then every chain segment is one range query.",
    },
    templates: [
      {
        name: "Decomposition",
        filename: "hld.go",
        note: "Two DFS passes: sizes and heavy children, then chain heads and positions.",
        code: `type HLD struct {
    parent, depth, heavy, head, pos []int
    cur                             int
}

func (h *HLD) dfsSize(u int, adj [][]int) int {
    size, maxSub := 1, 0
    for _, v := range adj[u] {
        if v == h.parent[u] {
            continue
        }
        h.parent[v] = u
        h.depth[v] = h.depth[u] + 1

        sub := h.dfsSize(v, adj)
        if sub > maxSub {
            maxSub, h.heavy[u] = sub, v
        }
        size += sub
    }
    return size
}

func (h *HLD) decompose(u, chainHead int, adj [][]int) {
    h.head[u] = chainHead
    h.pos[u] = h.cur
    h.cur++

    if h.heavy[u] != -1 {
        h.decompose(h.heavy[u], chainHead, adj) // extend the chain
    }
    for _, v := range adj[u] {
        if v != h.parent[u] && v != h.heavy[u] {
            h.decompose(v, v, adj) // each light child starts a chain
        }
    }
}`,
      },
      {
        name: "Path query",
        filename: "hld_query.go",
        note: "Climb the deeper chain head each round; each jump is one segment tree query.",
        code: `func (h *HLD) PathQuery(u, v int, seg *SegTree) int {
    res := 0
    for h.head[u] != h.head[v] {
        if h.depth[h.head[u]] < h.depth[h.head[v]] {
            u, v = v, u
        }
        res += seg.Query(h.pos[h.head[u]], h.pos[u]+1)
        u = h.parent[h.head[u]]
    }
    if h.depth[u] > h.depth[v] {
        u, v = v, u
    }
    res += seg.Query(h.pos[u], h.pos[v]+1) // final same-chain segment
    return res
}`,
      },
    ],
    complexity: [
      { label: "Build", value: "O(n)" },
      { label: "Path query", value: "O(log² n)", note: "log n chains × log n per segment tree query" },
      { label: "Subtree query", value: "O(log n)", note: "a subtree is one contiguous position range" },
      { label: "Space", value: "O(n)" },
    ],
    why: "Descending a light edge means entering a subtree of at most half the size, so at most log n light edges lie on any root-to-node path. Between them the path stays inside one heavy chain, which is contiguous in the flattened order.",
    variations: [
      { name: "Edge values", detail: "Store each edge's value at its deeper endpoint and exclude the LCA from the final segment." },
      { name: "Subtree queries", detail: "The DFS order makes a subtree a contiguous range — one query, no chains needed." },
      { name: "Euler tour + BIT", detail: "Simpler when only subtree aggregates are required." },
      { name: "Link-cut trees", detail: "Handle a changing tree structure, at a considerable implementation cost." },
    ],
    mistakes: [
      { title: "Including the LCA in an edge-based query", detail: "With edge values the LCA carries its parent's edge, which is outside the path." },
      { title: "Not starting a new chain at each light child", detail: "The chain head must be the light child itself." },
      { title: "Recursion depth", detail: "A path-shaped tree of 1e5 nodes will blow a naive recursive build." },
    ],
    related: ["segment-tree", "lowest-common-ancestor", "tree-dfs", "fenwick-tree"],
    problems: [1192, 310],
  },
];
