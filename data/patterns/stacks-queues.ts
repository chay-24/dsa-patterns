import type { Pattern } from "../types";

export const stacksQueues: Pattern[] = [
  {
    slug: "stack",
    title: "Stack",
    category: "stacks-queues",
    description: "Last in, first out — the structure for anything that nests.",
    concepts: ["LIFO", "Matching", "Nesting"],
    usedFor: ["bracket matching", "expression evaluation", "undo semantics", "converting recursion to iteration"],
    signals: ["balanced", "parentheses", "nested", "innermost", "most recent", "undo", "evaluate expression"],
    recognition: [
      "structures nest inside each other — brackets, tags, directories",
      "the relevant item is always the most recent one",
      "you need to defer work until a closing token arrives",
      "you are converting a recursive walk into an explicit loop",
    ],
    typicalQuestion: "Determine whether a string of brackets is balanced.",
    mentalModel: {
      lines: [
        "A stack remembers unfinished business.",
        "Push when something opens, pop when it closes.",
        "In Go a stack is just a slice: append to push, reslice to pop.",
      ],
      diagram: `  ( [ {        push
        ▲
     top of stack

  }  matches {  → pop
  ]  matches [  → pop
  )  matches (  → pop
  empty at the end → balanced`,
      key: "If the natural solution wants recursion but the depth is unknown, use a stack.",
    },
    templates: [
      {
        name: "Slice as a stack",
        filename: "stack.go",
        note: "No container needed. Always check the length before popping.",
        code: `stack := []int{}

stack = append(stack, v) // push

top := stack[len(stack)-1] // peek

stack = stack[:len(stack)-1] // pop

if len(stack) == 0 {
    // empty
}`,
      },
      {
        name: "Bracket matching",
        filename: "valid_parens.go",
        note: "Push the closer you expect. Then the check is one comparison.",
        code: `func isValid(s string) bool {
    pair := map[byte]byte{'(': ')', '[': ']', '{': '}'}
    stack := make([]byte, 0, len(s))

    for i := 0; i < len(s); i++ {
        if closer, ok := pair[s[i]]; ok {
            stack = append(stack, closer)
            continue
        }
        if len(stack) == 0 || stack[len(stack)-1] != s[i] {
            return false
        }
        stack = stack[:len(stack)-1]
    }
    return len(stack) == 0
}`,
      },
      {
        name: "Min stack",
        filename: "min_stack.go",
        note: "Store the running minimum next to each value. Everything stays O(1).",
        code: `type MinStack struct {
    vals []int
    mins []int
}

func (s *MinStack) Push(v int) {
    s.vals = append(s.vals, v)
    if len(s.mins) == 0 || v < s.mins[len(s.mins)-1] {
        s.mins = append(s.mins, v)
    } else {
        s.mins = append(s.mins, s.mins[len(s.mins)-1])
    }
}

func (s *MinStack) Pop() {
    s.vals = s.vals[:len(s.vals)-1]
    s.mins = s.mins[:len(s.mins)-1]
}

func (s *MinStack) GetMin() int { return s.mins[len(s.mins)-1] }`,
      },
      {
        name: "Nested decoding",
        filename: "decode_string.go",
        note: "Two stacks side by side: one for counts, one for partial results.",
        code: `func decodeString(s string) string {
    counts := []int{}
    parts := []string{}
    cur, num := "", 0

    for i := 0; i < len(s); i++ {
        c := s[i]
        switch {
        case c >= '0' && c <= '9':
            num = num*10 + int(c-'0')
        case c == '[':
            counts = append(counts, num)
            parts = append(parts, cur)
            cur, num = "", 0
        case c == ']':
            n := counts[len(counts)-1]
            counts = counts[:len(counts)-1]
            prev := parts[len(parts)-1]
            parts = parts[:len(parts)-1]
            cur = prev + strings.Repeat(cur, n)
        default:
            cur += string(c)
        }
    }
    return cur
}`,
      },
    ],
    complexity: [
      { label: "Push", value: "O(1)", note: "amortised — append may reallocate" },
      { label: "Pop / Peek", value: "O(1)" },
      { label: "Space", value: "O(n)" },
    ],
    variations: [
      { name: "Two stacks for a queue", detail: "An in-stack and an out-stack. Refill only when out is empty, so each item moves twice." },
      { name: "Stack with an aggregate", detail: "Min, max or sum can be carried per entry for O(1) queries." },
      { name: "Explicit recursion stack", detail: "Push a frame struct when converting a recursive DFS to a loop." },
      { name: "Monotonic stack", detail: "Keep the stack sorted and it answers next-greater questions in one pass." },
    ],
    mistakes: [
      { title: "Popping an empty stack", detail: "stack[len(stack)-1] panics at length zero. Guard every pop." },
      { title: "Keeping a stale pointer into the slice", detail: "append may move the backing array; re-read the top rather than caching an index." },
      { title: "Forgetting the final emptiness check", detail: "'(((' never fails during the scan — only at the end." },
    ],
    related: ["monotonic-stack", "queue", "iterative-traversal", "graph-dfs"],
    problems: [20, 155, 150, 71, 394, 227, 224, 232, 225],
  },
  {
    slug: "queue",
    title: "Queue",
    category: "stacks-queues",
    description: "First in, first out — the structure that makes breadth-first anything possible.",
    concepts: ["FIFO", "Levels", "Streams"],
    usedFor: ["BFS", "level-order traversal", "task scheduling", "time-window streams"],
    signals: ["level by level", "shortest number of steps", "in order of arrival", "process in waves", "recent calls"],
    recognition: [
      "you must process items in arrival order",
      "the problem is about levels, waves or rounds",
      "unweighted shortest path — BFS needs a queue",
      "a sliding time window over a stream of events",
    ],
    typicalQuestion: "Return a binary tree's nodes level by level.",
    mentalModel: {
      lines: [
        "A queue is a to-do list: found, but not dealt with yet.",
        "In Go, a slice with a moving front is the idiomatic queue.",
        "Freeze the length at the top of the loop to handle exactly one level.",
      ],
      diagram: `  enqueue ─▶ [ a  b  c ] ─▶ dequeue
                ▲       ▲
              head     tail

  level size = len(queue) at the start of the round`,
      key: "BFS reaches nodes in distance order, so the first time you arrive is the shortest way.",
    },
    templates: [
      {
        name: "Slice queue",
        filename: "queue.go",
        note: "Reslicing the front is O(1). The old prefix is freed later.",
        code: `queue := []int{start}

for len(queue) > 0 {
    v := queue[0]
    queue = queue[1:] // dequeue

    for _, next := range neighbours(v) {
        queue = append(queue, next)
    }
}`,
      },
      {
        name: "Level by level",
        filename: "level_order.go",
        note: "The frozen size is what keeps one level from bleeding into the next.",
        code: `func levelOrder(root *TreeNode) [][]int {
    if root == nil {
        return nil
    }
    var out [][]int
    queue := []*TreeNode{root}

    for len(queue) > 0 {
        size := len(queue) // freeze this level
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
        name: "Ring buffer",
        filename: "ring_queue.go",
        note: "When memory must stay fixed, use an array with a head and a count.",
        code: `type Ring struct {
    buf   []int
    head  int
    count int
}

func NewRing(n int) *Ring { return &Ring{buf: make([]int, n)} }

func (q *Ring) Push(v int) bool {
    if q.count == len(q.buf) {
        return false
    }
    q.buf[(q.head+q.count)%len(q.buf)] = v
    q.count++
    return true
}

func (q *Ring) Pop() (int, bool) {
    if q.count == 0 {
        return 0, false
    }
    v := q.buf[q.head]
    q.head = (q.head + 1) % len(q.buf)
    q.count--
    return v, true
}`,
      },
    ],
    complexity: [
      { label: "Enqueue", value: "O(1)", note: "amortised" },
      { label: "Dequeue", value: "O(1)" },
      { label: "BFS", value: "O(V + E)" },
      { label: "Space", value: "O(width)", note: "the widest level dominates" },
    ],
    variations: [
      { name: "Deque", detail: "Push and pop at both ends. Needed for window maximums and 0-1 BFS." },
      { name: "Priority queue", detail: "Ordered by priority rather than arrival; that is a heap." },
      { name: "Circular queue", detail: "Fixed capacity with wrap-around indices." },
      { name: "Multi-source BFS", detail: "Seed the queue with every source at once." },
    ],
    mistakes: [
      { title: "Not snapshotting the level size", detail: "len(queue) changes as you append children, so levels bleed into one another." },
      { title: "Marking visited on dequeue instead of enqueue", detail: "A node can be enqueued many times before it is processed, blowing up the queue." },
      { title: "Worrying about queue = queue[1:] leaking", detail: "It holds the prefix alive, but for interview-sized inputs this is a non-issue." },
    ],
    related: ["bfs-queue", "deque", "circular-queue", "graph-bfs"],
    problems: [102, 103, 199, 515, 933, 232, 225],
  },
  {
    slug: "deque",
    title: "Deque & Monotonic Queue",
    category: "stacks-queues",
    description: "A queue open at both ends, kept sorted so the window maximum is always at the front.",
    concepts: ["Both ends", "Window max", "Monotonic"],
    usedFor: ["sliding window maximum", "constrained DP transitions", "0-1 BFS", "shortest subarray with negatives"],
    signals: ["maximum of every window", "minimum in a range", "window of size k", "at most k apart", "0-1 weights"],
    recognition: [
      "you need the max or min of a sliding window and cannot subtract it away",
      "a DP transition looks back over a bounded range and takes a max or min",
      "edges weigh only 0 or 1 — a deque replaces Dijkstra's heap",
      "prefix sums plus a 'shortest valid' constraint, with negatives in play",
    ],
    typicalQuestion: "Return the maximum of every window of size k.",
    mentalModel: {
      lines: [
        "Keep a list of indices that could still win.",
        "Before adding i, drop everything older and worse. It can never win again.",
        "The front is always the answer for the current window.",
      ],
      diagram: `  values  1  3  -1  -3  5
  deque (decreasing values, by index)

  push 3 → pops 1     (1 can never be the max again)
  push 5 → pops -3,-1 (all dominated)

  front = window max`,
      key: "An element is useless the moment a newer, better one arrives. Delete it right away.",
    },
    templates: [
      {
        name: "Window maximum",
        filename: "window_max.go",
        note: "Each index goes in once and comes out once, so the whole scan is O(n).",
        code: `func maxSlidingWindow(nums []int, k int) []int {
    dq := []int{} // indices, values decreasing
    out := make([]int, 0, len(nums)-k+1)

    for i, v := range nums {
        // drop indices that have left the window
        if len(dq) > 0 && dq[0] <= i-k {
            dq = dq[1:]
        }
        // drop dominated indices
        for len(dq) > 0 && nums[dq[len(dq)-1]] <= v {
            dq = dq[:len(dq)-1]
        }
        dq = append(dq, i)

        if i >= k-1 {
            out = append(out, nums[dq[0]])
        }
    }
    return out
}`,
      },
      {
        name: "Shortest subarray with negatives",
        filename: "shortest_at_least_k.go",
        note: "Plain windows break once values can be negative. A deque over running totals does not.",
        code: `func shortestSubarray(nums []int, k int) int {
    n := len(nums)
    p := make([]int, n+1)
    for i, v := range nums {
        p[i+1] = p[i] + v
    }

    dq := []int{} // indices into p, values increasing
    best := n + 1

    for i, cur := range p {
        for len(dq) > 0 && cur-p[dq[0]] >= k {
            best = min(best, i-dq[0])
            dq = dq[1:] // this start can never do better
        }
        for len(dq) > 0 && p[dq[len(dq)-1]] >= cur {
            dq = dq[:len(dq)-1] // a larger earlier prefix is useless
        }
        dq = append(dq, i)
    }
    if best == n+1 {
        return -1
    }
    return best
}`,
      },
      {
        name: "DP with a window",
        filename: "constrained_dp.go",
        note: "dp[i] needs the best of the last k values. The deque hands that over in O(1).",
        code: `func constrainedSubsetSum(nums []int, k int) int {
    dp := make([]int, len(nums))
    dq := []int{}
    best := math.MinInt

    for i, v := range nums {
        if len(dq) > 0 && dq[0] < i-k {
            dq = dq[1:]
        }
        dp[i] = v
        if len(dq) > 0 && dp[dq[0]] > 0 {
            dp[i] += dp[dq[0]]
        }
        best = max(best, dp[i])

        for len(dq) > 0 && dp[dq[len(dq)-1]] <= dp[i] {
            dq = dq[:len(dq)-1]
        }
        dq = append(dq, i)
    }
    return best
}`,
      },
    ],
    complexity: [
      { label: "Per element", value: "O(1)", note: "on average: one push, one pop each" },
      { label: "Whole scan", value: "O(n)" },
      { label: "Space", value: "O(k)", note: "the deque never exceeds the window" },
    ],
    why: "The deque holds exactly the indices that could still be the answer for some future window. When a newer value arrives that is at least as good, every older weaker value is beaten forever, so dropping it is free and the front stays correct.",
    variations: [
      { name: "Window minimum", detail: "Flip the comparison to keep values increasing." },
      { name: "0-1 BFS", detail: "Push zero-weight edges to the front and one-weight edges to the back — Dijkstra without a heap." },
      { name: "Both extremes at once", detail: "Two deques give max and min of the same window, for 'absolute difference at most limit' problems." },
    ],
    mistakes: [
      { title: "Storing values instead of indices", detail: "Without indices you cannot tell when an entry has left the window." },
      { title: "Evicting expired entries in the wrong order", detail: "Do the front expiry check before pushing, so the front is valid when you read it." },
      { title: "Using <= versus < inconsistently", detail: "For strict maxima, popping on equality is still correct and keeps the deque smaller." },
    ],
    related: ["monotonic-stack", "fixed-sliding-window", "queue", "linear-dp"],
    problems: [239, 862, 641, 1425],
  },
  {
    slug: "monotonic-stack",
    title: "Monotonic Stack",
    category: "stacks-queues",
    description: "A stack kept sorted, so every pop discovers the answer for the element popped.",
    concepts: ["Increasing", "Decreasing", "Span"],
    usedFor: ["next/previous greater or smaller", "histogram rectangles", "span problems", "contribution counting"],
    signals: ["next greater", "next smaller", "previous greater", "previous smaller", "nearest", "histogram", "warmer", "span"],
    recognition: [
      "for each element you need the nearest element on one side satisfying a comparison",
      "the brute force is a nested loop scanning outwards from each index",
      "the problem asks about spans, ranges bounded by larger or smaller values",
      "you are counting each element's contribution as a minimum or maximum",
    ],
    typicalQuestion: "For each day, how many days until a warmer temperature?",
    mentalModel: {
      lines: [
        "Keep the stack sorted, either increasing or decreasing.",
        "When a new value breaks that order, pop.",
        "Whatever you pop has just found its answer: the new value.",
      ],
      diagram: `  decreasing stack (for next greater)

  push 73, 74 arrives
  74 > 73 → pop 73, its answer is 74

  [ 75  71  69 ]   ← still waiting
              ▲ top`,
      key: "The pop is the event. Record whatever you need right there.",
    },
    templates: [
      {
        name: "Next greater",
        filename: "next_greater.go",
        note: "Decreasing stack of indices. Anything left at the end has no answer.",
        code: `func nextGreater(nums []int) []int {
    out := make([]int, len(nums))
    for i := range out {
        out[i] = -1
    }
    stack := []int{} // indices, values decreasing

    for i, v := range nums {
        for len(stack) > 0 && nums[stack[len(stack)-1]] < v {
            j := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            out[j] = v // v is the first greater value right of j
        }
        stack = append(stack, i)
    }
    return out
}`,
      },
      {
        name: "Previous smaller",
        filename: "previous_smaller.go",
        note: "Increasing stack. After popping, the top is the nearest smaller to the left.",
        code: `func previousSmaller(nums []int) []int {
    out := make([]int, len(nums))
    stack := []int{} // indices, values increasing

    for i, v := range nums {
        for len(stack) > 0 && nums[stack[len(stack)-1]] >= v {
            stack = stack[:len(stack)-1]
        }
        if len(stack) == 0 {
            out[i] = -1
        } else {
            out[i] = stack[len(stack)-1]
        }
        stack = append(stack, i)
    }
    return out
}`,
      },
      {
        name: "Circular",
        filename: "circular_nge.go",
        note: "Go round twice, index modulo n, and only push on the first lap.",
        code: `func nextGreaterCircular(nums []int) []int {
    n := len(nums)
    out := make([]int, n)
    for i := range out {
        out[i] = -1
    }
    stack := []int{}

    for i := 0; i < 2*n; i++ {
        v := nums[i%n]
        for len(stack) > 0 && nums[stack[len(stack)-1]] < v {
            j := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            out[j] = v
        }
        if i < n {
            stack = append(stack, i)
        }
    }
    return out
}`,
      },
      {
        name: "Contribution counting",
        filename: "subarray_minimums.go",
        note: "Instead of listing subarrays, count how many each element rules.",
        code: `// a[i] is the minimum of (i - prev[i]) * (next[i] - i) subarrays
func sumSubarrayMins(a []int) int {
    const mod = 1_000_000_007
    prev, next := smallerBounds(a) // see next smaller element

    total := 0
    for i, v := range a {
        left := i - prev[i]  // choices for the start
        right := next[i] - i // choices for the end
        total = (total + v*left%mod*right) % mod
    }
    return total
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n)", note: "each index goes on once, off once" },
      { label: "Space", value: "O(n)", note: "at worst the whole array is on it" },
    ],
    why: "The inner loop looks like it could be quadratic, but every turn of it removes an index for good. At most n indices ever go on the stack, so at most n come off across the whole scan.",
    variations: [
      { name: "Four flavours", detail: "next/previous × greater/smaller. Direction of iteration picks next vs previous; the comparison picks greater vs smaller." },
      { name: "Strict versus non-strict", detail: "Using >= instead of > decides how ties are attributed — critical for contribution counting to avoid double counting." },
      { name: "Sentinel values", detail: "Appending a 0 or -infinity at the end flushes the stack without a separate cleanup loop." },
      { name: "Smallest-string greedy", detail: "Remove-k-digits keeps the stack increasing while you still have removals left." },
    ],
    mistakes: [
      { title: "Storing values instead of indices", detail: "Distances and spans need positions." },
      { title: "Double counting on ties", detail: "Make one side strict and the other non-strict, or equal values are counted twice." },
      { title: "Forgetting the leftovers", detail: "Indices still on the stack at the end have no answer — initialise the output accordingly." },
      { title: "Stack sorted the wrong way", detail: "Next greater needs a decreasing stack. Write down which comparison pops before you code." },
    ],
    related: ["next-greater-element", "next-smaller-element", "largest-rectangle", "deque"],
    problems: [739, 496, 503, 84, 85, 907, 402, 316, 42, 901, 1019],
  },
  {
    slug: "next-greater-element",
    title: "Next Greater Element",
    category: "stacks-queues",
    description: "For every position, the first larger value to its right. The classic monotonic stack.",
    concepts: ["Right scan", "Decreasing stack", "Circular"],
    usedFor: ["waiting-time problems", "next larger lookups", "circular variants"],
    signals: ["next greater", "next warmer", "first larger to the right", "days until", "circular array"],
    recognition: [
      "each element waits for the first bigger element after it",
      "the answer is a distance or a value, one per index",
      "a circular array turns the same question into two passes",
    ],
    typicalQuestion: "For each element, find the next greater element to its right.",
    mentalModel: {
      lines: [
        "Keep a stack of indices still waiting for an answer.",
        "A bigger value arrives and settles every index it beats.",
        "Whatever is still waiting at the end never gets one.",
      ],
      diagram: `  73 74 75 71 69 72

  74 resolves 73     → 1 day
  75 resolves 74     → 1 day
  72 resolves 69, 71 → 1, 2 days
  75 never resolved  → 0`,
      key: "Sweep left to right with a decreasing stack. Every pop answers one question.",
    },
    templates: [
      {
        name: "Distances",
        filename: "daily_temperatures.go",
        note: "Record i - j, not the value, when the question is 'how long until'.",
        code: `func dailyTemperatures(t []int) []int {
    out := make([]int, len(t))
    stack := []int{}

    for i, v := range t {
        for len(stack) > 0 && t[stack[len(stack)-1]] < v {
            j := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            out[j] = i - j
        }
        stack = append(stack, i)
    }
    return out // unresolved entries stay 0
}`,
      },
      {
        name: "Via a lookup map",
        filename: "nge_map.go",
        note: "When the query list is a subset, precompute over the full array first.",
        code: `func nextGreaterElementI(nums1, nums2 []int) []int {
    next := map[int]int{}
    stack := []int{}

    for _, v := range nums2 {
        for len(stack) > 0 && stack[len(stack)-1] < v {
            next[stack[len(stack)-1]] = v
            stack = stack[:len(stack)-1]
        }
        stack = append(stack, v)
    }

    out := make([]int, len(nums1))
    for i, v := range nums1 {
        if g, ok := next[v]; ok {
            out[i] = g
        } else {
            out[i] = -1
        }
    }
    return out
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n)" },
      { label: "Space", value: "O(n)" },
    ],
    variations: [
      { name: "Next greater or equal", detail: "Change < to <= in the pop condition." },
      { name: "Circular", detail: "Two passes over the array, pushing only in the first." },
      { name: "On a linked list", detail: "Collect values into a slice first, or push nodes as you walk." },
    ],
    mistakes: [
      { title: "Default value not set", detail: "Indices with no next greater must be -1 (or 0 for distances) — initialise deliberately." },
      { title: "Stack of values when distances are wanted", detail: "Distances need indices." },
      { title: "Pushing during the second circular pass", detail: "It would produce duplicate answers." },
    ],
    related: ["monotonic-stack", "next-smaller-element", "stock-span", "deque"],
    problems: [496, 503, 739, 1019],
  },
  {
    slug: "next-smaller-element",
    title: "Next Smaller Element",
    category: "stacks-queues",
    description: "The mirror image: the nearest smaller value on one side, which defines a value's range of dominance.",
    concepts: ["Increasing stack", "Boundaries", "Contribution"],
    usedFor: ["histogram boundaries", "range where an element is the minimum", "contribution counting"],
    signals: ["next smaller", "previous smaller", "nearest smaller", "range where it is the minimum", "histogram"],
    recognition: [
      "you need the span over which an element stays the minimum",
      "rectangles or ranges are bounded by the first smaller value on each side",
      "you are summing a quantity over all subarrays where each element is the extreme",
    ],
    typicalQuestion: "For each element, find the span in which it is the minimum.",
    mentalModel: {
      lines: [
        "Find the nearest smaller value on the left and on the right.",
        "Between those two walls, this element is the smallest.",
        "That window is exactly where it counts.",
      ],
      diagram: `  a =  2  1  5  6  2  3
             ▲
        for a[2]=5: prev smaller = 1 (idx 1)
                    next smaller = 2 (idx 4)
        span = indices 2..3, width 2`,
      key: "Make one side strict and the other not, or equal values get counted twice.",
    },
    templates: [
      {
        name: "Both boundaries",
        filename: "smaller_bounds.go",
        note: "Left uses >= and right uses >, so a tie is broken exactly once.",
        code: `func smallerBounds(a []int) (prev, next []int) {
    n := len(a)
    prev = make([]int, n)
    next = make([]int, n)
    stack := []int{}

    for i := 0; i < n; i++ {
        for len(stack) > 0 && a[stack[len(stack)-1]] >= a[i] {
            stack = stack[:len(stack)-1]
        }
        prev[i] = -1
        if len(stack) > 0 {
            prev[i] = stack[len(stack)-1]
        }
        stack = append(stack, i)
    }

    stack = stack[:0]
    for i := n - 1; i >= 0; i-- {
        for len(stack) > 0 && a[stack[len(stack)-1]] > a[i] {
            stack = stack[:len(stack)-1]
        }
        next[i] = n
        if len(stack) > 0 {
            next[i] = stack[len(stack)-1]
        }
        stack = append(stack, i)
    }
    return prev, next
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n)", note: "two passes, each amortised linear" },
      { label: "Space", value: "O(n)" },
    ],
    variations: [
      { name: "Sum of subarray minimums", detail: "Multiply each value by the count of subarrays it dominates." },
      { name: "Sum of subarray ranges", detail: "Do it twice — once for minimums, once for maximums — and subtract." },
      { name: "Histogram", detail: "The same boundaries give each bar's maximal rectangle." },
    ],
    mistakes: [
      { title: "Symmetric tie handling", detail: "Using >= on both sides double counts every duplicate run." },
      { title: "Sentinel confusion", detail: "prev = -1 and next = n make the width arithmetic uniform — do not use 0 and n-1." },
    ],
    related: ["monotonic-stack", "largest-rectangle", "next-greater-element"],
    problems: [907, 84, 85],
  },
  {
    slug: "stock-span",
    title: "Stock Span",
    category: "stacks-queues",
    description: "How far back a run of values stays at or below today's — previous-greater, answered online.",
    concepts: ["Online", "Previous greater", "Span collapse"],
    usedFor: ["streaming span queries", "consecutive-run counting", "online monotonic problems"],
    signals: ["consecutive days", "span", "streaming", "online", "since the last greater"],
    recognition: [
      "input arrives one element at a time and each query must be answered immediately",
      "the answer is a count of consecutive previous elements satisfying a comparison",
      "you cannot look ahead, so the offline two-pass approach is unavailable",
    ],
    typicalQuestion: "For each incoming price, how many consecutive previous days were at most as high?",
    mentalModel: {
      lines: [
        "Keep a decreasing stack of (value, span) pairs.",
        "A bigger value swallows the spans of everything it pops.",
        "The total it swallowed is the answer.",
      ],
      diagram: `  prices  100  80  60  70  60  75

  75 pops 60(span 1) and 70(span 2)
     → span = 1 + 1 + 2 = 4

  stack: (100,1) (80,1) (75,4)`,
      key: "Folding spans into the survivor is what keeps this O(1) on average.",
    },
    templates: [
      {
        name: "Online span",
        filename: "stock_span.go",
        note: "Each price goes on once and comes off once across the whole stream.",
        code: `type StockSpanner struct {
    stack [][2]int // {price, span}
}

func (s *StockSpanner) Next(price int) int {
    span := 1
    for len(s.stack) > 0 && s.stack[len(s.stack)-1][0] <= price {
        span += s.stack[len(s.stack)-1][1]
        s.stack = s.stack[:len(s.stack)-1]
    }
    s.stack = append(s.stack, [2]int{price, span})
    return span
}`,
      },
    ],
    complexity: [
      { label: "Next", value: "O(1)", note: "amortised across the stream" },
      { label: "Space", value: "O(n)" },
    ],
    variations: [
      { name: "Span of smaller values", detail: "Flip the comparison to keep an increasing stack." },
      { name: "Offline equivalent", detail: "With the whole array available, previousGreater gives the same answer by subtraction." },
      { name: "Windowed span", detail: "Cap the span at a window length by also storing indices." },
    ],
    mistakes: [
      { title: "Forgetting to absorb the popped span", detail: "Counting pops instead of summing spans undercounts every collapsed run." },
      { title: "Using < instead of <=", detail: "Equal prices count towards the span in the standard problem." },
    ],
    related: ["monotonic-stack", "next-greater-element", "stack"],
    problems: [901, 739, 496],
  },
  {
    slug: "largest-rectangle",
    title: "Largest Rectangle in Histogram",
    category: "stacks-queues",
    description: "Every bar's maximal rectangle is bounded by the first shorter bar on each side.",
    concepts: ["Histogram", "Boundaries", "Row sweep"],
    usedFor: ["maximum rectangle in a histogram", "maximal rectangle in a binary matrix", "area under constraints"],
    signals: ["histogram", "largest rectangle", "maximal area", "binary matrix of 1s", "bars"],
    recognition: [
      "an area is limited by the minimum element inside a range",
      "the input is a histogram, or can be turned into one row by row",
      "the brute force is 'for each pair of boundaries, find the minimum'",
    ],
    typicalQuestion: "Find the largest rectangle that fits inside a histogram.",
    mentalModel: {
      lines: [
        "Pick a bar and call it the shortest one in the rectangle.",
        "Stretch left and right until you hit something shorter.",
        "That width times this height is the best rectangle for this bar.",
      ],
      diagram: `        ┌─┐
    ┌─┐ │ │
    │ │ │ │ ┌─┐
  ┌─┤ ├─┤ ├─┤ │
  │ │ │ │ │ │ │
  2  1  5  6  2

  bar 5: left bound idx1, right bound idx4 → width 2, area 10`,
      key: "The stack pop hands you both walls at once.",
    },
    templates: [
      {
        name: "Histogram",
        filename: "largest_rectangle.go",
        note: "The 0 at the end forces everything still on the stack to be flushed.",
        code: `func largestRectangleArea(heights []int) int {
    stack := []int{} // indices, heights increasing
    best := 0

    for i := 0; i <= len(heights); i++ {
        h := 0 // sentinel: forces a full flush
        if i < len(heights) {
            h = heights[i]
        }

        for len(stack) > 0 && heights[stack[len(stack)-1]] >= h {
            top := stack[len(stack)-1]
            stack = stack[:len(stack)-1]

            width := i
            if len(stack) > 0 {
                width = i - stack[len(stack)-1] - 1
            }
            best = max(best, heights[top]*width)
        }
        stack = append(stack, i)
    }
    return best
}`,
      },
      {
        name: "Maximal rectangle",
        filename: "maximal_rectangle.go",
        note: "Build a histogram per row, then run the histogram solver on each.",
        code: `func maximalRectangle(matrix [][]byte) int {
    if len(matrix) == 0 {
        return 0
    }
    heights := make([]int, len(matrix[0]))
    best := 0

    for _, row := range matrix {
        for c, ch := range row {
            if ch == '1' {
                heights[c]++
            } else {
                heights[c] = 0 // the column is broken
            }
        }
        best = max(best, largestRectangleArea(heights))
    }
    return best
}`,
      },
    ],
    complexity: [
      { label: "Histogram", value: "O(n)" },
      { label: "Matrix", value: "O(rows · cols)" },
      { label: "Space", value: "O(cols)" },
    ],
    why: "Every bar has exactly one biggest rectangle in which it is the shortest bar. Those n rectangles include the winner, and the stack finds all n in one pass because each pop reveals both walls.",
    variations: [
      { name: "Trapping rain water", detail: "Same boundary idea inverted — the water level is the minimum of the two enclosing maxima." },
      { name: "Maximal square", detail: "Easier as a DP: dp = 1 + min of three neighbours." },
      { name: "Skyline", detail: "Also a boundary sweep, but the natural tool there is a heap." },
    ],
    mistakes: [
      { title: "Getting the width wrong after a pop", detail: "It is i - stack.top - 1, not i - top. The new top is the left boundary." },
      { title: "Forgetting the sentinel", detail: "Without it, an increasing histogram never flushes and the answer is missed." },
      { title: "Not resetting a broken column", detail: "In the matrix version a '0' must zero the height, not decrement it." },
    ],
    related: ["monotonic-stack", "next-smaller-element", "grid-dp", "two-pointers"],
    problems: [84, 85, 42, 221],
  },
  {
    slug: "bfs-queue",
    title: "BFS Queue Processing",
    category: "stacks-queues",
    description: "The queue discipline that makes breadth-first search return shortest paths.",
    concepts: ["Levels", "Visited", "Frontier"],
    usedFor: ["shortest path on unweighted graphs", "level counting", "spreading processes", "state-space search"],
    signals: ["minimum number of steps", "shortest path", "fewest moves", "level", "spread", "nearest"],
    recognition: [
      "every move costs the same — that is what makes BFS optimal",
      "the question asks for a minimum count of steps or rounds",
      "states can be enumerated and the graph is implicit",
      "many sources spread at once — seed them all",
    ],
    typicalQuestion: "What is the minimum number of moves to reach the target state?",
    mentalModel: {
      lines: [
        "BFS spreads out in rings, one step at a time.",
        "So the first time you reach a node, you got there the fastest way.",
        "Mark a node the moment you queue it, never when you take it out.",
      ],
      diagram: `  level 0     ●
  level 1   ● ● ●
  level 2  ● ● ● ● ●

  queue holds one frontier at a time
  distance = number of levels expanded`,
      key: "Mark visited when you enqueue. Marking on dequeue is the classic blow-up.",
    },
    templates: [
      {
        name: "Level counting",
        filename: "bfs_levels.go",
        note: "The frozen size turns rings into a step counter.",
        code: `func shortestSteps(start State, isGoal func(State) bool, next func(State) []State) int {
    seen := map[State]bool{start: true}
    queue := []State{start}
    steps := 0

    for len(queue) > 0 {
        size := len(queue)
        for i := 0; i < size; i++ {
            cur := queue[0]
            queue = queue[1:]

            if isGoal(cur) {
                return steps
            }
            for _, n := range next(cur) {
                if !seen[n] {
                    seen[n] = true // mark on enqueue
                    queue = append(queue, n)
                }
            }
        }
        steps++
    }
    return -1
}`,
      },
      {
        name: "Distance array",
        filename: "bfs_dist.go",
        note: "When you want every distance, store them instead of counting rings.",
        code: `func bfsDistances(adj [][]int, src int) []int {
    dist := make([]int, len(adj))
    for i := range dist {
        dist[i] = -1
    }
    dist[src] = 0
    queue := []int{src}

    for len(queue) > 0 {
        u := queue[0]
        queue = queue[1:]
        for _, v := range adj[u] {
            if dist[v] == -1 {
                dist[v] = dist[u] + 1
                queue = append(queue, v)
            }
        }
    }
    return dist
}`,
      },
      {
        name: "Grid BFS",
        filename: "grid_bfs.go",
        note: "A direction table keeps the bounds check in one place.",
        code: `var dirs = [4][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}

func gridBFS(grid [][]int, sr, sc int) [][]int {
    rows, cols := len(grid), len(grid[0])
    dist := make([][]int, rows)
    for i := range dist {
        dist[i] = make([]int, cols)
        for j := range dist[i] {
            dist[i][j] = -1
        }
    }

    dist[sr][sc] = 0
    queue := [][2]int{{sr, sc}}

    for len(queue) > 0 {
        cur := queue[0]
        queue = queue[1:]
        r, c := cur[0], cur[1]

        for _, d := range dirs {
            nr, nc := r+d[0], c+d[1]
            if nr < 0 || nr >= rows || nc < 0 || nc >= cols {
                continue
            }
            if dist[nr][nc] != -1 || grid[nr][nc] == 1 {
                continue
            }
            dist[nr][nc] = dist[r][c] + 1
            queue = append(queue, [2]int{nr, nc})
        }
    }
    return dist
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(V + E)" },
      { label: "Grid", value: "O(rows · cols)" },
      { label: "Space", value: "O(V)", note: "the ring can be as wide as the graph" },
    ],
    variations: [
      { name: "Multi-source", detail: "Seed the queue with every source at distance 0." },
      { name: "Bidirectional", detail: "Search from both ends and meet in the middle — roughly square-roots the frontier." },
      { name: "0-1 BFS", detail: "Weights of 0 and 1 only: use a deque, pushing 0-edges to the front." },
      { name: "State-space BFS", detail: "The node is a tuple (position, mask, keys) — same algorithm, richer key." },
    ],
    mistakes: [
      { title: "Marking visited on dequeue", detail: "The same node gets enqueued many times; the queue explodes and the run degrades badly." },
      { title: "Using BFS on weighted edges", detail: "Unequal costs break the ring logic. You need Dijkstra." },
      { title: "Forgetting the level snapshot", detail: "Without it, the step count is wrong." },
      { title: "Checking the goal only on enqueue or only on dequeue", detail: "Pick one and be consistent; checking on enqueue exits one level earlier." },
    ],
    related: ["graph-bfs", "multi-source-bfs", "queue", "shortest-path"],
    problems: [102, 994, 542, 1091, 127, 752, 815, 45],
  },
  {
    slug: "circular-queue",
    title: "Circular Queue",
    category: "stacks-queues",
    description: "A fixed-size buffer where indices wrap — constant memory, constant time.",
    concepts: ["Ring", "Modulo", "Capacity"],
    usedFor: ["bounded buffers", "fixed-capacity queues and deques", "streaming windows"],
    signals: ["fixed capacity", "circular", "design a queue", "ring buffer", "bounded"],
    recognition: [
      "the capacity is fixed and known up front",
      "memory must not grow with the number of operations",
      "you are asked to design a queue or deque with O(1) operations",
    ],
    typicalQuestion: "Design a circular queue with O(1) enqueue and dequeue.",
    mentalModel: {
      lines: [
        "Store a head and a count, not a head and a tail.",
        "The tail is just (head + count) mod capacity.",
        "Every index goes through one modulo.",
      ],
      diagram: `  capacity 5, head = 3, count = 4

  idx  0   1   2   3   4
      [c] [d]  ·  [a] [b]
                   ▲head
  tail = (3 + 4) % 5 = 2`,
      key: "head plus count beats head plus tail: full and empty stop looking the same.",
    },
    templates: [
      {
        name: "Circular queue",
        filename: "circular_queue.go",
        note: "No wasted slot, no ambiguity, every operation O(1).",
        code: `type MyCircularQueue struct {
    buf   []int
    head  int
    count int
}

func Constructor(k int) MyCircularQueue {
    return MyCircularQueue{buf: make([]int, k)}
}

func (q *MyCircularQueue) EnQueue(v int) bool {
    if q.count == len(q.buf) {
        return false
    }
    q.buf[(q.head+q.count)%len(q.buf)] = v
    q.count++
    return true
}

func (q *MyCircularQueue) DeQueue() bool {
    if q.count == 0 {
        return false
    }
    q.head = (q.head + 1) % len(q.buf)
    q.count--
    return true
}

func (q *MyCircularQueue) Front() int { return q.buf[q.head] }
func (q *MyCircularQueue) Rear() int  { return q.buf[(q.head+q.count-1)%len(q.buf)] }`,
      },
      {
        name: "Circular deque",
        filename: "circular_deque.go",
        note: "Pushing to the front moves head backwards, so add len before the modulo.",
        code: `func (q *MyCircularDeque) InsertFront(v int) bool {
    if q.IsFull() {
        return false
    }
    q.head = (q.head - 1 + len(q.buf)) % len(q.buf) // avoid a negative index
    q.buf[q.head] = v
    q.count++
    return true
}

func (q *MyCircularDeque) DeleteLast() bool {
    if q.IsEmpty() {
        return false
    }
    q.count-- // the tail is derived, so nothing else to update
    return true
}`,
      },
    ],
    complexity: [
      { label: "All operations", value: "O(1)" },
      { label: "Space", value: "O(k)", note: "exactly the declared capacity" },
    ],
    variations: [
      { name: "Head + tail with a sacrificed slot", detail: "The classic alternative: leave one slot empty so full and empty differ." },
      { name: "Growable ring", detail: "On overflow, allocate double and copy in two memcpys." },
      { name: "Overwrite-oldest", detail: "For streaming windows, enqueue on a full buffer evicts the head instead of failing." },
    ],
    mistakes: [
      { title: "Negative modulo in Go", detail: "(head-1) % n can be negative. Always add n first." },
      { title: "head == tail ambiguity", detail: "With head and tail alone, full and empty look identical. Keep a count." },
      { title: "Rear index off by one", detail: "It is (head + count - 1) % n, and only valid when count > 0." },
    ],
    related: ["queue", "deque", "arrays"],
    problems: [622, 641, 933],
  },
  {
    slug: "heap",
    title: "Priority Queue / Heap",
    category: "stacks-queues",
    description: "Keep only the extremes ordered — the best element in O(1), insertion in O(log n).",
    concepts: ["Top-k", "Two heaps", "Scheduling"],
    usedFor: ["top-k queries", "running medians", "merging sorted streams", "greedy selection", "Dijkstra"],
    signals: ["k largest", "k smallest", "top k", "median of a stream", "merge k lists", "always pick the best", "schedule"],
    recognition: [
      "you repeatedly need the current best element while the set keeps changing",
      "the problem says 'k largest' and k is much smaller than n",
      "a greedy algorithm needs the extreme element at each step",
      "you are merging many sorted sequences",
    ],
    typicalQuestion: "Find the k-th largest element in a stream.",
    mentalModel: {
      lines: [
        "A heap only keeps the path to the top sorted.",
        "That is enough to read the best element instantly and fix the rest in log n.",
        "For the k largest, keep a MIN-heap of size k.",
        "Its root is the weakest one you are still holding.",
      ],
      diagram: `  k largest of n, k = 3

  min-heap [7, 9, 12]
            ▲ root = weakest kept

  new 10 > 7 → pop 7, push 10
  new  4 < 7 → ignore`,
      key: "k largest wants a min-heap. k smallest wants a max-heap. Always the opposite of your instinct.",
    },
    templates: [
      {
        name: "container/heap",
        filename: "int_heap.go",
        note: "Five methods. Pop must return the last element, after heap moved it there.",
        code: `import "container/heap"

type IntHeap []int

func (h IntHeap) Len() int            { return len(h) }
func (h IntHeap) Less(i, j int) bool  { return h[i] < h[j] } // min-heap
func (h IntHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *IntHeap) Push(x interface{}) { *h = append(*h, x.(int)) }

func (h *IntHeap) Pop() interface{} {
    old := *h
    n := len(old)
    v := old[n-1]
    *h = old[:n-1]
    return v
}

// usage
h := &IntHeap{}
heap.Init(h)
heap.Push(h, 5)
smallest := heap.Pop(h).(int)
peek := (*h)[0]`,
      },
      {
        name: "Heap of structs",
        filename: "item_heap.go",
        note: "The shape you want for Dijkstra and for scheduling.",
        code: `type Item struct {
    Node int
    Dist int
}

type PQ []Item

func (p PQ) Len() int           { return len(p) }
func (p PQ) Less(i, j int) bool { return p[i].Dist < p[j].Dist }
func (p PQ) Swap(i, j int)      { p[i], p[j] = p[j], p[i] }
func (p *PQ) Push(x any)        { *p = append(*p, x.(Item)) }

func (p *PQ) Pop() any {
    old := *p
    n := len(old)
    it := old[n-1]
    *p = old[:n-1]
    return it
}`,
      },
      {
        name: "Top k",
        filename: "top_k.go",
        note: "A size-k min-heap: O(n log k) time and O(k) memory.",
        code: `func findKthLargest(nums []int, k int) int {
    h := &IntHeap{}
    heap.Init(h)

    for _, v := range nums {
        heap.Push(h, v)
        if h.Len() > k {
            heap.Pop(h) // drop the smallest
        }
    }
    return (*h)[0]
}`,
      },
      {
        name: "Two heaps",
        filename: "median_stream.go",
        note: "A max-heap for the low half, a min-heap for the high half, sizes within one.",
        code: `type MedianFinder struct {
    low  *MaxHeap // largest of the small half
    high *MinHeap // smallest of the large half
}

func (m *MedianFinder) AddNum(v int) {
    heap.Push(m.low, v)
    heap.Push(m.high, heap.Pop(m.low)) // funnel through to keep order

    if m.high.Len() > m.low.Len() {
        heap.Push(m.low, heap.Pop(m.high))
    }
}

func (m *MedianFinder) FindMedian() float64 {
    if m.low.Len() > m.high.Len() {
        return float64((*m.low)[0])
    }
    return float64((*m.low)[0]+(*m.high)[0]) / 2
}`,
      },
    ],
    complexity: [
      { label: "Push", value: "O(log n)" },
      { label: "Pop", value: "O(log n)" },
      { label: "Peek", value: "O(1)" },
      { label: "Build from a slice", value: "O(n)", note: "heap.Init, not n pushes" },
      { label: "Top k of n", value: "O(n log k)" },
    ],
    variations: [
      { name: "Max-heap", detail: "Flip Less, or push negated values into a min-heap." },
      { name: "Lazy deletion", detail: "You cannot cheaply remove something from the middle. Push a replacement and skip stale entries on pop." },
      { name: "Quickselect instead", detail: "For a one-off k-th element, quickselect is O(n) average and beats a heap." },
      { name: "Bucket sort instead", detail: "When keys are bounded frequencies, buckets give O(n) top-k." },
    ],
    mistakes: [
      { title: "Using the wrong heap direction", detail: "k largest needs a min-heap. Getting this backwards is the most common heap bug." },
      { title: "Calling h.Push instead of heap.Push", detail: "The plain method does not re-sort the heap. Always go through the package function." },
      { title: "Pop returning the wrong element", detail: "container/heap moves the target to the end before calling Pop; return old[n-1]." },
      { title: "n pushes instead of heap.Init", detail: "Init is O(n); pushing one by one is O(n log n)." },
    ],
    related: ["greedy-heap", "dijkstra", "sorting", "queue"],
    problems: [215, 347, 703, 295, 1046, 23, 373, 502, 1642, 218, 621],
  },
];
