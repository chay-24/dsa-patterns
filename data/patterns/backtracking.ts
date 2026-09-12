import type { Pattern } from "../types";

export const backtracking: Pattern[] = [
  {
    slug: "subsets",
    title: "Subsets",
    category: "backtracking",
    description: "Every element is a binary choice — take it or skip it, 2^n times.",
    concepts: ["Take/skip", "Bitmask", "Dedupe"],
    usedFor: ["power sets", "all combinations of flags", "subset enumeration with constraints"],
    signals: ["all subsets", "power set", "any number of elements", "include or exclude", "all possible groups"],
    recognition: [
      "each element is independently in or out",
      "the output size is 2^n, so n is small",
      "order within a result does not matter — otherwise it is permutations",
    ],
    typicalQuestion: "Return all possible subsets of a set of distinct integers.",
    mentalModel: {
      lines: [
        "At index i, branch twice: with nums[i], and without it.",
        "Equivalently: iterate the integers 0..2^n-1 and read their bits.",
        "Duplicates are handled by sorting, then skipping repeats at the same depth.",
      ],
      diagram: `            []
          /    \\
       [1]      []
       /  \\     /  \\
   [1,2] [1]  [2]  []

  2^n leaves, one per subset`,
      key: "Record at every node, not only at the leaves — every prefix is itself a subset.",
    },
    templates: [
      {
        name: "Backtracking",
        filename: "subsets.go",
        note: "The result is appended at every node, and a copy is essential.",
        code: `func subsets(nums []int) [][]int {
    var out [][]int
    cur := []int{}

    var backtrack func(start int)
    backtrack = func(start int) {
        out = append(out, append([]int(nil), cur...)) // copy!

        for i := start; i < len(nums); i++ {
            cur = append(cur, nums[i])
            backtrack(i + 1)
            cur = cur[:len(cur)-1] // undo
        }
    }

    backtrack(0)
    return out
}`,
      },
      {
        name: "Bitmask",
        filename: "subsets_bitmask.go",
        note: "No recursion, no backtracking — often the clearer answer for distinct elements.",
        code: `func subsetsBitmask(nums []int) [][]int {
    n := len(nums)
    out := make([][]int, 0, 1<<n)

    for mask := 0; mask < 1<<n; mask++ {
        var sub []int
        for i := 0; i < n; i++ {
            if mask>>i&1 == 1 {
                sub = append(sub, nums[i])
            }
        }
        out = append(out, sub)
    }
    return out
}`,
      },
      {
        name: "With duplicates",
        filename: "subsets_ii.go",
        note: "Sort first. i > start is the guard that skips a duplicate at the same depth.",
        code: `func subsetsWithDup(nums []int) [][]int {
    sort.Ints(nums)
    var out [][]int
    cur := []int{}

    var backtrack func(start int)
    backtrack = func(start int) {
        out = append(out, append([]int(nil), cur...))

        for i := start; i < len(nums); i++ {
            if i > start && nums[i] == nums[i-1] {
                continue // same value already tried at this depth
            }
            cur = append(cur, nums[i])
            backtrack(i + 1)
            cur = cur[:len(cur)-1]
        }
    }

    backtrack(0)
    return out
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n · 2^n)", note: "2^n subsets, O(n) to copy each" },
      { label: "Space", value: "O(n)", note: "excluding the output" },
      { label: "Output", value: "O(n · 2^n)" },
    ],
    variations: [
      { name: "Subsets of a fixed size", detail: "Add a size check and prune when the remaining elements cannot reach it." },
      { name: "Letter case permutation", detail: "Branch only on letters; digits have a single option." },
      { name: "Subsets with a running sum", detail: "Carry the aggregate as an argument instead of recomputing it." },
      { name: "Cannot sort", detail: "When the original order matters, dedupe with a per-level set instead." },
    ],
    mistakes: [
      { title: "Appending the slice without copying", detail: "cur is mutated afterwards, so every stored result ends up identical." },
      { title: "Using i > 0 instead of i > start", detail: "That would skip legitimate duplicates at deeper levels." },
      { title: "Forgetting to sort before deduping", detail: "Equal values must be adjacent for the skip to work." },
    ],
    related: ["combinations", "permutations", "bitmask-dp", "constraint-search"],
    problems: [78, 90, 784, 491],
  },
  {
    slug: "combinations",
    title: "Combinations",
    category: "backtracking",
    description: "Choose without regard to order — a start index enforces increasing selection.",
    concepts: ["Start index", "Pruning", "Reuse"],
    usedFor: ["k-of-n selections", "combination sums", "phone letter combinations"],
    signals: ["choose k", "combinations", "sum to target", "unique combinations", "any order of results"],
    recognition: [
      "selections are unordered, so [1,2] and [2,1] are the same answer",
      "the recursion needs a start index to avoid regenerating earlier elements",
      "reuse allowed means recursing with i; reuse forbidden means i+1",
    ],
    typicalQuestion: "Find all unique combinations summing to a target.",
    mentalModel: {
      lines: [
        "The start index is the whole mechanism: it forces indices to increase.",
        "Recurse with i to allow reusing the current element, or i+1 to move past it.",
        "Prune early: if the remaining budget is already exceeded, stop.",
      ],
      diagram: `  candidates [2,3,6,7]  target 7

  2 → 2,2 → 2,2,2 → prune (sum 8)
           → 2,2,3 ✓
    → 2,3 → prune
  7 → ✓

  sorted input makes break legal`,
      key: "Sort the candidates so a single break replaces a continue — that is the real speed-up.",
    },
    templates: [
      {
        name: "Choose k",
        filename: "combinations.go",
        note: "The upper bound on i prunes branches that cannot reach k elements.",
        code: `func combine(n, k int) [][]int {
    var out [][]int
    cur := []int{}

    var backtrack func(start int)
    backtrack = func(start int) {
        if len(cur) == k {
            out = append(out, append([]int(nil), cur...))
            return
        }
        need := k - len(cur)
        for i := start; i <= n-need+1; i++ { // prune: not enough left
            cur = append(cur, i)
            backtrack(i + 1)
            cur = cur[:len(cur)-1]
        }
    }

    backtrack(1)
    return out
}`,
      },
      {
        name: "Combination sum (reuse)",
        filename: "combination_sum.go",
        note: "Recurse with i, not i+1, to reuse the same candidate.",
        code: `func combinationSum(candidates []int, target int) [][]int {
    sort.Ints(candidates)
    var out [][]int
    cur := []int{}

    var backtrack func(start, remain int)
    backtrack = func(start, remain int) {
        if remain == 0 {
            out = append(out, append([]int(nil), cur...))
            return
        }
        for i := start; i < len(candidates); i++ {
            if candidates[i] > remain {
                break // sorted: everything after is too big
            }
            cur = append(cur, candidates[i])
            backtrack(i, remain-candidates[i]) // i: reuse allowed
            cur = cur[:len(cur)-1]
        }
    }

    backtrack(0, target)
    return out
}`,
      },
      {
        name: "Each used once",
        filename: "combination_sum_ii.go",
        note: "i+1 plus the duplicate skip — each number is used at most once per combination.",
        code: `func combinationSum2(candidates []int, target int) [][]int {
    sort.Ints(candidates)
    var out [][]int
    cur := []int{}

    var backtrack func(start, remain int)
    backtrack = func(start, remain int) {
        if remain == 0 {
            out = append(out, append([]int(nil), cur...))
            return
        }
        for i := start; i < len(candidates); i++ {
            if candidates[i] > remain {
                break
            }
            if i > start && candidates[i] == candidates[i-1] {
                continue // dedupe at this depth
            }
            cur = append(cur, candidates[i])
            backtrack(i+1, remain-candidates[i]) // i+1: no reuse
            cur = cur[:len(cur)-1]
        }
    }

    backtrack(0, target)
    return out
}`,
      },
      {
        name: "Cartesian product",
        filename: "phone_letters.go",
        note: "One position per depth, with all its options at that level.",
        code: `func letterCombinations(digits string) []string {
    if digits == "" {
        return nil
    }
    keys := map[byte]string{
        '2': "abc", '3': "def", '4': "ghi", '5': "jkl",
        '6': "mno", '7': "pqrs", '8': "tuv", '9': "wxyz",
    }

    var out []string
    cur := make([]byte, 0, len(digits))

    var backtrack func(i int)
    backtrack = func(i int) {
        if i == len(digits) {
            out = append(out, string(cur))
            return
        }
        for _, c := range []byte(keys[digits[i]]) {
            cur = append(cur, c)
            backtrack(i + 1)
            cur = cur[:len(cur)-1]
        }
    }

    backtrack(0)
    return out
}`,
      },
    ],
    complexity: [
      { label: "Choose k", value: "O(k · C(n,k))" },
      { label: "Combination sum", value: "O(n^(target/min))", note: "bounded by the tree size" },
      { label: "Space", value: "O(depth)", note: "excluding the output" },
    ],
    variations: [
      { name: "Fixed size and sum", detail: "Prune on both dimensions at once — combination-sum-III." },
      { name: "Counting only", detail: "If only the count is needed, it is usually a DP, not an enumeration." },
      { name: "Product of independent sets", detail: "No start index needed when each depth is a different dimension." },
    ],
    mistakes: [
      { title: "Passing i instead of i+1 (or vice versa)", detail: "That single character decides whether elements can repeat." },
      { title: "Deduping without sorting", detail: "The i > start skip needs equal values to be adjacent." },
      { title: "Using continue where break is correct", detail: "On sorted input, once a candidate exceeds the remainder, so do all the rest." },
      { title: "Not copying before appending", detail: "The universal backtracking bug." },
    ],
    related: ["subsets", "permutations", "constraint-search", "unbounded-knapsack"],
    problems: [77, 39, 40, 216, 17, 22],
  },
  {
    slug: "permutations",
    title: "Permutations",
    category: "backtracking",
    description: "Order matters — n! arrangements, generated by swapping or by tracking what is used.",
    concepts: ["Used array", "Swap", "Dedupe"],
    usedFor: ["all orderings", "arrangement constraints", "TSP brute force"],
    signals: ["all permutations", "arrangements", "order matters", "rearrange", "all orders"],
    recognition: [
      "different orders are different answers",
      "every element appears exactly once in each result",
      "n is small — 8 or 9 at most for a full enumeration",
    ],
    typicalQuestion: "Return all permutations of a list of distinct integers.",
    mentalModel: {
      lines: [
        "At each depth, choose any element not yet used.",
        "Either track a used[] array, or swap the chosen element into position.",
        "For duplicates: sort, then only use a repeated value if its twin was already used at this depth.",
      ],
      diagram: `  depth 0: choose any of n
  depth 1: choose any of n-1
  ...
  n! leaves

  swap approach: nums[depth..] are the unused ones`,
      key: "Duplicate handling differs from combinations — the condition is about the twin, not the position.",
    },
    templates: [
      {
        name: "Used array",
        filename: "permutations.go",
        note: "Clearest form, and easy to extend with constraints.",
        code: `func permute(nums []int) [][]int {
    var out [][]int
    cur := []int{}
    used := make([]bool, len(nums))

    var backtrack func()
    backtrack = func() {
        if len(cur) == len(nums) {
            out = append(out, append([]int(nil), cur...))
            return
        }
        for i, v := range nums {
            if used[i] {
                continue
            }
            used[i] = true
            cur = append(cur, v)

            backtrack()

            cur = cur[:len(cur)-1]
            used[i] = false
        }
    }

    backtrack()
    return out
}`,
      },
      {
        name: "Swap in place",
        filename: "permutations_swap.go",
        note: "No used array and no extra slice — everything after depth is unused.",
        code: `func permuteSwap(nums []int) [][]int {
    var out [][]int

    var backtrack func(depth int)
    backtrack = func(depth int) {
        if depth == len(nums) {
            out = append(out, append([]int(nil), nums...))
            return
        }
        for i := depth; i < len(nums); i++ {
            nums[depth], nums[i] = nums[i], nums[depth]
            backtrack(depth + 1)
            nums[depth], nums[i] = nums[i], nums[depth] // undo
        }
    }

    backtrack(0)
    return out
}`,
      },
      {
        name: "With duplicates",
        filename: "permutations_ii.go",
        note: "Skip a duplicate unless its identical predecessor is currently used.",
        code: `func permuteUnique(nums []int) [][]int {
    sort.Ints(nums)
    var out [][]int
    cur := []int{}
    used := make([]bool, len(nums))

    var backtrack func()
    backtrack = func() {
        if len(cur) == len(nums) {
            out = append(out, append([]int(nil), cur...))
            return
        }
        for i := range nums {
            if used[i] {
                continue
            }
            // only the leftmost unused copy may start a branch
            if i > 0 && nums[i] == nums[i-1] && !used[i-1] {
                continue
            }
            used[i] = true
            cur = append(cur, nums[i])

            backtrack()

            cur = cur[:len(cur)-1]
            used[i] = false
        }
    }

    backtrack()
    return out
}`,
      },
      {
        name: "Next permutation",
        filename: "next_permutation.go",
        note: "O(n) iteration through permutations in lexicographic order — no recursion.",
        code: `func nextPermutation(nums []int) {
    n := len(nums)

    i := n - 2
    for i >= 0 && nums[i] >= nums[i+1] {
        i-- // find the pivot: last ascent
    }

    if i >= 0 {
        j := n - 1
        for nums[j] <= nums[i] {
            j-- // smallest value greater than the pivot
        }
        nums[i], nums[j] = nums[j], nums[i]
    }

    for l, r := i+1, n-1; l < r; l, r = l+1, r-1 {
        nums[l], nums[r] = nums[r], nums[l] // reverse the suffix
    }
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n · n!)" },
      { label: "Space", value: "O(n)", note: "excluding the output" },
      { label: "Next permutation", value: "O(n)", note: "one step, constant space" },
    ],
    variations: [
      { name: "Constrained permutations", detail: "Prune as soon as the prefix violates the rule — beautiful-arrangement." },
      { name: "Permutations via bitmask DP", detail: "When you only need a count or an optimum, not the list: 2^n · n instead of n!." },
      { name: "K-th permutation", detail: "Compute it directly with factorial arithmetic instead of enumerating." },
    ],
    mistakes: [
      { title: "Using the combinations dedupe rule", detail: "For permutations the condition involves used[i-1], not i > start." },
      { title: "Forgetting to undo the swap", detail: "The array must be restored for the next branch." },
      { title: "Enumerating when n is large", detail: "10! is 3.6 million and 13! is over six billion — check n first." },
    ],
    related: ["subsets", "combinations", "bitmask-dp", "constraint-search"],
    problems: [46, 47, 31, 526, 784],
  },
  {
    slug: "n-queens",
    title: "N-Queens",
    category: "backtracking",
    description: "Place one item per row and encode the conflicts so each check is O(1).",
    concepts: ["Conflict sets", "Diagonals", "Bitmask"],
    usedFor: ["placement puzzles", "conflict-free assignment", "diagonal constraints"],
    signals: ["n-queens", "no two attacking", "place on a board", "diagonal conflict", "one per row"],
    recognition: [
      "exactly one item goes in each row or column",
      "conflicts are testable in constant time with the right encoding",
      "the branching factor shrinks fast as constraints accumulate",
    ],
    typicalQuestion: "Place n queens on an n×n board so that none attack each other.",
    mentalModel: {
      lines: [
        "One queen per row, so recursion depth equals the row index.",
        "Three conflict sets: column, r+c (anti-diagonal), r-c (diagonal).",
        "r-c can be negative — offset it by n, or use a map.",
      ],
      diagram: `  r + c is constant along  ╱
  r − c is constant along  ╲

  . Q . .     col {1}
  . . . Q     r+c {1, 4}
  Q . . .     r−c {−1, −2}
  . . Q .`,
      key: "Encoding the diagonals as r+c and r-c is the entire trick.",
    },
    templates: [
      {
        name: "With sets",
        filename: "n_queens.go",
        note: "Three boolean arrays make every conflict check O(1).",
        code: `func solveNQueens(n int) [][]string {
    var out [][]string
    pos := make([]int, n) // pos[r] = column of the queen in row r

    cols := make([]bool, n)
    diag := make([]bool, 2*n) // r - c + n
    anti := make([]bool, 2*n) // r + c

    var place func(r int)
    place = func(r int) {
        if r == n {
            out = append(out, render(pos, n))
            return
        }
        for c := 0; c < n; c++ {
            if cols[c] || diag[r-c+n] || anti[r+c] {
                continue
            }
            cols[c], diag[r-c+n], anti[r+c] = true, true, true
            pos[r] = c

            place(r + 1)

            cols[c], diag[r-c+n], anti[r+c] = false, false, false
        }
    }

    place(0)
    return out
}`,
      },
      {
        name: "Bitmask",
        filename: "n_queens_bitmask.go",
        note: "Dramatically faster: available is a bitmask, and the loop takes the lowest set bit.",
        code: `func totalNQueens(n int) int {
    full := 1<<n - 1
    count := 0

    var place func(cols, diag, anti int)
    place = func(cols, diag, anti int) {
        if cols == full {
            count++
            return
        }
        available := ^(cols | diag | anti) & full

        for available != 0 {
            bit := available & -available // lowest set bit
            available ^= bit

            place(cols|bit, (diag|bit)<<1&full, (anti|bit)>>1)
        }
    }

    place(0, 0, 0)
    return count
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n!)", note: "far less in practice thanks to pruning" },
      { label: "Conflict check", value: "O(1)" },
      { label: "Space", value: "O(n)" },
    ],
    variations: [
      { name: "Count only", detail: "Drop the board rendering and just increment — that is problem 52." },
      { name: "Symmetry reduction", detail: "Only search half the first row and double the count (mind the odd middle column)." },
      { name: "Other placement puzzles", detail: "Knight or rook placement: same skeleton, different conflict encoding." },
    ],
    mistakes: [
      { title: "Negative diagonal index", detail: "r-c ranges from -(n-1) to n-1; offset by n before indexing." },
      { title: "Scanning the board for conflicts", detail: "O(n) per check turns into O(n²) per placement — use the sets." },
      { title: "Forgetting to undo all three sets", detail: "Every marked constraint must be cleared on the way out." },
    ],
    related: ["constraint-search", "sudoku", "bitmask-dp", "permutations"],
    problems: [51, 52],
  },
  {
    slug: "sudoku",
    title: "Sudoku & Grid Constraints",
    category: "backtracking",
    description: "Constraint propagation plus most-constrained-first ordering turns a huge search into a fast one.",
    concepts: ["Row/col/box", "MRV", "Propagation"],
    usedFor: ["sudoku", "latin squares", "grid filling under constraints", "CSP-style puzzles"],
    signals: ["sudoku", "fill the grid", "each row and column must contain", "valid board", "3x3 box"],
    recognition: [
      "cells must be filled subject to row, column and region constraints",
      "the constraint sets can be maintained incrementally",
      "choosing the most constrained cell next collapses the search dramatically",
    ],
    typicalQuestion: "Fill the empty cells of a Sudoku board.",
    mentalModel: {
      lines: [
        "Maintain three constraint sets: per row, per column, per 3×3 box.",
        "Box index is (r/3)*3 + c/3.",
        "Always fill the cell with the fewest options next — minimum remaining values.",
      ],
      diagram: `  box index = (r/3)*3 + c/3

  ┌───┬───┬───┐
  │ 0 │ 1 │ 2 │
  ├───┼───┼───┤
  │ 3 │ 4 │ 5 │
  ├───┼───┼───┤
  │ 6 │ 7 │ 8 │
  └───┴───┴───┘`,
      key: "MRV ordering is the difference between instant and hopeless.",
    },
    templates: [
      {
        name: "Validity sets",
        filename: "sudoku_sets.go",
        note: "Maintained incrementally, so each placement check is O(1).",
        code: `type Sudoku struct {
    board    *[9][9]byte
    rows     [9][9]bool
    cols     [9][9]bool
    boxes    [9][9]bool
}

func boxOf(r, c int) int { return (r/3)*3 + c/3 }

func (s *Sudoku) canPlace(r, c, d int) bool {
    return !s.rows[r][d] && !s.cols[c][d] && !s.boxes[boxOf(r, c)][d]
}

func (s *Sudoku) set(r, c, d int, on bool) {
    s.rows[r][d] = on
    s.cols[c][d] = on
    s.boxes[boxOf(r, c)][d] = on
}`,
      },
      {
        name: "Solver",
        filename: "sudoku_solve.go",
        note: "Returns true to unwind the whole recursion as soon as a solution is found.",
        code: `func (s *Sudoku) Solve(cells [][2]int, k int) bool {
    if k == len(cells) {
        return true
    }
    r, c := cells[k][0], cells[k][1]

    for d := 0; d < 9; d++ {
        if !s.canPlace(r, c, d) {
            continue
        }
        s.board[r][c] = byte('1' + d)
        s.set(r, c, d, true)

        if s.Solve(cells, k+1) {
            return true // done: do not undo
        }

        s.set(r, c, d, false)
        s.board[r][c] = '.'
    }
    return false
}`,
      },
      {
        name: "Validation only",
        filename: "valid_sudoku.go",
        note: "No search needed — one pass with three sets.",
        code: `func isValidSudoku(board [][]byte) bool {
    var rows, cols, boxes [9][9]bool

    for r := 0; r < 9; r++ {
        for c := 0; c < 9; c++ {
            if board[r][c] == '.' {
                continue
            }
            d := board[r][c] - '1'
            b := (r/3)*3 + c/3

            if rows[r][d] || cols[c][d] || boxes[b][d] {
                return false
            }
            rows[r][d], cols[c][d], boxes[b][d] = true, true, true
        }
    }
    return true
}`,
      },
    ],
    complexity: [
      { label: "Worst case", value: "exponential", note: "in theory" },
      { label: "In practice", value: "milliseconds", note: "with MRV and constraint sets" },
      { label: "Validation", value: "O(1)", note: "the board is a fixed 81 cells" },
    ],
    variations: [
      { name: "MRV ordering", detail: "Recompute the candidate count per empty cell and pick the smallest — the single biggest win." },
      { name: "Bitmask candidates", detail: "A 9-bit mask per row, column and box lets you compute available digits with one AND." },
      { name: "Constraint propagation", detail: "When a cell has exactly one candidate, fill it immediately and propagate." },
    ],
    mistakes: [
      { title: "Undoing after a successful solve", detail: "Once the answer is found you must return up without restoring the board." },
      { title: "Wrong box index", detail: "(r/3)*3 + c/3, not r/3 + c/3." },
      { title: "Rebuilding the sets on every check", detail: "Maintain them incrementally instead." },
    ],
    related: ["constraint-search", "n-queens", "hash-map"],
    problems: [37, 36],
  },
  {
    slug: "constraint-search",
    title: "Constraint Search & Pruning",
    category: "backtracking",
    description: "The general backtracking skeleton — and pruning, which is what makes it viable.",
    concepts: ["Prune early", "Feasibility", "Order"],
    usedFor: ["generating only valid outputs", "partitioning", "grid word search", "any constrained enumeration"],
    signals: ["all valid", "generate all", "well-formed", "partition into", "is it possible to split", "word search"],
    recognition: [
      "you enumerate candidates but most branches are dead",
      "validity can be checked on a partial solution, not only on a complete one",
      "the search is exponential unless you prune",
    ],
    typicalQuestion: "Generate all well-formed combinations of n pairs of parentheses.",
    mentalModel: {
      lines: [
        "Choose, recurse, undo.",
        "Prune the moment a partial solution cannot possibly complete.",
        "Order the choices so the most constrained decisions happen first.",
      ],
      diagram: `  backtrack(state):
      if complete: record; return
      for each choice:
          if not feasible: skip     ← the pruning
          apply
          backtrack(next)
          undo

  pruning early beats validating late`,
      key: "Never generate and then filter. Make invalid branches unreachable.",
    },
    templates: [
      {
        name: "Skeleton",
        filename: "backtrack.go",
        note: "Every backtracking problem is this, with the three hooks filled in.",
        code: `func backtrackTemplate(state *State) {
    if state.Complete() {
        state.Record()
        return
    }

    for _, choice := range state.Choices() {
        if !state.Feasible(choice) {
            continue // prune
        }
        state.Apply(choice)
        backtrackTemplate(state)
        state.Undo(choice)
    }
}`,
      },
      {
        name: "Prune by rule",
        filename: "generate_parentheses.go",
        note: "Only valid strings are ever built — no post-hoc validation.",
        code: `func generateParenthesis(n int) []string {
    var out []string
    cur := make([]byte, 0, 2*n)

    var build func(open, close int)
    build = func(open, close int) {
        if len(cur) == 2*n {
            out = append(out, string(cur))
            return
        }
        if open < n { // can still open
            cur = append(cur, '(')
            build(open+1, close)
            cur = cur[:len(cur)-1]
        }
        if close < open { // can only close what is open
            cur = append(cur, ')')
            build(open, close+1)
            cur = cur[:len(cur)-1]
        }
    }

    build(0, 0)
    return out
}`,
      },
      {
        name: "Precomputed feasibility",
        filename: "palindrome_partition.go",
        note: "An O(n²) palindrome table makes each cut test O(1).",
        code: `func partition(s string) [][]string {
    n := len(s)
    isPal := make([][]bool, n)
    for i := range isPal {
        isPal[i] = make([]bool, n)
    }
    for i := n - 1; i >= 0; i-- {
        for j := i; j < n; j++ {
            isPal[i][j] = s[i] == s[j] && (j-i < 2 || isPal[i+1][j-1])
        }
    }

    var out [][]string
    cur := []string{}

    var cut func(start int)
    cut = func(start int) {
        if start == n {
            out = append(out, append([]string(nil), cur...))
            return
        }
        for end := start; end < n; end++ {
            if !isPal[start][end] {
                continue // prune
            }
            cur = append(cur, s[start:end+1])
            cut(end + 1)
            cur = cur[:len(cur)-1]
        }
    }

    cut(0)
    return out
}`,
      },
      {
        name: "Grid search",
        filename: "word_search.go",
        note: "Mark the cell in place, recurse, restore — the visited set costs nothing.",
        code: `func exist(board [][]byte, word string) bool {
    var dfs func(r, c, i int) bool
    dfs = func(r, c, i int) bool {
        if i == len(word) {
            return true
        }
        if r < 0 || r >= len(board) || c < 0 || c >= len(board[0]) {
            return false
        }
        if board[r][c] != word[i] {
            return false
        }

        saved := board[r][c]
        board[r][c] = '#' // mark visited

        found := dfs(r+1, c, i+1) || dfs(r-1, c, i+1) ||
            dfs(r, c+1, i+1) || dfs(r, c-1, i+1)

        board[r][c] = saved // restore
        return found
    }

    for r := range board {
        for c := range board[r] {
            if dfs(r, c, 0) {
                return true
            }
        }
    }
    return false
}`,
      },
    ],
    complexity: [
      { label: "Worst case", value: "exponential", note: "O(b^d) for branching b and depth d" },
      { label: "With pruning", value: "far smaller", note: "problem-dependent, often the difference between viable and not" },
      { label: "Space", value: "O(depth)" },
    ],
    variations: [
      { name: "Sort to enable pruning", detail: "Descending order makes large, infeasible items fail immediately — k-equal-subsets." },
      { name: "Memoise the state", detail: "If different paths reach identical states, you have DP, not backtracking." },
      { name: "Iterative deepening", detail: "Bound the depth and increase it — useful when a shallow answer is likely." },
      { name: "Early exit", detail: "Return a bool up the recursion to stop the whole search at the first solution." },
    ],
    mistakes: [
      { title: "Generating then filtering", detail: "Exponentially more work than pruning during construction." },
      { title: "Forgetting to undo", detail: "State leaks into sibling branches and the results are silently wrong." },
      { title: "Not copying the accumulator before recording", detail: "The universal backtracking bug." },
      { title: "Missing that the state repeats", detail: "If subproblems recur, memoise — backtracking is then doing exponential work for a polynomial problem." },
    ],
    related: ["subsets", "combinations", "n-queens", "graph-dfs"],
    problems: [22, 131, 93, 79, 212, 698, 17, 113],
  },
];
