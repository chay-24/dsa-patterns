import type { Snippet } from "./types";

export type CheatSection = {
  slug: string;
  title: string;
  blurb: string;
};

export const cheatSections: CheatSection[] = [
  { slug: "slices", title: "Arrays & Slices", blurb: "The one Go type you will use in every single problem." },
  { slug: "maps", title: "Maps & Sets", blurb: "Counting, grouping, membership — and the gotchas." },
  { slug: "sorting", title: "Sorting", blurb: "Standard calls, custom comparators, and sorting by rank." },
  { slug: "heap", title: "Heap", blurb: "container/heap is verbose. Here it is, once, correctly." },
  { slug: "stack-queue", title: "Stack, Queue & Deque", blurb: "All three are a slice. No imports required." },
  { slug: "strings", title: "Strings", blurb: "Bytes, runes, Builder, and the conversions that matter." },
  { slug: "math", title: "Math & Bits", blurb: "min, max, abs, gcd, overflow bounds, bit tricks." },
  { slug: "graph", title: "Graph Setup", blurb: "Adjacency lists, grids, visited sets — copy and go." },
  { slug: "dp", title: "DP Scaffolding", blurb: "Allocating 2D tables and memoising without ceremony." },
  { slug: "io", title: "Fast I/O", blurb: "Buffered scanning for competitive judges." },
  { slug: "idioms", title: "Idioms & Traps", blurb: "The Go-specific things that cost people interviews." },
];

export const snippets: Snippet[] = [
  // ── Slices ───────────────────────────────────────────────────────────────
  {
    title: "Creating",
    section: "slices",
    note: "make with a capacity avoids repeated reallocation when you know the size.",
    keywords: ["make", "new", "literal", "capacity"],
    code: `a := []int{1, 2, 3}          // literal
b := make([]int, 5)          // length 5, all zero
c := make([]int, 0, 100)     // length 0, capacity 100
d := make([][]int, rows)     // slice of slices — inner ones are nil!

for i := range d {
    d[i] = make([]int, cols) // must allocate each row
}`,
  },
  {
    title: "Append & copy",
    section: "slices",
    note: "append may reallocate. The return value is the only safe reference.",
    keywords: ["append", "copy", "clone", "concat", "spread"],
    code: `a = append(a, 4)            // one element
a = append(a, 5, 6, 7)      // several
a = append(a, b...)         // concatenate

// deep-ish copy of a slice (the elements are still shared if pointers)
clone := append([]int(nil), a...)
clone = slices.Clone(a)     // Go 1.21+

n := copy(dst, src)         // copies min(len(dst), len(src))`,
  },
  {
    title: "Slicing & aliasing",
    section: "slices",
    note: "b := a[1:3] shares memory with a. Writing through b changes a.",
    keywords: ["slice", "alias", "subslice", "share", "backing array"],
    code: `a := []int{1, 2, 3, 4, 5}

a[1:3]      // [2 3]     — shares the backing array
a[:3]       // [1 2 3]
a[2:]       // [3 4 5]
a[:]        // the whole thing

// ⚠ aliasing
b := a[1:3]
b[0] = 99   // a is now [1 99 3 4 5]

// take an independent copy instead
b = append([]int(nil), a[1:3]...)`,
  },
  {
    title: "Remove, insert, reverse",
    section: "slices",
    note: "Order-preserving removal is O(n). If order is irrelevant, swap with the last element.",
    keywords: ["remove", "delete", "insert", "reverse", "pop"],
    code: `// remove index i, preserving order
a = append(a[:i], a[i+1:]...)

// remove index i, order irrelevant — O(1)
a[i] = a[len(a)-1]
a = a[:len(a)-1]

// insert v at index i
a = append(a, 0)
copy(a[i+1:], a[i:])
a[i] = v

// reverse
slices.Reverse(a)                       // Go 1.21+
for l, r := 0, len(a)-1; l < r; l, r = l+1, r-1 {
    a[l], a[r] = a[r], a[l]
}`,
  },
  {
    title: "2D grids",
    section: "slices",
    note: "One allocation for the whole grid keeps it contiguous and faster.",
    keywords: ["2d", "grid", "matrix", "allocate", "rows", "cols"],
    code: `// straightforward
grid := make([][]int, rows)
for i := range grid {
    grid[i] = make([]int, cols)
}

// single allocation, better locality
flat := make([]int, rows*cols)
grid := make([][]int, rows)
for i := range grid {
    grid[i] = flat[i*cols : (i+1)*cols]
}

// fill with a non-zero value
for i := range grid {
    for j := range grid[i] {
        grid[i][j] = -1
    }
}`,
  },
  {
    title: "slices package",
    section: "slices",
    note: "Go 1.21+. Worth knowing — it removes a lot of boilerplate.",
    keywords: ["slices", "contains", "index", "max", "min", "sort", "equal"],
    code: `import "slices"

slices.Contains(a, v)
slices.Index(a, v)          // -1 if absent
slices.Max(a)
slices.Min(a)
slices.Sort(a)
slices.Reverse(a)
slices.Equal(a, b)
slices.Clone(a)
slices.BinarySearch(a, v)   // (index, found)`,
  },

  // ── Maps ─────────────────────────────────────────────────────────────────
  {
    title: "Basics",
    section: "maps",
    note: "Reading a missing key returns the zero value — no panic, no error.",
    keywords: ["map", "make", "delete", "exists", "comma ok"],
    code: `m := map[int]int{}
m := make(map[string]bool, 100) // pre-sized

m[k] = v
v := m[k]                    // zero value if absent
v, ok := m[k]                // ok is false if absent
delete(m, k)
n := len(m)

if _, ok := m[k]; ok {
    // present
}`,
  },
  {
    title: "Counting",
    section: "maps",
    note: "The zero value makes ++ work on a key that does not exist yet.",
    keywords: ["count", "frequency", "counter", "tally"],
    code: `cnt := map[byte]int{}
for i := 0; i < len(s); i++ {
    cnt[s[i]]++
}

// fixed alphabet: an array is faster and comparable with ==
var freq [26]int
for i := 0; i < len(s); i++ {
    freq[s[i]-'a']++
}`,
  },
  {
    title: "Sets",
    section: "maps",
    note: "struct{} occupies zero bytes. map[T]bool is fine too and reads more simply.",
    keywords: ["set", "struct{}", "seen", "visited", "membership"],
    code: `seen := map[int]struct{}{}
seen[v] = struct{}{}
if _, ok := seen[v]; ok { }

// simpler, one byte per entry
seen := map[int]bool{}
seen[v] = true
if seen[v] { }

// set of coordinates
type pt struct{ r, c int }
visited := map[pt]bool{}
visited[pt{1, 2}] = true`,
  },
  {
    title: "Keys must be comparable",
    section: "maps",
    note: "Arrays are comparable, slices are not. That distinction shows up constantly.",
    keywords: ["key", "comparable", "array key", "struct key", "slice key"],
    code: `// ✓ arrays are comparable
var key [26]int
groups := map[[26]int][]string{}

// ✗ slices are not — this does not compile
// m := map[[]int]bool{}

// workaround: convert to a string
key := fmt.Sprint(nums)
key := string(bytes)

// ✓ structs of comparable fields
type edge struct{ u, v int }
m := map[edge]int{}`,
  },
  {
    title: "Iteration order is random",
    section: "maps",
    note: "Go randomises map iteration deliberately. Sort the keys if order matters.",
    keywords: ["iterate", "range", "order", "sort keys", "deterministic"],
    code: `// order differs between runs — by design
for k, v := range m {
    _ = k
    _ = v
}

// deterministic: collect and sort the keys
keys := make([]string, 0, len(m))
for k := range m {
    keys = append(keys, k)
}
sort.Strings(keys)
for _, k := range keys {
    use(k, m[k])
}`,
  },

  // ── Sorting ──────────────────────────────────────────────────────────────
  {
    title: "Standard sorts",
    section: "sorting",
    note: "sort.Slice is not stable. Use sort.SliceStable when ties must keep their order.",
    keywords: ["sort", "ints", "strings", "slice", "stable"],
    code: `sort.Ints(nums)
sort.Strings(words)
sort.Float64s(xs)

sort.Slice(items, func(i, j int) bool {
    return items[i].Weight < items[j].Weight
})

sort.SliceStable(items, less) // preserves the order of equal elements

// Go 1.21+
slices.Sort(nums)
slices.SortFunc(items, func(a, b Item) int {
    return cmp.Compare(a.Weight, b.Weight)
})`,
  },
  {
    title: "Multi-key comparators",
    section: "sorting",
    note: "Compare the primary key, and only fall through to the next on a tie.",
    keywords: ["comparator", "multi key", "tie break", "descending"],
    code: `sort.Slice(a, func(i, j int) bool {
    if a[i].Score != a[j].Score {
        return a[i].Score > a[j].Score // descending
    }
    if a[i].Age != a[j].Age {
        return a[i].Age < a[j].Age     // ascending
    }
    return a[i].Name < a[j].Name
})

// intervals by end, the interval-scheduling order
sort.Slice(iv, func(i, j int) bool { return iv[i][1] < iv[j][1] })`,
  },
  {
    title: "Sorting indices",
    section: "sorting",
    note: "When the answer is a position, sort an index slice instead of the values.",
    keywords: ["indices", "argsort", "rank", "positions"],
    code: `idx := make([]int, len(nums))
for i := range idx {
    idx[i] = i
}
sort.Slice(idx, func(i, j int) bool {
    return nums[idx[i]] < nums[idx[j]]
})
// idx is now the ascending order of positions`,
  },
  {
    title: "Binary search",
    section: "sorting",
    note: "sort.Search is a lower bound over any false-then-true predicate.",
    keywords: ["binary search", "sort.Search", "SearchInts", "lower bound"],
    code: `i := sort.SearchInts(nums, target) // first index >= target
if i < len(nums) && nums[i] == target {
    // found
}

// generic: first index where the predicate is true
i = sort.Search(n, func(i int) bool {
    return check(i)
})

// Go 1.21+
i, found := slices.BinarySearch(nums, target)`,
  },

  // ── Heap ─────────────────────────────────────────────────────────────────
  {
    title: "Min-heap of ints",
    section: "heap",
    note: "Five methods. Copy this verbatim — deriving it under pressure wastes minutes.",
    keywords: ["heap", "priority queue", "container/heap", "min heap"],
    code: `import "container/heap"

type IntHeap []int

func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] } // > for max-heap
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *IntHeap) Push(x any)        { *h = append(*h, x.(int)) }

func (h *IntHeap) Pop() any {
    old := *h
    n := len(old)
    v := old[n-1]
    *h = old[:n-1]
    return v
}`,
  },
  {
    title: "Using it",
    section: "heap",
    note: "Always call heap.Push / heap.Pop, never the methods directly.",
    keywords: ["heap.Init", "heap.Push", "heap.Pop", "peek"],
    code: `h := &IntHeap{5, 2, 9}
heap.Init(h)            // O(n) — better than n pushes

heap.Push(h, 3)
smallest := heap.Pop(h).(int)
peek := (*h)[0]         // root without removing
size := h.Len()

// ⚠ h.Push(x) does NOT maintain the heap invariant`,
  },
  {
    title: "Heap of structs",
    section: "heap",
    note: "The shape used by Dijkstra, task scheduling and k-way merges.",
    keywords: ["struct heap", "dijkstra", "priority", "custom"],
    code: `type Item struct {
    Node, Dist int
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
    title: "Max-heap without rewriting",
    section: "heap",
    note: "Negate on the way in and out — fine for ints, avoid for MinInt.",
    keywords: ["max heap", "negate", "reverse"],
    code: `heap.Push(h, -v)
largest := -heap.Pop(h).(int)

// or wrap an existing sort.Interface
sort.Reverse(byDist(items))`,
  },

  // ── Stack / queue / deque ────────────────────────────────────────────────
  {
    title: "Stack",
    section: "stack-queue",
    note: "A slice is the idiomatic stack. Guard every pop.",
    keywords: ["stack", "push", "pop", "peek", "lifo"],
    code: `stack := []int{}

stack = append(stack, v)          // push

top := stack[len(stack)-1]        // peek
stack = stack[:len(stack)-1]      // pop

if len(stack) == 0 { }            // empty check`,
  },
  {
    title: "Queue",
    section: "stack-queue",
    note: "Reslicing the front is O(1). The prefix stays alive but that rarely matters here.",
    keywords: ["queue", "enqueue", "dequeue", "fifo", "bfs"],
    code: `queue := []int{start}

for len(queue) > 0 {
    v := queue[0]
    queue = queue[1:]             // dequeue
    queue = append(queue, next)   // enqueue
}

// head-index variant when you want to keep the slice
head := 0
for head < len(queue) {
    v := queue[head]
    head++
}`,
  },
  {
    title: "Deque",
    section: "stack-queue",
    note: "Pushing to the front is O(n) with this form. For hot loops, use a ring buffer.",
    keywords: ["deque", "front", "back", "monotonic", "both ends"],
    code: `dq := []int{}

dq = append(dq, v)                    // push back
dq = dq[:len(dq)-1]                   // pop back

dq = append([]int{v}, dq...)          // push front — O(n)
dq = dq[1:]                           // pop front

front, back := dq[0], dq[len(dq)-1]`,
  },
  {
    title: "Level-order BFS",
    section: "stack-queue",
    note: "The size snapshot is what separates one level from the next.",
    keywords: ["bfs", "level", "layers", "tree", "queue"],
    code: `queue := []*TreeNode{root}

for len(queue) > 0 {
    size := len(queue) // freeze this level

    for i := 0; i < size; i++ {
        n := queue[0]
        queue = queue[1:]

        if n.Left != nil {
            queue = append(queue, n.Left)
        }
        if n.Right != nil {
            queue = append(queue, n.Right)
        }
    }
    depth++
}`,
  },

  // ── Strings ──────────────────────────────────────────────────────────────
  {
    title: "Bytes vs runes",
    section: "strings",
    note: "s[i] is a byte. For unicode, convert to []rune first.",
    keywords: ["byte", "rune", "unicode", "index", "utf8"],
    code: `s := "héllo"

len(s)              // 6 — bytes, not characters
s[1]                // 0xC3 — half of é
[]byte(s)           // 6 elements, mutable
[]rune(s)           // 5 elements, mutable, unicode-safe

for i := 0; i < len(s); i++ { _ = s[i] }  // bytes
for i, r := range s { _ = i; _ = r }      // runes, i is a BYTE offset`,
  },
  {
    title: "Building strings",
    section: "strings",
    note: "s += x inside a loop is O(n²). Builder is O(n).",
    keywords: ["builder", "concat", "join", "repeat", "sprintf"],
    code: `var sb strings.Builder
sb.Grow(n)                  // optional pre-size
sb.WriteString("abc")
sb.WriteByte('x')
sb.WriteRune('é')
out := sb.String()

strings.Join(parts, ",")
strings.Repeat("ab", 3)     // "ababab"`,
  },
  {
    title: "Common operations",
    section: "strings",
    note: "strings.Fields collapses runs of whitespace — usually what you want.",
    keywords: ["split", "fields", "contains", "index", "trim", "replace"],
    code: `strings.Split("a,b,c", ",")     // ["a" "b" "c"]
strings.Fields("  a  b  ")     // ["a" "b"] — splits on any whitespace
strings.Contains(s, "ab")
strings.HasPrefix(s, "ab")
strings.Index(s, "ab")         // -1 if absent
strings.Count(s, "a")
strings.TrimSpace(s)
strings.ToLower(s)
strings.Replace(s, "a", "b", -1)`,
  },
  {
    title: "Conversions",
    section: "strings",
    note: "strconv, not fmt, for number parsing — it is faster and returns an error.",
    keywords: ["atoi", "itoa", "parse", "strconv", "convert"],
    code: `n, err := strconv.Atoi("42")
s := strconv.Itoa(42)

f, _ := strconv.ParseFloat("3.14", 64)
b, _ := strconv.ParseBool("true")
n, _ = strconv.ParseInt("ff", 16, 64)   // base 16

// digit ↔ value
d := int(c - '0')
c := byte('0' + d)`,
  },

  // ── Math ─────────────────────────────────────────────────────────────────
  {
    title: "min, max, abs",
    section: "math",
    note: "min and max are builtins since Go 1.21 and work on any ordered type.",
    keywords: ["min", "max", "abs", "builtin", "clamp"],
    code: `// Go 1.21+ builtins — variadic, no import
x := min(a, b)
y := max(a, b, c)

// abs has no builtin
func abs(x int) int {
    if x < 0 {
        return -x
    }
    return x
}

// pre-1.21 helpers, if the judge is old
func minInt(a, b int) int { if a < b { return a }; return b }`,
  },
  {
    title: "Limits & overflow",
    section: "math",
    note: "math.MaxInt is untyped; use MaxInt32 as a sentinel you can still add to.",
    keywords: ["MaxInt", "MinInt", "overflow", "sentinel", "infinity"],
    code: `math.MaxInt      // platform int (usually 2^63-1)
math.MinInt
math.MaxInt32    // 2147483647 — safer as a sentinel
math.MaxInt64
math.Inf(1)      // float +infinity

// ⚠ MaxInt + 1 wraps around silently
best := math.MaxInt32   // leaves room for +1 without overflow

// check before multiplying
if a > math.MaxInt/b {
    // would overflow
}`,
  },
  {
    title: "gcd, lcm, power",
    section: "math",
    note: "Divide before multiplying in lcm, or you overflow for no reason.",
    keywords: ["gcd", "lcm", "pow", "euclid", "exponent"],
    code: `func gcd(a, b int) int {
    for b != 0 {
        a, b = b, a%b
    }
    return a
}

func lcm(a, b int) int { return a / gcd(a, b) * b }

func powMod(base, exp, mod int) int {
    base %= mod
    r := 1
    for exp > 0 {
        if exp&1 == 1 {
            r = r * base % mod
        }
        base = base * base % mod
        exp >>= 1
    }
    return r
}`,
  },
  {
    title: "Bit manipulation",
    section: "math",
    note: "math/bits usually compiles to a single CPU instruction.",
    keywords: ["bits", "popcount", "xor", "shift", "mask", "lowbit"],
    code: `import "math/bits"

bits.OnesCount(uint(n))      // popcount
bits.TrailingZeros(uint(n))  // index of the lowest set bit
bits.LeadingZeros(uint(n))
bits.Len(uint(n))            // 1 + floor(log2 n)

n>>i & 1        // read bit i
n |= 1 << i     // set
n &^= 1 << i    // clear (Go's AND NOT operator)
n ^= 1 << i     // toggle

n & (n - 1)     // clear the lowest set bit
n & -n          // isolate the lowest set bit
1<<k - 1        // mask of k low bits`,
  },
  {
    title: "Integer division & modulo",
    section: "math",
    note: "Go truncates towards zero, so % keeps the dividend's sign.",
    keywords: ["division", "modulo", "negative", "ceil", "floor", "round"],
    code: `7 / 2       // 3
-7 / 2      // -3  (truncates towards zero)
-7 % 2      // -1  ← NOT 1

// normalise a remainder
r := ((x % m) + m) % m

// ceiling division without floats
ceil := (a + b - 1) / b

// floor division for negatives
func floorDiv(a, b int) int {
    q := a / b
    if (a%b != 0) && ((a < 0) != (b < 0)) {
        q--
    }
    return q
}`,
  },

  // ── Graph ────────────────────────────────────────────────────────────────
  {
    title: "Adjacency list",
    section: "graph",
    note: "Remember both directions for an undirected graph.",
    keywords: ["adjacency", "graph", "edges", "build", "directed"],
    code: `adj := make([][]int, n)
for _, e := range edges {
    adj[e[0]] = append(adj[e[0]], e[1])
    adj[e[1]] = append(adj[e[1]], e[0]) // drop if directed
}

// weighted
type Edge struct{ To, W int }
adj := make([][]Edge, n)
for _, e := range edges {
    adj[e[0]] = append(adj[e[0]], Edge{e[1], e[2]})
}`,
  },
  {
    title: "Grid directions",
    section: "graph",
    note: "A direction table keeps the bounds check in exactly one place.",
    keywords: ["directions", "grid", "neighbours", "dirs", "4-way", "8-way"],
    code: `var dirs = [4][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}

var dirs8 = [8][2]int{
    {1, 0}, {-1, 0}, {0, 1}, {0, -1},
    {1, 1}, {1, -1}, {-1, 1}, {-1, -1},
}

for _, d := range dirs {
    nr, nc := r+d[0], c+d[1]
    if nr < 0 || nr >= rows || nc < 0 || nc >= cols {
        continue
    }
    // visit (nr, nc)
}`,
  },
  {
    title: "Union-Find",
    section: "graph",
    note: "Path halving plus union by size — effectively constant time.",
    keywords: ["dsu", "union find", "disjoint set", "connected"],
    code: `type DSU struct{ p, sz []int; Count int }

func NewDSU(n int) *DSU {
    d := &DSU{p: make([]int, n), sz: make([]int, n), Count: n}
    for i := range d.p {
        d.p[i], d.sz[i] = i, 1
    }
    return d
}

func (d *DSU) Find(x int) int {
    for d.p[x] != x {
        d.p[x] = d.p[d.p[x]] // path halving
        x = d.p[x]
    }
    return x
}

func (d *DSU) Union(a, b int) bool {
    ra, rb := d.Find(a), d.Find(b)
    if ra == rb {
        return false
    }
    if d.sz[ra] < d.sz[rb] {
        ra, rb = rb, ra
    }
    d.p[rb] = ra
    d.sz[ra] += d.sz[rb]
    d.Count--
    return true
}`,
  },
  {
    title: "Recursive DFS in Go",
    section: "graph",
    note: "Declare the variable first, then assign — a closure cannot reference itself otherwise.",
    keywords: ["dfs", "recursion", "closure", "func", "self-reference"],
    code: `var dfs func(int)
dfs = func(u int) {
    seen[u] = true
    for _, v := range adj[u] {
        if !seen[v] {
            dfs(v)
        }
    }
}
dfs(0)

// ⚠ this does NOT compile:
// dfs := func(u int) { dfs(v) }  // dfs is undefined inside itself`,
  },

  // ── DP ───────────────────────────────────────────────────────────────────
  {
    title: "2D table",
    section: "dp",
    note: "Go zeroes everything, so only initialise when the base case is non-zero.",
    keywords: ["dp table", "2d", "allocate", "initialise"],
    code: `dp := make([][]int, m+1)
for i := range dp {
    dp[i] = make([]int, n+1)
}

// fill with a sentinel
for i := range dp {
    for j := range dp[i] {
        dp[i][j] = -1
    }
}`,
  },
  {
    title: "Memoisation",
    section: "dp",
    note: "A map keyed by a struct is the quickest way to memoise a multi-argument recursion.",
    keywords: ["memo", "memoise", "cache", "top-down", "recursion"],
    code: `type key struct{ i, j int }
memo := map[key]int{}

var solve func(i, j int) int
solve = func(i, j int) int {
    if base {
        return 0
    }
    k := key{i, j}
    if v, ok := memo[k]; ok {
        return v
    }

    res := compute()
    memo[k] = res
    return res
}

// array memo when the bounds are known — much faster
memo := make([][]int, m)
for i := range memo {
    memo[i] = make([]int, n)
    for j := range memo[i] {
        memo[i][j] = -1 // -1 means "not computed"
    }
}`,
  },
  {
    title: "Rolling rows",
    section: "dp",
    note: "Swap the row pointers instead of copying the data.",
    keywords: ["rolling", "space optimise", "two rows", "swap"],
    code: `prev := make([]int, n+1)
cur := make([]int, n+1)

for i := 1; i <= m; i++ {
    for j := 1; j <= n; j++ {
        cur[j] = f(prev[j], cur[j-1], prev[j-1])
    }
    prev, cur = cur, prev // swap, do not copy
}
answer := prev[n]`,
  },

  // ── I/O ──────────────────────────────────────────────────────────────────
  {
    title: "Buffered scanner",
    section: "io",
    note: "The default Scanner buffer is 64KB. Large inputs need an explicit Buffer call.",
    keywords: ["scanner", "bufio", "stdin", "fast input", "competitive"],
    code: `reader := bufio.NewScanner(os.Stdin)
reader.Buffer(make([]byte, 1024*1024), 1024*1024)
reader.Split(bufio.ScanWords) // token by token

func readInt() int {
    reader.Scan()
    n, _ := strconv.Atoi(reader.Text())
    return n
}

writer := bufio.NewWriter(os.Stdout)
defer writer.Flush()
fmt.Fprintln(writer, answer)`,
  },
  {
    title: "Reading everything at once",
    section: "io",
    note: "Fastest option: one read, then parse bytes manually.",
    keywords: ["readall", "bytes", "parse", "fast"],
    code: `data, _ := io.ReadAll(bufio.NewReader(os.Stdin))

pos := 0
func nextInt() int {
    for pos < len(data) && (data[pos] == ' ' || data[pos] == '\\n') {
        pos++
    }
    neg := false
    if data[pos] == '-' {
        neg = true
        pos++
    }
    n := 0
    for pos < len(data) && data[pos] > ' ' {
        n = n*10 + int(data[pos]-'0')
        pos++
    }
    if neg {
        return -n
    }
    return n
}`,
  },

  // ── Idioms ───────────────────────────────────────────────────────────────
  {
    title: "Multiple assignment",
    section: "idioms",
    note: "The right-hand side is fully evaluated first — that is what makes swaps work.",
    keywords: ["swap", "assign", "tuple", "multiple return"],
    code: `a, b = b, a                     // swap
l, r = l+1, r-1                 // move both pointers
take, skip = skip+v, max(take, skip) // DP rolling update

// evaluated before assignment, so this is safe:
prev, cur = cur, prev+cur`,
  },
  {
    title: "Labelled break",
    section: "idioms",
    note: "Breaking out of nested loops without a flag variable.",
    keywords: ["label", "break", "continue", "nested loop", "goto"],
    code: `outer:
for i := range grid {
    for j := range grid[i] {
        if found(grid[i][j]) {
            break outer
        }
    }
}

// continue works with labels too
search:
for _, a := range xs {
    for _, b := range ys {
        if bad(a, b) {
            continue search
        }
    }
}`,
  },
  {
    title: "Traps that cost interviews",
    section: "idioms",
    note: "Every one of these compiles and silently does the wrong thing.",
    keywords: ["gotcha", "trap", "bug", "mistake", "pitfall"],
    code: `// 1. appending a slice you will mutate later
out = append(out, path)                 // ✗ aliases path
out = append(out, append([]int(nil), path...)) // ✓ copy

// 2. inner slices of a 2D make are nil
grid := make([][]int, n) // grid[0] is nil — allocate each row

// 3. % keeps the dividend's sign
-7 % 3 // -1, not 2

// 4. map iteration order is randomised, deliberately

// 5. int overflow is silent — no panic

// 6. a closure cannot reference itself at declaration
var dfs func(int)
dfs = func(n int) { dfs(n - 1) }        // ✓

// 7. range copies the element
for _, v := range items { v.X = 1 }     // ✗ mutates a copy
for i := range items { items[i].X = 1 } // ✓`,
  },
  {
    title: "Common type definitions",
    section: "idioms",
    note: "LeetCode gives you these — reproduce them locally to test.",
    keywords: ["treenode", "listnode", "definition", "struct"],
    code: `type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

type ListNode struct {
    Val  int
    Next *ListNode
}

type Node struct {
    Val       int
    Neighbors []*Node
}`,
  },
];

export const snippetsBySection = new Map<string, Snippet[]>();
for (const s of snippets) {
  const list = snippetsBySection.get(s.section) ?? [];
  list.push(s);
  snippetsBySection.set(s.section, list);
}
