import type { Pattern } from "../types";

export const binarySearch: Pattern[] = [
  {
    slug: "classic-binary-search",
    title: "Classic Binary Search",
    category: "binary-search",
    description: "Halve a sorted range until the target is found or the range is empty.",
    concepts: ["Sorted", "Halving", "Invariant"],
    usedFor: ["exact lookup in sorted data", "any O(log n) requirement over an ordered range"],
    signals: ["sorted array", "find target", "O(log n)", "return the index", "already sorted"],
    recognition: [
      "the data is sorted and you need an exact match",
      "the required complexity is logarithmic",
      "you can discard half the candidates after one comparison",
      "the matrix is row-major sorted — treat it as one flat sorted array",
    ],
    typicalQuestion: "Return the index of target in a sorted array, or -1.",
    mentalModel: {
      lines: [
        "Keep one promise: the answer is inside [lo, hi).",
        "Look at the middle, throw away the half that cannot hold it.",
        "Every step must make the range smaller, or you loop forever.",
      ],
      diagram: `  [ 1  3  5  7  9  11 ]
    lo       mid      hi

  a[mid] < target → lo = mid+1
  a[mid] > target → hi = mid
  else            → found`,
      key: "Pick one convention, the half-open [lo, hi), and write every variant that way.",
    },
    templates: [
      {
        name: "Classic",
        filename: "binary_search.go",
        note: "Half-open bounds. The loop ends when lo == hi and nothing is left.",
        code: `func binarySearch(nums []int, target int) int {
    lo, hi := 0, len(nums) // half-open: [lo, hi)

    for lo < hi {
        mid := lo + (hi-lo)/2
        switch {
        case nums[mid] == target:
            return mid
        case nums[mid] < target:
            lo = mid + 1
        default:
            hi = mid
        }
    }
    return -1
}`,
      },
      {
        name: "Standard library",
        filename: "stdlib.go",
        note: "sort.Search finds the first index where a false-then-true test turns true.",
        code: `// index of the first element >= target
i := sort.SearchInts(nums, target)
if i < len(nums) && nums[i] == target {
    // found at i
}

// generic form over any monotone predicate
i = sort.Search(len(nums), func(i int) bool {
    return nums[i] >= target
})

// Go 1.21+
i, found := slices.BinarySearch(nums, target)`,
      },
      {
        name: "2D as 1D",
        filename: "search_matrix.go",
        note: "A row-major sorted matrix is one long sorted array.",
        code: `func searchMatrix(m [][]int, target int) bool {
    rows, cols := len(m), len(m[0])
    lo, hi := 0, rows*cols

    for lo < hi {
        mid := lo + (hi-lo)/2
        v := m[mid/cols][mid%cols]
        switch {
        case v == target:
            return true
        case v < target:
            lo = mid + 1
        default:
            hi = mid
        }
    }
    return false
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(log n)" },
      { label: "Space", value: "O(1)", note: "O(log n) if you write it recursively" },
    ],
    why: "Each comparison removes half the candidates, so n shrinks to 1 in about log2(n) steps. The only thing it needs is that the comparison agrees with the order, which is why 'sorted' is required and not just helpful.",
    variations: [
      { name: "Lower bound", detail: "First index with a[i] >= target — the form you should default to." },
      { name: "Upper bound", detail: "First index with a[i] > target." },
      { name: "Binary search on answer", detail: "When the array is not sorted, but a yes/no test over the answer flips just once." },
      { name: "Search on a float range", detail: "Loop a fixed 100 iterations, or until hi-lo < epsilon." },
    ],
    mistakes: [
      { title: "(lo+hi)/2 overflow", detail: "Not a practical risk with Go's 64-bit int, but lo + (hi-lo)/2 is the habit to keep." },
      { title: "Mixing inclusive and half-open bounds", detail: "hi = len(nums) with hi = mid-1 is an infinite loop waiting to happen." },
      { title: "A range that does not shrink", detail: "If a branch sets lo = mid (not mid+1), make sure mid is biased upward or the loop hangs." },
      { title: "Forgetting the post-check", detail: "sort.Search returns an insertion point; you still have to verify the element matches." },
    ],
    related: ["lower-bound", "upper-bound", "binary-search-on-answer", "rotated-array-search"],
    problems: [704, 35, 374, 74, 4, 240],
  },
  {
    slug: "lower-bound",
    title: "Lower Bound",
    category: "binary-search",
    description: "The first index whose value is greater than or equal to the target — the insertion point.",
    concepts: ["First >= x", "Insertion point", "Counting"],
    usedFor: ["first occurrence", "insertion position", "counting elements below a value", "LIS tails array"],
    signals: ["first occurrence", "insert position", "how many are less than", "smallest index such that", "at least x"],
    recognition: [
      "the array may contain duplicates and you want the leftmost match",
      "you need the position where a value would be inserted",
      "you want a count of elements strictly below a threshold — that count is the lower bound",
      "you are maintaining a tails array for longest increasing subsequence",
    ],
    typicalQuestion: "Find the first and last position of a target in a sorted array.",
    mentalModel: {
      lines: [
        "Ask a yes/no question: is a[i] >= target?",
        "The answers read false, false, ..., true, true.",
        "Lower bound is where they flip.",
        "It never fails: it returns where the value would be inserted.",
      ],
      diagram: `  [ 1  2  2  2  5 ]   target = 2

   >= 2 ?  F  T  T  T  T
              ▲
        lowerBound = 1

  count of elements < 2 is also 1`,
      key: "Lower bound gives an insertion point, so you still have to check the element yourself.",
    },
    templates: [
      {
        name: "Lower bound",
        filename: "lower_bound.go",
        note: "First index with nums[i] >= target. Returns len(nums) if there is none.",
        code: `func lowerBound(nums []int, target int) int {
    lo, hi := 0, len(nums)
    for lo < hi {
        mid := lo + (hi-lo)/2
        if nums[mid] < target {
            lo = mid + 1
        } else {
            hi = mid
        }
    }
    return lo
}`,
      },
      {
        name: "First and last",
        filename: "search_range.go",
        note: "Two bounds, no special cases, no walking outwards afterwards.",
        code: `func searchRange(nums []int, target int) []int {
    lo := lowerBound(nums, target)
    if lo == len(nums) || nums[lo] != target {
        return []int{-1, -1}
    }
    return []int{lo, upperBound(nums, target) - 1}
}`,
      },
      {
        name: "LIS tails",
        filename: "lis.go",
        note: "tails[k] is the smallest ending of any increasing run of length k+1.",
        code: `func lengthOfLIS(nums []int) int {
    tails := make([]int, 0, len(nums))

    for _, v := range nums {
        i := lowerBound(tails, v) // use upperBound for non-decreasing
        if i == len(tails) {
            tails = append(tails, v)
        } else {
            tails[i] = v
        }
    }
    return len(tails)
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(log n)" },
      { label: "LIS with lower bound", value: "O(n log n)" },
      { label: "Space", value: "O(1)", note: "O(n) for the LIS tails array" },
    ],
    variations: [
      { name: "Count less than x", detail: "lowerBound(x) is exactly that count." },
      { name: "Count in a range", detail: "upperBound(hi) - lowerBound(lo)." },
      { name: "On a predicate", detail: "sort.Search generalises it to any false-then-true condition." },
    ],
    mistakes: [
      { title: "Assuming the result is a match", detail: "Always check i < n && nums[i] == target." },
      { title: "Using < instead of <= in the comparison", detail: "One character separates lower bound from upper bound." },
      { title: "LIS with the wrong bound", detail: "Strictly increasing needs lowerBound; non-decreasing needs upperBound." },
    ],
    related: ["upper-bound", "classic-binary-search", "binary-search-on-answer", "linear-dp"],
    problems: [34, 35, 300, 354, 658, 2300, 528],
  },
  {
    slug: "upper-bound",
    title: "Upper Bound",
    category: "binary-search",
    description: "The first index whose value is strictly greater than the target.",
    concepts: ["First > x", "Counting", "Ranges"],
    usedFor: ["last occurrence", "counting duplicates", "range counts", "non-decreasing LIS"],
    signals: ["last occurrence", "how many are <= x", "count in range", "at most x"],
    recognition: [
      "you want the element after the last match",
      "you are counting how many values are less than or equal to a threshold",
      "you need the size of an equal-value block: upperBound - lowerBound",
    ],
    typicalQuestion: "How many values in this sorted array are at most x?",
    mentalModel: {
      lines: [
        "Same search, different question: is a[i] > target?",
        "upperBound(x) counts the values that are <= x.",
        "upperBound(x) - lowerBound(x) counts the copies of x.",
      ],
      diagram: `  [ 1  2  2  2  5 ]   target = 2

   > 2 ?  F  F  F  F  T
                     ▲
       upperBound = 4

  copies of 2 = 4 − 1 = 3`,
      key: "Lower bound counts what is below x. Upper bound counts what is at most x.",
    },
    templates: [
      {
        name: "Upper bound",
        filename: "upper_bound.go",
        note: "Identical to lower bound, with <= instead of <.",
        code: `func upperBound(nums []int, target int) int {
    lo, hi := 0, len(nums)
    for lo < hi {
        mid := lo + (hi-lo)/2
        if nums[mid] <= target {
            lo = mid + 1
        } else {
            hi = mid
        }
    }
    return lo
}`,
      },
      {
        name: "Counting",
        filename: "counting.go",
        note: "Three useful counts fall straight out of the two bounds.",
        code: `countLess     := lowerBound(a, x)
countLessEq   := upperBound(a, x)
countEqual    := upperBound(a, x) - lowerBound(a, x)
countInRange  := upperBound(a, hi) - lowerBound(a, lo) // [lo, hi] inclusive`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(log n)" },
      { label: "Space", value: "O(1)" },
    ],
    variations: [
      { name: "Last occurrence", detail: "upperBound(x) - 1, valid only after confirming x exists." },
      { name: "Weighted random pick", detail: "Upper bound over a prefix-sum array turns a uniform draw into a weighted one." },
      { name: "Non-decreasing LIS", detail: "Swap lowerBound for upperBound in the tails algorithm." },
    ],
    mistakes: [
      { title: "Off by one on the last occurrence", detail: "upperBound points past the block; subtract one." },
      { title: "Calling it on an unsorted slice", detail: "Both bounds assume order — no error is raised, the answer is just wrong." },
    ],
    related: ["lower-bound", "classic-binary-search", "prefix-sum", "coordinate-compression"],
    problems: [34, 528, 2300],
  },
  {
    slug: "binary-search-on-answer",
    title: "Binary Search on Answer",
    category: "binary-search",
    description: "The input is not sorted — the answer space is. Search that instead.",
    concepts: ["Feasibility", "Monotone", "Minimise max"],
    usedFor: ["minimise the maximum", "maximise the minimum", "minimum capacity or speed", "smallest valid threshold"],
    signals: ["minimum possible", "maximum possible", "minimise the largest", "maximise the smallest", "at least k within", "smallest capacity"],
    recognition: [
      "the answer is a number in a known range, not an element of the array",
      "you can write a cheap check that says whether a candidate is good enough",
      "if one candidate works, every bigger one works too",
      "the wording is 'minimise the largest' or 'maximise the smallest'",
    ],
    typicalQuestion: "What is the smallest eating speed that finishes all the bananas in h hours?",
    mentalModel: {
      lines: [
        "Stop searching the data. Search the answer.",
        "Write a cheap check: is this candidate good enough?",
        "If a bigger candidate is never worse, the checks read F F F T T T.",
        "Find the flip point.",
      ],
      diagram: `  answer space   1 ─────────────── maxV

  feasible(x)    F  F  F  T  T  T  T
                       └──▲
                 first feasible = answer

  cost: O(log range × cost of feasible)`,
      key: "The binary search is the easy half. Designing the check is the problem.",
    },
    templates: [
      {
        name: "Minimum feasible",
        filename: "search_on_answer.go",
        note: "The skeleton. Only feasible() changes from problem to problem.",
        code: `func minFeasible(lo, hi int, feasible func(int) bool) int {
    // invariant: the answer is in [lo, hi]
    for lo < hi {
        mid := lo + (hi-lo)/2
        if feasible(mid) {
            hi = mid // mid might be the answer — keep it
        } else {
            lo = mid + 1
        }
    }
    return lo
}`,
      },
      {
        name: "Koko bananas",
        filename: "koko.go",
        note: "feasible = can we finish at speed k. Ceil division without floats.",
        code: `func minEatingSpeed(piles []int, h int) int {
    lo, hi := 1, slices.Max(piles)

    feasible := func(k int) bool {
        hours := 0
        for _, p := range piles {
            hours += (p + k - 1) / k // ceil(p/k)
            if hours > h {
                return false // early exit
            }
        }
        return hours <= h
    }
    return minFeasible(lo, hi, feasible)
}`,
      },
      {
        name: "Minimise the maximum",
        filename: "split_array.go",
        note: "The floor is max(nums): no part can be smaller than its biggest element.",
        code: `func splitArray(nums []int, k int) int {
    lo, hi := slices.Max(nums), 0
    for _, v := range nums {
        hi += v
    }

    feasible := func(cap int) bool {
        parts, cur := 1, 0
        for _, v := range nums {
            if cur+v > cap {
                parts++
                cur = 0
            }
            cur += v
        }
        return parts <= k
    }
    return minFeasible(lo, hi, feasible)
}`,
      },
      {
        name: "Maximise the minimum",
        filename: "max_min_gap.go",
        note: "The mirror image. Bias mid upward, or lo = mid loops forever.",
        code: `func maxDistance(positions []int, m int) int {
    sort.Ints(positions)
    lo, hi := 1, positions[len(positions)-1]-positions[0]

    feasible := func(gap int) bool {
        count, last := 1, positions[0]
        for _, p := range positions[1:] {
            if p-last >= gap {
                count++
                last = p
            }
        }
        return count >= m
    }

    for lo < hi {
        mid := lo + (hi-lo+1)/2 // bias up: lo = mid would otherwise hang
        if feasible(mid) {
            lo = mid
        } else {
            hi = mid - 1
        }
    }
    return lo
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n log R)", note: "R = size of the answer range" },
      { label: "feasible()", value: "O(n)", note: "usually a single greedy sweep" },
      { label: "Space", value: "O(1)" },
    ],
    why: "Binary search only needs a yes/no test that flips once, not a sorted array. If a candidate that works means every larger candidate works, the answer range behaves exactly like a sorted array of booleans.",
    variations: [
      { name: "Maximise instead of minimise", detail: "Predicate becomes true-then-false. Bias mid upward and set lo = mid, or negate the predicate." },
      { name: "Real-valued answers", detail: "Iterate a fixed ~100 times instead of comparing floats for equality." },
      { name: "Nested binary search", detail: "feasible() may itself be a binary search — Median of Two Sorted Arrays, for example." },
      { name: "Parametric search", detail: "The general name for this technique in the literature." },
    ],
    mistakes: [
      { title: "An infinite loop on the maximise form", detail: "With lo = mid you must bias mid upward: lo + (hi-lo+1)/2." },
      { title: "Wrong initial bounds", detail: "lo must be feasible-or-lower and hi must be feasible. For split-array, lo = max(nums), not 1." },
      { title: "A test that flips more than once", detail: "Binary search will still find a boundary, just not the one you wanted." },
      { title: "Overflow or float error in feasible", detail: "Use integer ceil division: (p + k - 1) / k." },
    ],
    related: ["parametric-search", "lower-bound", "greedy-sorting", "dijkstra"],
    problems: [875, 1011, 410, 1482, 1283, 1552, 278, 69, 1044, 1631, 778, 287],
  },
  {
    slug: "rotated-array-search",
    title: "Search in Rotated Array",
    category: "binary-search",
    description: "A sorted array cut and swapped — one half of any split is still sorted.",
    concepts: ["Pivot", "Half sorted", "Duplicates"],
    usedFor: ["searching a rotated sorted array", "finding the rotation point", "finding the minimum"],
    signals: ["rotated sorted array", "pivot", "shifted", "find the minimum", "sorted but rotated"],
    recognition: [
      "the statement says 'sorted array rotated at an unknown pivot'",
      "the array is mostly increasing with one drop",
      "O(log n) is required, so a linear scan for the pivot is not allowed",
    ],
    typicalQuestion: "Search for a target in a rotated sorted array in O(log n).",
    mentalModel: {
      lines: [
        "Cut at the middle. One half is always still sorted.",
        "Work out which half that is by comparing with an end.",
        "Ask whether the target sits inside the sorted half, and search there.",
      ],
      diagram: `  [ 4  5  6  7  0  1  2 ]
     └── sorted ──┘  └ not ┘
    lo       mid          hi

  a[lo] <= a[mid] → left half sorted`,
      key: "Compare against the endpoints, not against the target, to find the sorted half.",
    },
    templates: [
      {
        name: "Search rotated",
        filename: "search_rotated.go",
        note: "Inclusive bounds read better here. Note the <= in the left-sorted test.",
        code: `func search(nums []int, target int) int {
    lo, hi := 0, len(nums)-1

    for lo <= hi {
        mid := lo + (hi-lo)/2
        if nums[mid] == target {
            return mid
        }

        if nums[lo] <= nums[mid] { // left half sorted
            if nums[lo] <= target && target < nums[mid] {
                hi = mid - 1
            } else {
                lo = mid + 1
            }
        } else { // right half sorted
            if nums[mid] < target && target <= nums[hi] {
                lo = mid + 1
            } else {
                hi = mid - 1
            }
        }
    }
    return -1
}`,
      },
      {
        name: "Find minimum",
        filename: "find_min.go",
        note: "Compare mid with hi. Comparing with lo cannot tell the cases apart.",
        code: `func findMin(nums []int) int {
    lo, hi := 0, len(nums)-1
    for lo < hi {
        mid := lo + (hi-lo)/2
        if nums[mid] > nums[hi] {
            lo = mid + 1 // minimum is strictly right of mid
        } else {
            hi = mid // mid could be the minimum
        }
    }
    return nums[lo]
}`,
      },
      {
        name: "With duplicates",
        filename: "rotated_dupes.go",
        note: "When nums[mid] == nums[hi] you learn nothing, so just step hi back.",
        code: `func findMinDup(nums []int) int {
    lo, hi := 0, len(nums)-1
    for lo < hi {
        mid := lo + (hi-lo)/2
        switch {
        case nums[mid] > nums[hi]:
            lo = mid + 1
        case nums[mid] < nums[hi]:
            hi = mid
        default:
            hi-- // ambiguous: discard one duplicate
        }
    }
    return nums[lo]
}`,
      },
    ],
    complexity: [
      { label: "Distinct values", value: "O(log n)" },
      { label: "With duplicates", value: "O(n)", note: "worst case, e.g. [2,2,2,1,2]" },
      { label: "Space", value: "O(1)" },
    ],
    variations: [
      { name: "Two-pass", detail: "Find the pivot, then binary search the correct segment. Easier to reason about, twice the code." },
      { name: "Index rotation", detail: "With the pivot p known, map logical index i to (i+p) % n and run an ordinary search." },
      { name: "Rotated with duplicates", detail: "Only the ambiguity branch changes; the rest is identical." },
    ],
    mistakes: [
      { title: "Using < instead of <= for nums[lo] <= nums[mid]", detail: "With a two-element range, lo == mid and the strict test misclassifies the sorted half." },
      { title: "Comparing mid against lo when finding the minimum", detail: "In an unrotated array that comparison sends you the wrong way. Use hi." },
      { title: "Assuming O(log n) with duplicates", detail: "It degrades to linear — say so in an interview." },
    ],
    related: ["classic-binary-search", "bitonic-search", "search-sorted-structures", "lower-bound"],
    problems: [33, 81, 153, 154],
  },
  {
    slug: "search-sorted-structures",
    title: "Search in Sorted Structures",
    category: "binary-search",
    description: "Matrices, streams and infinite arrays that are ordered — exploit the order without flattening.",
    concepts: ["Staircase", "2D", "Unknown length"],
    usedFor: ["row and column sorted matrices", "arrays of unknown length", "sorted streams"],
    signals: ["each row sorted", "each column sorted", "unknown size", "ArrayReader", "matrix search"],
    recognition: [
      "rows and columns are both sorted, but rows do not continue into each other",
      "the length is unknown or unbounded",
      "you can start at a corner where one direction always increases and the other decreases",
    ],
    typicalQuestion: "Search a matrix where every row and every column is sorted ascending.",
    mentalModel: {
      lines: [
        "Start at the top-right corner.",
        "Going left always gets smaller. Going down always gets bigger.",
        "So each step throws away a whole row or a whole column.",
      ],
      diagram: `  ┌──────────────▶ start
  │  1   4   7  11
  │  2   5   8  12
  ▼  3   6   9  16

  v > target → move left (drop a column)
  v < target → move down (drop a row)`,
      key: "A corner where the two directions disagree is a decision you can trust.",
    },
    templates: [
      {
        name: "Staircase",
        filename: "staircase.go",
        note: "O(m+n): every step removes an entire row or column.",
        code: `func searchMatrix(m [][]int, target int) bool {
    if len(m) == 0 {
        return false
    }
    r, c := 0, len(m[0])-1 // top-right

    for r < len(m) && c >= 0 {
        switch {
        case m[r][c] == target:
            return true
        case m[r][c] > target:
            c--
        default:
            r++
        }
    }
    return false
}`,
      },
      {
        name: "Unknown length",
        filename: "unbounded.go",
        note: "Double the bound until you overshoot, then binary search.",
        code: `func searchUnbounded(get func(int) int, target int) int {
    hi := 1
    for get(hi) < target {
        hi *= 2
    }
    lo := hi / 2

    for lo < hi {
        mid := lo + (hi-lo)/2
        if get(mid) < target {
            lo = mid + 1
        } else {
            hi = mid
        }
    }
    if get(lo) == target {
        return lo
    }
    return -1
}`,
      },
    ],
    complexity: [
      { label: "Staircase", value: "O(m + n)" },
      { label: "Flattened 2D search", value: "O(log mn)", note: "only if each row continues into the next" },
      { label: "Unknown length", value: "O(log n)" },
      { label: "Space", value: "O(1)" },
    ],
    variations: [
      { name: "Bottom-left start", detail: "Equivalent: up decreases, right increases." },
      { name: "Binary search per row", detail: "O(m log n) — correct but worse than the staircase." },
      { name: "Kth smallest in a sorted matrix", detail: "Binary search the value and count elements <= mid with a staircase." },
    ],
    mistakes: [
      { title: "Flattening a matrix that is not row-major sorted", detail: "Problem 74 allows it; problem 240 does not." },
      { title: "Starting at the top-left", detail: "Both directions increase there, so no comparison eliminates anything." },
      { title: "Reading out of bounds on unknown-length arrays", detail: "The API usually returns a sentinel; treat it as +infinity." },
    ],
    related: ["classic-binary-search", "exponential-search", "heap", "lower-bound"],
    problems: [240, 74, 4],
  },
  {
    slug: "ternary-search",
    title: "Ternary Search",
    category: "binary-search",
    description: "Find the extremum of a unimodal function by discarding a third at a time.",
    concepts: ["Unimodal", "Extremum", "Convex"],
    usedFor: ["maximising a concave function", "minimising a convex function", "continuous optimisation"],
    signals: ["unimodal", "increases then decreases", "minimise a convex cost", "peak", "optimal point"],
    recognition: [
      "the value rises then falls, or falls then rises, exactly once",
      "you are looking for the best point, not for an exact match",
      "the slope only changes direction once, even if you cannot write the formula",
    ],
    typicalQuestion: "Minimise a convex cost function over a range of integers.",
    mentalModel: {
      lines: [
        "Use it when the curve goes up then down, just once.",
        "Pick two points inside the range and compare them.",
        "The lower one cannot be near the peak, so drop its side.",
        "For integers, binary search the slope instead. It is simpler.",
      ],
      diagram: `        ╱‾‾╲
      ╱      ╲
    ╱          ╲
  lo   m1   m2   hi

  f(m1) < f(m2) → lo = m1   (maximising)
  f(m1) > f(m2) → hi = m2`,
      key: "Binary search needs a yes/no test. Ternary search needs a single hump.",
    },
    templates: [
      {
        name: "Integer ternary",
        filename: "ternary_int.go",
        note: "For integers, binary searching the slope is simpler and exact.",
        code: `// maximise a unimodal f over [lo, hi]
func ternaryMaxInt(lo, hi int, f func(int) int) int {
    for hi-lo > 2 {
        m1 := lo + (hi-lo)/3
        m2 := hi - (hi-lo)/3
        if f(m1) < f(m2) {
            lo = m1 + 1
        } else {
            hi = m2 - 1
        }
    }
    best := lo
    for i := lo + 1; i <= hi; i++ {
        if f(i) > f(best) {
            best = i
        }
    }
    return best
}`,
      },
      {
        name: "Slope binary search",
        filename: "slope_search.go",
        note: "The slope only changes sign once, so binary search it.",
        code: `// first index where the function stops increasing
func peakIndex(f func(int) int, lo, hi int) int {
    for lo < hi {
        mid := lo + (hi-lo)/2
        if f(mid) < f(mid+1) {
            lo = mid + 1 // still climbing
        } else {
            hi = mid
        }
    }
    return lo
}`,
      },
      {
        name: "Real-valued",
        filename: "ternary_float.go",
        note: "A fixed number of rounds beats comparing floats for equality.",
        code: `func ternaryMin(lo, hi float64, f func(float64) float64) float64 {
    for i := 0; i < 200; i++ {
        m1 := lo + (hi-lo)/3
        m2 := hi - (hi-lo)/3
        if f(m1) < f(m2) {
            hi = m2
        } else {
            lo = m1
        }
    }
    return (lo + hi) / 2
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(log n)", note: "two checks per round" },
      { label: "Slope binary search", value: "O(log n)", note: "one check per round, so prefer it" },
      { label: "Space", value: "O(1)" },
    ],
    variations: [
      { name: "Golden-section search", detail: "Reuses one evaluation per round, so it converges faster per call to f." },
      { name: "Nested ternary", detail: "Optimising over two unimodal dimensions: ternary inside ternary." },
      { name: "Peak finding", detail: "Discrete peak problems are the slope form in disguise." },
    ],
    mistakes: [
      { title: "Applying it to a function with a plateau", detail: "f(m1) == f(m2) on a flat region gives no information — unimodality must be strict." },
      { title: "Looping until floats are equal", detail: "Use a fixed iteration count." },
      { title: "Reaching for ternary on integers", detail: "The slope binary search is exact and half the work." },
    ],
    related: ["bitonic-search", "binary-search-on-answer", "classic-binary-search"],
    problems: [162, 852],
  },
  {
    slug: "parametric-search",
    title: "Parametric Search",
    category: "binary-search",
    description: "Turn an optimisation problem into a decision problem, then binary search the parameter.",
    concepts: ["Decision", "Optimisation", "Threshold"],
    usedFor: ["minimax and maximin objectives", "threshold problems", "reducing optimisation to feasibility"],
    signals: ["minimise the maximum", "maximise the minimum", "smallest k such that", "optimal threshold", "bottleneck"],
    recognition: [
      "the objective is a min-of-max or max-of-min",
      "you cannot compute the optimum directly, but you can verify a candidate",
      "checking a candidate is much cheaper than optimising",
    ],
    typicalQuestion: "Minimise the largest sum among k contiguous parts.",
    mentalModel: {
      lines: [
        "Finding the best answer is hard. Checking one answer is easy.",
        "So swap the question: instead of 'what is best?', ask 'is x good enough?'",
        "That check flips once, so binary search finds the threshold.",
      ],
      diagram: `  optimisation:  min over all splits of (max part)
         │
         ▼  reduce
  decision:      can we split with every part <= X ?
         │
         ▼  monotone in X
  binary search X`,
      key: "The swap is the insight. The binary search is just bookkeeping.",
    },
    templates: [
      {
        name: "Reduction",
        filename: "parametric.go",
        note: "Write decide() first. If it flips only once, you are done.",
        code: `// optimum = smallest X such that decide(X) is true
func parametric(lo, hi int, decide func(int) bool) int {
    for lo < hi {
        mid := lo + (hi-lo)/2
        if decide(mid) {
            hi = mid
        } else {
            lo = mid + 1
        }
    }
    return lo
}`,
      },
      {
        name: "Bottleneck path",
        filename: "bottleneck.go",
        note: "Smallest possible largest step: check it with a plain reachability search.",
        code: `func minimumEffortPath(heights [][]int) int {
    rows, cols := len(heights), len(heights[0])

    reachable := func(limit int) bool {
        seen := make([][]bool, rows)
        for i := range seen {
            seen[i] = make([]bool, cols)
        }
        stack := [][2]int{{0, 0}}
        seen[0][0] = true

        for len(stack) > 0 {
            cur := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            r, c := cur[0], cur[1]
            if r == rows-1 && c == cols-1 {
                return true
            }
            for _, d := range [][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}} {
                nr, nc := r+d[0], c+d[1]
                if nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc] {
                    continue
                }
                if abs(heights[nr][nc]-heights[r][c]) <= limit {
                    seen[nr][nc] = true
                    stack = append(stack, [2]int{nr, nc})
                }
            }
        }
        return false
    }
    return parametric(0, 1_000_000, reachable)
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(D · log R)", note: "D = cost of one check, R = the range" },
      { label: "Space", value: "O(D)", note: "whatever the check itself needs" },
    ],
    why: "Finding an optimum and checking a candidate are usually about equally hard, up to a log factor. If the check flips exactly once as the candidate grows, log R checks pin down the exact answer.",
    variations: [
      { name: "Binary search on answer", detail: "The array-flavoured special case of the same idea." },
      { name: "Bottleneck shortest path", detail: "Also solvable with a modified Dijkstra or a DSU sweep over sorted edges." },
      { name: "Fractional programming", detail: "Maximise a ratio by binary searching λ and testing whether sum(a - λb) >= 0." },
    ],
    mistakes: [
      { title: "A test that is not one-way", detail: "Say it out loud: if decide(X) is true, is decide(X+1) always true too?" },
      { title: "A range that misses the optimum", detail: "Bound lo and hi with provable extremes, not guesses." },
      { title: "An expensive decision inside the loop", detail: "It runs log R times — keep it linear if you can." },
    ],
    related: ["binary-search-on-answer", "dijkstra", "union-find", "greedy-sorting"],
    problems: [410, 875, 1011, 1552, 1631, 778],
  },
  {
    slug: "exponential-search",
    title: "Exponential Search",
    category: "binary-search",
    description: "Double a bound until it overshoots, then binary search inside the last interval.",
    concepts: ["Galloping", "Unbounded", "Near the front"],
    usedFor: ["unbounded or unknown-length data", "targets near the start", "infinite streams"],
    signals: ["unknown length", "infinite array", "ArrayReader", "unbounded", "answer is probably small"],
    recognition: [
      "you cannot ask for the length, or the length is enormous",
      "the target is expected to be near the beginning",
      "an out-of-range read is expensive or returns a sentinel",
    ],
    typicalQuestion: "Search a sorted array of unknown length.",
    mentalModel: {
      lines: [
        "Probe 1, 2, 4, 8, 16 until you overshoot the target.",
        "The answer now sits between the last two probes.",
        "Binary search that range.",
      ],
      diagram: `  probe  1   2   4   8   16
                       ✓ overshoot
  search [8, 16]

  O(log p) probes + O(log p) search`,
      key: "Doubling costs the same in theory but touches far less data when the answer is early.",
    },
    templates: [
      {
        name: "Exponential search",
        filename: "exponential.go",
        note: "Guard the probe so you never read past the end.",
        code: `func exponentialSearch(get func(int) int, target int) int {
    const inf = math.MaxInt32

    hi := 1
    for get(hi) != inf && get(hi) < target {
        hi *= 2
    }
    lo := hi / 2

    for lo <= hi {
        mid := lo + (hi-lo)/2
        v := get(mid)
        switch {
        case v == target:
            return mid
        case v == inf || v > target:
            hi = mid - 1
        default:
            lo = mid + 1
        }
    }
    return -1
}`,
      },
      {
        name: "Galloping merge",
        filename: "gallop.go",
        note: "Used inside merge sorts to skip long runs from one side quickly.",
        code: `// first index in a[start:] with a[i] >= target
func gallop(a []int, start, target int) int {
    step := 1
    i := start
    for i < len(a) && a[i] < target {
        i += step
        step *= 2
    }
    lo, hi := max(start, i-step), min(i, len(a))
    return lo + lowerBound(a[lo:hi], target)
}`,
      },
    ],
    complexity: [
      { label: "Probing", value: "O(log p)", note: "p = index of the answer" },
      { label: "Binary search", value: "O(log p)" },
      { label: "Total", value: "O(log p)", note: "does not depend on n at all" },
      { label: "Space", value: "O(1)" },
    ],
    variations: [
      { name: "Galloping search", detail: "The same doubling used to merge two runs of very different sizes." },
      { name: "Backwards doubling", detail: "When the answer is likely near the end, double inwards from the far bound." },
      { name: "Unbounded answer range", detail: "Use it to establish hi before a binary search on answer." },
    ],
    mistakes: [
      { title: "Reading past the end while probing", detail: "Check the sentinel before comparing the value." },
      { title: "Starting the binary search at 0", detail: "It should start at hi/2 — everything below was already ruled out." },
      { title: "Using it when the length is known", detail: "A plain binary search is simpler and no slower." },
    ],
    related: ["classic-binary-search", "search-sorted-structures", "binary-search-on-answer"],
    problems: [704, 35],
  },
  {
    slug: "bitonic-search",
    title: "Bitonic / Peak Search",
    category: "binary-search",
    description: "An array that rises then falls — find the peak, then search the side that can hold the target.",
    concepts: ["Mountain", "Peak", "Two runs"],
    usedFor: ["mountain arrays", "peak elements", "local maxima in unsorted data"],
    signals: ["mountain array", "peak element", "increases then decreases", "local maximum", "bitonic"],
    recognition: [
      "the array climbs and then drops",
      "you need any local peak, and anything off the edge counts as very small",
      "the values are not sorted, but the slope only flips once, which is enough",
    ],
    typicalQuestion: "Find a peak element in O(log n).",
    mentalModel: {
      lines: [
        "Compare a[mid] with a[mid+1]. That tells you which way the slope runs.",
        "Going up means a peak lies to the right.",
        "Going down means mid might already be the peak.",
      ],
      diagram: `        ╱‾╲
      ╱     ╲
    ╱          ╲
  a[mid] < a[mid+1] → go right
  a[mid] > a[mid+1] → go left (mid may be the peak)`,
      key: "You are binary searching the slope, not the values.",
    },
    templates: [
      {
        name: "Peak index",
        filename: "peak.go",
        note: "Works even on an unsorted array, as long as neighbours differ.",
        code: `func findPeakElement(nums []int) int {
    lo, hi := 0, len(nums)-1
    for lo < hi {
        mid := lo + (hi-lo)/2
        if nums[mid] < nums[mid+1] {
            lo = mid + 1 // ascending: peak is strictly right
        } else {
            hi = mid // descending or equal: mid may be the peak
        }
    }
    return lo
}`,
      },
      {
        name: "Search a mountain",
        filename: "mountain_search.go",
        note: "Find the peak, then search the rising side and the falling side.",
        code: `func findInMountainArray(target int, a []int) int {
    peak := findPeakElement(a)

    if i := ascendingSearch(a[:peak+1], target); i != -1 {
        return i
    }
    if i := descendingSearch(a[peak+1:], target); i != -1 {
        return peak + 1 + i
    }
    return -1
}

func descendingSearch(a []int, target int) int {
    lo, hi := 0, len(a)-1
    for lo <= hi {
        mid := lo + (hi-lo)/2
        switch {
        case a[mid] == target:
            return mid
        case a[mid] > target:
            lo = mid + 1 // descending: larger means go right
        default:
            hi = mid - 1
        }
    }
    return -1
}`,
      },
    ],
    complexity: [
      { label: "Find peak", value: "O(log n)" },
      { label: "Full mountain search", value: "O(log n)", note: "three binary searches" },
      { label: "Space", value: "O(1)" },
    ],
    variations: [
      { name: "Valley search", detail: "Mirror every comparison for an array that falls then rises." },
      { name: "Any local maximum", detail: "Problem 162 does not require a true mountain — the slope argument still holds." },
      { name: "Ternary search", detail: "Equivalent for strictly unimodal data, but costs two evaluations per round." },
    ],
    mistakes: [
      { title: "Reading nums[mid+1] out of bounds", detail: "With hi = len-1 and lo < hi, mid+1 is always valid — do not use hi = len." },
      { title: "Forgetting the descending half flips the comparison", detail: "On the way down, a value larger than the target means move right." },
      { title: "Assuming a unique peak", detail: "Problem 162 guarantees only that neighbours differ." },
    ],
    related: ["ternary-search", "classic-binary-search", "rotated-array-search"],
    problems: [162, 852],
  },
];
