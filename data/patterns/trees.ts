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
    teach: [
      "Visiting every node in a tree is three lines of recursion: handle the node, go left, go right. What changes between the three traversals is only where you put the first line.",
      "Put the work before the two calls and you get preorder: you see a node on the way down, before its children. That is what you want when you are copying a tree or writing it out, because you need the parent before you can attach children to it.",
      "Put it between the two calls and you get inorder. On a binary search tree this is the important one: everything smaller comes first, so the values come out sorted. A surprising number of BST problems are just that fact in disguise.",
      "Put it after both calls and you get postorder. Now every child has already reported back, so you can combine their answers. Heights, sums, and anything where a node's answer depends on its subtrees is postorder.",
      "So the question to ask is not 'which traversal' but 'do I need my children's answers before I can decide?'. If yes, postorder. If you are handing information down instead, preorder.",
      "One practical note: writing a tree out and reading it back needs explicit markers for the missing children. Without them, the same sequence of values can describe several different shapes.",
    ],
    mentalModel: {
      lines: [
        "One recursion, three places to do the work.",
        "Before the children: preorder. Between them: inorder. After them: postorder.",
        "Inorder on a BST comes out sorted.",
      ],
      diagram: `        1
       / \\
      2   3

  pre   1 2 3    (act before descending)
  in    2 1 3    (act between children)
  post  2 3 1    (act after descending)`,
      key: "Ask whether you need answers from the children first. If yes, that is postorder.",
    },
    templates: [
      {
        name: "Recursive",
        filename: "traversals.go",
        note: "Move the visit line to change the order. Nothing else changes.",
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
        note: "Preorder with explicit nil markers rebuilds exactly one tree.",
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
        note: "O(1) memory: borrow spare nil pointers, then put them back.",
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
      { label: "Space", value: "O(h)", note: "call stack; h = n for a chain" },
      { label: "Morris", value: "O(1)", note: "but it rewrites pointers as it goes" },
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
    teach: [
      "Almost every tree problem is one recursive function, and almost every bug is in its signature rather than its body.",
      "Before writing anything, answer two questions. What travels down the tree as arguments? And what travels back up as the return value?",
      "Down is for context a node cannot work out on its own — a running total, an allowed range of values, the depth so far. Up is for facts a parent needs — a height, a sum, a yes or no.",
      "Validating a binary search tree shows why this matters. The tempting check is that each node sits between its two children. That passes on trees that are clearly invalid, because a node far down the left branch can still be larger than an ancestor. What you actually inherit from above is a range: everything in this subtree must lie between low and high. Going left tightens the high end, going right tightens the low end.",
      "When a parent needs several facts, return them together. Checking whether a tree is balanced needs both the height and whether anything below was already unbalanced. Returning just the height forces a second pass and turns a linear solution into a quadratic one.",
      "And if you are collecting paths rather than aggregating, remember to undo. Append on the way in, remove on the way out, and copy the slice before storing it — otherwise every saved path points at the same memory and they all end up identical.",
    ],
    mentalModel: {
      lines: [
        "Decide two things before you write anything.",
        "What travels down as arguments, and what travels back up as the return.",
        "Down: a running total, a bound. Up: a height, a sum, a yes/no.",
        "If both children need to report several facts, return a small struct.",
      ],
      diagram: `        node
        ↓ args (bounds, running sum)
       / \\
      ↑   ↑  returns (height, sum, valid)
     combine here`,
      key: "Write the return type first. Most tree bugs are a return that carries too little.",
    },
    templates: [
      {
        name: "Bottom-up",
        filename: "depth.go",
        note: "Children answer, the parent combines. No shared state.",
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
        note: "Comparing a node only with its children is the classic wrong answer.",
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
        note: "Return the height and the verdict together so one pass is enough.",
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
        note: "Append, recurse, remove. And copy before you store.",
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
    teach: [
      "Some questions are not about the shape of a tree but about its depth. The rightmost node on each row. The widest row. The first leaf.",
      "Depth-first search wanders down one branch and comes back, so it meets nodes in an order that has nothing to do with their depth. Breadth-first search handles the tree one row at a time, which is exactly what these questions want.",
      "Put the root in a queue. Then repeat: take everything currently in the queue, handle it, and add its children.",
      "That word 'currently' is the whole technique. Save the queue length before you start the row, and process exactly that many nodes. The children you add during the row belong to the next row, and if you keep checking len(queue) as you go, the rows run together.",
      "Once the rows are separate, the variations are small. Keep the last node of each row for a right side view. Keep the largest for a per-row maximum. Fill the row backwards on alternate rows for a zigzag.",
      "BFS also wins on minimum depth, because it stops at the first leaf it meets rather than exploring a long branch first.",
    ],
    mentalModel: {
      lines: [
        "Put the root in a queue, then handle exactly one level at a time.",
        "Freeze the queue length first.",
        "Anything added during the level belongs to the next one.",
      ],
      diagram: `  queue: [ root ]          level 0
  queue: [ a  b ]          level 1
  queue: [ c  d  e ]       level 2

  size = len(queue) at the top of each round`,
      key: "Freezing the size is the whole technique.",
    },
    templates: [
      {
        name: "Level order",
        filename: "level_order.go",
        note: "The shape every other level-based answer edits.",
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
        note: "Reverse on the way into the slice, not while walking.",
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
      { label: "Space", value: "O(w)", note: "w = widest level, up to n/2" },
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
    teach: [
      "Recursion walks a tree beautifully, but it gives you no way to pause. If you need an iterator that hands back one value per call, or you want to stop after the kth element, you need the stack in your own hands.",
      "So build it. The recursion's call stack was holding nodes you had gone past but not finished with. Keep exactly that.",
      "For inorder: go left as far as you can, pushing every node you pass. When you cannot go left any more, pop — that node is next in order, because everything to its left is done. Then step once to the right and start diving left again.",
      "That gives you a BST iterator with no extra work. The stack only ever holds one root-to-node path, so it is O(h) memory, and each Next costs O(1) on average across the whole traversal.",
      "Preorder is easier: push the root, then repeatedly pop and push its children — right first, because a stack reverses the order and you want left to come out first.",
      "Postorder done directly is fiddly. The trick is to do preorder but visit right before left, then reverse the whole result at the end. Same answer, a fraction of the code.",
    ],
    mentalModel: {
      lines: [
        "The stack holds nodes you have gone past but not used yet.",
        "Go left as far as you can, pop, use it, then step right.",
        "Postorder is easiest as node-right-left, reversed at the end.",
      ],
      diagram: `  push all lefts
      ┌───┐
      │ 2 │ ← visit next
      │ 5 │
      │ 7 │
      └───┘
  pop → visit → go right → push all its lefts`,
      key: "The stack is the call stack, written out by hand.",
    },
    templates: [
      {
        name: "Iterative inorder",
        filename: "iter_inorder.go",
        note: "The loop version of the recursion. Stop whenever you like.",
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
        note: "O(1) per Next on average, O(h) memory. The standard design answer.",
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
    description: "Smaller on the left, bigger on the right, so walking down is binary search.",
    concepts: ["Ordering", "Inorder sorted", "Bounds"],
    usedFor: ["ordered lookups", "insert and delete keeping order", "kth smallest", "range queries"],
    signals: ["binary search tree", "sorted order", "kth smallest", "validate", "successor", "insert into"],
    recognition: [
      "the statement says BST — every comparison halves the search",
      "an inorder traversal must come out sorted",
      "you need a predecessor, successor or rank",
    ],
    typicalQuestion: "Validate that a binary tree is a binary search tree.",
    teach: [
      "A binary search tree adds one promise to an ordinary tree: everything in a node's left subtree is smaller than it, and everything on the right is larger.",
      "That promise turns a search into a decision. Compare with the node, and one whole subtree disappears. It is binary search, walking pointers instead of indices.",
      "It also means an inorder traversal comes out sorted — left subtree, then the node, then the right. Once you notice that, 'find the kth smallest' becomes an inorder walk you stop after k steps, rather than anything clever.",
      "Insertion is easier in Go than it looks, if you let the recursion do the work. Have it return the subtree and assign the result back: root.Left = insert(root.Left, v). Then the nil case just returns a new node and it attaches itself.",
      "Deletion has one interesting case. A node with no children, or with one, is simple. A node with two cannot be removed directly, so copy in the next-largest value — the leftmost node of the right subtree — and then delete that node instead, which by definition has at most one child.",
      "Finally, be honest about the cost. All of this is O(h), the height. Balanced that is log n; fed sorted input the tree is a straight line and it is n. Say which you mean.",
    ],
    mentalModel: {
      lines: [
        "Everything on the left is smaller. Everything on the right is bigger.",
        "So each step compares once and picks a side.",
        "Reading it inorder gives you sorted values, which is half of these problems.",
      ],
      diagram: `           8
        /     \\
       3       10
      / \\        \\
     1   6        14

  search 6: 6<8 → left, 6>3 → right, found
  inorder: 1 3 6 8 10 14`,
      key: "To check a BST, carry a (low, high) range down. Comparing with children is not enough.",
    },
    templates: [
      {
        name: "Search / insert",
        filename: "bst_ops.go",
        note: "Returning the subtree from the recursion reattaches it for you.",
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
        note: "Two children: copy in the next-biggest value, then delete that one instead.",
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
        note: "Iterative inorder, stopped early. No need to walk the whole tree.",
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
    teach: [
      "Given two nodes, find the deepest node that has both of them somewhere underneath it. That node is where their two paths from the root split apart.",
      "The recursion is surprisingly short. At each node, ask the left subtree and the right subtree whether either target is down there. Return whatever you find upwards.",
      "Now the three cases. If both sides came back with something, the two targets are on opposite sides of this node — so this node is the split, and it is the answer. If only one side came back, both targets are down that way, so pass that answer along. If neither, return nothing.",
      "On a binary search tree it is simpler still: no recursion needed. Walk down from the root. While both targets are smaller than the current node, go left. While both are larger, go right. The first node where they disagree is the split.",
      "One caveat on the general version: it assumes both nodes actually exist in the tree. If they might not, it will happily return the one node it did find. If that matters, return a count alongside the node.",
    ],
    mentalModel: {
      lines: [
        "Send a signal up when you find either node.",
        "The first node that hears from both sides is the answer.",
        "In a BST it is easier: walk down while both targets sit on the same side.",
      ],
      diagram: `        3
       / \\
      5   1
     / \\
    6   2      LCA(6, 2) = 5

  left returns 6, right returns 2
  → this node is the answer`,
      key: "The LCA is simply where the two search paths split.",
    },
    templates: [
      {
        name: "Binary tree LCA",
        filename: "lca.go",
        note: "Assumes both nodes exist. If not, also return how many you found.",
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
        note: "The ordering removes the recursion completely.",
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
        note: "For many queries on a fixed tree: O(n log n) to build, O(log n) each.",
        code: `// up[v][k] = the ancestor 2^k steps above v (filled in a first DFS)
const LOG = 17

func (l *LCA) Query(u, v int) int {
    if l.depth[u] < l.depth[v] {
        u, v = v, u
    }

    // step 1: lift the deeper node to the same depth
    for diff := l.depth[u] - l.depth[v]; diff > 0; diff &= diff - 1 {
        u = l.up[u][bits.TrailingZeros(uint(diff))]
    }
    if u == v {
        return u
    }

    // step 2: lift both as high as possible while they stay apart
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
      { title: "Using the BST version on a general tree", detail: "Without the ordering rule, walking down tells you nothing." },
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
    teach: [
      "You are handed two traversals of the same tree and asked to rebuild it. It feels like there is not enough information, but between them there is exactly enough.",
      "Preorder gives you the root immediately — it is the first value. Postorder gives it to you too, as the last value.",
      "Inorder gives you the other half. Find the root inside it, and everything to its left is the left subtree, everything to its right is the right subtree. Now you know how big each side is.",
      "So take the root, split the inorder list, and recurse on the two halves with the matching slices of the preorder list. The tree assembles itself.",
      "The one thing that makes this fast or slow is finding the root inside the inorder list. Scanning for it each time is O(n) per node and the whole build becomes quadratic. Build a map from value to position once at the start and every lookup is instant.",
      "Watch the direction when you have postorder instead. You consume it from the back, and the value just before a root belongs to the right subtree — so you must build the right side before the left.",
    ],
    mentalModel: {
      lines: [
        "Preorder tells you the root first. Postorder tells you the root last.",
        "Inorder tells you how many nodes sit in the left subtree.",
        "Put those together and recurse on both sides.",
      ],
      diagram: `  pre    [3 | 9 | 20 15 7]
          root  left   right

  in     [9 | 3 | 15 20 7]
          left root right

  leftSize = index of root in inorder`,
      key: "Index the inorder positions in a map, or every node costs an O(n) scan.",
    },
    templates: [
      {
        name: "Pre + in",
        filename: "build_pre_in.go",
        note: "The map lookup is what makes this O(n) instead of O(n^2).",
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
        note: "Read postorder backwards, and build the RIGHT subtree first.",
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
        note: "Take the middle as the root and the tree comes out balanced.",
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
    teach: [
      "Rob houses laid out as a tree, where robbing a house means you cannot rob its neighbours. A single number per node cannot express this: the best total for a subtree depends on whether you touched its root.",
      "So give each node more than one answer. Here two: the best total if you rob this node, and the best if you skip it.",
      "Now the combination is obvious. If you rob this node, its children must be skipped, so add their skip values. If you skip it, each child is free to do whichever is better for itself.",
      "Every node reports both numbers to its parent, and the answer at the root is the better of its two.",
      "Why does DP work so cleanly here? Because a tree has no cycles. Once the parent has made its decision, the subtrees cannot influence one another — they are genuinely separate problems. That is also why you need no memo table: each node is visited exactly once.",
      "The pattern generalises by adding states. Covering every node with cameras needs three: has a camera, is covered by a child, is not yet covered. Write the states down first, then the transitions almost write themselves.",
    ],
    mentalModel: {
      lines: [
        "Give each node a few states, like taken or not taken.",
        "Every node reports one value per state to its parent.",
        "The parent picks the best combination the rule allows.",
      ],
      diagram: `        node
     take │ skip
         / \\
    child   child
    (skip)  (skip)      ← take forces children to skip

  take = val + Σ child.skip
  skip = Σ max(child.take, child.skip)`,
      key: "Return one value per state. A single number cannot express the trade-off.",
    },
    templates: [
      {
        name: "Two states",
        filename: "house_robber_iii.go",
        note: "Return (take, skip) together. One pass, no memo needed.",
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
        note: "On a graph-shaped tree, pass the parent down and skip it.",
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
        note: "Two passes: totals downwards, then push the outside part back down.",
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
    why: "A tree has no cycles, so once the parent has decided, the subtrees do not affect each other. That independence is exactly what DP needs, and it is why tree DP needs no memo table: each node is visited once.",
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
    teach: [
      "Find the longest path between any two nodes. The path does not have to go through the root, which is what makes this harder than it first looks.",
      "Here is the observation that cracks it. Every path in a tree has one highest node — the point where it stops going up and starts going down. Call that the bend.",
      "At the bend, the path is: the deepest reach into the left child, plus this node, plus the deepest reach into the right child. So if you visit every node and treat each one as the bend, you are guaranteed to have considered the true longest path.",
      "But there is a catch, and it is the thing people get wrong. You cannot return that combined length to your parent. A parent extending your path can only continue down one branch — going down both would make a Y, and a Y is not a path.",
      "So split the two jobs. Record the two-branch total in a variable outside the recursion, and return only the better single branch upwards. Once you see that split, maximum-path-sum is the same function with values instead of ones, and with negative branches clamped to zero because taking nothing is always allowed.",
      "On a general unweighted tree there is a neat alternative: walk to the farthest node from anywhere, then walk to the farthest node from there. That second node is the other end of a longest path.",
    ],
    mentalModel: {
      lines: [
        "Every path turns at exactly one node.",
        "At that node the path is left branch + node + right branch.",
        "But the parent can only use one branch.",
        "So record the two-branch total, and return only the better branch.",
      ],
      diagram: `        bend
       /    \\
   left      right      ← recorded globally
      ↑
   return max(left, right) + 1 to the parent`,
      key: "Record the answer with both branches. Return only one.",
    },
    templates: [
      {
        name: "Diameter",
        filename: "diameter.go",
        note: "The closure holds the best. The return value is just the depth.",
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
        note: "A negative branch is dropped with max(0, ...): taking nothing is allowed.",
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
        note: "Farthest node from anywhere, then farthest from there.",
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
    why: "Picking any node and walking to the farthest node always lands on one end of a longest path. From there, the farthest node is the other end, which is why two BFS passes find the diameter.",
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
    teach: [
      "You have a dictionary of words and you keep asking whether anything starts with a given prefix. Checking every word costs the size of the dictionary each time.",
      "But words that start the same way share a beginning, and you are re-reading that shared beginning over and over. So store it once.",
      "Build a tree where each edge is a letter, so each node stands for a prefix. 'car' and 'cat' walk the same path for two letters and then split. Looking anything up means walking the letters of the query, which costs the length of the word — no matter whether the dictionary has ten words or ten million.",
      "One detail is easy to forget. Reaching a node means the prefix exists, not that the word does. If you only ever inserted 'apple', the node at 'app' exists, so you need a flag on each node marking where a real word ends.",
      "For lowercase input, give each node a [26]*Trie array rather than a map. No hashing, better memory layout, and the code is shorter.",
      "The real payoff is pruning. Searching a grid for a hundred words, you walk the board and the trie together, and the instant the current path has no matching child you stop — you have just ruled out every word starting that way, all at once.",
    ],
    mentalModel: {
      lines: [
        "Each edge is a letter. Each node is a prefix.",
        "Looking a word up costs its length, no matter how many words you stored.",
        "A flag on the node marks where a real word ends.",
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
      key: "A trie turns 'does any word start with this?' into a short walk.",
    },
    templates: [
      {
        name: "Trie",
        filename: "trie.go",
        note: "A 26-slot array beats a map for a-z: no hashing, better cache behaviour.",
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
        note: "A '.' splits the search into every child that exists.",
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
        note: "Store the bits of each number, then greedily take the opposite bit.",
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
        note: "Walk the board and the trie together. A missing child stops you instantly.",
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
        if ch == '#' {
            return // already on the current path
        }
        next := node.children[ch-'a']
        if next == nil {
            return // no word starts like this: stop early
        }

        path = append(path, ch)
        if next.isWord {
            out = append(out, string(path))
            next.isWord = false // do not report it twice
        }

        board[r][c] = '#'
        for _, d := range dirs {
            dfs(r+d[0], c+d[1], next, path)
        }
        board[r][c] = ch
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
      { label: "Space", value: "O(total chars × alphabet)", note: "a map per node saves memory, costs speed" },
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
      "you need range answers on an array that also changes",
      "the thing you combine cannot be undone by subtracting: min, max, gcd",
      "you need to update whole ranges as well as read them, so you need lazy updates",
    ],
    typicalQuestion: "Support range sum queries and point updates on a mutable array.",
    teach: [
      "Prefix sums answer range questions instantly, but they assume the array never changes. Change one value and you have to rebuild everything after it.",
      "A segment tree keeps the speed and allows updates. Build a binary tree over the array where each node stores the answer for one slice: the root covers everything, its children cover each half, and the leaves are single elements.",
      "Now a range query is a small jigsaw. Any range you ask for can be tiled by about log n of these nodes — take the ones fully inside your range, skip the ones fully outside, and split the ones that straddle the edge. Combine their stored answers and you are done.",
      "An update is one path. Change a leaf, then walk up to the root fixing each parent, which is log n nodes.",
      "Reach for it when prefix sums cannot cope: because the array changes, or because the operation has no inverse. You can subtract a sum back out; you cannot subtract a minimum back out. Min, max and gcd all need a tree.",
      "Range updates need one more idea, called lazy propagation. Rather than pushing a change down to every leaf, record it on the highest node that is fully covered and leave a note there. Push the note one level down only when a later query needs to look inside. That keeps range updates at log n too.",
    ],
    mentalModel: {
      lines: [
        "Each node holds the answer for one slice of the array.",
        "Any range you ask for is covered by about log n of those nodes.",
        "An update touches one path from a leaf to the root.",
      ],
      diagram: `            [0..7]
          /        \\
      [0..3]        [4..7]
      /    \\        /    \\
  [0..1] [2..3] [4..5] [6..7]

  query [1..5] = [1] + [2..3] + [4..5]`,
      key: "Use it when prefix sums fail: because of updates, or because min and max cannot be undone.",
    },
    templates: [
      {
        name: "Iterative sum tree",
        filename: "segment_tree.go",
        note: "The bottom-up form. Shortest correct version, no recursion.",
        code: `// leaves live at tree[n..2n). A node's parent is always at i/2.
type SegTree struct {
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
        note: "push() pays the debt on a node and passes it to the children.",
        code: `// range add, range max. lazy[node] is an increment owed to that whole range.
type Lazy struct {
    tree, lazy []int
    n          int
}

func NewLazy(n int) *Lazy {
    return &Lazy{tree: make([]int, 4*n), lazy: make([]int, 4*n), n: n}
}

func (s *Lazy) push(node, lo, hi int) {
    if s.lazy[node] == 0 {
        return
    }
    s.tree[node] += s.lazy[node]
    if lo != hi { // pass the debt to the children
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
    if l <= lo && hi <= r { // fully covered: record and stop
        s.lazy[node] += v
        s.push(node, lo, hi)
        return
    }
    mid := (lo + hi) / 2
    s.Add(2*node, lo, mid, l, r, v)
    s.Add(2*node+1, mid+1, hi, l, r, v)
    s.tree[node] = max(s.tree[2*node], s.tree[2*node+1])
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
      { name: "Any combining rule", detail: "Swap + for min, max or gcd. Only the combine function changes." },
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
      "you only ever need totals from the start, or the difference of two of them",
      "you are counting inversions, or elements smaller than the current one",
      "the values are huge, so compress them into ranks first",
    ],
    typicalQuestion: "Support point updates and prefix sum queries on an array.",
    teach: [
      "A segment tree is powerful but long to write. If all you need is running totals with updates, there is something much shorter.",
      "The Fenwick tree hides the structure in the bits of the index. Position i is responsible for a block of values ending at i, and the size of that block is i & -i — the lowest set bit of i.",
      "To read the total up to i, add tree[i], then strip the lowest set bit and repeat. Each strip removes a bit, so you finish in at most log n steps and the blocks you touched tile the prefix exactly.",
      "To update position i, go the other way: add the lowest set bit and repeat, fixing every block that contains i. Also log n steps.",
      "That is the whole structure — about twenty lines, one array, no nodes.",
      "Two rules. It must be 1-indexed, because 0 & -0 is 0 and the update loop would never move. And it only works for operations you can subtract back out, so sums yes, minimums no. When the values are large, compress them to ranks first, which is exactly the setup for counting inversions.",
    ],
    mentalModel: {
      lines: [
        "Node i covers a block of size (i & -i) ending at i.",
        "A query walks down by clearing the lowest set bit.",
        "An update walks up by adding it. Both take log n steps.",
      ],
      diagram: `  i      binary   covers
  8      1000     [1..8]
  6      0110     [5..6]
  7      0111     [7..7]

  query(7) = tree[7] + tree[6] + tree[4]
  7 → 6 → 4 → 0   (clear the lowest bit)`,
      key: "1-indexed, always. Index 0 has no lowest set bit, so the loop never ends.",
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
        note: "Compress the values, then count how many smaller ones you have seen.",
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
        note: "Smallest index whose running total reaches the target, in O(log n).",
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
    teach: [
      "Subtree questions are easy: number the nodes in DFS order and a subtree becomes one contiguous run, which any range structure can handle.",
      "Path questions are not. The path from u to v zigzags up and down the tree, touching nodes that are nowhere near each other in any numbering.",
      "So choose the numbering carefully. At each node, look at its children and pick the one with the biggest subtree — call that edge heavy, and all the others light. Follow the heavy edges and they link into long chains. Lay each chain out contiguously.",
      "Here is why that helps. Going down a light edge means entering a subtree at most half the size of where you were. You can only halve a tree about log n times, so any root-to-node path crosses at most log n light edges. Between them, the path stays inside a single chain.",
      "So a path breaks into about log n contiguous pieces, and each piece is one range query on a segment tree. Climb from the deeper of the two chain heads, query that piece, jump to the parent above it, repeat.",
      "The cost is log squared per query: log chains times log per query. This is heavy machinery — only reach for it when path updates and path queries genuinely both appear.",
    ],
    mentalModel: {
      lines: [
        "From each node, the child with the biggest subtree is the 'heavy' one.",
        "Heavy edges link up into chains.",
        "Stepping off a chain at least halves the subtree.",
        "So any path crosses only about log n chains.",
      ],
      diagram: `  chain 1: ●─●─●─●
                 └ light
  chain 2:       ●─●
                    └ light
  chain 3:          ●

  path u→v = O(log n) chain segments
  each segment = one segment tree range query`,
      key: "Lay each chain out in a row, and every chunk of a path is one range query.",
    },
    templates: [
      {
        name: "Decomposition",
        filename: "hld.go",
        note: "Two passes: subtree sizes and heavy children, then chain heads and positions.",
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
        note: "Climb the deeper chain head each round. Each jump is one range query.",
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
      { label: "Path query", value: "O(log² n)", note: "log n chains, log n per range query" },
      { label: "Subtree query", value: "O(log n)", note: "a subtree is one run of positions" },
      { label: "Space", value: "O(n)" },
    ],
    why: "Going down a light edge means entering a subtree at most half the size, so a path from the root can only do that log n times. In between, the path stays inside one chain, and a chain is stored as one contiguous block.",
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
