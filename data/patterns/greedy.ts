import type { Pattern } from "../types";

export const greedy: Pattern[] = [
  {
    slug: "greedy-sorting",
    title: "Greedy + Sorting",
    category: "greedy",
    description: "Sort into the order that makes the locally best choice provably safe.",
    concepts: ["Order first", "Exchange argument", "Comparator"],
    usedFor: ["pairing and matching", "custom arrangement orders", "deadline scheduling"],
    signals: ["minimum number of", "maximum number of", "pair up", "arrange to form", "sort by", "assign"],
    recognition: [
      "there is an order in which the first choice is obviously correct",
      "you can argue by exchange: swapping any optimal solution towards your choice does not make it worse",
      "the answer does not depend on the input order, so sorting is free",
    ],
    typicalQuestion: "Arrange the numbers to form the largest possible concatenated value.",
    mentalModel: {
      lines: [
        "Greedy is sort, then one pass.",
        "The sort key IS the algorithm. Get that right and the pass is trivial.",
        "Before you trust it, explain why the first pick is always safe.",
      ],
      diagram: `  unsorted → which choice is safe? unclear

  sorted by the right key
      ▼
  take the first, commit, move on

  proof: any optimal solution can be
  rewritten to start with this choice`,
      key: "If you cannot say why the first choice is safe, it is probably DP, not greedy.",
    },
    templates: [
      {
        name: "Two-sequence matching",
        filename: "assign_cookies.go",
        note: "Sort both, then move whichever pointer can still be satisfied.",
        code: `func findContentChildren(greed, sizes []int) int {
    sort.Ints(greed)
    sort.Ints(sizes)

    child := 0
    for _, s := range sizes {
        if child < len(greed) && greed[child] <= s {
            child++ // smallest sufficient cookie
        }
    }
    return child
}`,
      },
      {
        name: "Custom order",
        filename: "largest_number.go",
        note: "The comparator carries the whole idea: a before b when a+b beats b+a.",
        code: `func largestNumber(nums []int) string {
    strs := make([]string, len(nums))
    for i, v := range nums {
        strs[i] = strconv.Itoa(v)
    }

    sort.Slice(strs, func(i, j int) bool {
        return strs[i]+strs[j] > strs[j]+strs[i]
    })

    if strs[0] == "0" {
        return "0"
    }
    return strings.Join(strs, "")
}`,
      },
      {
        name: "Insert by rank",
        filename: "queue_reconstruction.go",
        note: "Place the tallest first. Shorter people inserted later cannot disturb them.",
        code: `func reconstructQueue(people [][]int) [][]int {
    sort.Slice(people, func(i, j int) bool {
        if people[i][0] != people[j][0] {
            return people[i][0] > people[j][0] // tallest first
        }
        return people[i][1] < people[j][1]
    })

    out := make([][]int, 0, len(people))
    for _, p := range people {
        k := p[1]
        out = append(out, nil)
        copy(out[k+1:], out[k:])
        out[k] = p // insert at index k
    }
    return out
}`,
      },
      {
        name: "Two sweeps",
        filename: "candy.go",
        note: "When rules point both ways, satisfy each direction in its own pass.",
        code: `func candy(ratings []int) int {
    n := len(ratings)
    give := make([]int, n)
    for i := range give {
        give[i] = 1
    }

    for i := 1; i < n; i++ {
        if ratings[i] > ratings[i-1] {
            give[i] = give[i-1] + 1
        }
    }
    for i := n - 2; i >= 0; i-- {
        if ratings[i] > ratings[i+1] {
            give[i] = max(give[i], give[i+1]+1)
        }
    }

    total := 0
    for _, g := range give {
        total += g
    }
    return total
}`,
      },
    ],
    complexity: [
      { label: "Sort", value: "O(n log n)", note: "dominates" },
      { label: "Sweep", value: "O(n)" },
      { label: "Space", value: "O(1) – O(n)" },
    ],
    variations: [
      { name: "Sort by end time", detail: "Interval scheduling: earliest finisher leaves the most room." },
      { name: "Sort by ratio", detail: "Fractional knapsack: value per unit weight." },
      { name: "Sort descending", detail: "When large items are the constraint — bin packing heuristics, triangle sides." },
      { name: "Sort + heap", detail: "When the feasible set changes as you sweep." },
    ],
    mistakes: [
      { title: "Greedy where DP is required", detail: "Coin change with coins {1,3,4} and amount 6: greedy gives 3 coins, optimal is 2." },
      { title: "A comparator that says both ways are true", detail: "sort.Slice can misbehave if less(a,b) and less(b,a) are both true." },
      { title: "Sorting when positions matter", detail: "If the answer is an index into the original array, sort pairs, not values." },
      { title: "Skipping the proof", detail: "Passing a few examples proves nothing. Find the swap argument." },
    ],
    related: ["interval-scheduling", "greedy-heap", "sorting", "local-global"],
    problems: [455, 179, 406, 135, 976, 1338, 763, 56, 354],
  },
  {
    slug: "greedy-heap",
    title: "Greedy + Heap",
    category: "greedy",
    description: "The best choice keeps changing as you sweep — so keep the candidates in a heap.",
    concepts: ["Dynamic best", "Regret", "Scheduling"],
    usedFor: ["scheduling by deadline or profit", "resource allocation", "merging streams", "regret-based swaps"],
    signals: ["always pick the best available", "schedule tasks", "k largest so far", "profit", "deadline", "capital"],
    recognition: [
      "which options are available changes as you move through the input",
      "you repeatedly need the current maximum or minimum of a growing set",
      "a decision may need revisiting — push the regret back into the heap",
    ],
    typicalQuestion: "Maximise capital by choosing up to k projects, each unlocked by your current capital.",
    mentalModel: {
      lines: [
        "Sort by whatever decides when an option becomes available.",
        "Sweep forward, pushing options into a heap as they unlock.",
        "Take the best one in the heap.",
        "Sometimes you push back what you replaced, and take it again later.",
      ],
      diagram: `  sort by availability
      │
      ▼  sweep
  push newly available ──▶ [ heap ]
                              │
                          pop the best`,
      key: "Sorting handles what is allowed. The heap handles what is best.",
    },
    templates: [
      {
        name: "Availability sweep",
        filename: "ipo.go",
        note: "Two orders at once: sorted by cost to unlock, heaped by payoff.",
        code: `func findMaximizedCapital(k, w int, profits, capital []int) int {
    type proj struct{ cap, profit int }
    projects := make([]proj, len(profits))
    for i := range profits {
        projects[i] = proj{capital[i], profits[i]}
    }
    sort.Slice(projects, func(i, j int) bool {
        return projects[i].cap < projects[j].cap
    })

    h := &MaxHeap{}
    heap.Init(h)
    i := 0

    for ; k > 0; k-- {
        for i < len(projects) && projects[i].cap <= w {
            heap.Push(h, projects[i].profit) // now affordable
            i++
        }
        if h.Len() == 0 {
            break
        }
        w += heap.Pop(h).(int)
    }
    return w
}`,
      },
      {
        name: "Regret heap",
        filename: "furthest_building.go",
        note: "Spend the scarce thing freely, then downgrade the smallest use when you run out.",
        code: `func furthestBuilding(heights []int, bricks, ladders int) int {
    h := &IntHeap{} // min-heap of climbs currently using a ladder
    heap.Init(h)

    for i := 1; i < len(heights); i++ {
        climb := heights[i] - heights[i-1]
        if climb <= 0 {
            continue
        }

        heap.Push(h, climb)
        if h.Len() > ladders {
            bricks -= heap.Pop(h).(int) // demote the smallest to bricks
        }
        if bricks < 0 {
            return i - 1
        }
    }
    return len(heights) - 1
}`,
      },
      {
        name: "Frequency scheduling",
        filename: "reorganize_string.go",
        note: "Always place the most common letter that is not the one you just placed.",
        code: `func reorganizeString(s string) string {
    var cnt [26]int
    for i := 0; i < len(s); i++ {
        cnt[s[i]-'a']++
    }

    h := &CharHeap{}
    for c, n := range cnt {
        if n > 0 {
            heap.Push(h, Char{byte(c) + 'a', n})
        }
    }

    var out []byte
    var prev *Char

    for h.Len() > 0 {
        cur := heap.Pop(h).(Char)
        out = append(out, cur.ch)
        cur.n--

        if prev != nil {
            heap.Push(h, *prev) // the previous one is legal again
        }
        if cur.n > 0 {
            prev = &cur
        } else {
            prev = nil
        }
    }

    if len(out) != len(s) {
        return "" // impossible
    }
    return string(out)
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n log n)", note: "sort plus n heap operations" },
      { label: "Heap operations", value: "O(log n)" },
      { label: "Space", value: "O(n)" },
    ],
    variations: [
      { name: "Two heaps", detail: "A running median, or balancing two halves of a set." },
      { name: "Deadline scheduling", detail: "Take every job, and when infeasible drop the least profitable one already taken." },
      { name: "Lazy deletion", detail: "Push stale entries and skip them on pop rather than removing from the middle." },
      { name: "Heap of iterators", detail: "Merging k sorted streams by always advancing the smallest head." },
    ],
    mistakes: [
      { title: "Wrong heap direction", detail: "Write down whether you need the largest or smallest before choosing Less." },
      { title: "Pushing before the availability check", detail: "Only push candidates that are actually legal at this point in the sweep." },
      { title: "Forgetting to re-push the displaced item", detail: "Regret-based greedies depend on putting the previous choice back." },
      { title: "Comparing floats in Less", detail: "Use integer keys where you can; ties in float comparisons cause unstable orders." },
    ],
    related: ["heap", "greedy-sorting", "interval-scheduling", "dijkstra"],
    problems: [502, 1642, 767, 621, 1834, 1046, 23, 373, 295],
  },
  {
    slug: "interval-scheduling",
    title: "Interval Scheduling",
    category: "greedy",
    description: "Sort by end time to maximise how many intervals fit; sort by start time to merge them.",
    concepts: ["Sort by end", "Merge", "Overlap"],
    usedFor: ["maximum non-overlapping intervals", "merging ranges", "minimum removals", "meeting rooms"],
    signals: ["intervals", "overlap", "merge", "meeting rooms", "non-overlapping", "erase overlap", "burst balloons"],
    recognition: [
      "the input is a list of [start, end] pairs",
      "you count how many fit without overlapping, or merge what does overlap",
      "you need the maximum number of simultaneous intervals",
    ],
    typicalQuestion: "What is the minimum number of intervals to remove so none overlap?",
    mentalModel: {
      lines: [
        "To fit as many as possible, sort by END time.",
        "To merge overlaps, sort by START time.",
        "To count how many run at once, sweep the endpoints.",
      ],
      diagram: `  sort by end:
  ├───┤
     ├─────┤          take the earliest finisher
        ├──┤          it leaves the most room
              ├───┤

  sort by start: extend or push`,
      key: "By end for counting. By start for merging. Mixing them is the classic mistake.",
    },
    templates: [
      {
        name: "Max non-overlapping",
        filename: "non_overlapping.go",
        note: "Earliest finisher first. Count what you keep; the answer is the rest.",
        code: `func eraseOverlapIntervals(intervals [][]int) int {
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][1] < intervals[j][1] // by END
    })

    kept, lastEnd := 0, math.MinInt
    for _, iv := range intervals {
        if iv[0] >= lastEnd {
            kept++
            lastEnd = iv[1]
        }
    }
    return len(intervals) - kept
}`,
      },
      {
        name: "Merge",
        filename: "merge_intervals.go",
        note: "Sort by start, then either stretch the last interval or begin a new one.",
        code: `func merge(intervals [][]int) [][]int {
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][0] < intervals[j][0] // by START
    })

    out := [][]int{intervals[0]}
    for _, iv := range intervals[1:] {
        last := out[len(out)-1]
        if iv[0] <= last[1] {
            last[1] = max(last[1], iv[1]) // extend
        } else {
            out = append(out, iv) // disjoint
        }
    }
    return out
}`,
      },
      {
        name: "Insert into sorted",
        filename: "insert_interval.go",
        note: "Three phases: before, overlapping (absorb), after.",
        code: `func insert(intervals [][]int, newIv []int) [][]int {
    var out [][]int
    i, n := 0, len(intervals)

    for i < n && intervals[i][1] < newIv[0] {
        out = append(out, intervals[i])
        i++
    }
    for i < n && intervals[i][0] <= newIv[1] {
        newIv[0] = min(newIv[0], intervals[i][0])
        newIv[1] = max(newIv[1], intervals[i][1])
        i++
    }
    out = append(out, newIv)

    return append(out, intervals[i:]...)
}`,
      },
      {
        name: "Max simultaneous",
        filename: "meeting_rooms.go",
        note: "Walk the sorted starts and ends together, tracking how many are open.",
        code: `func minMeetingRooms(intervals [][]int) int {
    starts := make([]int, len(intervals))
    ends := make([]int, len(intervals))
    for i, iv := range intervals {
        starts[i], ends[i] = iv[0], iv[1]
    }
    sort.Ints(starts)
    sort.Ints(ends)

    rooms, best, e := 0, 0, 0
    for _, s := range starts {
        for e < len(ends) && ends[e] <= s {
            rooms-- // a meeting freed a room
            e++
        }
        rooms++
        best = max(best, rooms)
    }
    return best
}`,
      },
    ],
    complexity: [
      { label: "Sort", value: "O(n log n)" },
      { label: "Sweep", value: "O(n)" },
      { label: "Space", value: "O(n)", note: "O(1) extra if sorting in place" },
    ],
    why: "Keeping the interval that finishes earliest leaves the most room for everything after it. Take any best-possible schedule: its first interval finishes no sooner than yours, so swapping yours in is never worse.",
    variations: [
      { name: "Minimum arrows", detail: "Identical to maximum non-overlapping — count the groups instead of the removals." },
      { name: "Remove covered intervals", detail: "Sort start ascending, end descending, then track the furthest end." },
      { name: "Weighted interval scheduling", detail: "Not greedy — sort by end and DP with a binary search for the last compatible interval." },
      { name: "Interval intersection", detail: "Two sorted lists, advancing whichever ends first." },
    ],
    mistakes: [
      { title: "Sorting by start when counting", detail: "One long early interval then blocks everything — sort by end." },
      { title: "Treating touching intervals as overlapping", detail: "[1,2] and [2,3] may or may not conflict — read whether endpoints are inclusive." },
      { title: "Not taking the max when merging", detail: "last[1] = iv[1] loses a fully contained longer interval." },
      { title: "Assuming greedy works when intervals have weights", detail: "Weighted scheduling needs DP." },
    ],
    related: ["greedy-sorting", "activity-selection", "difference-array", "heap"],
    problems: [435, 452, 56, 57, 1288, 763, 986, 1094],
  },
  {
    slug: "activity-selection",
    title: "Activity Selection",
    category: "greedy",
    description: "The classic greedy proof, and the shape of the argument for any greedy choice.",
    concepts: ["Exchange argument", "Earliest finish", "Optimality"],
    usedFor: ["maximum compatible activities", "justifying greedy choices", "deadline feasibility"],
    signals: ["maximum number of activities", "non-conflicting", "select as many as possible", "schedule"],
    recognition: [
      "you must select the largest compatible subset, not optimise a weighted total",
      "all items are worth the same, so counting them is the objective",
      "you need to prove the greedy choice rather than just guess it",
    ],
    typicalQuestion: "Select the maximum number of activities that do not overlap.",
    mentalModel: {
      lines: [
        "Take whatever finishes first.",
        "Throw away everything that clashes with it.",
        "Repeat on what is left.",
        "It is safe because any best schedule can swap in your pick and stay just as good.",
      ],
      diagram: `  exchange argument

  OPT:  ├─────┤ ├───┤ ├────┤
  ours: ├──┤   (finishes earlier)

  replace OPT's first with ours
  → still valid, still the same size
  → greedy is optimal by induction`,
      key: "Greedy needs two things: the first pick is safe, and what is left is the same problem.",
    },
    templates: [
      {
        name: "Activity selection",
        filename: "activity_selection.go",
        note: "The whole algorithm, once the sort is right.",
        code: `type Activity struct{ Start, End int }

func selectActivities(a []Activity) []Activity {
    sort.Slice(a, func(i, j int) bool { return a[i].End < a[j].End })

    var chosen []Activity
    lastEnd := math.MinInt

    for _, act := range a {
        if act.Start >= lastEnd {
            chosen = append(chosen, act)
            lastEnd = act.End
        }
    }
    return chosen
}`,
      },
      {
        name: "Deadline feasibility",
        filename: "job_deadlines.go",
        note: "Take everything. When the schedule breaks, drop the longest job so far.",
        code: `func scheduleWithDeadlines(jobs [][]int) int {
    // jobs = [duration, deadline]
    sort.Slice(jobs, func(i, j int) bool { return jobs[i][1] < jobs[j][1] })

    h := &MaxHeap{} // durations of accepted jobs
    heap.Init(h)
    elapsed := 0

    for _, j := range jobs {
        dur, deadline := j[0], j[1]
        elapsed += dur
        heap.Push(h, dur)

        if elapsed > deadline { // infeasible: drop the longest
            elapsed -= heap.Pop(h).(int)
        }
    }
    return h.Len()
}`,
      },
    ],
    complexity: [
      { label: "Sort", value: "O(n log n)" },
      { label: "Selection", value: "O(n)" },
      { label: "With a heap", value: "O(n log n)" },
    ],
    why: "Greedy works when two things hold. First, some best answer starts with the greedy pick, which you prove by swapping. Second, after committing, what remains is the same problem on a smaller input.",
    variations: [
      { name: "Weighted activities", detail: "Greedy fails. Sort by end and DP with a binary search for the last compatible activity." },
      { name: "Multiple machines", detail: "Assign each activity to the machine that freed up earliest — a min-heap of release times." },
      { name: "Structures greedy always fits", detail: "Some structures always work with greedy. Spotting one is a quick proof." },
    ],
    mistakes: [
      { title: "Sorting by duration", detail: "Shortest-first is intuitive and wrong — it can block two compatible activities." },
      { title: "Sorting by start", detail: "A long first activity blocks everything after it." },
      { title: "Assuming greedy extends to weights", detail: "The swap argument breaks the moment items are worth different amounts." },
    ],
    related: ["interval-scheduling", "matroid-intuition", "greedy-heap", "greedy-sorting"],
    problems: [435, 452, 455, 621],
  },
  {
    slug: "matroid-intuition",
    title: "Matroid Intuition",
    category: "greedy",
    description: "When greedy is provably optimal — and how to spot that it is not.",
    concepts: ["Exchange", "Independence", "Proof"],
    usedFor: ["deciding greedy versus DP", "justifying an approach", "spanning trees and scheduling"],
    signals: ["is greedy correct here", "prove the approach", "maximum weight independent set", "spanning tree"],
    recognition: [
      "you have a candidate greedy rule and need to know whether to trust it",
      "the structure is closed downward — any subset of a valid set is valid",
      "the exchange property holds: given two valid sets of different sizes, the larger can donate an element to the smaller",
    ],
    typicalQuestion: "Is sorting by this key and taking greedily guaranteed to be optimal?",
    mentalModel: {
      lines: [
        "Two quick tests tell you whether greedy is safe.",
        "One: is every part of a valid set also valid?",
        "Two: can a smaller valid set always borrow an item from a bigger one?",
        "Both yes means sort by value and take greedily.",
      ],
      diagram: `  forests in a graph      → matroid → Kruskal is optimal
  intervals by end        → matroid-like → greedy optimal
  coin change {1,3,4}     → NOT → greedy fails
  weighted intervals      → NOT → needs DP`,
      key: "Cannot find the swap argument in two minutes? Write the DP.",
    },
    templates: [
      {
        name: "Greedy on a matroid",
        filename: "matroid_greedy.go",
        note: "Sort by value, take anything that keeps the set valid.",
        code: `// generic greedy: optimal when independent() defines a matroid
func matroidGreedy(items []Item, independent func([]Item) bool) []Item {
    sort.Slice(items, func(i, j int) bool {
        return items[i].Weight > items[j].Weight
    })

    var chosen []Item
    for _, it := range items {
        if independent(append(chosen, it)) {
            chosen = append(chosen, it)
        }
    }
    return chosen
}`,
      },
      {
        name: "Kruskal as a matroid",
        filename: "kruskal_matroid.go",
        note: "'Valid' here means no loop. Union-Find answers that instantly.",
        code: `// "independent" = acyclic. DSU answers it in O(alpha(n)).
func kruskalMST(n int, edges [][]int) int {
    sort.Slice(edges, func(i, j int) bool { return edges[i][2] < edges[j][2] })
    dsu := NewDSU(n)

    total := 0
    for _, e := range edges {
        if dsu.Union(e[0], e[1]) { // stays acyclic → independent
            total += e[2]
        }
    }
    return total
}`,
      },
      {
        name: "When greedy fails",
        filename: "greedy_fails.go",
        note: "Keep these two counterexamples ready. They are the standard follow-up.",
        code: `// coin change: greedy is NOT optimal
coins := []int{1, 3, 4}
amount := 6
// greedy: 4 + 1 + 1 = 3 coins
// optimal: 3 + 3     = 2 coins

// weighted interval scheduling: greedy is NOT optimal
// [0,10] weight 100   vs   [0,4] weight 5 + [5,9] weight 5
// earliest-finish greedy takes the two small ones and loses`,
      },
    ],
    complexity: [
      { label: "Greedy on a matroid", value: "O(n log n + n · I)", note: "I = cost of the independence check" },
      { label: "Kruskal", value: "O(E log E)" },
    ],
    variations: [
      { name: "Forests in a graph", detail: "Sets of edges with no loop always work with greedy. That is why Kruskal is correct." },
      { name: "Any k of them", detail: "Any set of size at most k is valid, so 'take the k best' is optimal." },
      { name: "Jobs that all fit", detail: "Sets of jobs that can all meet their deadlines. Greedy plus a heap works." },
      { name: "Two rules at once", detail: "Two such rules at once is still solvable. Three is not." },
    ],
    mistakes: [
      { title: "Assuming greedy because it is simple", detail: "Try it on a small nasty case before you commit." },
      { title: "Confusing locally optimal with globally optimal", detail: "The swap argument is what connects the two." },
      { title: "Ignoring weights", detail: "Unweighted problems are often greedy; adding weights usually breaks it." },
    ],
    related: ["activity-selection", "minimum-spanning-tree", "greedy-sorting", "local-global"],
    problems: [435, 1584, 621, 502],
  },
  {
    slug: "local-global",
    title: "Local → Global Optimisation",
    category: "greedy",
    description: "Sweep once, carrying one running number that guarantees the final answer.",
    concepts: ["Running best", "Reset", "Reachability"],
    usedFor: ["jump games", "gas stations", "furthest reach", "single-pass feasibility"],
    signals: ["can you reach", "minimum jumps", "furthest you can get", "start index", "one pass"],
    recognition: [
      "the state you need is a single running quantity — furthest reach, running deficit, best so far",
      "failing at position i rules out a whole prefix of starting points",
      "the answer is feasibility or a minimum count over a single sweep",
    ],
    typicalQuestion: "Can you reach the last index, given each index's maximum jump length?",
    mentalModel: {
      lines: [
        "Carry one running number: how far you can get, or how much you are short by.",
        "Update it at every step.",
        "If failing at i also rules out every start before i, one pass is enough.",
      ],
      diagram: `  nums  2  3  1  1  4
  reach 2  4  4  4  8
        │
        i must never exceed reach

  jump count: reach a boundary → one more jump`,
      key: "Prove that failing at i kills everything before it. That is what makes one pass work.",
    },
    templates: [
      {
        name: "Furthest reach",
        filename: "jump_game.go",
        note: "One variable, one pass.",
        code: `func canJump(nums []int) bool {
    reach := 0
    for i, v := range nums {
        if i > reach {
            return false // stranded
        }
        reach = max(reach, i+v)
    }
    return true
}`,
      },
      {
        name: "Implicit BFS levels",
        filename: "jump_game_ii.go",
        note: "Each jump covers a stretch of indices. That stretch is one BFS ring.",
        code: `func jump(nums []int) int {
    jumps, curEnd, farthest := 0, 0, 0

    for i := 0; i < len(nums)-1; i++ {
        farthest = max(farthest, i+nums[i])
        if i == curEnd { // end of the current level
            jumps++
            curEnd = farthest
        }
    }
    return jumps
}`,
      },
      {
        name: "Restart on deficit",
        filename: "gas_station.go",
        note: "Tank goes negative at i? No start up to i can work. Begin again at i+1.",
        code: `func canCompleteCircuit(gas, cost []int) int {
    total, tank, start := 0, 0, 0

    for i := range gas {
        diff := gas[i] - cost[i]
        total += diff
        tank += diff

        if tank < 0 {
            start = i + 1 // everything before is impossible
            tank = 0
        }
    }

    if total < 0 {
        return -1
    }
    return start
}`,
      },
      {
        name: "Keep the flexible option",
        filename: "lemonade.go",
        note: "Spend the least useful thing first. Hold on to what fits everywhere.",
        code: `func lemonadeChange(bills []int) bool {
    five, ten := 0, 0

    for _, b := range bills {
        switch b {
        case 5:
            five++
        case 10:
            if five == 0 {
                return false
            }
            five--
            ten++
        default: // 20
            if ten > 0 && five > 0 {
                ten--
                five-- // prefer using the 10
            } else if five >= 3 {
                five -= 3
            } else {
                return false
            }
        }
    }
    return true
}`,
      },
    ],
    complexity: [
      { label: "Time", value: "O(n)" },
      { label: "Space", value: "O(1)" },
    ],
    why: "In gas station, if the tank goes negative at index i, then every start between the last restart and i also fails: each of those begins partway through a stretch that was already not negative, so it can only be worse. That is why one pass replaces trying all n starts.",
    variations: [
      { name: "Two-directional sweeps", detail: "When constraints point both ways, sweep left to right and then right to left." },
      { name: "Running minimum", detail: "Best-time-to-buy-stock is this pattern: track the minimum so far." },
      { name: "Jump as BFS", detail: "Recognising the level structure is what makes jump-game-II O(n)." },
    ],
    mistakes: [
      { title: "Resetting at i instead of i+1", detail: "The failing index itself cannot be the new start." },
      { title: "Iterating to the last index in jump-game-II", detail: "Arriving at the last index needs no further jump; stop at n-2." },
      { title: "Forgetting the global feasibility check", detail: "In gas station, a valid start exists only if the total is non-negative." },
    ],
    related: ["greedy-sorting", "linear-dp", "graph-bfs", "subarray-substring"],
    problems: [55, 45, 134, 135, 860, 121, 53],
  },
];
