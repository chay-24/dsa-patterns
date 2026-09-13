import type { Pattern } from "../types";

export const advanced: Pattern[] = [
  {
    slug: "divide-and-conquer",
    title: "Divide & Conquer",
    category: "advanced",
    description: "Split, solve the halves, and do the real work in the combine step.",
    concepts: ["Split", "Combine", "Master theorem"],
    usedFor: ["sorting", "counting inversions", "quickselect", "expression evaluation"],
    signals: ["sort it yourself", "count pairs", "kth element", "merge", "O(n log n) expected", "all ways to parenthesise"],
    recognition: [
      "the problem splits into independent halves of the same shape",
      "the interesting computation happens while merging, not while splitting",
      "you need O(n log n) and no greedy or DP formulation is apparent",
    ],
    typicalQuestion: "Count how many pairs are inverted in this array.",
    mentalModel: {
      lines: [
        "Cut the problem in half, solve both halves, then put them back together.",
        "The real work is almost always in the putting-back-together step.",
        "Halving plus a linear merge gives O(n log n).",
      ],
      diagram: `           [ n ]
          /     \\
      [n/2]     [n/2]
       / \\       / \\
      …   …     …   …

  combine cost O(n) per level
  log n levels → O(n log n)`,
      key: "Ask what can only be worked out across the cut. That is your merge step.",
    },
    templates: [
      {
        name: "Merge sort + count",
        filename: "count_inversions.go",
        note: "Counting during the merge is the classic divide-and-conquer insight.",
        code: `func sortAndCount(a []int) ([]int, int) {
    if len(a) <= 1 {
        return a, 0
    }
    mid := len(a) / 2
    left, li := sortAndCount(a[:mid])
    right, ri := sortAndCount(a[mid:])

    merged := make([]int, 0, len(a))
    cross := 0
    i, j := 0, 0

    for i < len(left) && j < len(right) {
        if left[i] <= right[j] {
            merged = append(merged, left[i])
            i++
        } else {
            cross += len(left) - i // all remaining lefts beat right[j]
            merged = append(merged, right[j])
            j++
        }
    }
    merged = append(merged, left[i:]...)
    merged = append(merged, right[j:]...)

    return merged, li + ri + cross
}`,
      },
      {
        name: "Quickselect",
        filename: "quickselect.go",
        note: "O(n) on average for the k-th element: only recurse into one side.",
        code: `func quickSelect(a []int, k int) int { // k is 0-indexed
    lo, hi := 0, len(a)-1
    for {
        if lo == hi {
            return a[lo]
        }
        p := partition(a, lo, hi)
        switch {
        case p == k:
            return a[p]
        case p < k:
            lo = p + 1
        default:
            hi = p - 1
        }
    }
}

func partition(a []int, lo, hi int) int {
    r := lo + rand.Intn(hi-lo+1) // randomise: avoids the sorted-input trap
    a[r], a[hi] = a[hi], a[r]

    pivot := a[hi]
    w := lo
    for i := lo; i < hi; i++ {
        if a[i] < pivot {
            a[i], a[w] = a[w], a[i]
            w++
        }
    }
    a[w], a[hi] = a[hi], a[w]
    return w
}`,
      },
      {
        name: "Split on operators",
        filename: "different_ways.go",
        note: "Every operator can be the last one applied.",
        code: `func diffWaysToCompute(expr string) []int {
    var out []int

    for i := 0; i < len(expr); i++ {
        c := expr[i]
        if c != '+' && c != '-' && c != '*' {
            continue
        }
        left := diffWaysToCompute(expr[:i])
        right := diffWaysToCompute(expr[i+1:])

        for _, l := range left {
            for _, r := range right {
                switch c {
                case '+':
                    out = append(out, l+r)
                case '-':
                    out = append(out, l-r)
                case '*':
                    out = append(out, l*r)
                }
            }
        }
    }

    if len(out) == 0 { // a pure number
        v, _ := strconv.Atoi(expr)
        out = append(out, v)
    }
    return out
}`,
      },
    ],
    complexity: [
      { label: "Merge sort", value: "O(n log n)" },
      { label: "Quickselect", value: "O(n)", note: "average; O(n²) without a random pivot" },
      { label: "Master theorem", value: "T(n)=aT(n/b)+f(n)", note: "compare f(n) with n^(log_b a)" },
      { label: "Space", value: "O(n)", note: "O(log n) for in-place variants" },
    ],
    variations: [
      { name: "Count across the split", detail: "Inversions and reverse pairs both count cross-half relationships during the merge." },
      { name: "Binary search as D&C", detail: "One half is discarded entirely, giving T(n) = T(n/2) + O(1) = O(log n)." },
      { name: "Karatsuba / Strassen", detail: "Reduce the number of recursive calls to beat the naive exponent." },
      { name: "Parallelism", detail: "The halves are independent, so D&C parallelises naturally." },
    ],
    mistakes: [
      { title: "Forgetting the base case", detail: "Length 0 and 1 must both terminate." },
      { title: "Quicksort on sorted input", detail: "Without a random pivot it degrades to O(n²)." },
      { title: "Recomputing shared subproblems", detail: "If halves overlap, it is DP, not divide and conquer." },
      { title: "Allocating in the merge", detail: "Reuse one scratch buffer when performance matters." },
    ],
    related: ["sorting", "classic-binary-search", "meet-in-the-middle", "fenwick-tree"],
    problems: [912, 493, 315, 215, 148, 23, 241, 169, 4, 53],
  },
  {
    slug: "meet-in-the-middle",
    title: "Meet in the Middle",
    category: "advanced",
    description: "Halve the exponent: enumerate both halves separately and combine them.",
    concepts: ["Split n/2", "Sort + search", "2^(n/2)"],
    usedFor: ["subset problems with n around 40", "bidirectional search", "closest subset sums"],
    signals: ["n <= 40", "subset sum with huge values", "closest to target", "2^n too slow but 2^(n/2) fine"],
    recognition: [
      "n is around 30 to 45 — too big for 2^n, too small for a polynomial trick",
      "the problem is over subsets and the values are too large for a DP array",
      "results from the two halves can be combined by sorting or hashing",
    ],
    typicalQuestion: "Find the subset sum closest to a goal, with n up to 40.",
    mentalModel: {
      lines: [
        "2^40 is far too many. 2^20 is about a million.",
        "So split the items into two halves and list every subset of each.",
        "Sort one side, then binary search it for each result from the other.",
      ],
      diagram: `  n = 40

  left  20 items → 2^20 sums   (sorted)
  right 20 items → 2^20 sums

  for each right sum r:
      binary search left for goal − r

  2^20 · 20 ≈ 2·10^7`,
      key: "n around 40 with subsets is the signature. Look for it directly.",
    },
    templates: [
      {
        name: "Enumerate subsets",
        filename: "subset_sums.go",
        note: "2^k totals from k items, built by walking the bit patterns.",
        code: `func subsetSums(a []int) []int {
    n := len(a)
    out := make([]int, 0, 1<<n)

    for mask := 0; mask < 1<<n; mask++ {
        sum := 0
        for i := 0; i < n; i++ {
            if mask>>i&1 == 1 {
                sum += a[i]
            }
        }
        out = append(out, sum)
    }
    return out
}`,
      },
      {
        name: "Closest sum",
        filename: "closest_subset_sum.go",
        note: "Sort the left half once, then one binary search per right-half total.",
        code: `func minAbsDifference(nums []int, goal int) int {
    mid := len(nums) / 2
    left := subsetSums(nums[:mid])
    right := subsetSums(nums[mid:])
    sort.Ints(left)

    best := math.MaxInt
    for _, r := range right {
        want := goal - r
        i := sort.SearchInts(left, want) // first >= want

        if i < len(left) {
            best = min(best, abs(left[i]+r-goal))
        }
        if i > 0 {
            best = min(best, abs(left[i-1]+r-goal))
        }
    }
    return best
}`,
      },
      {
        name: "Group by size",
        filename: "split_by_size.go",
        note: "For when the rule depends on how many items each half contributed.",
        code: `func sumsBySize(a []int) map[int][]int {
    n := len(a)
    bySize := map[int][]int{}

    for mask := 0; mask < 1<<n; mask++ {
        sum, size := 0, 0
        for i := 0; i < n; i++ {
            if mask>>i&1 == 1 {
                sum += a[i]
                size++
            }
        }
        bySize[size] = append(bySize[size], sum)
    }
    return bySize
}`,
      },
    ],
    complexity: [
      { label: "Enumeration", value: "O(2^(n/2) · n)" },
      { label: "Combine", value: "O(2^(n/2) · n/2)", note: "sort plus binary search" },
      { label: "Space", value: "O(2^(n/2))" },
    ],
    why: "Splitting turns 2^n into two runs of 2^(n/2), which is the square root of the original. For n = 40 that is the difference between a trillion and a million.",
    variations: [
      { name: "Bidirectional BFS", detail: "The same halving applied to search depth: two frontiers meeting in the middle." },
      { name: "Hash instead of sort", detail: "For exact-match targets, a hash set of one half gives O(1) lookups." },
      { name: "Prune dominated sums", detail: "Keep a running maximum while sweeping so each query is O(1)." },
    ],
    mistakes: [
      { title: "Uneven splits", detail: "Split as evenly as possible; 25/15 is 30 times more work than 20/20." },
      { title: "Forgetting the empty subset", detail: "mask = 0 must be included, or answers using only one half are lost." },
      { title: "Checking only one binary-search neighbour", detail: "The closest value may be just below the insertion point." },
    ],
    related: ["bitmask-dp", "subset-sum", "divide-and-conquer", "lower-bound"],
    problems: [1755, 805, 698],
  },
  {
    slug: "randomized-algorithms",
    title: "Randomized Algorithms",
    category: "advanced",
    description: "Use randomness to dodge worst cases or to sample without bias.",
    concepts: ["Shuffle", "Rejection", "Expected time"],
    usedFor: ["shuffling", "weighted picks", "randomised pivots", "Monte Carlo checks"],
    signals: ["shuffle", "random pick", "uniformly at random", "pick with weight", "expected O(n)", "avoid worst case"],
    recognition: [
      "a badly chosen input could make your normal approach very slow",
      "you need to pick fairly from a set or a weighted list",
      "an average-case guarantee is good enough here",
    ],
    typicalQuestion: "Shuffle an array so that every permutation is equally likely.",
    mentalModel: {
      lines: [
        "Randomness protects you from the worst case.",
        "Fisher-Yates: at each position, swap with a random spot at or after it.",
        "Rejection sampling: over-generate, throw away what is out of range, try again.",
        "Weighted picks: running totals plus one binary search.",
      ],
      diagram: `  Fisher–Yates

  i = 0: swap with any of n
  i = 1: swap with any of n−1
  ...
  each permutation has probability 1/n!`,
      key: "Pick the swap partner from [i, n), never from [0, n). The second one is biased.",
    },
    templates: [
      {
        name: "Fisher-Yates",
        filename: "shuffle.go",
        note: "The range must start at i. Starting at 0 makes some orders more likely.",
        code: `func shuffle(a []int) {
    for i := len(a) - 1; i > 0; i-- {
        j := rand.Intn(i + 1) // uniform in [0, i]
        a[i], a[j] = a[j], a[i]
    }
}

// Go 1.20+: rand.Shuffle does exactly this
rand.Shuffle(len(a), func(i, j int) { a[i], a[j] = a[j], a[i] })`,
      },
      {
        name: "Weighted pick",
        filename: "weighted_pick.go",
        note: "Running totals, then look up where a uniform draw lands.",
        code: `type WeightedPicker struct{ prefix []int }

func NewWeightedPicker(w []int) *WeightedPicker {
    prefix := make([]int, len(w))
    run := 0
    for i, x := range w {
        run += x
        prefix[i] = run
    }
    return &WeightedPicker{prefix}
}

func (p *WeightedPicker) Pick() int {
    target := rand.Intn(p.prefix[len(p.prefix)-1]) + 1
    return sort.SearchInts(p.prefix, target) // first prefix >= target
}`,
      },
      {
        name: "Rejection sampling",
        filename: "rand10.go",
        note: "About 2.2 calls per result. Throwing away is what keeps it fair.",
        code: `func rand10() int {
    for {
        row := rand7() - 1 // 0..6
        col := rand7()     // 1..7
        n := row*7 + col   // uniform in 1..49

        if n <= 40 {
            return (n-1)%10 + 1 // 1..10, uniform
        }
        // 41..49 rejected: keeping them would bias the result
    }
}`,
      },
      {
        name: "Randomised pivot",
        filename: "random_pivot.go",
        note: "One line that turns quicksort's worst case from likely into rare.",
        code: `func partitionRandom(a []int, lo, hi int) int {
    r := lo + rand.Intn(hi-lo+1)
    a[r], a[hi] = a[hi], a[r] // random element becomes the pivot
    return partition(a, lo, hi)
}`,
      },
    ],
    complexity: [
      { label: "Fisher-Yates", value: "O(n)" },
      { label: "Weighted pick", value: "O(log n)", note: "O(n) to build" },
      { label: "Rejection sampling", value: "O(1)", note: "expected; unbounded worst case" },
      { label: "Quickselect", value: "O(n)", note: "expected, with a random pivot" },
    ],
    variations: [
      { name: "Reservoir sampling", detail: "Sampling from a stream of unknown length." },
      { name: "Alias method", detail: "O(1) weighted sampling after O(n) preprocessing." },
      { name: "Monte Carlo versus Las Vegas", detail: "Monte Carlo is always fast and sometimes wrong; Las Vegas is always right and sometimes slow." },
      { name: "Random hash seed", detail: "A random seed stops anyone from engineering collisions against you." },
    ],
    mistakes: [
      { title: "Swapping with a fully random index", detail: "rand.Intn(n) instead of rand.Intn(i+1) makes some permutations more likely." },
      { title: "Reusing the rejected draw", detail: "Mapping 41..49 onto 1..10 instead of retrying destroys uniformity." },
      { title: "Seeding badly", detail: "Go 1.20+ auto-seeds the global source; older code needed an explicit seed." },
      { title: "Claiming a worst-case bound", detail: "Randomised quickselect is O(n) expected, not worst case." },
    ],
    related: ["reservoir-sampling", "randomized-hashing", "divide-and-conquer", "upper-bound"],
    problems: [384, 528, 470, 215, 398],
  },
  {
    slug: "reservoir-sampling",
    title: "Reservoir Sampling",
    category: "advanced",
    description: "Sample uniformly from a stream whose length you never learn.",
    concepts: ["Stream", "1/i probability", "k-reservoir"],
    usedFor: ["random node from a linked list", "random index of a value", "sampling big streams"],
    signals: ["unknown length", "stream", "linked list random node", "cannot store everything", "one pass"],
    recognition: [
      "the input length is unknown or too large to store",
      "you may only make one pass over the data",
      "you need a uniform sample, not the first or last match",
    ],
    typicalQuestion: "Return a random node from a linked list of unknown length, in O(1) space.",
    mentalModel: {
      lines: [
        "Keep the item you are looking at with probability 1 in i.",
        "Otherwise keep whatever you already had.",
        "After n items, every one of them is equally likely to be the survivor.",
      ],
      diagram: `  item 1: keep (prob 1/1)
  item 2: replace with prob 1/2
  item 3: replace with prob 1/3
  ...

  P(item j survives) = 1/j · j/(j+1) · … = 1/n`,
      key: "One variable, one pass, and you never need to know the length.",
    },
    templates: [
      {
        name: "Single sample",
        filename: "reservoir_one.go",
        note: "One variable, one pass, no idea how long the stream is.",
        code: `func randomNode(head *ListNode) int {
    result, i := 0, 0

    for n := head; n != nil; n = n.Next {
        i++
        if rand.Intn(i) == 0 { // probability 1/i
            result = n.Val
        }
    }
    return result
}`,
      },
      {
        name: "k samples",
        filename: "reservoir_k.go",
        note: "Fill the reservoir first, then swap out a random slot with chance k/i.",
        code: `func reservoirK(stream []int, k int) []int {
    res := make([]int, 0, k)

    for i, v := range stream {
        if i < k {
            res = append(res, v)
            continue
        }
        if j := rand.Intn(i + 1); j < k { // probability k/(i+1)
            res[j] = v
        }
    }
    return res
}`,
      },
      {
        name: "Random matching index",
        filename: "random_pick_index.go",
        note: "A reservoir of size one, over only the positions that match.",
        code: `func (s *Solution) Pick(target int) int {
    result, count := -1, 0

    for i, v := range s.nums {
        if v != target {
            continue
        }
        count++
        if rand.Intn(count) == 0 {
            result = i
        }
    }
    return result
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n)", note: "one pass" },
      { label: "Space", value: "O(k)", note: "O(1) for a single sample" },
      { label: "Preprocessing", value: "none", note: "the point of the technique" },
    ],
    why: "Item j is kept when it arrives with chance 1/j, then has to survive everything after it. Multiply those chances together and they cancel down to exactly 1/n for every item.",
    variations: [
      { name: "Weighted reservoir", detail: "A-Res: key each item as u^(1/w) with u uniform, and keep the k largest keys." },
      { name: "Distributed sampling", detail: "Reservoirs merge, which makes the technique natural for parallel streams." },
      { name: "Precomputed index map", detail: "If the data is static and queried often, a map of value → indices beats resampling." },
    ],
    mistakes: [
      { title: "Using rand.Intn(i) with a zero-based i", detail: "The counter must be 1-based, or the first item is never kept." },
      { title: "Storing the whole stream", detail: "That defeats the purpose — the technique exists for O(1) space." },
      { title: "Sampling before filtering", detail: "For random-pick-index, only matching positions should enter the reservoir." },
    ],
    related: ["randomized-algorithms", "hash-map", "randomized-hashing"],
    problems: [382, 398, 384],
  },
  {
    slug: "randomized-hashing",
    title: "Randomized Hashing",
    category: "advanced",
    description: "Hash content into a number so that comparisons become O(1) — and randomise the base to stay safe.",
    concepts: ["Polynomial hash", "Collisions", "Double hashing"],
    usedFor: ["substring comparison", "subtree identity", "set fingerprints", "duplicate detection"],
    signals: ["compare substrings", "duplicate substring", "identical subtrees", "anagram groups", "fingerprint"],
    recognition: [
      "you compare long objects repeatedly and equality is the bottleneck",
      "a rolling update is possible, so the hash costs O(1) per step",
      "a small false-positive probability is acceptable, or verifiable cheaply",
    ],
    typicalQuestion: "Find the longest substring that appears at least twice.",
    mentalModel: {
      lines: [
        "Turn a stretch of text into one number.",
        "Same number nearly always means same text.",
        "Different number always means different text.",
        "Pick the multiplier at random so no prepared input can trip you up.",
      ],
      diagram: `  h("abc") = a·B² + b·B + c  (mod M)

  prefix hashes let you get any substring:
  h(i..j) = H[j+1] − H[i]·B^(j−i+1)

  all mod M`,
      key: "Use a big modulus and a random base, or verify the match before you trust it.",
    },
    templates: [
      {
        name: "Prefix hash",
        filename: "string_hash.go",
        note: "O(1) for any substring, after one pass to set it up.",
        code: `type StrHash struct {
    h    []uint64
    pow  []uint64
    mod  uint64
    base uint64
}

func NewStrHash(s string) *StrHash {
    const mod = (1 << 61) - 1 // a large Mersenne prime
    base := uint64(rand.Int63n(1<<30)) + 256

    n := len(s)
    sh := &StrHash{
        h:    make([]uint64, n+1),
        pow:  make([]uint64, n+1),
        mod:  mod,
        base: base,
    }
    sh.pow[0] = 1

    for i := 0; i < n; i++ {
        sh.h[i+1] = (sh.h[i]*base + uint64(s[i])) % mod
        sh.pow[i+1] = sh.pow[i] * base % mod
    }
    return sh
}

// hash of s[l:r]
func (sh *StrHash) Range(l, r int) uint64 {
    x := sh.h[r] + sh.mod*sh.mod
    return (x - sh.h[l]*sh.pow[r-l]%sh.mod) % sh.mod
}`,
      },
      {
        name: "Rolling window",
        filename: "rabin_karp.go",
        note: "Add the new character, subtract the one that fell off.",
        code: `func rabinKarp(text, pattern string) int {
    n, m := len(text), len(pattern)
    if m > n {
        return -1
    }
    const base, mod = 256, 1_000_000_007

    highPow := 1
    for i := 0; i < m-1; i++ {
        highPow = highPow * base % mod
    }

    var pHash, tHash int
    for i := 0; i < m; i++ {
        pHash = (pHash*base + int(pattern[i])) % mod
        tHash = (tHash*base + int(text[i])) % mod
    }

    for i := 0; ; i++ {
        if pHash == tHash && text[i:i+m] == pattern { // verify!
            return i
        }
        if i+m >= n {
            return -1
        }
        tHash = ((tHash-int(text[i])*highPow%mod+mod)*base + int(text[i+m])) % mod
    }
}`,
      },
      {
        name: "Subtree fingerprint",
        filename: "subtree_hash.go",
        note: "Mix the children's numbers with the node's own to identify shapes.",
        code: `func subtreeHashes(root *TreeNode) map[uint64]int {
    counts := map[uint64]int{}

    var hash func(*TreeNode) uint64
    hash = func(n *TreeNode) uint64 {
        if n == nil {
            return 1
        }
        l, r := hash(n.Left), hash(n.Right)
        h := uint64(n.Val)*1_000_003 ^ l*31 ^ r*37
        counts[h]++
        return h
    }

    hash(root)
    return counts
}`,
      },
    ],
    complexity: [
      { label: "Preprocess", value: "O(n)" },
      { label: "Substring hash", value: "O(1)" },
      { label: "Collision probability", value: "~n²/M", note: "negligible for a 61-bit modulus" },
      { label: "Space", value: "O(n)" },
    ],
    variations: [
      { name: "Double hashing", detail: "Two independent moduli make collisions astronomically unlikely." },
      { name: "Binary search + hash", detail: "Longest duplicate substring: binary search the length, hash to test it." },
      { name: "Set fingerprint", detail: "XOR of random per-element values gives an order-independent identity." },
      { name: "Verify on match", detail: "Confirm with a direct comparison to turn Monte Carlo into Las Vegas." },
    ],
    mistakes: [
      { title: "A fixed base and small modulus", detail: "Anti-hash tests exist for the common base-31, mod-1e9+7 choice." },
      { title: "Negative values after subtraction", detail: "Add the modulus before taking the remainder." },
      { title: "Overflow in the multiplication", detail: "With a 61-bit modulus you need care; a 32-bit modulus in uint64 is safe." },
      { title: "Trusting the hash without verification", detail: "When correctness is required, compare the actual content on a hash match." },
    ],
    related: ["rolling-hash", "kmp", "hash-map", "randomized-algorithms"],
    problems: [1044, 187, 28, 572, 1392],
  },
  {
    slug: "computational-geometry",
    title: "Computational Geometry",
    category: "advanced",
    description: "Cross products, orientation and convex hulls — integer arithmetic wherever possible.",
    concepts: ["Cross product", "Orientation", "Convex hull"],
    usedFor: ["collinearity", "convex hulls", "polygon area", "segment intersection", "closest pairs"],
    signals: ["points", "coordinates", "collinear", "convex hull", "area of a polygon", "straight line", "fence"],
    recognition: [
      "the input is a list of coordinate pairs",
      "the question is about turning direction, containment or hull shape",
      "you are about to compute a slope — use a cross product instead",
    ],
    typicalQuestion: "Build the convex hull enclosing all the given points.",
    mentalModel: {
      lines: [
        "The cross product tells you which way a turn goes.",
        "Positive is left, negative is right, zero is straight.",
        "It uses no division, so integers stay exact.",
      ],
      diagram: `  cross(O,A,B) =
      (A.x−O.x)(B.y−O.y) − (A.y−O.y)(B.x−O.x)

      B
     ╱          > 0  counter-clockwise
    O───A       = 0  collinear
                < 0  clockwise`,
      key: "Never use slopes. Cross products avoid division, infinity and floating point entirely.",
    },
    templates: [
      {
        name: "Cross product",
        filename: "cross.go",
        note: "The single most useful thing in any geometry problem.",
        code: `type Point struct{ X, Y int }

// > 0 counter-clockwise, < 0 clockwise, 0 collinear
func cross(o, a, b Point) int {
    return (a.X-o.X)*(b.Y-o.Y) - (a.Y-o.Y)*(b.X-o.X)
}

func collinear(a, b, c Point) bool { return cross(a, b, c) == 0 }

// twice the signed area of triangle abc
func area2(a, b, c Point) int { return cross(a, b, c) }`,
      },
      {
        name: "Convex hull",
        filename: "convex_hull.go",
        note: "Sort, build the bottom edge, then the top edge.",
        code: `func convexHull(pts []Point) []Point {
    if len(pts) < 3 {
        return pts
    }
    sort.Slice(pts, func(i, j int) bool {
        if pts[i].X != pts[j].X {
            return pts[i].X < pts[j].X
        }
        return pts[i].Y < pts[j].Y
    })

    build := func(pts []Point) []Point {
        var hull []Point
        for _, p := range pts {
            for len(hull) >= 2 && cross(hull[len(hull)-2], hull[len(hull)-1], p) <= 0 {
                hull = hull[:len(hull)-1] // not a left turn
            }
            hull = append(hull, p)
        }
        return hull
    }

    lower := build(pts)
    slices.Reverse(pts)
    upper := build(pts)

    return append(lower[:len(lower)-1], upper[:len(upper)-1]...)
}`,
      },
      {
        name: "Slope without division",
        filename: "max_points_line.go",
        note: "Reduce dy and dx by their gcd and fix the sign. Never use floats.",
        code: `func maxPoints(points [][]int) int {
    if len(points) <= 2 {
        return len(points)
    }
    best := 2

    for i := range points {
        slopes := map[[2]int]int{}
        for j := range points {
            if i == j {
                continue
            }
            dy := points[j][1] - points[i][1]
            dx := points[j][0] - points[i][0]

            g := gcd(abs(dy), abs(dx))
            if g != 0 {
                dy, dx = dy/g, dx/g
            }
            if dx < 0 || (dx == 0 && dy < 0) { // canonical direction
                dy, dx = -dy, -dx
            }

            key := [2]int{dy, dx}
            slopes[key]++
            best = max(best, slopes[key]+1)
        }
    }
    return best
}`,
      },
      {
        name: "Polygon area",
        filename: "shoelace.go",
        note: "Walk the boundary adding cross products. That is the shoelace formula.",
        code: `func polygonArea2(pts []Point) int { // twice the area
    n := len(pts)
    sum := 0
    for i := 0; i < n; i++ {
        j := (i + 1) % n
        sum += pts[i].X*pts[j].Y - pts[j].X*pts[i].Y
    }
    return abs(sum)
}`,
      },
    ],
    complexity: [
      { label: "Cross product", value: "O(1)" },
      { label: "Convex hull", value: "O(n log n)", note: "dominated by the sort" },
      { label: "Max points on a line", value: "O(n²)" },
      { label: "Closest pair", value: "O(n log n)", note: "divide and conquer" },
    ],
    variations: [
      { name: "Graham scan", detail: "Sort by angle instead of by x. Same result as the chain method." },
      { name: "Keeping collinear points", detail: "Use < 0 instead of <= 0 in the hull test when boundary points must be retained." },
      { name: "Point in polygon", detail: "Ray casting, counting crossings; or a winding number for self-intersecting polygons." },
      { name: "Rotating calipers", detail: "Diameter and width of a convex polygon in linear time after the hull." },
    ],
    mistakes: [
      { title: "Using floating-point slopes", detail: "Vertical lines give infinity, and equal slopes may not compare equal." },
      { title: "Not normalising the slope direction", detail: "(1,2) and (-1,-2) are the same line and must hash to one key." },
      { title: "Forgetting duplicate points", detail: "They break gcd normalisation and inflate counts." },
      { title: "Hull orientation", detail: "Decide clockwise or counter-clockwise up front and keep the comparison consistent." },
    ],
    related: ["sorting", "math-number-theory", "monotonic-stack", "divide-and-conquer"],
    problems: [149, 587, 1232, 1266],
  },
  {
    slug: "kmp",
    title: "KMP",
    category: "advanced",
    description: "Precompute how far to fall back on a mismatch, so the text pointer never moves backwards.",
    concepts: ["LPS array", "No backtrack", "Borders"],
    usedFor: ["substring search", "periodicity detection", "longest border", "palindromic prefixes"],
    signals: ["find the pattern", "strstr", "repeated substring pattern", "longest prefix that is also a suffix", "period"],
    recognition: [
      "exact substring search in linear time",
      "you need the longest proper prefix that is also a suffix — a border",
      "the question is about the period of a string",
    ],
    typicalQuestion: "Find the first occurrence of a pattern in a text.",
    mentalModel: {
      lines: [
        "Work out, for each prefix, how much of it is also a suffix.",
        "On a mismatch, slide the pattern to that overlap instead of starting over.",
        "The pointer into the text never goes backwards, so one pass is enough.",
      ],
      diagram: `  p = a b a b c
  lps 0 0 1 2 0

  mismatch at j=4 → j = lps[3] = 2
  keep the "ab" already matched`,
      key: "n - lps[n-1] is the shortest repeating block. That fact alone solves several problems.",
    },
    templates: [
      {
        name: "LPS array",
        filename: "lps.go",
        note: "The whole idea lives here. Searching is the same loop against the text.",
        code: `func buildLPS(p string) []int {
    lps := make([]int, len(p))
    length := 0

    for i := 1; i < len(p); {
        if p[i] == p[length] {
            length++
            lps[i] = length
            i++
        } else if length > 0 {
            length = lps[length-1] // fall back
        } else {
            lps[i] = 0
            i++
        }
    }
    return lps
}`,
      },
      {
        name: "Search",
        filename: "kmp_search.go",
        note: "i never goes backwards. That is what keeps it linear.",
        code: `func strStr(text, pattern string) int {
    if len(pattern) == 0 {
        return 0
    }
    lps := buildLPS(pattern)

    j := 0
    for i := 0; i < len(text); i++ {
        for j > 0 && text[i] != pattern[j] {
            j = lps[j-1] // fall back, never rewind i
        }
        if text[i] == pattern[j] {
            j++
        }
        if j == len(pattern) {
            return i - j + 1
        }
    }
    return -1
}`,
      },
      {
        name: "Period detection",
        filename: "period.go",
        note: "A string repeats exactly when its length divides by its shortest block.",
        code: `func repeatedSubstringPattern(s string) bool {
    n := len(s)
    lps := buildLPS(s)
    period := n - lps[n-1]

    return period < n && n%period == 0
}`,
      },
      {
        name: "Longest palindromic prefix",
        filename: "shortest_palindrome.go",
        note: "Run KMP on s + '#' + reverse(s) and read the last value.",
        code: `func shortestPalindrome(s string) string {
    if len(s) == 0 {
        return s
    }
    rev := reverseString(s)
    combined := s + "#" + rev // '#' prevents overlap across the join

    lps := buildLPS(combined)
    overlap := lps[len(combined)-1]

    return rev[:len(s)-overlap] + s
}`,
      },
    ],
    complexity: [
      { label: "Build LPS", value: "O(m)" },
      { label: "Search", value: "O(n)" },
      { label: "Total", value: "O(n + m)" },
      { label: "Space", value: "O(m)" },
    ],
    why: "The fallback loop looks like it could be quadratic. It is not: the pattern pointer only ever goes up by one per character, and every fallback pushes it down. So the total number of fallbacks is capped by the number of steps forward.",
    variations: [
      { name: "All occurrences", detail: "After a match, set j = lps[j-1] and continue instead of returning." },
      { name: "Z-algorithm", detail: "A different linear-time primitive that many people find easier to reason about." },
      { name: "Aho-Corasick", detail: "KMP generalised to many patterns at once, over a trie." },
      { name: "Rolling hash instead", detail: "Simpler to write, with a small probability of error unless you verify." },
    ],
    mistakes: [
      { title: "Confusing lps[i] with a match length", detail: "It is the longest PROPER border of the prefix ending at i." },
      { title: "Omitting the sentinel in the palindrome trick", detail: "Without '#', the border can span the join and give a wrong answer." },
      { title: "Falling back to lps[j] instead of lps[j-1]", detail: "The classic off-by-one in every KMP implementation." },
    ],
    related: ["z-algorithm", "rolling-hash", "strings", "trie"],
    problems: [28, 459, 214, 1392],
  },
  {
    slug: "z-algorithm",
    title: "Z Algorithm",
    category: "advanced",
    description: "For each position, how long a prefix of the string starts there — in one linear pass.",
    concepts: ["Z array", "Z-box", "Prefix match"],
    usedFor: ["pattern matching", "counting occurrences", "border and period questions"],
    signals: ["pattern matching", "prefix that starts at i", "count occurrences", "string periodicity"],
    recognition: [
      "you want, for every index, the match length against the string's own prefix",
      "pattern matching where KMP feels fiddly — Z is often easier to derive",
      "problems about borders and repetitions",
    ],
    typicalQuestion: "Find all occurrences of a pattern in a text in linear time.",
    mentalModel: {
      lines: [
        "z[i] says how much of the string's own start is repeated at position i.",
        "Remember the furthest match found so far.",
        "Inside that stretch you already know the answer, so only extend past its edge.",
      ],
      diagram: `  s = a a b a a b

  z   -  1  0  3  1  0
         ▲        ▲
      "a"     "aab" matches the prefix

  window [l,r] = the rightmost match`,
      key: "Glue pattern + separator + text, and any z equal to the pattern length is a match.",
    },
    templates: [
      {
        name: "Z array",
        filename: "z_array.go",
        note: "Reusing what you already know inside the window is what keeps it linear.",
        code: `func zArray(s string) []int {
    n := len(s)
    z := make([]int, n)
    z[0] = n

    l, r := 0, 0
    for i := 1; i < n; i++ {
        if i < r {
            z[i] = min(r-i, z[i-l]) // reuse inside the window
        }
        for i+z[i] < n && s[z[i]] == s[i+z[i]] {
            z[i]++ // extend past r
        }
        if i+z[i] > r {
            l, r = i, i+z[i] // new rightmost window
        }
    }
    return z
}`,
      },
      {
        name: "Pattern matching",
        filename: "z_search.go",
        note: "The separator must be a character that appears in neither string.",
        code: `func findAll(text, pattern string) []int {
    combined := pattern + "\x00" + text
    z := zArray(combined)

    var out []int
    offset := len(pattern) + 1

    for i := offset; i < len(combined); i++ {
        if z[i] >= len(pattern) {
            out = append(out, i-offset)
        }
    }
    return out
}`,
      },
      {
        name: "Borders from Z",
        filename: "z_borders.go",
        note: "i + z[i] == n means the ending at i is also the beginning.",
        code: `func borders(s string) []int {
    n := len(s)
    z := zArray(s)

    var out []int
    for i := 1; i < n; i++ {
        if i+z[i] == n {
            out = append(out, z[i]) // border of this length
        }
    }
    return out
}`,
      },
    ],
    complexity: [
      { label: "Build", value: "O(n)" },
      { label: "Search", value: "O(n + m)" },
      { label: "Space", value: "O(n + m)" },
    ],
    variations: [
      { name: "KMP instead", detail: "Same complexity; KMP streams the text without concatenating." },
      { name: "Counting distinct substrings", detail: "Z arrays over suffixes, or a suffix automaton for a better bound." },
      { name: "Smallest rotation", detail: "Booth's algorithm uses similar machinery on s + s." },
    ],
    mistakes: [
      { title: "Setting z[0]", detail: "It is conventionally n (or left undefined). Using 0 breaks border logic." },
      { title: "A sentinel that appears in the input", detail: "Matches can then span the join. Use a byte outside the alphabet." },
      { title: "Forgetting min(r-i, z[i-l])", detail: "Without the clamp the window reuse over-reads and the result is wrong." },
    ],
    related: ["kmp", "rolling-hash", "strings", "manacher"],
    problems: [28, 1392, 459],
  },
  {
    slug: "rolling-hash",
    title: "Rolling Hash",
    category: "advanced",
    description: "Update a window's hash in O(1) as it slides — Rabin-Karp and everything built on it.",
    concepts: ["Window hash", "Base", "Verify"],
    usedFor: ["substring search", "duplicate substrings", "fixed-length fingerprints"],
    signals: ["duplicate substring", "all substrings of length k", "repeated DNA", "compare many substrings"],
    recognition: [
      "you compare many equal-length substrings against each other",
      "the window slides by one, so the hash can be patched instead of recomputed",
      "a binary search over the length is combined with an equality test",
    ],
    typicalQuestion: "Find the longest substring that occurs more than once.",
    mentalModel: {
      lines: [
        "Treat the window as a number written in some base.",
        "Sliding one step: drop the old digit, shift, add the new one.",
        "That is O(1) per step instead of rebuilding the whole thing.",
      ],
      diagram: `  window "abc" → "bcd"

  h = (h − 'a'·B²)·B + 'd'
       └ remove   └ shift  └ add

  all arithmetic mod M`,
      key: "A tiny alphabet packs into an integer exactly, with no collisions at all.",
    },
    templates: [
      {
        name: "Sliding hash",
        filename: "rolling.go",
        note: "The precomputed power is what lets you remove the outgoing character.",
        code: `func windowHashes(s string, k int) []int {
    const base, mod = 256, 1_000_000_007
    if len(s) < k {
        return nil
    }

    highPow := 1
    for i := 0; i < k-1; i++ {
        highPow = highPow * base % mod
    }

    h := 0
    for i := 0; i < k; i++ {
        h = (h*base + int(s[i])) % mod
    }

    out := []int{h}
    for i := k; i < len(s); i++ {
        h = (h - int(s[i-k])*highPow%mod + mod) % mod // remove
        h = (h*base + int(s[i])) % mod                // shift and add
        out = append(out, h)
    }
    return out
}`,
      },
      {
        name: "Exact packing",
        filename: "dna_pack.go",
        note: "Four letters fit in two bits each, so the window is just an int.",
        code: `func findRepeatedDnaSequences(s string) []string {
    if len(s) < 10 {
        return nil
    }
    code := [256]int{'A': 0, 'C': 1, 'G': 2, 'T': 3}
    const mask = 1<<20 - 1 // 10 bases × 2 bits

    seen := map[int]int{}
    var out []string

    h := 0
    for i := 0; i < len(s); i++ {
        h = (h<<2 | code[s[i]]) & mask
        if i >= 9 {
            seen[h]++
            if seen[h] == 2 {
                out = append(out, s[i-9:i+1])
            }
        }
    }
    return out
}`,
      },
      {
        name: "Binary search + hash",
        filename: "longest_dup.go",
        note: "Longer duplicates imply shorter ones, so the length can be searched.",
        code: `func longestDupSubstring(s string) string {
    lo, hi := 1, len(s)-1
    best := ""

    for lo <= hi {
        mid := lo + (hi-lo)/2
        if found := dupOfLength(s, mid); found != "" {
            best = found
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }
    return best
}

func dupOfLength(s string, k int) string {
    seen := map[int][]int{} // hash → start positions
    for i, h := range windowHashes(s, k) {
        for _, j := range seen[h] {
            if s[j:j+k] == s[i:i+k] { // verify
                return s[i : i+k]
            }
        }
        seen[h] = append(seen[h], i)
    }
    return ""
}`,
      },
    ],
    complexity: [
      { label: "Roll one step", value: "O(1)" },
      { label: "All windows", value: "O(n)" },
      { label: "Binary search + hash", value: "O(n log n)" },
      { label: "Space", value: "O(n)" },
    ],
    variations: [
      { name: "Double hashing", detail: "Two moduli make collisions effectively impossible without verification." },
      { name: "Prefix hashing", detail: "Precompute prefixes to hash any substring in O(1), not just a fixed-width window." },
      { name: "2D rolling hash", detail: "Hash rows, then hash the row hashes, for submatrix matching." },
    ],
    mistakes: [
      { title: "Negative after the subtraction", detail: "Add the modulus before taking the remainder." },
      { title: "Recomputing B^(k-1) per step", detail: "Compute it once outside the loop." },
      { title: "Skipping verification", detail: "With one 32-bit modulus, two different strings really can collide. Compare them to be sure." },
      { title: "Using a fixed base", detail: "Pick the multiplier at random if someone might have designed the tests against you." },
    ],
    related: ["randomized-hashing", "kmp", "fixed-sliding-window", "binary-search-on-answer"],
    problems: [187, 1044, 28, 1392, 214],
  },
  {
    slug: "manacher",
    title: "Manacher's Algorithm",
    category: "advanced",
    description: "All palindromic radii in linear time, by mirroring what you already know.",
    concepts: ["Radii", "Mirror", "Transform"],
    usedFor: ["longest palindromic substring in O(n)", "counting palindromic substrings", "palindromic structure"],
    signals: ["longest palindromic substring", "count palindromes", "O(n) required", "large string"],
    recognition: [
      "expand-around-centre at O(n²) is too slow for the constraints",
      "you need every palindromic radius, not just the longest",
      "the string is large — 10^5 or more",
    ],
    typicalQuestion: "Find the longest palindromic substring in linear time.",
    mentalModel: {
      lines: [
        "Put a separator between every letter so every palindrome has an odd length.",
        "Remember the palindrome that reaches furthest right.",
        "Inside it, mirror what you already know instead of recomputing.",
        "Only grow past its right edge.",
      ],
      diagram: `  "abba" → "^#a#b#b#a#$"

  centre c, right boundary r
  for i < r:  p[i] = min(r−i, p[mirror])
  then expand only beyond r

  total expansion work is O(n)`,
      key: "The separators make odd and even palindromes behave the same way.",
    },
    templates: [
      {
        name: "Manacher",
        filename: "manacher.go",
        note: "Guards at both ends remove every bounds check from the growing loop.",
        code: `func manacher(s string) []int {
    // transform: ^#a#b#a#$  — sentinels avoid bounds checks
    t := make([]byte, 0, 2*len(s)+3)
    t = append(t, '^')
    for i := 0; i < len(s); i++ {
        t = append(t, '#', s[i])
    }
    t = append(t, '#', '$')

    p := make([]int, len(t))
    centre, right := 0, 0

    for i := 1; i < len(t)-1; i++ {
        if i < right {
            mirror := 2*centre - i
            p[i] = min(right-i, p[mirror]) // reuse
        }
        for t[i+p[i]+1] == t[i-p[i]-1] {
            p[i]++ // expand past the boundary
        }
        if i+p[i] > right {
            centre, right = i, i+p[i]
        }
    }
    return p // p[i] is the radius in ORIGINAL characters
}`,
      },
      {
        name: "Longest substring",
        filename: "longest_pal.go",
        note: "The radius in the padded string is the length in the original.",
        code: `func longestPalindrome(s string) string {
    if len(s) < 2 {
        return s
    }
    p := manacher(s)

    bestLen, bestCentre := 0, 0
    for i, r := range p {
        if r > bestLen {
            bestLen, bestCentre = r, i
        }
    }

    start := (bestCentre - bestLen) / 2 // back to original indices
    return s[start : start+bestLen]
}`,
      },
      {
        name: "Count palindromes",
        filename: "count_pal.go",
        note: "A palindrome of radius r contains about r/2 smaller ones inside it.",
        code: `func countSubstrings(s string) int {
    p := manacher(s)

    total := 0
    for _, r := range p {
        total += (r + 1) / 2
    }
    return total
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n)" },
      { label: "Space", value: "O(n)" },
      { label: "Expand around centres", value: "O(n²)", note: "the simpler alternative" },
    ],
    why: "The right edge only ever moves forward, and every extra comparison moves it. So all the growing across the whole string adds up to n steps, even though one centre may grow a long way.",
    variations: [
      { name: "Expand around centres", detail: "O(n²) but a quarter of the code — usually the right answer in an interview." },
      { name: "Palindromic tree (Eertree)", detail: "Maintains all distinct palindromic substrings online." },
      { name: "Palindromic prefix via KMP", detail: "For the specific 'longest palindromic prefix' question, KMP is simpler." },
    ],
    mistakes: [
      { title: "Mapping back to the original indices wrongly", detail: "start = (centre - radius) / 2 in the transformed coordinates." },
      { title: "Omitting the sentinels", detail: "Without ^ and $ the expansion loop needs explicit bounds checks." },
      { title: "Reaching for it when O(n²) suffices", detail: "Manacher is easy to get wrong under pressure; only use it when n demands it." },
    ],
    related: ["palindrome-techniques", "kmp", "z-algorithm", "interval-dp"],
    problems: [5, 647, 214],
  },
  {
    slug: "matrix-exponentiation",
    title: "Matrix Exponentiation",
    category: "advanced",
    description: "A fixed linear recurrence advanced n steps in O(log n) by squaring its transition matrix.",
    concepts: ["Transition matrix", "Fast power", "Linear recurrence"],
    usedFor: ["huge Fibonacci-like indices", "counting paths of a given length", "fixed-state DP with enormous n"],
    signals: ["n up to 1e18", "linear recurrence", "count paths of length k", "fibonacci with huge n", "modulo 1e9+7"],
    recognition: [
      "the recurrence is linear with constant coefficients",
      "n is far too large for an O(n) DP — 1e12 or more",
      "the state count is small, typically under 100",
    ],
    typicalQuestion: "Compute the n-th Fibonacci number for n up to 1e18, modulo 1e9+7.",
    mentalModel: {
      lines: [
        "Write one step of the recurrence as a matrix times a vector.",
        "Then n steps is that matrix raised to the n.",
        "Squaring repeatedly gets you there in log n multiplications.",
      ],
      diagram: `  [F(n+1)]   [1 1]   [F(n)  ]
  [F(n)  ] = [1 0] · [F(n−1)]

  n steps → M^n

  M^13 = M^8 · M^4 · M^1`,
      key: "An adjacency matrix raised to the k counts the walks of exactly k steps.",
    },
    templates: [
      {
        name: "Matrix power",
        filename: "mat_pow.go",
        note: "Square and multiply, with the modulus folded into every product.",
        code: `const mod = 1_000_000_007

type Matrix [][]int

func matMul(a, b Matrix) Matrix {
    n, p := len(a), len(b[0])
    c := make(Matrix, n)
    for i := range c {
        c[i] = make([]int, p)
        for k := range b {
            for j := 0; j < p; j++ {
                c[i][j] = (c[i][j] + a[i][k]*b[k][j]) % mod
            }
        }
    }
    return c
}

func matPow(m Matrix, p int) Matrix {
    n := len(m)
    result := make(Matrix, n)
    for i := range result {
        result[i] = make([]int, n)
        result[i][i] = 1 // identity
    }

    for p > 0 {
        if p&1 == 1 {
            result = matMul(result, m)
        }
        m = matMul(m, m)
        p >>= 1
    }
    return result
}`,
      },
      {
        name: "Fibonacci",
        filename: "fib_matrix.go",
        note: "The two-by-two case, and the one worth remembering.",
        code: `func fib(n int) int {
    if n == 0 {
        return 0
    }
    m := Matrix{{1, 1}, {1, 0}}
    r := matPow(m, n-1)
    return r[0][0] // F(n)
}`,
      },
      {
        name: "Counting paths",
        filename: "path_count.go",
        note: "Entry [i][j] is the number of walks of exactly k edges from i to j.",
        code: `func pathsOfLength(adj Matrix, k int) Matrix {
    return matPow(adj, k) // entry [i][j] = walks of length k
}`,
      },
      {
        name: "General recurrence",
        filename: "linear_recurrence.go",
        note: "First row holds the coefficients; the rest shifts the window along.",
        code: `func companion(coeffs []int) Matrix {
    k := len(coeffs)
    m := make(Matrix, k)
    for i := range m {
        m[i] = make([]int, k)
    }

    copy(m[0], coeffs) // first row: the coefficients
    for i := 1; i < k; i++ {
        m[i][i-1] = 1 // sub-diagonal shifts the window
    }
    return m
}`,
      },
    ],
    complexity: [
      { label: "One multiplication", value: "O(k³)", note: "k = state count" },
      { label: "n steps", value: "O(k³ log n)" },
      { label: "Space", value: "O(k²)" },
    ],
    variations: [
      { name: "Kitamasa / Berlekamp-Massey", detail: "O(k² log n) — better when k is large." },
      { name: "Boolean matrices", detail: "Reachability in exactly k steps, using OR and AND." },
      { name: "Min-plus matrices", detail: "Shortest path with exactly k edges, replacing (+, ×) with (min, +)." },
    ],
    mistakes: [
      { title: "Wrong base vector or offset", detail: "Verify against small n by hand — off-by-one here is very easy." },
      { title: "Forgetting the modulus inside the multiplication", detail: "Intermediate products overflow quickly." },
      { title: "Using it when n is small", detail: "A plain O(n) DP is simpler and faster below about 10^6." },
      { title: "Non-linear recurrences", detail: "Any product of two states makes the transition non-linear and the method inapplicable." },
    ],
    related: ["modular-arithmetic", "math-number-theory", "linear-dp", "graph-representation"],
    problems: [509, 1220, 70],
  },
  {
    slug: "modular-arithmetic",
    title: "Modular Arithmetic",
    category: "advanced",
    description: "Keep numbers bounded — and know that division needs an inverse, not a slash.",
    concepts: ["mod 1e9+7", "Inverse", "Fermat"],
    usedFor: ["counting problems with huge answers", "hashing", "combinatorics", "modular division"],
    signals: ["modulo 1e9+7", "answer may be large", "count the number of ways", "nCr", "modular inverse"],
    recognition: [
      "the statement says to return the answer modulo something",
      "you are counting and the result would overflow",
      "you need to divide under a modulus — that means a modular inverse",
    ],
    typicalQuestion: "Count the arrangements modulo 1e9+7.",
    mentalModel: {
      lines: [
        "Add, subtract and multiply as normal, taking the remainder as you go.",
        "Division does not work that way.",
        "To divide by b, multiply by its inverse instead.",
        "When the modulus is prime, the inverse of b is b to the power (mod - 2).",
      ],
      diagram: `  (a + b) % M = ((a%M) + (b%M)) % M
  (a × b) % M = ((a%M) × (b%M)) % M
  (a − b) % M = ((a%M) − (b%M) + M) % M

  a / b  ✗
  a × inverse(b)  ✓`,
      key: "Go's % keeps the sign of the left-hand side, so always add the modulus before the final %.",
    },
    templates: [
      {
        name: "Safe operations",
        filename: "mod_ops.go",
        note: "The +mod in subtraction is not optional in Go.",
        code: `const mod = 1_000_000_007

func addMod(a, b int) int { return (a + b) % mod }
func subMod(a, b int) int { return ((a-b)%mod + mod) % mod }
func mulMod(a, b int) int { return a % mod * (b % mod) % mod }

func powMod(base, exp int) int {
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
        name: "Modular inverse",
        filename: "mod_inverse.go",
        note: "Fermat needs a prime modulus. Extended Euclid works more generally.",
        code: `// prime modulus: a^(mod-2) is the inverse of a
func inverse(a int) int { return powMod(a, mod-2) }

func divMod(a, b int) int { return mulMod(a, inverse(b)) }

// general modulus, needs gcd(a, m) == 1
func inverseExt(a, m int) int {
    g, x, _ := extGCD(a, m)
    if g != 1 {
        return -1 // no inverse exists
    }
    return (x%m + m) % m
}

func extGCD(a, b int) (g, x, y int) {
    if b == 0 {
        return a, 1, 0
    }
    g, x1, y1 := extGCD(b, a%b)
    return g, y1, x1 - a/b*y1
}`,
      },
      {
        name: "Binomials",
        filename: "binomial.go",
        note: "Work out the factorials once, then every nCr is a single multiply.",
        code: `type Comb struct {
    fact, inv []int
}

func NewComb(n int) *Comb {
    c := &Comb{fact: make([]int, n+1), inv: make([]int, n+1)}
    c.fact[0] = 1
    for i := 1; i <= n; i++ {
        c.fact[i] = c.fact[i-1] * i % mod
    }

    c.inv[n] = powMod(c.fact[n], mod-2)
    for i := n; i > 0; i-- {
        c.inv[i-1] = c.inv[i] * i % mod // backwards: one exponentiation total
    }
    return c
}

func (c *Comb) Choose(n, k int) int {
    if k < 0 || k > n {
        return 0
    }
    return c.fact[n] * c.inv[k] % mod * c.inv[n-k] % mod
}`,
      },
      {
        name: "Negative remainders",
        filename: "normalize.go",
        note: "The single most common modular bug in Go.",
        code: `// Go: -7 % 3 == -1, not 2
r := ((x % m) + m) % m

// e.g. counting prefix sums by remainder
sum = ((sum+v)%k + k) % k`,
      },
    ],
    complexity: [
      { label: "add / sub / mul", value: "O(1)" },
      { label: "powMod", value: "O(log exp)" },
      { label: "Inverse (Fermat)", value: "O(log mod)" },
      { label: "nCr after preprocessing", value: "O(1)", note: "O(n) to build" },
    ],
    variations: [
      { name: "Inverses for 1..n", detail: "A linear recurrence gives all of them in O(n) with no exponentiation per value." },
      { name: "Chinese remainder theorem", detail: "Combine results from several coprime moduli." },
      { name: "Composite modulus", detail: "Fermat fails; use extended Euclid, and remember the inverse may not exist." },
      { name: "Double hashing", detail: "Two moduli at once makes hash collisions negligible." },
    ],
    mistakes: [
      { title: "Dividing directly", detail: "a/b % m is simply wrong. Multiply by the inverse." },
      { title: "Negative results from %", detail: "Go keeps the dividend's sign; normalise with ((x%m)+m)%m." },
      { title: "Overflow before the modulus", detail: "Reduce both operands first: a%mod * (b%mod) % mod." },
      { title: "Using Fermat with a composite modulus", detail: "It only holds for a prime modulus." },
    ],
    related: ["math-number-theory", "matrix-exponentiation", "prefix-sum-hash-map", "randomized-hashing"],
    problems: [1622, 372, 974, 1220],
  },
];
