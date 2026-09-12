import type { Pattern } from "../types";

export const dynamicProgramming: Pattern[] = [
  {
    slug: "linear-dp",
    title: "Linear DP",
    category: "dynamic-programming",
    description: "One dimension, one pass — dp[i] depends on a constant number of earlier entries.",
    concepts: ["1D state", "Rolling", "Kadane"],
    usedFor: ["stairs and paths", "house robber", "longest increasing subsequence", "decode ways"],
    signals: ["in how many ways", "maximum up to i", "cannot pick adjacent", "longest increasing", "fibonacci-like"],
    recognition: [
      "the answer at position i is built from a few earlier positions",
      "a greedy choice fails because a local best can block a better global one",
      "counting arrangements or ways over a sequence",
      "you can describe the state in one sentence with one index",
    ],
    typicalQuestion: "Rob houses without robbing two adjacent ones — what is the maximum?",
    mentalModel: {
      lines: [
        "State: what does dp[i] mean? Answer that in one sentence before writing code.",
        "Transition: how does dp[i] follow from dp[i-1], dp[i-2], …?",
        "Base: what are dp[0] and dp[1]?",
        "Order: left to right, because every dependency is to the left.",
      ],
      diagram: `  dp[i] = f(dp[i-1], dp[i-2])

  ● ● ● ● ● ● ●
      └─┴─▶ i

  only a constant window matters
  → keep two variables, not an array`,
      key: "Write the state definition as a comment first. Most DP bugs are a vague state.",
    },
    templates: [
      {
        name: "Rolling variables",
        filename: "house_robber.go",
        note: "Two numbers replace the whole array when only the last two matter.",
        code: `// take = best if we rob house i, skip = best if we do not
func rob(nums []int) int {
    take, skip := 0, 0
    for _, v := range nums {
        take, skip = skip+v, max(take, skip)
    }
    return max(take, skip)
}`,
      },
      {
        name: "Counting ways",
        filename: "decode_ways.go",
        note: "Additive transitions count arrangements; guard the invalid cases explicitly.",
        code: `func numDecodings(s string) int {
    if len(s) == 0 || s[0] == '0' {
        return 0
    }
    prev2, prev1 := 1, 1 // dp[i-2], dp[i-1]

    for i := 1; i < len(s); i++ {
        cur := 0
        if s[i] != '0' {
            cur += prev1 // single digit
        }
        if two := (s[i-1]-'0')*10 + (s[i] - '0'); two >= 10 && two <= 26 {
            cur += prev2 // two digits
        }
        prev2, prev1 = prev1, cur
    }
    return prev1
}`,
      },
      {
        name: "O(n²) LIS",
        filename: "lis_quadratic.go",
        note: "dp[i] = longest increasing subsequence ENDING at i. Easy to extend.",
        code: `func lengthOfLIS(nums []int) int {
    dp := make([]int, len(nums))
    best := 0

    for i := range nums {
        dp[i] = 1
        for j := 0; j < i; j++ {
            if nums[j] < nums[i] {
                dp[i] = max(dp[i], dp[j]+1)
            }
        }
        best = max(best, dp[i])
    }
    return best
}`,
      },
      {
        name: "Reachability DP",
        filename: "word_break.go",
        note: "dp[i] = can the first i characters be segmented?",
        code: `func wordBreak(s string, wordDict []string) bool {
    words := map[string]bool{}
    maxLen := 0
    for _, w := range wordDict {
        words[w] = true
        maxLen = max(maxLen, len(w))
    }

    dp := make([]bool, len(s)+1)
    dp[0] = true

    for i := 1; i <= len(s); i++ {
        for j := max(0, i-maxLen); j < i; j++ {
            if dp[j] && words[s[j:i]] {
                dp[i] = true
                break
            }
        }
    }
    return dp[len(s)]
}`,
      },
    ],
    complexity: [
      { label: "Simple transitions", value: "O(n)" },
      { label: "LIS quadratic", value: "O(n²)" },
      { label: "LIS with binary search", value: "O(n log n)" },
      { label: "Space", value: "O(1) – O(n)", note: "O(1) when only a fixed window is needed" },
    ],
    variations: [
      { name: "Circular arrays", detail: "Run the linear version twice with one end excluded each time." },
      { name: "Kadane", detail: "Maximum subarray: extend or restart at each index." },
      { name: "Count paths instead of max", detail: "Swap max for + and the same recurrence counts." },
      { name: "Reconstructing the answer", detail: "Store a parent pointer alongside each dp value." },
    ],
    mistakes: [
      { title: "A vague state definition", detail: "'dp[i] is the best so far' versus 'best ending exactly at i' are different recurrences." },
      { title: "Wrong base cases", detail: "dp[0] for counting problems is usually 1 (the empty way), not 0." },
      { title: "Updating rolling variables in the wrong order", detail: "Use simultaneous assignment, or save the old value first." },
      { title: "Off-by-one between string indices and dp indices", detail: "dp has n+1 entries; dp[i] refers to the first i characters." },
    ],
    related: ["grid-dp", "state-machine-dp", "subarray-substring", "knapsack-01"],
    problems: [70, 746, 198, 213, 91, 139, 300, 673, 53, 368, 1626, 338],
  },
  {
    slug: "grid-dp",
    title: "Grid / Matrix DP",
    category: "dynamic-programming",
    description: "Two dimensions where each cell depends on its neighbours above and to the left.",
    concepts: ["2D table", "Row rolling", "Boundaries"],
    usedFor: ["path counting", "minimum path cost", "largest square or rectangle", "grid reachability"],
    signals: ["grid", "matrix", "paths from top-left", "only right and down", "minimum path sum", "largest square"],
    recognition: [
      "movement is restricted so dependencies always point one way",
      "the state is a cell and the answer combines a few adjacent cells",
      "obstacles or costs vary per cell",
    ],
    typicalQuestion: "How many unique paths are there from the top-left to the bottom-right?",
    mentalModel: {
      lines: [
        "dp[r][c] = the answer for the subproblem ending at that cell.",
        "Fill in an order that respects the dependency direction — usually top-left to bottom-right.",
        "If each row only needs the row above, one array is enough.",
      ],
      diagram: `  ┌───┬───┬───┐
  │ 1 │ 1 │ 1 │
  ├───┼───┼───┤
  │ 1 │ 2 │ 3 │   dp[r][c] = dp[r-1][c] + dp[r][c-1]
  ├───┼───┼───┤
  │ 1 │ 3 │ 6 │
  └───┴───┴───┘`,
      key: "Initialise the first row and column separately, or handle boundaries inside the loop.",
    },
    templates: [
      {
        name: "Rolling row",
        filename: "unique_paths.go",
        note: "O(cols) space: dp[c] holds the row above until it is overwritten.",
        code: `func uniquePaths(m, n int) int {
    dp := make([]int, n)
    for i := range dp {
        dp[i] = 1 // first row
    }

    for r := 1; r < m; r++ {
        for c := 1; c < n; c++ {
            dp[c] += dp[c-1] // dp[c] is above, dp[c-1] is left
        }
    }
    return dp[n-1]
}`,
      },
      {
        name: "Minimum path",
        filename: "min_path_sum.go",
        note: "In-place over the input when mutation is allowed.",
        code: `func minPathSum(grid [][]int) int {
    rows, cols := len(grid), len(grid[0])

    for r := 0; r < rows; r++ {
        for c := 0; c < cols; c++ {
            switch {
            case r == 0 && c == 0:
                // start
            case r == 0:
                grid[r][c] += grid[r][c-1]
            case c == 0:
                grid[r][c] += grid[r-1][c]
            default:
                grid[r][c] += min(grid[r-1][c], grid[r][c-1])
            }
        }
    }
    return grid[rows-1][cols-1]
}`,
      },
      {
        name: "Maximal square",
        filename: "maximal_square.go",
        note: "The three-corner minimum: a square can only be as big as its weakest corner allows.",
        code: `func maximalSquare(matrix [][]byte) int {
    rows, cols := len(matrix), len(matrix[0])
    dp := make([][]int, rows+1)
    for i := range dp {
        dp[i] = make([]int, cols+1)
    }
    best := 0

    for r := 1; r <= rows; r++ {
        for c := 1; c <= cols; c++ {
            if matrix[r-1][c-1] == '1' {
                dp[r][c] = 1 + min(dp[r-1][c], min(dp[r][c-1], dp[r-1][c-1]))
                best = max(best, dp[r][c])
            }
        }
    }
    return best * best
}`,
      },
      {
        name: "Bottom-up triangle",
        filename: "triangle.go",
        note: "Working upward removes every boundary check.",
        code: `func minimumTotal(triangle [][]int) int {
    dp := append([]int(nil), triangle[len(triangle)-1]...)

    for r := len(triangle) - 2; r >= 0; r-- {
        for c := 0; c <= r; c++ {
            dp[c] = triangle[r][c] + min(dp[c], dp[c+1])
        }
    }
    return dp[0]
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(rows · cols)" },
      { label: "Space (naive)", value: "O(rows · cols)" },
      { label: "Space (rolling)", value: "O(cols)" },
    ],
    variations: [
      { name: "Obstacles", detail: "Set the cell to 0 instead of summing; the rest of the recurrence is unchanged." },
      { name: "Any direction allowed", detail: "Dependencies become cyclic — that is Dijkstra or BFS, not DP." },
      { name: "Three predecessors", detail: "Falling-path problems take the min of up-left, up and up-right." },
      { name: "Padded table", detail: "An extra row and column of zeroes removes special cases entirely." },
    ],
    mistakes: [
      { title: "Rolling in the wrong direction", detail: "With one array, dp[c-1] must already be the current row and dp[c] still the previous one." },
      { title: "Forgetting obstacle propagation", detail: "A blocked cell must zero out, not inherit." },
      { title: "Using DP when movement is unrestricted", detail: "If you can move in all four directions, dependencies are cyclic." },
      { title: "Confusing side length with area", detail: "Maximal square returns side², not side." },
    ],
    related: ["linear-dp", "string-dp", "largest-rectangle", "graph-bfs"],
    problems: [62, 63, 64, 120, 931, 221, 85],
  },
  {
    slug: "string-dp",
    title: "String DP",
    category: "dynamic-programming",
    description: "Two strings, two indices — match or skip, and the recurrence writes itself.",
    concepts: ["Two indices", "LCS", "Edit distance"],
    usedFor: ["subsequences and alignment", "edit distance", "pattern matching", "counting subsequences"],
    signals: ["two strings", "subsequence", "edit distance", "transform one into another", "matching pattern", "delete characters"],
    recognition: [
      "two sequences must be aligned or compared",
      "characters can be skipped in one or both strings",
      "the operations are insert, delete and replace",
      "a pattern contains wildcards",
    ],
    typicalQuestion: "What is the minimum number of edits to turn word1 into word2?",
    mentalModel: {
      lines: [
        "dp[i][j] covers the first i characters of a and the first j of b.",
        "If a[i-1] == b[j-1], the problem shrinks diagonally.",
        "Otherwise take the best of the moves you are allowed.",
      ],
      diagram: `        ""  b  b  c
    ""   0  1  2  3
    a    1  ↖  ←  ←
    b    2  ↑  ↖  ←

  match    → dp[i-1][j-1]
  mismatch → 1 + min(↑, ←, ↖)`,
      key: "Index i in the DP means 'first i characters', so the string index is i-1.",
    },
    templates: [
      {
        name: "LCS",
        filename: "lcs.go",
        note: "The parent recurrence of nearly every two-string DP.",
        code: `func longestCommonSubsequence(a, b string) int {
    dp := make([][]int, len(a)+1)
    for i := range dp {
        dp[i] = make([]int, len(b)+1)
    }

    for i := 1; i <= len(a); i++ {
        for j := 1; j <= len(b); j++ {
            if a[i-1] == b[j-1] {
                dp[i][j] = dp[i-1][j-1] + 1
            } else {
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
            }
        }
    }
    return dp[len(a)][len(b)]
}`,
      },
      {
        name: "Edit distance",
        filename: "edit_distance.go",
        note: "Three operations, three neighbouring cells.",
        code: `func minDistance(a, b string) int {
    dp := make([][]int, len(a)+1)
    for i := range dp {
        dp[i] = make([]int, len(b)+1)
        dp[i][0] = i // delete everything
    }
    for j := 0; j <= len(b); j++ {
        dp[0][j] = j // insert everything
    }

    for i := 1; i <= len(a); i++ {
        for j := 1; j <= len(b); j++ {
            if a[i-1] == b[j-1] {
                dp[i][j] = dp[i-1][j-1]
            } else {
                dp[i][j] = 1 + min(dp[i-1][j-1], // replace
                    min(dp[i-1][j], // delete
                        dp[i][j-1])) // insert
            }
        }
    }
    return dp[len(a)][len(b)]
}`,
      },
      {
        name: "Rolling rows",
        filename: "lcs_rolling.go",
        note: "Only two rows are ever live — O(min(m,n)) space.",
        code: `func lcsSpaceOptimised(a, b string) int {
    if len(a) < len(b) {
        a, b = b, a // keep the inner dimension small
    }
    prev := make([]int, len(b)+1)
    cur := make([]int, len(b)+1)

    for i := 1; i <= len(a); i++ {
        for j := 1; j <= len(b); j++ {
            if a[i-1] == b[j-1] {
                cur[j] = prev[j-1] + 1
            } else {
                cur[j] = max(prev[j], cur[j-1])
            }
        }
        prev, cur = cur, prev
    }
    return prev[len(b)]
}`,
      },
      {
        name: "Wildcard matching",
        filename: "regex_dp.go",
        note: "'*' either consumes nothing (skip the pair) or one more character (stay).",
        code: `func isMatch(s, p string) bool {
    dp := make([][]bool, len(s)+1)
    for i := range dp {
        dp[i] = make([]bool, len(p)+1)
    }
    dp[0][0] = true

    for j := 1; j <= len(p); j++ {
        if p[j-1] == '*' && j >= 2 {
            dp[0][j] = dp[0][j-2] // x* matches empty
        }
    }

    for i := 1; i <= len(s); i++ {
        for j := 1; j <= len(p); j++ {
            switch {
            case p[j-1] == '*':
                dp[i][j] = dp[i][j-2] // zero occurrences
                if p[j-2] == '.' || p[j-2] == s[i-1] {
                    dp[i][j] = dp[i][j] || dp[i-1][j] // one more
                }
            case p[j-1] == '.' || p[j-1] == s[i-1]:
                dp[i][j] = dp[i-1][j-1]
            }
        }
    }
    return dp[len(s)][len(p)]
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(m · n)" },
      { label: "Space (table)", value: "O(m · n)" },
      { label: "Space (rolling)", value: "O(min(m, n))" },
    ],
    variations: [
      { name: "Counting instead of optimising", detail: "Distinct subsequences adds instead of taking a max." },
      { name: "Palindromic subsequence", detail: "LCS of s with its reverse." },
      { name: "Three strings", detail: "Interleaving string uses (i, j) with k implied by i+j." },
      { name: "Reconstructing the alignment", detail: "Walk backwards from dp[m][n], following which branch produced each value." },
    ],
    mistakes: [
      { title: "Index confusion", detail: "dp[i][j] uses a[i-1] and b[j-1]. Mixing the conventions is the standard bug." },
      { title: "Missing base rows", detail: "Edit distance needs dp[i][0] = i and dp[0][j] = j." },
      { title: "Rolling rows without clearing", detail: "Reused rows keep stale values; overwrite every cell or reset." },
      { title: "Regex '*' handling", detail: "The star binds to the preceding character, so you look back two positions." },
    ],
    related: ["grid-dp", "interval-dp", "palindrome-techniques", "linear-dp"],
    problems: [1143, 72, 516, 97, 115, 10, 44, 91, 139],
  },
  {
    slug: "state-machine-dp",
    title: "State Machine DP",
    category: "dynamic-programming",
    description: "A handful of named states and the legal transitions between them.",
    concepts: ["States", "Transitions", "Stocks"],
    usedFor: ["buy/sell with constraints", "cooldowns and fees", "limited transactions", "mode-based problems"],
    signals: ["buy and sell", "at most k transactions", "cooldown", "holding or not", "two modes", "transaction fee"],
    recognition: [
      "at each step you are in one of a few distinct situations",
      "what you may do next depends on which situation you are in",
      "constraints like cooldown or a transaction limit add states, not dimensions",
    ],
    typicalQuestion: "Maximise profit with at most k stock transactions.",
    mentalModel: {
      lines: [
        "Name the states. Draw the arrows. Write one line per arrow.",
        "hold = the best balance while owning a share.",
        "free = the best balance while owning nothing.",
        "Every constraint is a new state or a blocked arrow.",
      ],
      diagram: `      buy
  free ──▶ hold
    ▲        │
    │  sell  │
    └────────┘

  cooldown adds a third state:
  hold ─sell─▶ sold ─rest─▶ free`,
      key: "Adding a constraint means adding a state — not another loop.",
    },
    templates: [
      {
        name: "Two states",
        filename: "stock_ii.go",
        note: "Unlimited transactions: two variables, one pass.",
        code: `func maxProfit(prices []int) int {
    hold, free := math.MinInt, 0

    for _, p := range prices {
        hold = max(hold, free-p) // buy today
        free = max(free, hold+p) // sell today
    }
    return free
}`,
      },
      {
        name: "Cooldown",
        filename: "stock_cooldown.go",
        note: "Three states. Update from the PREVIOUS day's values, not the current ones.",
        code: `func maxProfitCooldown(prices []int) int {
    hold, sold, rest := math.MinInt, math.MinInt, 0

    for _, p := range prices {
        prevHold, prevSold, prevRest := hold, sold, rest
        hold = max(prevHold, prevRest-p) // can only buy from rest
        sold = prevHold + p              // sell today
        rest = max(prevRest, prevSold)   // cooling down
    }
    return max(sold, rest)
}`,
      },
      {
        name: "k transactions",
        filename: "stock_iv.go",
        note: "2k states. Updating in order lets each transaction see the previous one's result.",
        code: `func maxProfitK(k int, prices []int) int {
    if k >= len(prices)/2 { // effectively unlimited
        return maxProfit(prices)
    }

    buy := make([]int, k+1)
    sell := make([]int, k+1)
    for i := range buy {
        buy[i] = math.MinInt
    }

    for _, p := range prices {
        for t := 1; t <= k; t++ {
            buy[t] = max(buy[t], sell[t-1]-p)
            sell[t] = max(sell[t], buy[t]+p)
        }
    }
    return sell[k]
}`,
      },
      {
        name: "Transaction fee",
        filename: "stock_fee.go",
        note: "Charge the fee once per round trip — on the sell side here.",
        code: `func maxProfitFee(prices []int, fee int) int {
    hold, free := -prices[0], 0

    for _, p := range prices[1:] {
        hold = max(hold, free-p)
        free = max(free, hold+p-fee)
    }
    return free
}`,
      },
    ],
    complexity: [
      { label: "Fixed states", value: "O(n)" },
      { label: "k transactions", value: "O(n · k)" },
      { label: "Space", value: "O(1)", note: "O(k) for the k-transaction form" },
    ],
    why: "The state captures everything about the past that affects the future. Once you have that, the transition is local and the optimal substructure is automatic — which is why naming the states correctly solves the problem.",
    variations: [
      { name: "Cooldown of length m", detail: "Generalises to m rest states, or a lookback of m days." },
      { name: "Paint house / colouring", detail: "One state per colour, with transitions forbidding repeats." },
      { name: "Two-dimensional state", detail: "(position, mode) — mode can be direction, parity or a held item." },
      { name: "Automaton for strings", detail: "Regex and digit DP are state machines over characters." },
    ],
    mistakes: [
      { title: "Updating states in place", detail: "hold and free must be computed from the previous day. Snapshot, or order the updates deliberately." },
      { title: "Initialising hold to 0", detail: "Owning a share on day 0 costs money — it must start at -prices[0] or MinInt." },
      { title: "Forgetting the unlimited shortcut", detail: "When k exceeds n/2 the transaction limit is not binding; otherwise the loop is wasteful." },
      { title: "Charging the fee on both sides", detail: "Pick buy or sell, not both." },
    ],
    related: ["linear-dp", "bitmask-dp", "digit-dp", "greedy-sorting"],
    problems: [121, 122, 123, 188, 309, 714],
  },
  {
    slug: "interval-dp",
    title: "Interval DP",
    category: "dynamic-programming",
    description: "The state is a range, and the transition is where you split it — or which element you handle last.",
    concepts: ["Range state", "Split point", "By length"],
    usedFor: ["merging and bursting problems", "optimal parenthesisation", "palindromic ranges", "polygon triangulation"],
    signals: ["merge stones", "burst balloons", "remove boxes", "between i and j", "triangulate", "optimal grouping"],
    recognition: [
      "the state naturally covers a contiguous range [i, j]",
      "you choose a split point, or the last element to process inside the range",
      "n is small — typically at most a few hundred, because it is O(n³)",
    ],
    typicalQuestion: "Maximise the coins from bursting all balloons, given neighbours change as you go.",
    mentalModel: {
      lines: [
        "dp[i][j] = the best answer for the range i..j.",
        "Iterate by increasing length so shorter ranges are ready.",
        "The transition picks a split k inside the range.",
        "When actions change the neighbourhood, think about the LAST action, not the first.",
      ],
      diagram: `  length 1:  [i..i]
  length 2:  [i..i+1]
  length L:  dp[i][j] = max over k of
                 dp[i][k-1] + cost(k) + dp[k+1][j]

  fill by increasing L`,
      key: "Choosing the last action keeps the subranges independent; choosing the first does not.",
    },
    templates: [
      {
        name: "Skeleton",
        filename: "interval_dp.go",
        note: "The loop order is the pattern: length, then start, then split.",
        code: `func intervalDP(n int, cost func(i, k, j int) int) int {
    dp := make([][]int, n)
    for i := range dp {
        dp[i] = make([]int, n)
    }

    for length := 2; length <= n; length++ {
        for i := 0; i+length-1 < n; i++ {
            j := i + length - 1
            dp[i][j] = math.MinInt

            for k := i; k <= j; k++ { // last action inside [i, j]
                left, right := 0, 0
                if k > i {
                    left = dp[i][k-1]
                }
                if k < j {
                    right = dp[k+1][j]
                }
                dp[i][j] = max(dp[i][j], left+cost(i, k, j)+right)
            }
        }
    }
    return dp[0][n-1]
}`,
      },
      {
        name: "Burst balloons",
        filename: "burst_balloons.go",
        note: "Pad with 1s. k is the LAST balloon burst, so its neighbours are exactly i-1 and j+1.",
        code: `func maxCoins(nums []int) int {
    n := len(nums)
    v := make([]int, n+2)
    v[0], v[n+1] = 1, 1
    copy(v[1:], nums)

    dp := make([][]int, n+2)
    for i := range dp {
        dp[i] = make([]int, n+2)
    }

    for length := 1; length <= n; length++ {
        for i := 1; i+length-1 <= n; i++ {
            j := i + length - 1
            for k := i; k <= j; k++ {
                gain := v[i-1] * v[k] * v[j+1] // k burst last
                dp[i][j] = max(dp[i][j], dp[i][k-1]+gain+dp[k+1][j])
            }
        }
    }
    return dp[1][n]
}`,
      },
      {
        name: "Palindromic range",
        filename: "longest_pal_subseq.go",
        note: "Endpoints match: the inner range plus two. Otherwise drop one end.",
        code: `func longestPalindromeSubseq(s string) int {
    n := len(s)
    dp := make([][]int, n)
    for i := range dp {
        dp[i] = make([]int, n)
        dp[i][i] = 1
    }

    for length := 2; length <= n; length++ {
        for i := 0; i+length-1 < n; i++ {
            j := i + length - 1
            if s[i] == s[j] {
                dp[i][j] = dp[i+1][j-1] + 2
            } else {
                dp[i][j] = max(dp[i+1][j], dp[i][j-1])
            }
        }
    }
    return dp[0][n-1]
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n³)", note: "n² states × n split points" },
      { label: "Space", value: "O(n²)" },
      { label: "With Knuth optimisation", value: "O(n²)", note: "when the split point is monotone" },
    ],
    why: "Bursting a balloon first makes its neighbours adjacent, so the two sides are no longer independent subproblems. Choosing which balloon is burst LAST fixes its neighbours as the range's boundaries — and the two sides never interact again.",
    variations: [
      { name: "Merge stones", detail: "Splits must respect a fixed group size, adding a third state dimension." },
      { name: "Minimax intervals", detail: "Guess-number-higher-or-lower II takes min over guesses of max over outcomes." },
      { name: "Extra state", detail: "Remove Boxes needs (i, j, k) with k = the count of equal boxes carried in." },
      { name: "Memoised recursion", detail: "Often clearer than bottom-up; the order then takes care of itself." },
    ],
    mistakes: [
      { title: "Iterating i and j directly", detail: "dp[i][j] needs shorter ranges, so length must be the outer loop." },
      { title: "Thinking about the first action", detail: "In burst-balloons that breaks independence; think last." },
      { title: "Forgetting the padding", detail: "Sentinels of 1 at both ends remove all the boundary cases." },
      { title: "Applying it to large n", detail: "O(n³) with n = 10⁴ is hopeless — look for a different structure." },
    ],
    related: ["string-dp", "palindrome-techniques", "divide-and-conquer", "tree-dp"],
    problems: [312, 1039, 375, 546, 664, 516, 241],
  },
  {
    slug: "digit-dp",
    title: "Digit DP",
    category: "dynamic-programming",
    description: "Count numbers up to N with a property, digit by digit, tracking whether you are still on the bound.",
    concepts: ["Tight", "Started", "Position"],
    usedFor: ["counting numbers with digit properties", "sums over a numeric range", "constraints on digits"],
    signals: ["count numbers between", "numbers with no repeated digits", "digits satisfying", "up to 1e18", "no consecutive"],
    recognition: [
      "the range is astronomically large — 1e18 — so enumeration is impossible",
      "the property depends on the digits, not the value",
      "the answer is a count over a range; compute f(hi) - f(lo-1)",
    ],
    typicalQuestion: "How many integers up to N have no two consecutive ones in binary?",
    mentalModel: {
      lines: [
        "Build the number one digit at a time from the most significant end.",
        "tight = every digit so far equals N's prefix, so this digit is capped.",
        "started = we have placed a non-zero digit, which matters for leading zeroes.",
        "Memoise on (pos, state, tight, started).",
      ],
      diagram: `  N = 3 4 7

  pos 0: digits 0..3   (tight)
     if we pick 3 → still tight
     if we pick <3 → free below

  once free: digits 0..9 at every position`,
      key: "Only the tight branch is constrained. Everything below it is a clean, memoisable subproblem.",
    },
    templates: [
      {
        name: "Digit DP skeleton",
        filename: "digit_dp.go",
        note: "Memoise only the non-tight, started states — the tight path is visited once per position.",
        code: `func countUpTo(n int, ok func(prev, d int) bool) int {
    digits := []int{}
    for x := n; x > 0; x /= 10 {
        digits = append(digits, x%10)
    }
    slices.Reverse(digits)

    // memo[pos][prev] for the free, started case
    memo := map[[2]int]int{}

    var rec func(pos, prev int, tight, started bool) int
    rec = func(pos, prev int, tight, started bool) int {
        if pos == len(digits) {
            if started {
                return 1
            }
            return 0
        }
        if !tight && started {
            if v, hit := memo[[2]int{pos, prev}]; hit {
                return v
            }
        }

        limit := 9
        if tight {
            limit = digits[pos]
        }

        total := 0
        for d := 0; d <= limit; d++ {
            if started && !ok(prev, d) {
                continue
            }
            nStarted := started || d > 0
            nPrev := prev
            if nStarted {
                nPrev = d
            }
            total += rec(pos+1, nPrev, tight && d == limit, nStarted)
        }

        if !tight && started {
            memo[[2]int{pos, prev}] = total
        }
        return total
    }

    return rec(0, -1, true, false)
}`,
      },
      {
        name: "Binary digit DP",
        filename: "no_consecutive_ones.go",
        note: "Same shape in base 2: the state is the previous bit.",
        code: `func findIntegers(n int) int {
    bits := []int{}
    for i := 30; i >= 0; i-- {
        bits = append(bits, n>>i&1)
    }

    memo := map[[2]int]int{}
    var rec func(pos, prev int, tight bool) int
    rec = func(pos, prev int, tight bool) int {
        if pos == len(bits) {
            return 1
        }
        if !tight {
            if v, ok := memo[[2]int{pos, prev}]; ok {
                return v
            }
        }

        limit := 1
        if tight {
            limit = bits[pos]
        }

        total := 0
        for b := 0; b <= limit; b++ {
            if prev == 1 && b == 1 {
                continue // no consecutive ones
            }
            total += rec(pos+1, b, tight && b == limit)
        }

        if !tight {
            memo[[2]int{pos, prev}] = total
        }
        return total
    }

    return rec(0, 0, true)
}`,
      },
      {
        name: "Range counting",
        filename: "range_count.go",
        note: "Counting in [lo, hi] is always two calls and a subtraction.",
        code: `func countInRange(lo, hi int) int {
    return countUpTo(hi) - countUpTo(lo-1)
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(digits · states · base)" },
      { label: "Typical", value: "O(18 · S · 10)", note: "trivially fast even for 1e18" },
      { label: "Space", value: "O(digits · states)" },
    ],
    variations: [
      { name: "Sum instead of count", detail: "Return both a count and a sum; the sum needs the count of completions to place each digit's weight." },
      { name: "Mask state", detail: "'All digits distinct' carries a 10-bit used mask." },
      { name: "Modular state", detail: "'Divisible by k' carries the running remainder." },
      { name: "Combinatorial shortcut", detail: "Many digit problems have a direct counting formula — often simpler than the DP." },
    ],
    mistakes: [
      { title: "Memoising the tight state", detail: "Tight results depend on N's digits, so caching them across branches is wrong." },
      { title: "Mishandling leading zeroes", detail: "Without a started flag, 007 is treated as having repeated digits." },
      { title: "Forgetting the lo-1 subtraction", detail: "Range counts are f(hi) - f(lo-1), not f(hi) - f(lo)." },
    ],
    related: ["bitmask-dp", "state-machine-dp", "math-number-theory", "modular-arithmetic"],
    problems: [233, 902, 600, 1012],
  },
  {
    slug: "bitmask-dp",
    title: "Bitmask DP",
    category: "dynamic-programming",
    description: "When n ≤ 20, a subset is an integer — and DP over subsets becomes possible.",
    concepts: ["Subset as int", "2^n states", "Popcount"],
    usedFor: ["travelling salesman", "assignment problems", "set cover", "permutations with constraints"],
    signals: ["n <= 20", "visit all", "assign each to", "subset", "every permutation", "minimum team", "cover all skills"],
    recognition: [
      "n is suspiciously small: 10 to 22",
      "the state is 'which subset have I already handled'",
      "you are assigning items to slots, or ordering all of them",
      "brute-force permutations (n!) are too slow but 2^n · n is fine",
    ],
    typicalQuestion: "What is the shortest path that visits every node?",
    mentalModel: {
      lines: [
        "Bit i of the mask means item i is done.",
        "dp[mask] (sometimes dp[mask][last]) is the best way to reach that set.",
        "Iterate masks in increasing order — submasks are always smaller integers.",
      ],
      diagram: `  n = 4

  mask 1011 = items 0, 1, 3 used
  popcount  = 3 → we are at position 3

  transition: for each unused bit i
      dp[mask | 1<<i] ← dp[mask] + cost`,
      key: "popcount(mask) is often a free dimension — it tells you how far along you are.",
    },
    templates: [
      {
        name: "Bit operations",
        filename: "bit_ops.go",
        note: "The five you need. math/bits has the rest.",
        code: `mask |= 1 << i        // add i
mask &^= 1 << i       // remove i (Go's AND NOT)
mask ^= 1 << i        // toggle i
mask>>i&1 == 1        // is i present?
bits.OnesCount(uint(mask)) // how many items

full := 1<<n - 1      // all items

// iterate every submask of mask, descending
for sub := mask; sub > 0; sub = (sub - 1) & mask {
    // sub is a non-empty submask
}`,
      },
      {
        name: "Assignment DP",
        filename: "assignment.go",
        note: "popcount(mask) is the person being assigned, so no second dimension is needed.",
        code: `func minCostAssign(cost [][]int) int {
    n := len(cost)
    full := 1<<n - 1
    dp := make([]int, full+1)
    for i := range dp {
        dp[i] = math.MaxInt
    }
    dp[0] = 0

    for mask := 0; mask < full; mask++ {
        if dp[mask] == math.MaxInt {
            continue
        }
        person := bits.OnesCount(uint(mask)) // next person to assign

        for job := 0; job < n; job++ {
            if mask>>job&1 == 1 {
                continue
            }
            next := mask | 1<<job
            dp[next] = min(dp[next], dp[mask]+cost[person][job])
        }
    }
    return dp[full]
}`,
      },
      {
        name: "TSP / visit all",
        filename: "tsp.go",
        note: "Two dimensions: which nodes are visited, and where you currently stand.",
        code: `func shortestPathVisitingAll(graph [][]int) int {
    n := len(graph)
    full := 1<<n - 1

    type state struct{ mask, node int }
    seen := map[state]bool{}
    queue := []state{}

    for i := 0; i < n; i++ {
        s := state{1 << i, i}
        queue = append(queue, s)
        seen[s] = true
    }

    steps := 0
    for len(queue) > 0 {
        size := len(queue)
        for i := 0; i < size; i++ {
            cur := queue[0]
            queue = queue[1:]
            if cur.mask == full {
                return steps
            }
            for _, nxt := range graph[cur.node] {
                s := state{cur.mask | 1<<nxt, nxt}
                if !seen[s] {
                    seen[s] = true
                    queue = append(queue, s)
                }
            }
        }
        steps++
    }
    return 0
}`,
      },
      {
        name: "Submask enumeration",
        filename: "submask.go",
        note: "Summed over all masks this is O(3^n), not O(4^n) — the standard set-cover bound.",
        code: `func minPartitions(n int, valid func(mask int) bool) int {
    full := 1<<n - 1
    dp := make([]int, full+1)
    for i := 1; i <= full; i++ {
        dp[i] = math.MaxInt
    }

    for mask := 1; mask <= full; mask++ {
        for sub := mask; sub > 0; sub = (sub - 1) & mask {
            if valid(sub) && dp[mask^sub] != math.MaxInt {
                dp[mask] = min(dp[mask], dp[mask^sub]+1)
            }
        }
    }
    return dp[full]
}`,
      },
    ],
    complexity: [
      { label: "Subset DP", value: "O(2^n · n)" },
      { label: "TSP", value: "O(2^n · n²)" },
      { label: "Submask enumeration", value: "O(3^n)" },
      { label: "Space", value: "O(2^n)", note: "or O(2^n · n) with a position dimension" },
    ],
    variations: [
      { name: "Profile DP", detail: "Tiling problems carry a mask describing the boundary between processed and unprocessed cells." },
      { name: "Meet in the middle", detail: "When n is around 40, split into halves of 20 and combine." },
      { name: "SOS DP", detail: "Sum over subsets in O(2^n · n) — useful for counting over supersets." },
      { name: "Bitset acceleration", detail: "Use uint64 words to make an ordinary DP 64× faster." },
    ],
    mistakes: [
      { title: "Iterating masks in the wrong order", detail: "dp[mask] must be final before it is used to build a larger mask — ascending order guarantees that." },
      { title: "Overflowing the shift", detail: "1 << 32 on a 32-bit type is undefined-ish; use uint64 or keep n small." },
      { title: "Reaching for it when n is 30", detail: "2^30 states is a billion — look for a different structure." },
      { title: "Forgetting 1<<i is not i", detail: "Confusing the bit index with the bit value is the classic slip." },
    ],
    related: ["subset-sum", "meet-in-the-middle", "permutations", "digit-dp"],
    problems: [847, 698, 1125, 526, 1434, 52, 600],
  },
  {
    slug: "knapsack-01",
    title: "0/1 Knapsack",
    category: "dynamic-programming",
    description: "Each item is taken at most once — so iterate the capacity downward.",
    concepts: ["Take or skip", "Capacity", "Reverse loop"],
    usedFor: ["subset selection under a budget", "partitioning", "maximising value under a weight limit"],
    signals: ["each item once", "maximum value", "capacity", "weight limit", "choose a subset", "budget"],
    recognition: [
      "each item is available exactly once",
      "there is a capacity or budget constraint",
      "you want to maximise or check feasibility over subsets",
      "the capacity is small enough to index an array",
    ],
    typicalQuestion: "Maximise value within a weight capacity, using each item at most once.",
    mentalModel: {
      lines: [
        "dp[c] = the best value achievable with capacity exactly c (or at most c).",
        "For each item, consider every capacity — but go DOWNWARD.",
        "Downward means dp[c-w] is still from the previous item, so the item is used once.",
      ],
      diagram: `  item weight 3, value 4

  c:  5  4  3  2  1  0
      ◀───── iterate down

  dp[c] = max(dp[c], dp[c-3] + 4)
                     └ previous item's row`,
      key: "0/1 → descending capacity. Unbounded → ascending. That single direction is the whole distinction.",
    },
    templates: [
      {
        name: "1D knapsack",
        filename: "knapsack_01.go",
        note: "The descending inner loop is what enforces 'at most once'.",
        code: `func knapsack(weights, values []int, capacity int) int {
    dp := make([]int, capacity+1)

    for i, w := range weights {
        for c := capacity; c >= w; c-- { // DOWNWARD
            dp[c] = max(dp[c], dp[c-w]+values[i])
        }
    }
    return dp[capacity]
}`,
      },
      {
        name: "2D (explicit)",
        filename: "knapsack_2d.go",
        note: "Clearer for explaining, and required if you must reconstruct the chosen items.",
        code: `func knapsack2D(weights, values []int, capacity int) int {
    n := len(weights)
    dp := make([][]int, n+1)
    for i := range dp {
        dp[i] = make([]int, capacity+1)
    }

    for i := 1; i <= n; i++ {
        for c := 0; c <= capacity; c++ {
            dp[i][c] = dp[i-1][c] // skip
            if w := weights[i-1]; c >= w {
                dp[i][c] = max(dp[i][c], dp[i-1][c-w]+values[i-1]) // take
            }
        }
    }
    return dp[n][capacity]
}`,
      },
      {
        name: "Two capacities",
        filename: "ones_and_zeroes.go",
        note: "Both dimensions iterate downward for the same reason.",
        code: `func findMaxForm(strs []string, m, n int) int {
    dp := make([][]int, m+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
    }

    for _, s := range strs {
        zeros := strings.Count(s, "0")
        ones := len(s) - zeros

        for i := m; i >= zeros; i-- {
            for j := n; j >= ones; j-- {
                dp[i][j] = max(dp[i][j], dp[i-zeros][j-ones]+1)
            }
        }
    }
    return dp[m][n]
}`,
      },
      {
        name: "Reconstruct the items",
        filename: "knapsack_trace.go",
        note: "Needs the 2D table — walk backwards comparing rows.",
        code: `func chosenItems(dp [][]int, weights []int, capacity int) []int {
    var picked []int
    c := capacity

    for i := len(dp) - 1; i > 0; i-- {
        if dp[i][c] != dp[i-1][c] { // this item was taken
            picked = append(picked, i-1)
            c -= weights[i-1]
        }
    }
    slices.Reverse(picked)
    return picked
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n · capacity)" },
      { label: "Space (1D)", value: "O(capacity)" },
      { label: "Space (2D)", value: "O(n · capacity)", note: "needed to reconstruct" },
      { label: "Note", value: "pseudo-polynomial", note: "linear in the capacity's VALUE, not its bit length" },
    ],
    why: "Iterating capacity downward means dp[c-w] has not yet been touched for this item, so it still holds the previous item's answer. Iterating upward would let the same item be counted repeatedly — which is exactly the unbounded variant.",
    variations: [
      { name: "Subset sum", detail: "Values equal weights and you only need feasibility — booleans." },
      { name: "Counting solutions", detail: "Replace max with + to count the ways to reach each capacity." },
      { name: "Bounded knapsack", detail: "Each item has a limited count — binary-split it into powers of two." },
      { name: "Bitset acceleration", detail: "For pure feasibility, a bitset shift does 64 capacities per operation." },
    ],
    mistakes: [
      { title: "Iterating capacity upward", detail: "Silently turns 0/1 into unbounded. The single most common DP bug." },
      { title: "Looping items inside capacity", detail: "In the 1D form the item loop must be outermost." },
      { title: "Assuming polynomial time", detail: "O(n·W) is pseudo-polynomial — huge W makes it infeasible." },
      { title: "Trying to reconstruct from the 1D array", detail: "The history is gone; keep the 2D table." },
    ],
    related: ["unbounded-knapsack", "subset-sum", "bounded-knapsack", "linear-dp"],
    problems: [416, 494, 474, 1049, 698],
  },
  {
    slug: "unbounded-knapsack",
    title: "Unbounded Knapsack",
    category: "dynamic-programming",
    description: "Items can be reused, so iterate the capacity upward — and the loop order decides what you count.",
    concepts: ["Reuse", "Forward loop", "Order matters"],
    usedFor: ["coin change", "rod cutting", "counting combinations versus permutations"],
    signals: ["unlimited supply", "as many as you like", "coin change", "minimum coins", "how many ways", "repeat allowed"],
    recognition: [
      "each item may be used any number of times",
      "you are minimising a count, or counting ways to make a total",
      "the classic: coins of given denominations making a target amount",
    ],
    typicalQuestion: "What is the fewest coins needed to make this amount?",
    mentalModel: {
      lines: [
        "Upward capacity means dp[c-w] may already include this item — that is reuse.",
        "Coins outer, amount inner → counts COMBINATIONS (order ignored).",
        "Amount outer, coins inner → counts PERMUTATIONS (order matters).",
      ],
      diagram: `  coins {1,2}, amount 3

  combinations: 1+1+1, 1+2        → 2
  permutations: 1+1+1, 1+2, 2+1   → 3

  the loop order alone decides which`,
      key: "The loop nesting is not a style choice — it changes the answer.",
    },
    templates: [
      {
        name: "Minimum count",
        filename: "coin_change.go",
        note: "Upward inner loop allows reuse. Sentinel for unreachable amounts.",
        code: `func coinChange(coins []int, amount int) int {
    const inf = math.MaxInt32
    dp := make([]int, amount+1)
    for i := 1; i <= amount; i++ {
        dp[i] = inf
    }

    for _, c := range coins {
        for a := c; a <= amount; a++ { // UPWARD
            if dp[a-c]+1 < dp[a] {
                dp[a] = dp[a-c] + 1
            }
        }
    }

    if dp[amount] == inf {
        return -1
    }
    return dp[amount]
}`,
      },
      {
        name: "Count combinations",
        filename: "coin_change_ii.go",
        note: "Coins OUTSIDE — each combination is generated in one fixed coin order.",
        code: `func change(amount int, coins []int) int {
    dp := make([]int, amount+1)
    dp[0] = 1

    for _, c := range coins { // coins outer → combinations
        for a := c; a <= amount; a++ {
            dp[a] += dp[a-c]
        }
    }
    return dp[amount]
}`,
      },
      {
        name: "Count permutations",
        filename: "combination_sum_iv.go",
        note: "Amount OUTSIDE — every ordering is counted separately.",
        code: `func combinationSum4(nums []int, target int) int {
    dp := make([]int, target+1)
    dp[0] = 1

    for a := 1; a <= target; a++ { // amount outer → permutations
        for _, v := range nums {
            if v <= a {
                dp[a] += dp[a-v]
            }
        }
    }
    return dp[target]
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n · amount)" },
      { label: "Space", value: "O(amount)" },
    ],
    why: "Going upward, dp[c-w] may already have used item w, so the item can be taken again. Going downward, dp[c-w] is untouched for this item — which is the 0/1 case. One loop direction separates the two problems entirely.",
    variations: [
      { name: "Rod cutting", detail: "Identical structure, maximising value instead of minimising count." },
      { name: "Perfect squares", detail: "Coin change where the coins are 1, 4, 9, 16 …" },
      { name: "Minimum with reconstruction", detail: "Store which coin improved each amount to recover the actual set." },
    ],
    mistakes: [
      { title: "Wrong loop order for counting", detail: "Combinations and permutations differ only in nesting — and the expected answer is usually combinations." },
      { title: "Using MaxInt as the sentinel", detail: "dp[a-c] + 1 overflows. Use MaxInt32, or guard the addition." },
      { title: "Forgetting dp[0] = 1 when counting", detail: "There is exactly one way to make zero: take nothing." },
      { title: "Greedy coin change", detail: "Works for real currencies, fails for coin sets like {1, 3, 4} and amount 6." },
    ],
    related: ["knapsack-01", "bounded-knapsack", "linear-dp", "subset-sum"],
    problems: [322, 518, 377, 279],
  },
  {
    slug: "bounded-knapsack",
    title: "Bounded Knapsack",
    category: "dynamic-programming",
    description: "Each item has a limited count — binary splitting turns it back into 0/1.",
    concepts: ["Limited copies", "Binary split", "Monotonic deque"],
    usedFor: ["limited inventory", "multiple identical items", "bounded resource allocation"],
    signals: ["at most k copies", "limited quantity", "you have n_i of item i", "bounded supply"],
    recognition: [
      "each item has a count between 2 and many, not 1 and not unlimited",
      "expanding every copy into a separate item would be too slow",
      "counts are large enough that the naive triple loop times out",
    ],
    typicalQuestion: "Maximise value with at most k copies of each item.",
    mentalModel: {
      lines: [
        "Naively: try taking 0, 1, … k copies — an extra O(k) factor.",
        "Binary split: represent k as 1 + 2 + 4 + … + remainder.",
        "Those log k bundles can compose any count from 0 to k, so run 0/1 knapsack on them.",
      ],
      diagram: `  k = 13

  bundles: 1, 2, 4, 6
  (1+2+4 = 7, remainder 6)

  any count 0..13 is a subset sum of those
  → log k items instead of 13`,
      key: "Binary splitting turns bounded into 0/1 at a log k cost.",
    },
    templates: [
      {
        name: "Binary splitting",
        filename: "bounded_knapsack.go",
        note: "Each bundle is used at most once, so the standard downward loop applies.",
        code: `func boundedKnapsack(weights, values, counts []int, capacity int) int {
    dp := make([]int, capacity+1)

    for i := range weights {
        remaining := counts[i]
        for k := 1; remaining > 0; k *= 2 {
            take := min(k, remaining)
            remaining -= take

            w, v := weights[i]*take, values[i]*take
            for c := capacity; c >= w; c-- { // 0/1 over the bundle
                dp[c] = max(dp[c], dp[c-w]+v)
            }
        }
    }
    return dp[capacity]
}`,
      },
      {
        name: "Naive (small counts)",
        filename: "bounded_naive.go",
        note: "Fine when the counts are tiny; the extra loop is the copy count.",
        code: `func boundedNaive(weights, values, counts []int, capacity int) int {
    dp := make([]int, capacity+1)

    for i := range weights {
        for c := capacity; c >= 0; c-- {
            for k := 1; k <= counts[i] && k*weights[i] <= c; k++ {
                dp[c] = max(dp[c], dp[c-k*weights[i]]+k*values[i])
            }
        }
    }
    return dp[capacity]
}`,
      },
      {
        name: "Feasibility shortcut",
        filename: "bounded_feasible.go",
        note: "For 'can I reach exactly X', a greedy counter beats any knapsack.",
        code: `// can we hit target using at most counts[i] copies of value[i]?
func canReach(values, counts []int, target int) bool {
    used := make([]int, target+1)
    for i := range used {
        used[i] = -1
    }
    used[0] = 0

    for i := range values {
        for a := 0; a <= target; a++ {
            switch {
            case used[a] >= 0:
                used[a] = counts[i] // fresh budget at this amount
            case a < values[i] || used[a-values[i]] <= 0:
                used[a] = -1
            default:
                used[a] = used[a-values[i]] - 1
            }
        }
    }
    return used[target] >= 0
}`,
      },
    ],
    complexity: [
      { label: "Binary splitting", value: "O(capacity · Σ log kᵢ)" },
      { label: "Naive", value: "O(capacity · Σ kᵢ)" },
      { label: "Monotonic deque", value: "O(n · capacity)", note: "optimal, considerably more code" },
      { label: "Space", value: "O(capacity)" },
    ],
    variations: [
      { name: "Monotonic deque optimisation", detail: "Group capacities by remainder modulo the weight and slide a max-deque — removes the log factor." },
      { name: "Treat as unbounded", detail: "When k ≥ capacity / weight the bound never binds, so use the unbounded version." },
      { name: "Feasibility only", detail: "The greedy remaining-count trick above is O(n · target) with no splitting." },
    ],
    mistakes: [
      { title: "Splitting wrong", detail: "The bundles must be 1, 2, 4, …, and a final remainder — not k/2 and k/2." },
      { title: "Using an upward loop for the bundles", detail: "Each bundle is a 0/1 item; upward would allow reuse." },
      { title: "Expanding every copy", detail: "With k = 1e5 that is 1e5 items — the whole reason binary splitting exists." },
    ],
    related: ["knapsack-01", "unbounded-knapsack", "deque", "subset-sum"],
    problems: [474, 416, 322],
  },
  {
    slug: "subset-sum",
    title: "Subset Sum",
    category: "dynamic-programming",
    description: "Which totals are reachable from a set of numbers — knapsack reduced to booleans.",
    concepts: ["Reachability", "Partition", "Bitset"],
    usedFor: ["equal-sum partitions", "target sum with signs", "minimum difference splits"],
    signals: ["can be partitioned", "sum to target", "equal subsets", "+ and - signs", "minimum difference"],
    recognition: [
      "the question is feasibility — can some subset hit a total",
      "splitting into two groups with equal or near-equal sums",
      "assigning + and - to each number to reach a target",
    ],
    typicalQuestion: "Can this array be split into two subsets with equal sums?",
    mentalModel: {
      lines: [
        "dp[s] = is the sum s reachable using the items seen so far?",
        "Each item either contributes or not, so dp[s] |= dp[s - v].",
        "Iterate sums downward — a 0/1 knapsack with booleans.",
      ],
      diagram: `  nums 1, 5, 11, 5   total 22 → target 11

  reachable after 1:     {0,1}
  after 5:               {0,1,5,6}
  after 11:              {0,1,5,6,11,...}
                                  ▲ hit`,
      key: "Sign assignment reduces to subset sum: sum(P) = (total + target) / 2.",
    },
    templates: [
      {
        name: "Partition",
        filename: "partition_equal.go",
        note: "Odd totals are immediately impossible — check before allocating.",
        code: `func canPartition(nums []int) bool {
    total := 0
    for _, v := range nums {
        total += v
    }
    if total%2 == 1 {
        return false
    }
    target := total / 2

    dp := make([]bool, target+1)
    dp[0] = true

    for _, v := range nums {
        for s := target; s >= v; s-- { // downward: each item once
            dp[s] = dp[s] || dp[s-v]
        }
    }
    return dp[target]
}`,
      },
      {
        name: "Target sum (signs)",
        filename: "target_sum.go",
        note: "P - N = target and P + N = total, so P = (total + target) / 2.",
        code: `func findTargetSumWays(nums []int, target int) int {
    total := 0
    for _, v := range nums {
        total += v
    }
    if abs(target) > total || (total+target)%2 == 1 {
        return 0
    }
    want := (total + target) / 2

    dp := make([]int, want+1)
    dp[0] = 1

    for _, v := range nums {
        for s := want; s >= v; s-- {
            dp[s] += dp[s-v] // counting, not just feasibility
        }
    }
    return dp[want]
}`,
      },
      {
        name: "Minimum difference",
        filename: "min_difference.go",
        note: "Find the reachable sum closest to half the total.",
        code: `func minimumDifference(nums []int) int {
    total := 0
    for _, v := range nums {
        total += v
    }
    half := total / 2

    dp := make([]bool, half+1)
    dp[0] = true
    for _, v := range nums {
        for s := half; s >= v; s-- {
            dp[s] = dp[s] || dp[s-v]
        }
    }

    for s := half; s >= 0; s-- {
        if dp[s] {
            return total - 2*s
        }
    }
    return total
}`,
      },
      {
        name: "Bitset trick",
        filename: "subset_bitset.go",
        note: "A shifted big-integer OR does 64 sums per word — very fast for pure feasibility.",
        code: `func canPartitionFast(nums []int, target int) bool {
    reach := big.NewInt(1) // bit s set means sum s is reachable

    for _, v := range nums {
        shifted := new(big.Int).Lsh(reach, uint(v))
        reach.Or(reach, shifted)
    }
    return reach.Bit(target) == 1
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n · target)" },
      { label: "Space", value: "O(target)" },
      { label: "Bitset", value: "O(n · target / 64)" },
    ],
    variations: [
      { name: "Count instead of feasibility", detail: "Use an int array and += instead of a bool array with ||." },
      { name: "K equal subsets", detail: "No longer a simple sum — needs bitmask DP or pruned backtracking." },
      { name: "Meet in the middle", detail: "When n ≈ 40 but the sums are huge, split into halves." },
    ],
    mistakes: [
      { title: "Iterating sums upward", detail: "Allows reusing one item, which answers a different question." },
      { title: "Forgetting the parity check", detail: "An odd total can never split evenly; the same applies to (total+target)." },
      { title: "Negative numbers", detail: "The array-index formulation assumes non-negative values; shift the range or use a map." },
    ],
    related: ["knapsack-01", "bitmask-dp", "meet-in-the-middle", "unbounded-knapsack"],
    problems: [416, 494, 1049, 698, 805],
  },
];
