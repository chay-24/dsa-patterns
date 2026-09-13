import type { Pattern } from "../types";

export const foundations: Pattern[] = [
  {
    slug: "arrays",
    title: "Arrays & Slices",
    category: "foundations",
    description: "Index arithmetic, in-place rewriting, and using the array itself as storage.",
    concepts: ["In-place", "Index tricks", "Cyclic sort"],
    usedFor: ["in-place rewrites", "index-as-hash tricks", "matrix walks", "O(1) extra space"],
    signals: ["in-place", "O(1) space", "1..n values", "rotate", "matrix", "without extra array"],
    recognition: [
      "the values are bounded by the length (1..n), so an index can stand in for a value",
      "the problem forbids extra memory",
      "you are asked to rewrite the input, not return a new slice",
      "a matrix walk where the boundaries, not the direction, are the real state",
    ],
    typicalQuestion: "Rearrange the array in place using O(1) extra space.",
    mentalModel: {
      lines: [
        "Use two indices: one reads, one writes.",
        "The reader always moves. The writer only moves on a keeper.",
        "If the values are 1..n, the array can be its own lookup table.",
      ],
      diagram: `  read →
  [ 1 , 0 , 2 , 0 , 3 ]
        ↑
      write

  write only advances on a keeper`,
      key: "Two indices at different speeds. That is all in-place work is.",
    },
    templates: [
      {
        name: "Read / write",
        filename: "compact.go",
        note: "Keep everything that passes a test, in order, with no new slice.",
        code: `func compact(nums []int, keep func(int) bool) []int {
    w := 0
    for _, v := range nums {
        if keep(v) {
            nums[w] = v
            w++
        }
    }
    return nums[:w]
}`,
      },
      {
        name: "Cyclic sort",
        filename: "cyclic_sort.go",
        note: "Values are 1..n, so value v belongs at index v-1.",
        code: `func cyclicSort(nums []int) {
    for i := 0; i < len(nums); i++ {
        for nums[i] >= 1 && nums[i] <= len(nums) && nums[nums[i]-1] != nums[i] {
            j := nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
        }
    }
}

// first missing positive
func firstMissing(nums []int) int {
    cyclicSort(nums)
    for i, v := range nums {
        if v != i+1 {
            return i + 1
        }
    }
    return len(nums) + 1
}`,
      },
      {
        name: "Sign marking",
        filename: "sign_mark.go",
        note: "Mark 'seen' by flipping the sign at index v-1. No extra memory.",
        code: `func findDisappeared(nums []int) []int {
    for _, v := range nums {
        i := abs(v) - 1
        if nums[i] > 0 {
            nums[i] = -nums[i]
        }
    }
    out := []int{}
    for i, v := range nums {
        if v > 0 {
            out = append(out, i+1)
        }
    }
    return out
}

func abs(x int) int {
    if x < 0 {
        return -x
    }
    return x
}`,
      },
      {
        name: "Matrix boundaries",
        filename: "spiral.go",
        note: "Rotating a square matrix 90 degrees is a transpose plus a row reverse.",
        code: `func rotate(m [][]int) {
    n := len(m)

    // transpose: swap across the diagonal
    for r := 0; r < n; r++ {
        for c := r + 1; c < n; c++ {
            m[r][c], m[c][r] = m[c][r], m[r][c]
        }
    }

    // reverse each row
    for _, row := range m {
        for l, r := 0, n-1; l < r; l, r = l+1, r-1 {
            row[l], row[r] = row[r], row[l]
        }
    }
}`,
      },
    ],
    complexity: [
      { label: "Scan", value: "O(n)" },
      { label: "Cyclic sort", value: "O(n)", note: "each swap places one value for good" },
      { label: "Space", value: "O(1)", note: "the input is the scratch space" },
    ],
    why: "The inner loop looks like it makes cyclic sort quadratic. It does not: every swap puts one value in its final spot, and a placed value never moves again. So there are at most n swaps in total.",
    variations: [
      { name: "Reverse-based rotation", detail: "Rotate by k: reverse all, reverse [0,k), reverse [k,n). Three linear passes, no buffer." },
      { name: "Transpose + reverse", detail: "Rotating a square matrix 90° clockwise is a transpose followed by a row reverse." },
      { name: "First row/column as markers", detail: "When you need per-row and per-column flags without extra space, store them in row 0 and column 0." },
    ],
    mistakes: [
      { title: "Forgetting slices share backing arrays", detail: "b := a[1:3] aliases a. Writing through b changes a. Use append([]int{}, a...) or copy when you need a snapshot." },
      { title: "append inside a loop over the same slice", detail: "append may reallocate, so a range loop keeps iterating the old array. Range over an index, or build into a separate slice." },
      { title: "Off-by-one in the middle row of a spiral", detail: "The two reverse legs need their own top <= bottom / left <= right guards, or a single-row matrix is emitted twice." },
    ],
    related: ["two-pointers", "prefix-sum", "hash-map", "sorting"],
    problems: [41, 448, 189, 54, 48, 73, 283, 26, 27, 88, 169, 268, 31],
  },
  {
    slug: "strings",
    title: "Strings",
    category: "foundations",
    description: "In Go a string is immutable bytes — the pattern is choosing the right view of it.",
    concepts: ["[]byte", "[]rune", "Builder", "Frequency"],
    usedFor: ["character frequency", "parsing", "building output", "unicode-safe indexing"],
    signals: ["substring", "anagram", "characters", "parse", "build a string", "lowercase letters"],
    recognition: [
      "you need to change a string, so copy it into []byte or []rune first",
      "you are gluing text together in a loop, so reach for strings.Builder",
      "the input is 'lowercase English letters', so a [26]int beats a map",
      "you need a standard form of a word, like its sorted letters or its letter counts",
    ],
    typicalQuestion: "Group all anagrams together.",
    mentalModel: {
      lines: [
        "A Go string is read-only bytes.",
        "To change it, copy into []byte for ASCII or []rune for unicode.",
        "For lowercase input, a [26]int count array beats a map.",
      ],
      diagram: `  s := "héllo"

  len(s)        → 6     bytes
  len([]rune(s))→ 5     code points
  s[1]          → 0xC3  half of é

  index bytes, iterate runes`,
      key: "Use []byte for ASCII. Switch to []rune the moment unicode shows up.",
    },
    templates: [
      {
        name: "Frequency",
        filename: "freq.go",
        note: "Fixed alphabet, so use an array. Arrays compare with == and never allocate.",
        code: `func signature(s string) [26]int {
    var cnt [26]int
    for i := 0; i < len(s); i++ {
        cnt[s[i]-'a']++
    }
    return cnt
}

func isAnagram(a, b string) bool {
    return len(a) == len(b) && signature(a) == signature(b)
}`,
      },
      {
        name: "Builder",
        filename: "builder.go",
        note: "s += x in a loop is O(n^2). A Builder writes into one buffer.",
        code: `func repeatJoin(parts []string, sep string) string {
    var sb strings.Builder
    sb.Grow(64) // optional: pre-size when you can estimate

    for i, p := range parts {
        if i > 0 {
            sb.WriteString(sep)
        }
        sb.WriteString(p)
    }
    return sb.String()
}`,
      },
      {
        name: "In-place bytes",
        filename: "bytes.go",
        note: "Convert once, edit freely, convert back once.",
        code: `func reverseWords(s string) string {
    b := []byte(s)
    reverse(b, 0, len(b)-1)

    start := 0
    for i := 0; i <= len(b); i++ {
        if i == len(b) || b[i] == ' ' {
            reverse(b, start, i-1)
            start = i + 1
        }
    }
    return string(b)
}

func reverse(b []byte, i, j int) {
    for i < j {
        b[i], b[j] = b[j], b[i]
        i++
        j--
    }
}`,
      },
    ],
    complexity: [
      { label: "Scan", value: "O(n)" },
      { label: "Builder append", value: "O(1)", note: "amortised" },
      { label: "Naive concat in a loop", value: "O(n²)", note: "every += copies the whole string" },
      { label: "Space", value: "O(n)", note: "for the []byte or []rune copy" },
    ],
    variations: [
      { name: "Count signature as a map key", detail: "Use the [26]int array directly as a map key — arrays are comparable in Go, slices are not." },
      { name: "strings.Fields over Split", detail: "Fields collapses runs of whitespace, which removes most of the edge cases in word problems." },
      { name: "Two-pointer cleaning", detail: "Skipping punctuation in place beats building a filtered copy." },
    ],
    mistakes: [
      { title: "Indexing a string expecting characters", detail: "s[i] is a byte. For any non-ASCII input that is a fragment of a code point, not a character." },
      { title: "Using a slice as a map key", detail: "Won't compile. Convert to a string or a fixed-size array first." },
      { title: "Building with += inside a loop", detail: "Quadratic. Interviewers notice; use strings.Builder." },
    ],
    related: ["hash-map", "variable-sliding-window", "palindrome-techniques", "kmp"],
    problems: [242, 49, 383, 387, 205, 290, 344, 151, 14, 43, 8, 71],
  },
  {
    slug: "hash-map",
    title: "Hash Map",
    category: "foundations",
    description: "Trade space for time: turn a linear search inside a loop into a constant lookup.",
    concepts: ["Lookup", "Counting", "Grouping", "Seen-set"],
    usedFor: ["existence checks", "counting", "grouping by key", "index lookup", "de-duplication"],
    signals: ["seen before", "count", "frequency", "duplicate", "group", "pair", "anagram", "O(n) required"],
    recognition: [
      "you wrote a nested loop and the inner loop only asks 'does X exist?'",
      "you need the index or the count of something you already passed",
      "items must be grouped by some derived key",
      "the problem says O(n) and the data is unsorted",
    ],
    typicalQuestion: "Find two numbers adding up to a target, in O(n).",
    mentalModel: {
      lines: [
        "A map answers one question fast: have I seen this before?",
        "Decide three things: the key, the value, and when to write.",
        "The key is often not the element itself but something derived from it.",
      ],
      diagram: `  need = target - x
         │
         ▼
  ┌──────────────┐
  │  seen: k→i   │  ── hit? ──▶ answer
  └──────────────┘
         ▲
      insert x after looking up`,
      key: "Look up before you insert, or an element will pair with itself.",
    },
    templates: [
      {
        name: "Seen set",
        filename: "seen.go",
        note: "struct{} takes zero bytes. This is the idiomatic Go set.",
        code: `func hasDuplicate(nums []int) bool {
    seen := make(map[int]struct{}, len(nums))
    for _, v := range nums {
        if _, ok := seen[v]; ok {
            return true
        }
        seen[v] = struct{}{}
    }
    return false
}`,
      },
      {
        name: "Complement lookup",
        filename: "two_sum.go",
        note: "One pass. Looking up before inserting keeps i and j different.",
        code: `func twoSum(nums []int, target int) []int {
    idx := make(map[int]int, len(nums))
    for i, v := range nums {
        if j, ok := idx[target-v]; ok {
            return []int{j, i}
        }
        idx[v] = i
    }
    return nil
}`,
      },
      {
        name: "Counting",
        filename: "counter.go",
        note: "A missing key reads as 0, so ++ just works.",
        code: `func mostCommon(words []string) string {
    cnt := map[string]int{}
    for _, w := range words {
        cnt[w]++
    }

    best, bestN := "", -1
    for w, n := range cnt {
        if n > bestN || (n == bestN && w < best) {
            best, bestN = w, n
        }
    }
    return best
}`,
      },
      {
        name: "Group by key",
        filename: "group.go",
        note: "The key is a canonical form. The value is a bucket.",
        code: `func groupAnagrams(words []string) [][]string {
    groups := map[[26]int][]string{}
    for _, w := range words {
        var key [26]int
        for i := 0; i < len(w); i++ {
            key[w[i]-'a']++
        }
        groups[key] = append(groups[key], w)
    }

    out := make([][]string, 0, len(groups))
    for _, g := range groups {
        out = append(out, g)
    }
    return out
}`,
      },
    ],
    complexity: [
      { label: "Lookup", value: "O(1)", note: "average; O(n) if the keys are chosen badly" },
      { label: "Insert", value: "O(1)", note: "amortised" },
      { label: "Full pass", value: "O(n)" },
      { label: "Space", value: "O(n)" },
    ],
    why: "An inner loop that only asks 'did I see this already?' is really doing a search. A map answers that in one step, so the loop disappears.",
    variations: [
      { name: "Map to index", detail: "Store the position, not just presence, when the answer is an index or a distance." },
      { name: "Map to first occurrence", detail: "For 'longest range with property P', keep the earliest index of each key and never overwrite it." },
      { name: "Fixed-size array instead", detail: "If keys are small integers or lowercase letters, an array is faster and allocation-free." },
      { name: "Two maps, both ways", detail: "Isomorphic-string problems need the mapping checked in both directions." },
    ],
    mistakes: [
      { title: "Inserting before looking up", detail: "In two-sum with target 2x, the element finds itself. Look up first." },
      { title: "Relying on map order", detail: "Go deliberately randomises range order over maps. Sort the keys if the output order matters." },
      { title: "Ignoring the zero value", detail: "cnt[k] == 0 does not mean absent. Use the two-value form v, ok := m[k] when zero is meaningful." },
      { title: "Using a slice as a key", detail: "Not comparable. Convert to a string or a fixed array." },
    ],
    related: ["prefix-sum-hash-map", "variable-sliding-window", "trie", "arrays"],
    problems: [1, 217, 242, 49, 128, 383, 387, 205, 290, 347, 36, 149],
  },
  {
    slug: "prefix-sum",
    title: "Prefix Sum",
    category: "foundations",
    description: "Precompute cumulative totals so any range query becomes one subtraction.",
    concepts: ["Range query", "2D", "Immutable"],
    usedFor: ["repeated range sums", "range averages", "counting over ranges", "2D submatrix sums"],
    signals: ["range sum", "subarray sum", "between i and j", "many queries", "submatrix", "average of a range"],
    recognition: [
      "the same array is asked for range sums many times and never changes",
      "the naive answer re-adds the same overlapping region on every query",
      "the thing you are summing can be undone by subtraction: sums, counts, XOR",
      "the 2D version: totals over a submatrix",
    ],
    typicalQuestion: "Answer many range-sum queries over an immutable array.",
    mentalModel: {
      lines: [
        "P[0] = 0, and P[i] is the sum of the first i values.",
        "Then the sum of a[i..j] is P[j+1] - P[i].",
        "One subtraction answers any range.",
      ],
      diagram: `  a      [ 2   4   1   3 ]
  P    [ 0   2   6   7  10 ]
         │           │
         P[1]        P[4]

  sum(1..3) = P[4] - P[1] = 8`,
      key: "Make the prefix array n+1 long and leave P[0] = 0. That removes every edge case.",
    },
    templates: [
      {
        name: "1D",
        filename: "prefix_sum.go",
        note: "Build once in O(n). Every query after that is O(1).",
        code: `type Prefix struct{ p []int }

func NewPrefix(a []int) *Prefix {
    p := make([]int, len(a)+1)
    for i, v := range a {
        p[i+1] = p[i] + v
    }
    return &Prefix{p}
}

// Sum of a[i..j] inclusive.
func (s *Prefix) Range(i, j int) int {
    return s.p[j+1] - s.p[i]
}`,
      },
      {
        name: "2D",
        filename: "prefix_2d.go",
        note: "Add the two overlapping rectangles back once.",
        code: `type Prefix2D struct{ p [][]int }

func NewPrefix2D(m [][]int) *Prefix2D {
    rows, cols := len(m), len(m[0])
    p := make([][]int, rows+1)
    for i := range p {
        p[i] = make([]int, cols+1)
    }
    for r := 0; r < rows; r++ {
        for c := 0; c < cols; c++ {
            p[r+1][c+1] = m[r][c] + p[r][c+1] + p[r+1][c] - p[r][c]
        }
    }
    return &Prefix2D{p}
}

func (s *Prefix2D) Range(r1, c1, r2, c2 int) int {
    return s.p[r2+1][c2+1] - s.p[r1][c2+1] - s.p[r2+1][c1] + s.p[r1][c1]
}`,
      },
      {
        name: "Prefix + suffix",
        filename: "except_self.go",
        note: "When the answer at i needs everything except i, sweep both ways.",
        code: `func productExceptSelf(nums []int) []int {
    n := len(nums)
    out := make([]int, n)

    out[0] = 1
    for i := 1; i < n; i++ {
        out[i] = out[i-1] * nums[i-1]
    }

    suffix := 1
    for i := n - 1; i >= 0; i-- {
        out[i] *= suffix
        suffix *= nums[i]
    }
    return out
}`,
      },
    ],
    complexity: [
      { label: "Build", value: "O(n)", note: "O(rows·cols) in 2D" },
      { label: "Query", value: "O(1)" },
      { label: "Update", value: "O(n)", note: "need updates? use a Fenwick tree" },
      { label: "Space", value: "O(n)" },
    ],
    variations: [
      { name: "Prefix XOR", detail: "XOR is its own inverse, so xor(i..j) = P[j+1] ^ P[i]." },
      { name: "Prefix count", detail: "Store counts of a property to answer 'how many vowels in this range' in O(1)." },
      { name: "Prefix min/max", detail: "You cannot subtract a min back out, so the prefix trick does not apply. Use a segment tree." },
    ],
    mistakes: [
      { title: "Off-by-one from a size-n prefix array", detail: "Use n+1 entries with P[0]=0 and sum(i..j)=P[j+1]-P[i]. Every other convention needs special cases." },
      { title: "Trying to subtract a min or max", detail: "Prefix tricks need an inverse. min has none." },
      { title: "Reaching for a window when values can be negative", detail: "With negatives, shrinking a window can make the sum go up, so the window logic breaks. Prefix sums do not care about signs." },
    ],
    related: ["prefix-sum-hash-map", "difference-array", "fenwick-tree", "subarray-substring"],
    problems: [303, 304, 238, 560, 42, 528],
  },
  {
    slug: "difference-array",
    title: "Difference Array",
    category: "foundations",
    description: "Record range updates as two endpoints, then resolve them all in one sweep.",
    concepts: ["Range add", "Offline", "Sweep"],
    usedFor: ["many range increments", "booking and interval overlap counts", "offline updates then one read"],
    signals: ["add k to every index in [l, r]", "bookings", "intervals overlap count", "after all operations", "range update"],
    recognition: [
      "many range updates arrive, and you only read the array at the very end",
      "the naive solution is a nested loop writing the same cells repeatedly",
      "you need the maximum number of simultaneously active intervals",
      "the coordinate space is small, or can be compressed to be small",
    ],
    typicalQuestion: "Apply thousands of range increments, then report the final array.",
    mentalModel: {
      lines: [
        "A difference array is a prefix sum run backwards.",
        "To add v over [l, r]: write +v at l and -v at r+1.",
        "Prefix-sum the whole array once at the end.",
      ],
      diagram: `  add +5 over [1,3]

  d   [ 0  +5   0   0  -5 ]
             └─────────┘
  prefix sum ▼
  a   [ 0   5   5   5   0 ]

  O(1) per update, O(n) once`,
      key: "Two writes per update instead of one write per cell.",
    },
    templates: [
      {
        name: "Range add",
        filename: "diff.go",
        note: "Size it n+1 so r+1 is always in bounds.",
        code: `type Diff struct{ d []int }

func NewDiff(n int) *Diff { return &Diff{make([]int, n+1)} }

// Add v to every index in [l, r] inclusive.
func (s *Diff) Add(l, r, v int) {
    s.d[l] += v
    s.d[r+1] -= v
}

func (s *Diff) Build() []int {
    out := make([]int, len(s.d)-1)
    run := 0
    for i := range out {
        run += s.d[i]
        out[i] = run
    }
    return out
}`,
      },
      {
        name: "Sweep line",
        filename: "sweep.go",
        note: "When positions are huge, sort events instead of allocating an array.",
        code: `func maxOverlap(intervals [][]int) int {
    type event struct{ at, delta int }
    ev := make([]event, 0, 2*len(intervals))
    for _, iv := range intervals {
        ev = append(ev, event{iv[0], +1}, event{iv[1], -1})
    }
    // ends before starts at the same coordinate, for half-open intervals
    sort.Slice(ev, func(i, j int) bool {
        if ev[i].at != ev[j].at {
            return ev[i].at < ev[j].at
        }
        return ev[i].delta < ev[j].delta
    })

    cur, best := 0, 0
    for _, e := range ev {
        cur += e.delta
        best = max(best, cur)
    }
    return best
}`,
      },
    ],
    complexity: [
      { label: "Update", value: "O(1)" },
      { label: "Build", value: "O(n)", note: "one final prefix sum" },
      { label: "Sweep line", value: "O(m log m)", note: "m events, dominated by the sort" },
      { label: "Space", value: "O(n)" },
    ],
    variations: [
      { name: "2D difference", detail: "Four corner writes per rectangle, then a 2D prefix sum." },
      { name: "Capacity check", detail: "Prefix-sum the diff array and compare each running value against a limit." },
      { name: "Compressed coordinates", detail: "When positions are up to 1e9, map the endpoints to ranks first." },
    ],
    mistakes: [
      { title: "Forgetting the n+1 slot", detail: "d[r+1] with r = n-1 panics on a size-n array." },
      { title: "Mixing inclusive and half-open", detail: "For half-open [l, r) the second write is d[r] -= v, with no +1. Pick one convention." },
      { title: "Reading before the final sweep", detail: "The diff array is meaningless until it is prefix-summed." },
    ],
    related: ["prefix-sum", "interval-scheduling", "coordinate-compression", "segment-tree"],
    problems: [1109, 1094, 2381, 1893, 732],
  },
  {
    slug: "sorting",
    title: "Sorting",
    category: "foundations",
    description: "Sorting is rarely the answer — it is the preprocessing step that makes the answer obvious.",
    concepts: ["Comparator", "Stability", "Counting sort"],
    usedFor: ["enabling two pointers", "greedy orderings", "grouping equals", "enabling binary search"],
    signals: ["pairs", "intervals", "k closest", "duplicates adjacent", "smallest/largest arrangement", "order doesn't matter"],
    recognition: [
      "the output order is irrelevant, so you are free to reorder the input",
      "a greedy choice becomes obviously safe once the data is ordered",
      "duplicates should be adjacent so they can be skipped",
      "you want to two-point or binary search afterwards",
    ],
    typicalQuestion: "Find all unique triplets summing to zero.",
    mentalModel: {
      lines: [
        "Sorting is rarely the answer. It is what makes the answer easy.",
        "Spend O(n log n) only to unlock a faster next step.",
        "The interesting choice is the comparator, not the algorithm.",
      ],
      diagram: `  unsorted   → nested loops, O(n²)
       │
     sort  O(n log n)
       ▼
  sorted     → two pointers / binary search / greedy sweep, O(n) or O(n log n)`,
      key: "Ask what sorting buys you before you pay for it.",
    },
    templates: [
      {
        name: "Basics",
        filename: "sort_basics.go",
        note: "The four calls that cover almost every interview.",
        code: `sort.Ints(nums)
sort.Strings(words)
sort.Float64s(xs)

// slices.Sort is the modern generic form (Go 1.21+)
slices.Sort(nums)
slices.SortFunc(items, func(a, b Item) int {
    return cmp.Compare(a.Weight, b.Weight)
})`,
      },
      {
        name: "Custom comparator",
        filename: "comparator.go",
        note: "less(i, j) must be strict: never true for both (i,j) and (j,i).",
        code: `// by end ascending, then by start descending
sort.Slice(intervals, func(i, j int) bool {
    if intervals[i][1] != intervals[j][1] {
        return intervals[i][1] < intervals[j][1]
    }
    return intervals[i][0] > intervals[j][0]
})

// arrangement order: "9" before "34" because "934" > "349"
sort.Slice(nums, func(i, j int) bool {
    a, b := nums[i], nums[j]
    return a+b > b+a
})`,
      },
      {
        name: "Counting sort",
        filename: "counting_sort.go",
        note: "O(n + k) when the values sit in a small known range.",
        code: `func countingSort(a []int, maxV int) []int {
    cnt := make([]int, maxV+1)
    for _, v := range a {
        cnt[v]++
    }

    out := make([]int, 0, len(a))
    for v, c := range cnt {
        for ; c > 0; c-- {
            out = append(out, v)
        }
    }
    return out
}`,
      },
      {
        name: "Merge sort",
        filename: "merge_sort.go",
        note: "Write it by hand when the merge step also has to count something.",
        code: `func mergeSort(a []int) []int {
    if len(a) <= 1 {
        return a
    }
    mid := len(a) / 2
    left, right := mergeSort(a[:mid]), mergeSort(a[mid:])

    out := make([]int, 0, len(a))
    i, j := 0, 0
    for i < len(left) && j < len(right) {
        if left[i] <= right[j] {
            out = append(out, left[i])
            i++
        } else {
            out = append(out, right[j])
            j++
        }
    }
    out = append(out, left[i:]...)
    return append(out, right[j:]...)
}`,
      },
    ],
    complexity: [
      { label: "Comparison sort", value: "O(n log n)", note: "no comparison sort can beat this" },
      { label: "Counting sort", value: "O(n + k)", note: "k = value range" },
      { label: "sort.Slice space", value: "O(log n)", note: "pdqsort, in place" },
      { label: "Merge sort space", value: "O(n)" },
    ],
    variations: [
      { name: "Sort by a derived key", detail: "Sort indices or a struct rather than mutating the original when positions matter." },
      { name: "Partial sort", detail: "For top-k you want a heap or quickselect, not a full sort." },
      { name: "Bucket by frequency", detail: "Frequencies are bounded by n, so 'top k frequent' can be O(n) with buckets." },
    ],
    mistakes: [
      { title: "Assuming sort.Slice is stable", detail: "It is not. Use sort.SliceStable when equal elements must keep their relative order." },
      { title: "A comparator that says both ways are true", detail: "Using <= in less() can cause an inconsistent order and, in some runtimes, a panic." },
      { title: "Sorting when you only need the k best", detail: "A size-k heap is O(n log k), and quickselect is O(n) on average." },
      { title: "Losing the original indices", detail: "If the answer is an index, sort a slice of pairs or of indices." },
    ],
    related: ["two-pointers", "greedy-sorting", "classic-binary-search", "heap"],
    problems: [912, 75, 179, 274, 56, 57, 15, 368, 1626],
  },
  {
    slug: "coordinate-compression",
    title: "Coordinate Compression",
    category: "foundations",
    description: "Replace huge or sparse values with their ranks so index-based structures become usable.",
    concepts: ["Rank", "Sort + dedupe", "Sparse"],
    usedFor: ["BIT and segment trees over large values", "sweep lines with huge coordinates", "rank queries"],
    signals: ["values up to 1e9", "n is small but values are large", "count smaller elements", "sparse intervals"],
    recognition: [
      "you want a Fenwick or segment tree but the value range is far larger than n",
      "only the relative order of values matters, not their magnitudes",
      "coordinates are sparse — millions of possible positions, thousands used",
    ],
    typicalQuestion: "Count how many elements to the right are smaller than each element.",
    mentalModel: {
      lines: [
        "Sort the distinct values and replace each one by its position.",
        "n values means at most n positions, so the structure stays small.",
        "Order survives, so any comparison still works.",
      ],
      diagram: `  values   [ 900  5  900  10⁹ ]
  sorted   [ 5  900  10⁹ ]
  rank      0    1     2

  compressed [ 1  0  1  2 ]`,
      key: "Compression keeps order, not distance. Never use ranks for sums or gaps.",
    },
    templates: [
      {
        name: "Compress",
        filename: "compress.go",
        note: "Sort, remove duplicates, then binary search each value for its rank.",
        code: `func compress(a []int) ([]int, []int) {
    sorted := append([]int(nil), a...)
    sort.Ints(sorted)

    // dedupe in place
    w := 0
    for i, v := range sorted {
        if i == 0 || v != sorted[w-1] {
            sorted[w] = v
            w++
        }
    }
    sorted = sorted[:w]

    ranks := make([]int, len(a))
    for i, v := range a {
        ranks[i] = sort.SearchInts(sorted, v)
    }
    return ranks, sorted // ranks[i] indexes into sorted
}`,
      },
      {
        name: "Compress + BIT",
        filename: "count_smaller.go",
        note: "Sweep right to left, asking how many smaller ranks are already in.",
        code: `func countSmaller(nums []int) []int {
    ranks, distinct := compress(nums)
    bit := NewBIT(len(distinct))

    out := make([]int, len(nums))
    for i := len(nums) - 1; i >= 0; i-- {
        out[i] = bit.Query(ranks[i] - 1) // strictly smaller
        bit.Add(ranks[i], 1)
    }
    return out
}`,
      },
    ],
    complexity: [
      { label: "Compress", value: "O(n log n)", note: "a sort plus one lookup per element" },
      { label: "Lookup rank", value: "O(log n)" },
      { label: "Space", value: "O(n)" },
    ],
    variations: [
      { name: "Map-based ranks", detail: "A map[int]int of value → rank avoids repeated binary searches when you look up many times." },
      { name: "Interval endpoints", detail: "For sweep lines, compress both starts and ends, and remember that adjacent ranks may span a wide real gap." },
      { name: "Offline queries", detail: "Compress query values together with the array values so both fit the same index space." },
    ],
    mistakes: [
      { title: "Forgetting to dedupe", detail: "Duplicate values must map to the same rank, or counts split across two indices." },
      { title: "Using ranks for arithmetic", detail: "Rank differences are not value differences. Keep the original values for any sum or distance." },
      { title: "Compressing queries separately", detail: "If a query value is absent from the compressed set, its rank is meaningless — compress everything together." },
    ],
    related: ["fenwick-tree", "segment-tree", "sorting", "lower-bound"],
    problems: [315, 493, 220, 218, 699, 274],
  },
  {
    slug: "math-number-theory",
    title: "Math & Number Theory",
    category: "foundations",
    description: "GCD, primes, bit tricks and overflow — the small results that collapse a loop into a formula.",
    concepts: ["GCD", "Sieve", "Bits", "Overflow"],
    usedFor: ["divisibility", "fraction normalisation", "prime enumeration", "bit manipulation", "closed forms"],
    signals: ["divisible", "prime", "gcd", "lcm", "power", "digits", "xor", "count bits", "modulo 1e9+7"],
    recognition: [
      "the brute force is a loop over multiples or divisors — a formula or sieve exists",
      "a fraction must be normalised, meaning gcd",
      "the input is huge (1e18) so the answer must be O(log n) or closed form",
      "the problem mentions XOR, parity, or counting set bits",
    ],
    typicalQuestion: "Count the primes below n.",
    mentalModel: {
      lines: [
        "gcd(a, b) = gcd(b, a mod b). That loop finishes in O(log n).",
        "lcm(a, b) = a / gcd * b. Divide first so nothing overflows.",
        "Squaring turns a^n from n steps into log n steps.",
        "n & (n-1) clears the lowest set bit.",
      ],
      diagram: `  a^13 = a^8 · a^4 · a^1
         13 = 1101₂

  square and multiply:
  bit set → multiply into the result
  always  → square the base`,
      key: "Anything phrased over multiples, divisors or powers has a log-time form.",
    },
    templates: [
      {
        name: "GCD / LCM",
        filename: "gcd.go",
        note: "Euclid, written as a loop. No recursion depth to worry about.",
        code: `func gcd(a, b int) int {
    for b != 0 {
        a, b = b, a%b
    }
    if a < 0 {
        return -a
    }
    return a
}

func lcm(a, b int) int {
    return a / gcd(a, b) * b // divide first: avoids overflow
}`,
      },
      {
        name: "Sieve",
        filename: "sieve.go",
        note: "Start crossing out at i*i. Smaller multiples already have a smaller factor.",
        code: `func sieve(n int) []bool {
    isComposite := make([]bool, n+1)
    for i := 2; i*i <= n; i++ {
        if !isComposite[i] {
            for j := i * i; j <= n; j += i {
                isComposite[j] = true
            }
        }
    }
    return isComposite
}`,
      },
      {
        name: "Fast power",
        filename: "fast_pow.go",
        note: "Square and multiply, with the modulus folded in.",
        code: `func powMod(base, exp, mod int) int {
    base %= mod
    result := 1
    for exp > 0 {
        if exp&1 == 1 {
            result = result * base % mod
        }
        base = base * base % mod
        exp >>= 1
    }
    return result
}`,
      },
      {
        name: "Bit tricks",
        filename: "bits.go",
        note: "math/bits is standard library and usually compiles to one instruction.",
        code: `import "math/bits"

bits.OnesCount(uint(n))      // popcount
bits.TrailingZeros(uint(n))  // index of the lowest set bit
bits.Len(uint(n))            // 1 + floor(log2(n))

n & (n - 1)   // clear the lowest set bit
n & -n        // isolate the lowest set bit
n | (n + 1)   // set the lowest clear bit
n>>i & 1      // read bit i`,
      },
    ],
    complexity: [
      { label: "GCD", value: "O(log min(a,b))" },
      { label: "Sieve", value: "O(n log log n)" },
      { label: "Fast power", value: "O(log n)" },
      { label: "Popcount", value: "O(1)", note: "hardware instruction" },
    ],
    variations: [
      { name: "Extended Euclid", detail: "Also returns x, y with ax + by = gcd(a,b) — the basis of the modular inverse." },
      { name: "Smallest prime factor sieve", detail: "Store the smallest factor of each number for O(log n) factorisation of any value below n." },
      { name: "Digit extraction", detail: "n % 10 and n /= 10 walk digits right to left with no string conversion." },
    ],
    mistakes: [
      { title: "a * b overflowing before the division in lcm", detail: "Always a / gcd * b, never a * b / gcd." },
      { title: "Negative modulo in Go", detail: "-7 % 3 is -1, not 2. Normalise with ((x % m) + m) % m." },
      { title: "Starting the sieve inner loop at 2*i", detail: "Correct but slower; i*i is the standard bound." },
      { title: "Checking overflow after it happens", detail: "Compare against math.MaxInt/10 before multiplying." },
    ],
    related: ["modular-arithmetic", "matrix-exponentiation", "binary-search-on-answer", "bitmask-dp"],
    problems: [204, 50, 372, 69, 7, 168, 268, 136, 191, 338, 202, 149],
  },
];
