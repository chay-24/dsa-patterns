import type { Pattern } from "../types";

export const twoPointers: Pattern[] = [
  {
    slug: "two-pointers",
    title: "Two Pointers",
    category: "two-pointers",
    description: "Two indices moving under a rule that makes one of them never go backwards.",
    concepts: ["Converging", "Same direction", "Partition"],
    usedFor: ["pairs in sorted data", "in-place partitioning", "merging two sequences", "removing duplicates"],
    signals: ["sorted array", "pair", "triplet", "opposite ends", "in-place", "remove duplicates", "partition", "closest sum"],
    recognition: [
      "the array is sorted, or sorting it costs you nothing",
      "you are looking for a pair or triplet with a target relationship",
      "a nested loop exists where the inner index never needs to restart",
      "you must rewrite the array in place with O(1) extra space",
      "two sorted sequences must be walked together",
    ],
    typicalQuestion: "Find two numbers in a sorted array that sum to a target.",
    mentalModel: {
      lines: [
        "Converging: start at both ends, move the one that can improve the answer.",
        "Same direction: a slow write pointer trails a fast read pointer.",
        "Each pointer moves only forward, so the total work is linear.",
      ],
      diagram: `  converging
  [ 2   3   5   8   11   15 ]
    ↑                     ↑
    L                     R

  sum < target → L++      (only L can raise it)
  sum > target → R--      (only R can lower it)`,
      key: "Every move must eliminate a whole set of candidates, not just one.",
    },
    templates: [
      {
        name: "Converging",
        filename: "two_pointers.go",
        note: "Sorted input. Each comparison discards an entire row or column of the pair space.",
        code: `func twoSumSorted(nums []int, target int) []int {
    l, r := 0, len(nums)-1
    for l < r {
        sum := nums[l] + nums[r]
        switch {
        case sum == target:
            return []int{l, r}
        case sum < target:
            l++
        default:
            r--
        }
    }
    return nil
}`,
      },
      {
        name: "Three sum",
        filename: "three_sum.go",
        note: "Fix one index, two-point the rest. Duplicate skipping is needed at all three levels.",
        code: `func threeSum(nums []int) [][]int {
    sort.Ints(nums)
    var out [][]int

    for i := 0; i < len(nums)-2; i++ {
        if nums[i] > 0 {
            break // sorted: no way back to zero
        }
        if i > 0 && nums[i] == nums[i-1] {
            continue // skip duplicate anchors
        }

        l, r := i+1, len(nums)-1
        for l < r {
            sum := nums[i] + nums[l] + nums[r]
            switch {
            case sum < 0:
                l++
            case sum > 0:
                r--
            default:
                out = append(out, []int{nums[i], nums[l], nums[r]})
                l++
                r--
                for l < r && nums[l] == nums[l-1] {
                    l++
                }
                for l < r && nums[r] == nums[r+1] {
                    r--
                }
            }
        }
    }
    return out
}`,
      },
      {
        name: "Read / write",
        filename: "partition.go",
        note: "Same-direction pointers. w marks where the next keeper goes.",
        code: `func removeDuplicates(nums []int) int {
    if len(nums) == 0 {
        return 0
    }
    w := 1
    for r := 1; r < len(nums); r++ {
        if nums[r] != nums[w-1] {
            nums[w] = nums[r]
            w++
        }
    }
    return w
}`,
      },
      {
        name: "Dutch flag",
        filename: "dutch_flag.go",
        note: "Three-way partition in one pass. Do not advance i when swapping with hi.",
        code: `func sortColors(nums []int) {
    lo, i, hi := 0, 0, len(nums)-1
    for i <= hi {
        switch nums[i] {
        case 0:
            nums[lo], nums[i] = nums[i], nums[lo]
            lo++
            i++
        case 2:
            nums[hi], nums[i] = nums[i], nums[hi]
            hi-- // the value swapped in is unexamined: do not advance i
        default:
            i++
        }
    }
}`,
      },
    ],
    complexity: [
      { label: "Two pointers", value: "O(n)" },
      { label: "With a sort", value: "O(n log n)", note: "the sort dominates" },
      { label: "Three sum", value: "O(n²)" },
      { label: "Space", value: "O(1)" },
    ],
    why: "Correctness rests on a monotonicity argument. In converging two-sum, if nums[l]+nums[r] < target then nums[l] paired with anything at or below r is also too small, so l can never be part of the answer with any of those partners — the entire row is eliminated, not one cell.",
    variations: [
      { name: "Closest sum", detail: "Same skeleton; instead of testing equality, track the smallest |sum - target| seen." },
      { name: "Fill from the back", detail: "Merging into the larger array is only safe backwards, where the unread region is never overwritten." },
      { name: "Two sequences", detail: "Subsequence checks advance the pattern pointer only on a match." },
      { name: "Fast and slow", detail: "When the two pointers move at different rates over the same structure, see fast & slow pointers." },
    ],
    mistakes: [
      { title: "Forgetting to skip duplicates", detail: "In 3Sum the duplicate skip is needed for the anchor and for both moving pointers." },
      { title: "Advancing after a swap with hi", detail: "The value pulled in from the right has not been classified yet." },
      { title: "Using two pointers on unsorted data", detail: "Without an order there is no reason a move eliminates candidates." },
      { title: "l <= r instead of l < r", detail: "Pairs need two distinct indices." },
    ],
    related: ["fast-slow-pointers", "variable-sliding-window", "sorting", "palindrome-techniques"],
    problems: [167, 15, 16, 18, 11, 42, 26, 27, 88, 283, 75, 977, 392, 986, 658],
  },
  {
    slug: "fast-slow-pointers",
    title: "Fast & Slow Pointers",
    category: "two-pointers",
    description: "Two pointers over the same sequence at different speeds — cycles and midpoints fall out.",
    concepts: ["Floyd", "Cycle", "Midpoint"],
    usedFor: ["cycle detection", "finding a midpoint", "nth from the end", "duplicate as a cycle entry"],
    signals: ["linked list", "cycle", "middle of", "nth from the end", "repeats forever", "O(1) space"],
    recognition: [
      "a linked list, or any structure where i → f(i) defines a next step",
      "you need the middle without knowing the length",
      "the question is 'does this repeat forever' — that is a cycle",
      "a one-pass, constant-space requirement over a list",
    ],
    typicalQuestion: "Detect whether a linked list has a cycle, in O(1) space.",
    mentalModel: {
      lines: [
        "Slow moves one step, fast moves two.",
        "In a cycle, fast gains exactly one position per step on slow, so it must land on it.",
        "When fast reaches the end, slow is at the middle.",
      ],
      diagram: `  1 → 2 → 3 → 4 → 5
              ↑         │
              └─────────┘

  slow +1, fast +2
  gap shrinks by 1 each step → they meet`,
      key: "Any function graph where each node has exactly one successor is a rho shape: a tail into a loop.",
    },
    templates: [
      {
        name: "Cycle detect",
        filename: "has_cycle.go",
        note: "Check fast and fast.Next before dereferencing.",
        code: `func hasCycle(head *ListNode) bool {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
        if slow == fast {
            return true
        }
    }
    return false
}`,
      },
      {
        name: "Cycle entry",
        filename: "cycle_start.go",
        note: "After the meeting, reset one pointer to the head and step both at speed 1.",
        code: `func detectCycle(head *ListNode) *ListNode {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
        if slow == fast {
            // a = distance head→entry, they are now equidistant
            p := head
            for p != slow {
                p = p.Next
                slow = slow.Next
            }
            return p
        }
    }
    return nil
}`,
      },
      {
        name: "Midpoint",
        filename: "middle.go",
        note: "For even lengths this returns the second middle. Start fast at head.Next for the first.",
        code: `func middleNode(head *ListNode) *ListNode {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
    }
    return slow
}`,
      },
      {
        name: "Nth from end",
        filename: "nth_from_end.go",
        note: "Open a gap of n, then move both until the leader falls off. A dummy head removes the edge case.",
        code: `func removeNthFromEnd(head *ListNode, n int) *ListNode {
    dummy := &ListNode{Next: head}
    slow, fast := dummy, dummy

    for i := 0; i < n; i++ {
        fast = fast.Next
    }
    for fast.Next != nil {
        slow = slow.Next
        fast = fast.Next
    }
    slow.Next = slow.Next.Next
    return dummy.Next
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n)" },
      { label: "Space", value: "O(1)", note: "the point of the pattern; a hash set also works at O(n) space" },
    ],
    why: "Let the tail have length a and the meeting point sit b steps into a cycle of length c. Slow travelled a+b, fast travelled a+b+kc, and fast travelled exactly twice as far. So a+b = kc-b, giving a = kc - 2b + ... — reduced: walking a steps from the head and a steps from the meeting point lands on the same node.",
    variations: [
      { name: "Duplicate number as a cycle", detail: "Treat i → nums[i] as a list. With n+1 values in 1..n, two indices point at the same value, forming a cycle whose entry is the duplicate." },
      { name: "Happy number", detail: "Digit-square-sum is a function on integers, so it is a functional graph — the cycle detection applies unchanged." },
      { name: "Palindrome list", detail: "Midpoint, reverse the second half, compare, and optionally restore." },
      { name: "Reorder / split", detail: "Midpoint plus reversal underpins reorder-list and merge-sort on lists." },
    ],
    mistakes: [
      { title: "Dereferencing fast.Next.Next unguarded", detail: "The loop condition must check both fast != nil and fast.Next != nil." },
      { title: "Starting slow and fast one apart for cycle detection", detail: "They must start together, or the meeting-point maths for the entry node does not hold." },
      { title: "Returning the wrong middle", detail: "Decide up front whether an even-length list should return the first or second middle." },
    ],
    related: ["two-pointers", "palindrome-techniques", "divide-and-conquer", "math-number-theory"],
    problems: [141, 142, 876, 287, 234, 143, 19, 206, 202, 148],
  },
  {
    slug: "fixed-sliding-window",
    title: "Fixed Sliding Window",
    category: "two-pointers",
    description: "A window of known size k slid across the sequence, updated by one add and one remove.",
    concepts: ["Size k", "Add/remove", "Rolling"],
    usedFor: ["subarrays of length k", "rolling averages", "anagram search", "fixed-length substrings"],
    signals: ["of size k", "of length k", "exactly k consecutive", "every window", "average of k", "anagram"],
    recognition: [
      "the window length is given in the statement",
      "the answer is over all contiguous blocks of that exact length",
      "the naive solution recomputes the whole block for every start index",
      "the aggregate is incremental: sum, count, frequency",
    ],
    typicalQuestion: "Find the maximum sum of any subarray of length k.",
    mentalModel: {
      lines: [
        "Fill the first k elements, then slide.",
        "One element enters on the right, one leaves on the left.",
        "State never gets recomputed — it gets patched.",
      ],
      diagram: `  [ 1   3   2   5   4 ]   k = 3
    └───────┘
        └───────┘
             +5  −1

  each step: O(1) update`,
      key: "If the aggregate can be undone, the window costs O(1) per step.",
    },
    templates: [
      {
        name: "Fixed window",
        filename: "fixed_window.go",
        note: "The single loop form: add, then evict once the window is oversized.",
        code: `func maxSumK(nums []int, k int) int {
    sum, best := 0, math.MinInt

    for i, v := range nums {
        sum += v
        if i >= k {
            sum -= nums[i-k]
        }
        if i >= k-1 {
            best = max(best, sum)
        }
    }
    return best
}`,
      },
      {
        name: "Frequency window",
        filename: "anagrams.go",
        note: "Track a matched counter instead of comparing two tables every step.",
        code: `func findAnagrams(s, p string) []int {
    if len(s) < len(p) {
        return nil
    }
    var need, win [26]int
    for i := 0; i < len(p); i++ {
        need[p[i]-'a']++
    }

    var out []int
    for i := 0; i < len(s); i++ {
        win[s[i]-'a']++
        if i >= len(p) {
            win[s[i-len(p)]-'a']--
        }
        if i >= len(p)-1 && win == need {
            out = append(out, i-len(p)+1)
        }
    }
    return out
}`,
      },
      {
        name: "Rolling hash window",
        filename: "rolling_window.go",
        note: "When the window is a fixed-width code, pack it into an integer instead of a map.",
        code: `func findRepeatedDNA(s string) []string {
    if len(s) < 10 {
        return nil
    }
    code := map[byte]int{'A': 0, 'C': 1, 'G': 2, 'T': 3}
    seen, added := map[int]int{}, map[int]bool{}

    var out []string
    h := 0
    for i := 0; i < len(s); i++ {
        h = (h<<2 | code[s[i]]) & (1<<20 - 1) // keep 10 bases
        if i >= 9 {
            seen[h]++
            if seen[h] == 2 && !added[h] {
                added[h] = true
                out = append(out, s[i-9:i+1])
            }
        }
    }
    return out
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n)", note: "each element enters and leaves exactly once" },
      { label: "Space", value: "O(1)", note: "O(k) or O(alphabet) when a frequency table is needed" },
    ],
    variations: [
      { name: "Window maximum", detail: "max cannot be undone by subtraction — use a monotonic deque." },
      { name: "Window with a constraint", detail: "Fixed size plus a validity rule (all distinct, at most k vowels) just adds a counter." },
      { name: "Two windows", detail: "Some problems slide two windows of different sizes in the same pass." },
    ],
    mistakes: [
      { title: "Recording the answer before the window is full", detail: "Guard with i >= k-1." },
      { title: "Evicting with the wrong index", detail: "When i enters, the element leaving is i-k, not i-k+1." },
      { title: "Comparing full frequency tables every step", detail: "Fine for 26 slots, quadratic for a large alphabet — track a match counter." },
    ],
    related: ["variable-sliding-window", "deque", "rolling-hash", "hash-map"],
    problems: [643, 1456, 438, 567, 2461, 239, 187],
  },
  {
    slug: "variable-sliding-window",
    title: "Variable Sliding Window",
    category: "two-pointers",
    description: "Grow the window on the right, shrink it from the left whenever it becomes invalid.",
    concepts: ["Expand", "Shrink", "Invariant"],
    usedFor: ["longest valid subarray", "shortest valid subarray", "at most K constraints", "frequency constraints"],
    signals: ["longest", "shortest", "at most K", "at least K", "contiguous", "without repeating", "distinct characters"],
    recognition: [
      "the answer is a contiguous subarray or substring",
      "there is a constraint that can only get harder as the window grows",
      "you can test validity incrementally from the window's own state",
      "all values are non-negative (for sum constraints) so growth is monotone",
    ],
    typicalQuestion: "Find the longest substring containing at most K distinct characters.",
    mentalModel: {
      lines: [
        "left ────────────── right",
        "Expand right to include the next element.",
        "While the window is invalid, move left until it is valid again.",
        "Record the answer at the right moment — that moment differs for longest and shortest.",
      ],
      diagram: `  longest valid          shortest valid
  ─────────────          ──────────────
  expand right           expand right
  while INVALID:         while VALID:
      shrink left            record
  record                     shrink left`,
      key: "Don't recompute the window. Maintain its state incrementally.",
    },
    templates: [
      {
        name: "Longest",
        filename: "longest_window.go",
        note: "Shrink while invalid, then the window is valid and maximal for this right.",
        code: `func longestAtMostKDistinct(s string, k int) int {
    cnt := map[byte]int{}
    left, best := 0, 0

    for right := 0; right < len(s); right++ {
        cnt[s[right]]++

        for len(cnt) > k { // invalid → shrink
            c := s[left]
            cnt[c]--
            if cnt[c] == 0 {
                delete(cnt, c)
            }
            left++
        }
        best = max(best, right-left+1)
    }
    return best
}`,
      },
      {
        name: "Shortest",
        filename: "shortest_window.go",
        note: "Record inside the shrink loop — that is where the window is minimal and still valid.",
        code: `func minSubArrayLen(target int, nums []int) int {
    left, sum := 0, 0
    best := math.MaxInt

    for right, v := range nums {
        sum += v

        for sum >= target { // valid → record, then try smaller
            best = min(best, right-left+1)
            sum -= nums[left]
            left++
        }
    }
    if best == math.MaxInt {
        return 0
    }
    return best
}`,
      },
      {
        name: "Jump the left edge",
        filename: "no_repeat.go",
        note: "When you know exactly where the violation is, jump instead of stepping.",
        code: `func lengthOfLongestSubstring(s string) int {
    last := [128]int{}
    for i := range last {
        last[i] = -1
    }

    left, best := 0, 0
    for right := 0; right < len(s); right++ {
        if p := last[s[right]]; p >= left {
            left = p + 1 // never move left backwards
        }
        last[s[right]] = right
        best = max(best, right-left+1)
    }
    return best
}`,
      },
      {
        name: "Exactly K",
        filename: "exactly_k.go",
        note: "'Exactly K' is not monotone. 'At most K' is — so subtract two runs.",
        code: `func subarraysWithKDistinct(nums []int, k int) int {
    return atMostKDistinct(nums, k) - atMostKDistinct(nums, k-1)
}

func atMostKDistinct(nums []int, k int) int {
    cnt := map[int]int{}
    left, total := 0, 0

    for right, v := range nums {
        cnt[v]++
        for len(cnt) > k {
            cnt[nums[left]]--
            if cnt[nums[left]] == 0 {
                delete(cnt, nums[left])
            }
            left++
        }
        total += right - left + 1 // every window ending at right
    }
    return total
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n)", note: "left and right each advance at most n times" },
      { label: "Space", value: "O(k)", note: "or O(alphabet) for the frequency table" },
    ],
    why: "The window works only when validity is monotone: if a window is invalid, every window containing it is also invalid. That is what lets left move forward and never come back. Sums with negative numbers break this, which is why 'subarray sum equals K' needs prefix sums instead.",
    variations: [
      { name: "At least K", detail: "Often easier as total subarrays minus atMost(K-1)." },
      { name: "Count, not length", detail: "Each right contributes right-left+1 valid subarrays — a one-line change." },
      { name: "Replacement budget", detail: "Window valid while size - maxFreq <= k (problem 424)." },
      { name: "Requirement counter", detail: "For minimum-window problems, track how many distinct requirements are fully met, not raw counts." },
    ],
    mistakes: [
      { title: "Moving left backwards", detail: "In the jump variant, guard with left = max(left, last+1) or an old duplicate drags the window back." },
      { title: "Recording the answer in the wrong place", detail: "Longest records after shrinking; shortest records inside the shrink loop." },
      { title: "Using a window when values can be negative", detail: "Shrinking may increase the sum, so the invariant is gone. Use prefix sums plus a map." },
      { title: "Leaving zero counts in the map", detail: "len(cnt) is the distinct count only if you delete keys that reach zero." },
    ],
    related: ["fixed-sliding-window", "two-pointers", "prefix-sum-hash-map", "deque"],
    problems: [3, 209, 424, 76, 340, 904, 1004, 1493, 992, 713, 930, 220],
  },
  {
    slug: "subarray-substring",
    title: "Subarray & Substring Problems",
    category: "two-pointers",
    description: "A decision procedure: window, prefix sums, or DP — the constraints tell you which.",
    concepts: ["Contiguous", "Counting", "Kadane"],
    usedFor: ["choosing between window and prefix sum", "counting subarrays", "maximum-sum subarrays"],
    signals: ["subarray", "substring", "contiguous", "how many subarrays", "maximum sum", "equals k"],
    recognition: [
      "the word 'contiguous' appears, or is implied by 'subarray'/'substring'",
      "you must decide: is the property monotone as the window grows?",
      "counting subarrays rather than finding one — think 'endings at each right'",
      "maximum sum with no length constraint — that is Kadane, not a window",
    ],
    typicalQuestion: "How many subarrays sum to exactly k?",
    mentalModel: {
      lines: [
        "All values non-negative and the property monotone → sliding window.",
        "Negatives present, or an exact sum required → prefix sums plus a hash map.",
        "Maximum sum with no constraints → Kadane.",
        "Counting subarrays → sum over right of (number of valid lefts).",
      ],
      diagram: `  contiguous?
      │yes
      ▼
  property monotone in window size?
      ├── yes ──▶ sliding window          O(n)
      └── no  ──▶ exact target?
                   ├── yes ─▶ prefix + map  O(n)
                   └── no  ─▶ DP / D&C`,
      key: "The question is never 'which trick' — it is 'is the property monotone'.",
    },
    templates: [
      {
        name: "Kadane",
        filename: "kadane.go",
        note: "Best subarray ending here: extend the previous one, or start fresh.",
        code: `func maxSubArray(nums []int) int {
    best, cur := nums[0], nums[0]
    for _, v := range nums[1:] {
        cur = max(v, cur+v)
        best = max(best, cur)
    }
    return best
}`,
      },
      {
        name: "Count by endings",
        filename: "count_subarrays.go",
        note: "Fix the right end; count how many lefts make it valid. Sum over all rights.",
        code: `func numSubarrayProductLessThanK(nums []int, k int) int {
    if k <= 1 {
        return 0
    }
    prod, left, total := 1, 0, 0

    for right, v := range nums {
        prod *= v
        for prod >= k {
            prod /= nums[left]
            left++
        }
        total += right - left + 1
    }
    return total
}`,
      },
      {
        name: "Min and max together",
        filename: "max_product.go",
        note: "A negative swaps the roles of the running min and max, so carry both.",
        code: `func maxProduct(nums []int) int {
    best, curMax, curMin := nums[0], nums[0], nums[0]

    for _, v := range nums[1:] {
        if v < 0 {
            curMax, curMin = curMin, curMax
        }
        curMax = max(v, curMax*v)
        curMin = min(v, curMin*v)
        best = max(best, curMax)
    }
    return best
}`,
      },
    ],
    complexity: [
      { label: "Window", value: "O(n)" },
      { label: "Prefix + map", value: "O(n)" },
      { label: "Kadane", value: "O(n)" },
      { label: "Space", value: "O(1) – O(n)", note: "O(n) only when a prefix map is needed" },
    ],
    variations: [
      { name: "Circular subarray", detail: "max(kadaneMax, total - kadaneMin), with a guard for the all-negative case." },
      { name: "Subarray with equal counts", detail: "Map one symbol to -1 and look for two equal prefix sums." },
      { name: "Longest with sum k", detail: "Store the first index of each prefix sum and never overwrite it." },
    ],
    mistakes: [
      { title: "Applying a window to a problem with negatives", detail: "The classic wrong answer on problem 560." },
      { title: "Initialising Kadane at 0", detail: "An all-negative array then returns 0. Start from nums[0]." },
      { title: "Counting subarrays by their starts", detail: "Counting by endings is what makes the window arithmetic work." },
    ],
    related: ["variable-sliding-window", "prefix-sum-hash-map", "linear-dp", "monotonic-stack"],
    problems: [53, 152, 918, 560, 713, 992, 525],
  },
  {
    slug: "prefix-sum-hash-map",
    title: "Prefix Sum + Hash Map",
    category: "two-pointers",
    description: "Any subarray sum is a difference of two prefix sums — so store the prefixes you have seen.",
    concepts: ["Exact target", "Negatives", "Remainders"],
    usedFor: ["exact subarray sums", "sums with negative numbers", "divisibility of subarray sums", "balanced subarrays"],
    signals: ["sum equals k", "divisible by k", "equal number of", "negative numbers allowed", "count subarrays"],
    recognition: [
      "an exact subarray sum is required, not a bound",
      "the array can contain negative numbers or zeroes",
      "the target is a remainder: 'sum divisible by k'",
      "you need to count subarrays, not just find one",
    ],
    typicalQuestion: "Count the subarrays whose sum equals k, where values may be negative.",
    mentalModel: {
      lines: [
        "P[j+1] - P[i] = k   ⟺   P[i] = P[j+1] - k.",
        "So as you sweep, ask the map how many earlier prefixes equal cur - k.",
        "Seed the map with prefix 0 seen once — that covers subarrays starting at index 0.",
      ],
      diagram: `  running sum:  0   3   1   6   6
                 ↑           ↑
              P[i]        P[j+1]

  need P[i] = P[j+1] − k
  map: prefix → count (or first index)`,
      key: "Seed {0: 1}. Almost every wrong answer here is a missing seed.",
    },
    templates: [
      {
        name: "Count subarrays",
        filename: "subarray_sum_k.go",
        note: "The map counts occurrences, so it counts subarrays.",
        code: `func subarraySum(nums []int, k int) int {
    seen := map[int]int{0: 1} // empty prefix
    sum, total := 0, 0

    for _, v := range nums {
        sum += v
        total += seen[sum-k]
        seen[sum]++
    }
    return total
}`,
      },
      {
        name: "Longest subarray",
        filename: "longest_sum_k.go",
        note: "Store the FIRST index of each prefix and never overwrite it.",
        code: `func maxLenSumK(nums []int, k int) int {
    first := map[int]int{0: -1}
    sum, best := 0, 0

    for i, v := range nums {
        sum += v
        if j, ok := first[sum-k]; ok {
            best = max(best, i-j)
        }
        if _, ok := first[sum]; !ok {
            first[sum] = i // earliest only → longest span
        }
    }
    return best
}`,
      },
      {
        name: "Divisible by k",
        filename: "divisible_k.go",
        note: "Two prefixes with the same remainder bracket a subarray divisible by k.",
        code: `func subarraysDivByK(nums []int, k int) int {
    cnt := make([]int, k)
    cnt[0] = 1

    sum, total := 0, 0
    for _, v := range nums {
        sum = ((sum+v)%k + k) % k // Go's % keeps the sign
        total += cnt[sum]
        cnt[sum]++
    }
    return total
}`,
      },
      {
        name: "On a tree path",
        filename: "path_sum_iii.go",
        note: "The same map, but the prefix is the root-to-node path — undo it on the way out.",
        code: `func pathSum(root *TreeNode, target int) int {
    seen := map[int]int{0: 1}
    var dfs func(*TreeNode, int) int

    dfs = func(n *TreeNode, sum int) int {
        if n == nil {
            return 0
        }
        sum += n.Val
        count := seen[sum-target]

        seen[sum]++
        count += dfs(n.Left, sum) + dfs(n.Right, sum)
        seen[sum]-- // leave the path: undo

        return count
    }
    return dfs(root, 0)
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n)" },
      { label: "Space", value: "O(n)", note: "O(k) for the remainder variant" },
    ],
    why: "A sliding window needs the running sum to be monotone in the window size. Negative values destroy that. Prefix sums do not care about signs — every subarray sum is still exactly a difference of two prefixes, so the only question becomes a lookup.",
    variations: [
      { name: "Equal counts of two symbols", detail: "Map one to +1 and the other to -1; a balanced subarray is two equal prefixes." },
      { name: "Remainder with a first-index map", detail: "For 'length at least 2 and divisible by k', store the first index per remainder." },
      { name: "XOR prefixes", detail: "XOR is invertible, so the same structure counts subarrays with a given XOR." },
    ],
    mistakes: [
      { title: "Forgetting the {0: 1} seed", detail: "Subarrays that start at index 0 go uncounted." },
      { title: "Overwriting the first index", detail: "For longest-span problems you must keep the earliest occurrence." },
      { title: "Negative remainders", detail: "In Go, -1 % 3 is -1. Normalise with ((x%k)+k)%k." },
      { title: "Mixing the count map and the index map", detail: "Counting needs occurrences; longest needs first index. They are different maps." },
    ],
    related: ["prefix-sum", "hash-map", "variable-sliding-window", "modular-arithmetic"],
    problems: [560, 523, 974, 525, 930, 437],
  },
  {
    slug: "palindrome-techniques",
    title: "Palindrome Techniques",
    category: "two-pointers",
    description: "Check from both ends, expand from centres, or run Manacher when linear time is required.",
    concepts: ["Expand", "Centres", "DP"],
    usedFor: ["palindrome validation", "longest palindromic substring", "counting palindromes", "palindrome partitioning"],
    signals: ["palindrome", "reads the same backwards", "symmetric", "longest palindromic", "at most one deletion"],
    recognition: [
      "validation → two pointers from both ends",
      "longest or count → expand around each of the 2n-1 centres",
      "subsequence, not substring → interval DP, not expansion",
      "linear time demanded on a large string → Manacher",
    ],
    typicalQuestion: "Find the longest palindromic substring.",
    mentalModel: {
      lines: [
        "A palindrome is defined by its centre, and there are 2n-1 centres: n single, n-1 between.",
        "Expanding from a centre costs O(len) and finds the maximal palindrome there.",
        "Substring means contiguous — expansion. Subsequence means gaps allowed — DP.",
      ],
      diagram: `  a b a c a b a
      ▲                odd centre  (1 char)
  a a b b a a
      ▲                even centre (between 2)

  expand while s[l] == s[r]`,
      key: "Substring → expand around centres. Subsequence → interval DP.",
    },
    templates: [
      {
        name: "Validate",
        filename: "is_palindrome.go",
        note: "Skip non-alphanumerics in place — no cleaned copy needed.",
        code: `func isPalindrome(s string) bool {
    l, r := 0, len(s)-1
    for l < r {
        for l < r && !isAlnum(s[l]) {
            l++
        }
        for l < r && !isAlnum(s[r]) {
            r--
        }
        if lower(s[l]) != lower(s[r]) {
            return false
        }
        l++
        r--
    }
    return true
}`,
      },
      {
        name: "Expand from centre",
        filename: "expand_center.go",
        note: "Run it twice per index: odd centre (i,i) and even centre (i,i+1).",
        code: `func longestPalindrome(s string) string {
    if len(s) < 2 {
        return s
    }
    start, length := 0, 1

    expand := func(l, r int) {
        for l >= 0 && r < len(s) && s[l] == s[r] {
            l--
            r++
        }
        // s[l+1:r] is the palindrome
        if r-l-1 > length {
            start, length = l+1, r-l-1
        }
    }

    for i := 0; i < len(s); i++ {
        expand(i, i)   // odd
        expand(i, i+1) // even
    }
    return s[start : start+length]
}`,
      },
      {
        name: "Interval DP",
        filename: "palindrome_dp.go",
        note: "isPal[i][j] depends on isPal[i+1][j-1], so fill by increasing length.",
        code: `func palindromeTable(s string) [][]bool {
    n := len(s)
    isPal := make([][]bool, n)
    for i := range isPal {
        isPal[i] = make([]bool, n)
        isPal[i][i] = true
    }

    for length := 2; length <= n; length++ {
        for i := 0; i+length-1 < n; i++ {
            j := i + length - 1
            isPal[i][j] = s[i] == s[j] && (length == 2 || isPal[i+1][j-1])
        }
    }
    return isPal
}`,
      },
      {
        name: "Allow one deletion",
        filename: "almost_palindrome.go",
        note: "On the first mismatch, branch into the two possible repairs.",
        code: `func validPalindromeII(s string) bool {
    l, r := 0, len(s)-1
    for l < r {
        if s[l] != s[r] {
            return isPalRange(s, l+1, r) || isPalRange(s, l, r-1)
        }
        l++
        r--
    }
    return true
}

func isPalRange(s string, l, r int) bool {
    for l < r {
        if s[l] != s[r] {
            return false
        }
        l++
        r--
    }
    return true
}`,
      },
    ],
    complexity: [
      { label: "Validate", value: "O(n)" },
      { label: "Expand all centres", value: "O(n²)" },
      { label: "Interval DP", value: "O(n²)", note: "O(n²) space too" },
      { label: "Manacher", value: "O(n)", note: "O(n) space" },
    ],
    variations: [
      { name: "Count instead of longest", detail: "Increment a counter on every successful expansion step." },
      { name: "Palindromic subsequence", detail: "LCS of s and reverse(s), or a direct interval DP." },
      { name: "Partitioning", detail: "Precompute the isPal table, then backtrack or DP over cut positions." },
      { name: "Shortest palindrome by prefixing", detail: "Longest palindromic prefix via KMP on s + '#' + reverse(s)." },
    ],
    mistakes: [
      { title: "Only checking odd centres", detail: "'abba' has no single-character centre." },
      { title: "Getting the length back from expansion wrong", detail: "After the loop, l and r are one step too far: the palindrome is s[l+1:r], of length r-l-1." },
      { title: "Filling the DP table in index order", detail: "isPal[i][j] needs isPal[i+1][j-1], so iterate by length or with i descending." },
      { title: "Treating subsequence like substring", detail: "Expansion only finds contiguous palindromes." },
    ],
    related: ["manacher", "interval-dp", "string-dp", "two-pointers"],
    problems: [125, 680, 5, 647, 131, 234, 214, 516],
  },
];
