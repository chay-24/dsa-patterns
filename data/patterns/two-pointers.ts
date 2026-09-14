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
    teach: [
      "You have a sorted array and you need two numbers adding up to 9. The obvious move is to try every pair: take the first number, scan the rest for its partner, repeat. That is n times n work, and it throws away the one thing you were handed for free — the order.",
      "Put one finger on the smallest number and one on the largest. Add them. If the total is too small, the only way to raise it is to move the left finger right, because the right one is already as big as it gets. If the total is too big, move the right finger left for the same reason.",
      "Now think about what that move throws away. When the left finger steps past a number, you are not skipping one pair — you are saying that number cannot work with anything the right finger could still reach. One comparison rules out a whole row of the table you were about to search.",
      "Each finger only ever moves inward, so between them they take at most n steps. The nested loop is gone. The same two-index idea also runs in one direction: a slow writer trailing a fast reader, which is how you rewrite an array in place.",
    ],
    mentalModel: {
      lines: [
        "Start at both ends and walk inwards.",
        "Move the pointer that could still improve the answer.",
        "Or walk the same way: a slow writer trailing a fast reader.",
      ],
      diagram: `  converging
  [ 2   3   5   8   11   15 ]
    ↑                     ↑
    L                     R

  sum < target → L++      (only L can raise it)
  sum > target → R--      (only R can lower it)`,
      key: "Every move must rule out a whole group of candidates, not just one.",
    },
    templates: [
      {
        name: "Converging",
        filename: "two_pointers.go",
        note: "Sorted input. Each comparison throws away a whole row of pairs.",
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
        note: "Fix one number, two-point the rest. Skip duplicates at every level.",
        code: `func threeSum(nums []int) [][]int {
    sort.Ints(nums)
    var out [][]int

    for i := 0; i < len(nums)-2; i++ {
        if nums[i] > 0 {
            break // sorted: no way back to zero
        }
        if i > 0 && nums[i] == nums[i-1] {
            continue // skip a duplicate anchor
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
                for l++; l < r && nums[l] == nums[l-1]; l++ {
                }
                r--
            }
        }
    }
    return out
}`,
      },
      {
        name: "Read / write",
        filename: "partition.go",
        note: "Same direction. w marks where the next keeper goes.",
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
        note: "Three-way split in one pass. Do not advance i after swapping with hi.",
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
    why: "It works because the array is sorted. If nums[l] + nums[r] is too small, then nums[l] is too small with every partner up to r as well. So one comparison throws away a whole row of pairs, not a single pair.",
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
    teach: [
      "You are handed the head of a linked list and asked whether it loops back on itself. You cannot see the whole thing, and you are told not to use extra memory, so a set of visited nodes is out.",
      "Send two walkers down the list. The slow one takes one step at a time, the fast one takes two. If the list ends, the fast one falls off and you have your answer: no loop.",
      "If there is a loop, both walkers end up inside it, and now the fast one gains exactly one place on the slow one every step. A gap that shrinks by one every time must eventually reach zero. They cannot jump past each other, so they land on the same node.",
      "The same pair does other work for free. Let the fast one run to the end and the slow one is standing at the middle, without ever counting the length. Start them n apart instead of together, move them in step, and when the leader falls off the end the follower is exactly n from the back.",
      "It goes beyond lists. Any rule where each thing points at exactly one next thing — index i leads to nums[i], a number leads to its digit-square-sum — is a chain that must eventually repeat. The same two walkers find it.",
    ],
    mentalModel: {
      lines: [
        "Slow moves one step, fast moves two.",
        "Inside a loop, fast gains one place per step, so it must catch slow.",
        "When fast runs off the end, slow is sitting at the middle.",
      ],
      diagram: `  1 → 2 → 3 → 4 → 5
              ↑         │
              └─────────┘

  slow +1, fast +2
  gap shrinks by 1 each step → they meet`,
      key: "Any structure where each node has exactly one next is a loop with a tail.",
    },
    templates: [
      {
        name: "Cycle detect",
        filename: "has_cycle.go",
        note: "Check fast and fast.Next before stepping, or you dereference nil.",
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
        note: "After they meet, put one pointer back at the head and step both by one.",
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
        note: "For an even length this gives the second middle.",
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
        note: "Open a gap of n, then move both. A dummy head kills the edge case.",
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
      { label: "Space", value: "O(1)", note: "the whole point; a hash set works too, at O(n)" },
    ],
    why: "Say the tail is a steps long and they meet b steps into a loop of length c. Slow walked a+b, fast walked twice that, and the extra distance is a whole number of loops. Doing the algebra, walking a steps from the head and a steps from the meeting point lands on the same node.",
    variations: [
      { name: "Duplicate number as a cycle", detail: "Treat i → nums[i] as a list. With n+1 values in 1..n, two indices point at the same value, forming a cycle whose entry is the duplicate." },
      { name: "Happy number", detail: "Each number leads to exactly one other, so the chain must eventually loop. Same detection." },
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
      "the window length is given to you in the statement",
      "the answer is over every block of exactly that length",
      "the naive version redoes the whole block for each starting point",
      "the thing you track can be added to and taken away from: a sum, a count",
    ],
    typicalQuestion: "Find the maximum sum of any subarray of length k.",
    teach: [
      "Find the largest sum of any three neighbouring numbers. The direct approach takes each starting point and adds up the three that follow. For a window of size k that is k additions per position, and nearly all of them repeat work you just did.",
      "Look at two neighbouring windows. Positions 2, 3, 4 and positions 3, 4, 5 share almost everything — only one number joined and one number left.",
      "So stop rebuilding. Add the number entering on the right, subtract the number leaving on the left, and the total is correct again. One add and one subtract per step, no matter how wide the window is.",
      "That works whenever the thing you track can be undone. Sums and counts can. A maximum cannot — knowing the biggest number in the window tells you nothing once it leaves — and that is exactly when you reach for a deque instead.",
    ],
    mentalModel: {
      lines: [
        "Fill the first k elements, then slide.",
        "One value enters on the right, one leaves on the left.",
        "Patch the running total instead of recomputing it.",
      ],
      diagram: `  [ 1   3   2   5   4 ]   k = 3
    └───────┘
        └───────┘
             +5  −1

  each step: O(1) update`,
      key: "If the total can be undone, each step costs O(1).",
    },
    templates: [
      {
        name: "Fixed window",
        filename: "fixed_window.go",
        note: "Add first, then drop the element that fell out of the window.",
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
        note: "Compare 26-slot count arrays with == rather than looping.",
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
        note: "A tiny alphabet packs into an integer, so no map is needed.",
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
      { label: "Time", value: "O(n)", note: "each element goes in once, out once" },
      { label: "Space", value: "O(1)", note: "O(k) if you keep a count table" },
    ],
    variations: [
      { name: "Window maximum", detail: "A max cannot be subtracted back out, so use a deque instead." },
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
      "the answer is a stretch of neighbouring elements",
      "there is a rule that only gets harder to satisfy as the window grows",
      "you can tell whether the window is valid from what you already track",
      "for sums, the values are all positive, so a bigger window means a bigger sum",
    ],
    typicalQuestion: "Find the longest substring containing at most K distinct characters.",
    teach: [
      "Find the longest stretch of a string containing at most two different letters. Trying every start with every end means n squared stretches, and most of them repeat work.",
      "Keep a left edge and a right edge instead. Push the right edge out one step at a time, taking in a new letter. If the stretch is still allowed, carry on. If it has broken the rule, pull the left edge in until it is allowed again.",
      "Why is it safe to pull left in and never push it back out? Because of the kind of rule this is. If a stretch already has three different letters, then any longer stretch containing it has three as well. Breaking the rule is permanent. So once the left edge passes a position, that position can never start a valid answer ending further right.",
      "Both edges only move forward, at most n steps each, so the whole scan is linear even though it looks like a loop inside a loop.",
      "The last thing to get right is when you write the answer down. For a longest, record after the shrinking stops — that is when the window is valid and as wide as it gets. For a shortest, record inside the shrinking loop, where it is valid and as narrow as it gets.",
    ],
    mentalModel: {
      lines: [
        "Move right to take in a new element.",
        "While the window is invalid, move left until it is valid again.",
        "Record the answer at the right moment.",
        "For longest, record after shrinking. For shortest, record while shrinking.",
      ],
      diagram: `  longest valid          shortest valid
  ─────────────          ──────────────
  expand right           expand right
  while INVALID:         while VALID:
      shrink left            record
  record                     shrink left`,
      key: "Do not rebuild the window. Update what you already know.",
    },
    templates: [
      {
        name: "Longest",
        filename: "longest_window.go",
        note: "Shrink while invalid. When the loop ends, the window is valid and as big as it gets.",
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
        note: "Record inside the shrink loop, where the window is smallest and still valid.",
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
        note: "When you know where the clash is, jump left past it instead of stepping.",
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
        note: "'Exactly K' is not a one-sided rule. 'At most K' is, so run it twice and subtract.",
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
      { label: "Time", value: "O(n)", note: "each pointer moves forward at most n times" },
      { label: "Space", value: "O(k)", note: "or the alphabet size, for counts" },
    ],
    why: "The window only works if breaking the rule is permanent: once a window is invalid, every bigger window around it is invalid too. That is what lets left move forward and never come back. Negative numbers break it, which is why 'sum equals k' needs prefix sums instead.",
    variations: [
      { name: "At least K", detail: "Often easier as total subarrays minus atMost(K-1)." },
      { name: "Count, not length", detail: "Each right contributes right-left+1 valid subarrays — a one-line change." },
      { name: "Replacement budget", detail: "Window valid while size - maxFreq <= k (problem 424)." },
      { name: "Requirement counter", detail: "For minimum-window problems, track how many distinct requirements are fully met, not raw counts." },
    ],
    mistakes: [
      { title: "Moving left backwards", detail: "In the jump variant, guard with left = max(left, last+1) or an old duplicate drags the window back." },
      { title: "Recording the answer in the wrong place", detail: "Longest records after shrinking; shortest records inside the shrink loop." },
      { title: "Using a window when values can be negative", detail: "Shrinking might make the sum bigger, so the rule you relied on is gone. Use prefix sums plus a map." },
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
      "the word 'contiguous' appears, or 'subarray' or 'substring' implies it",
      "ask one question: once the rule breaks, does a bigger window always break it too?",
      "you are counting subarrays, so think about how many valid starts each end has",
      "biggest sum with no length limit: that is Kadane, not a window",
    ],
    typicalQuestion: "How many subarrays sum to exactly k?",
    teach: [
      "'Subarray' and 'substring' both mean a run of neighbours with nothing skipped. Nearly every one of these problems is solved by one of three tools, and choosing between them is the actual work.",
      "Ask one question first: once a stretch breaks the rule, does every bigger stretch around it break it too? If yes, a sliding window works, because the left edge can move forward and never come back.",
      "If the answer is no — usually because negative numbers are allowed, so growing the window can make the sum go down again — the window falls apart. Reach for prefix sums instead. Every subarray total is one running total minus another, and signs do not bother that at all.",
      "If instead you want the biggest sum with no length limit, neither applies. That is Kadane: at each position ask whether it is better to extend the run you are on or start a fresh one here.",
      "And when the question is 'how many subarrays', count by their right end. Fix the end, work out how many starts make it valid, and add that up as you sweep.",
    ],
    mentalModel: {
      lines: [
        "All values positive and the rule one-sided? Sliding window.",
        "Negatives, or an exact total? Prefix sums plus a map.",
        "Biggest sum, any length? Kadane.",
        "Counting them? Add up how many valid starts each end has.",
      ],
      diagram: `  contiguous?
      │yes
      ▼
  property monotone in window size?
      ├── yes ──▶ sliding window          O(n)
      └── no  ──▶ exact target?
                   ├── yes ─▶ prefix + map  O(n)
                   └── no  ─▶ DP / D&C`,
      key: "The question is never which trick. It is whether breaking the rule is permanent.",
    },
    templates: [
      {
        name: "Kadane",
        filename: "kadane.go",
        note: "Best run ending here: either extend the last one, or start again.",
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
        note: "Fix the right end, count the valid lefts, add them up.",
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
        note: "A negative swaps the running best and worst, so carry both.",
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
      { label: "Space", value: "O(1) – O(n)", note: "O(n) only if you need a prefix map" },
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
    teach: [
      "Count the subarrays that add up to exactly k, where some numbers are negative. The window trick dies here: shrinking a window with negatives in it can make the total go up, so there is no safe direction to move.",
      "Go back to running totals. Keep one number as you sweep: the sum of everything so far. Call it cur.",
      "Any subarray total is the difference of two running totals. So a subarray ending here adds up to k exactly when some earlier running total equalled cur - k. You are no longer looking for a subarray — you are looking up a number.",
      "Keep a map of every running total you have seen and how often. At each step, add up how many times cur - k appeared. That is how many subarrays end right here. Sweep once and you have them all.",
      "One line makes or breaks this: seed the map with zero seen once. A subarray that starts at the very beginning needs an 'earlier total' of 0 to subtract, and if it is not in the map those answers vanish silently.",
    ],
    mentalModel: {
      lines: [
        "Every subarray sum is the difference of two running totals.",
        "So sum(i..j) = k means an earlier total equalled cur - k.",
        "As you sweep, ask the map how many earlier totals match.",
      ],
      diagram: `  running sum:  0   3   1   6   6
                 ↑           ↑
              P[i]        P[j+1]

  need P[i] = P[j+1] − k
  map: prefix → count (or first index)`,
      key: "Seed the map with {0: 1}. Almost every wrong answer here is a missing seed.",
    },
    templates: [
      {
        name: "Count subarrays",
        filename: "subarray_sum_k.go",
        note: "The map counts how often each total appeared, so it counts subarrays.",
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
        note: "Store the FIRST index of each total and never overwrite it.",
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
        note: "Two totals with the same remainder bracket a subarray divisible by k.",
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
        note: "Same map, but the total runs down the path. Undo it on the way back up.",
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
    why: "A sliding window needs the running sum to grow as the window grows. Negative numbers break that. Prefix sums do not care about signs: a subarray sum is still just one total minus another, so the whole problem becomes a lookup.",
    variations: [
      { name: "Equal counts of two symbols", detail: "Map one to +1 and the other to -1; a balanced subarray is two equal prefixes." },
      { name: "Remainder with a first-index map", detail: "For 'length at least 2 and divisible by k', store the first index per remainder." },
      { name: "XOR prefixes", detail: "XOR undoes itself, so the same structure counts subarrays with a given XOR." },
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
    teach: [
      "A palindrome reads the same both ways. To check one, walk in from both ends comparing as you go — that part is easy.",
      "Finding the longest one inside a string is different. The trick is to stop thinking about where palindromes start and end, and think about where they are centred.",
      "Every palindrome has a middle. For 'aba' the middle is a letter; for 'abba' the middle sits between two letters. So a string of length n has 2n-1 possible centres. Stand on each one and push outwards while the two sides still match. The furthest you get is the biggest palindrome centred there.",
      "That is n centres and up to n steps each, so n squared — usually fine. Manacher's algorithm gets it down to linear by reusing what nearby centres already proved, but only reach for it when the string is genuinely huge.",
      "One distinction to keep straight. 'Substring' means neighbours with nothing skipped, and that is what expanding from centres finds. 'Subsequence' allows gaps, and expansion cannot see those at all — that is an interval DP.",
    ],
    mentalModel: {
      lines: [
        "A palindrome is defined by its centre.",
        "There are 2n-1 centres: one on each letter, one between each pair.",
        "Grow outwards from a centre while both sides match.",
        "Contiguous means expand. Gaps allowed means DP.",
      ],
      diagram: `  a b a c a b a
      ▲                odd centre  (1 char)
  a a b b a a
      ▲                even centre (between 2)

  expand while s[l] == s[r]`,
      key: "Substring, so expand from centres. Subsequence, so use interval DP.",
    },
    templates: [
      {
        name: "Validate",
        filename: "is_palindrome.go",
        note: "Skip punctuation in place instead of building a cleaned copy.",
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
        note: "Run it twice per index: centred on i, and between i and i+1.",
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
        note: "isPal[i][j] needs isPal[i+1][j-1], so fill by growing length.",
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
        note: "On the first mismatch, try skipping the left char, then the right.",
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
