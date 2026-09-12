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
        "Greedy = sort + one pass.",
        "The sort key IS the algorithm — get that right and the pass is trivial.",
        "Justify it with an exchange argument, not with examples.",
      ],
      diagram: `  unsorted → which choice is safe? unclear

  sorted by the right key
      ▼
  take the first, commit, move on

  proof: any optimal solution can be
  rewritten to start with this choice`,
      key: "If you cannot state why the first choice is safe, it is probably DP, not greedy.",
    },
    templates: [
      {
        name: "Two-sequence matching",
        filename: "assign_cookies.go",
        note: "Sort both, then advance whichever pointer can still be satisfied.",
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
        note: "The comparator encodes the objective: a before b iff a+b > b+a.",
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
        note: "Place the tallest first: later, shorter insertions cannot disturb their counts.",
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
        note: "When constraints point both ways, satisfy each direction in its own pass and take the max.",
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
      { title: "A comparator that is not a strict ordering", detail: "sort.Slice can misbehave when less() is not antisymmetric." },
      { title: "Sorting when positions matter", detail: "If the answer is an index into the original array, sort pairs, not values." },
      { title: "Skipping the proof", detail: "Passing a few examples is not evidence; find the exchange argument." },
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
        "Sort by the dimension that gates availability — time, capital, deadline.",
        "Sweep, pushing everything that has become available into the heap.",
        "Take the heap's best. Optionally push back the thing you displaced.",
      ],
      diagram: `  sort by availability
      │
      ▼  sweep
  push newly available ──▶ [ heap ]
                              │
                          pop the best`,
      key: "Sorting handles 'what is allowed'; the heap handles 'what is best'.",
    },
    templates: [
      {
        name: "Availability sweep",
        filename: "ipo.go",
        note: "Two orderings at once: sorted by capital, heap by profit.",
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
        note: "Spend the scarce resource freely, then demote the smallest use when you run out.",
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
        note: "Always place the most frequent character that is not the one just placed.",
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
        "Maximise the count of non-overlapping intervals → sort by END.",
        "Merge overlapping intervals → sort by START.",
        "Count simultaneous intervals → sweep line over the endpoints.",
      ],
      diagram: `  sort by end:
  ├───┤
     ├─────┤          take the earliest finisher
        ├──┤          it leaves the most room
              ├───┤

  sort by start: extend or push`,
      key: "By end for counting, by start for merging. Mixing them is the classic error.",
    },
    templates: [
      {
        name: "Max non-overlapping",
        filename: "non_overlapping.go",
        note: "Earliest end first. Count what you keep; the answer is n minus that.",
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
        note: "Sort by start, then either extend the last interval or start a new one.",
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
        note: "Three phases: strictly before, overlapping (absorb), strictly after.",
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
        note: "Either a sweep over sorted events, or a min-heap of end times.",
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
    why: "Choosing the interval that finishes earliest is safe by an exchange argument: take any optimal schedule, and its first interval finishes no earlier than yours, so swapping yours in leaves at least as much room for the rest.",
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
    description: "The canonical greedy proof — and the template for arguing any greedy choice is safe.",
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
        "Pick the activity that finishes earliest.",
        "Discard everything that conflicts with it.",
        "Repeat on what remains.",
        "The proof: any optimal solution's first activity finishes no earlier, so swapping is safe.",
      ],
      diagram: `  exchange argument

  OPT:  ├─────┤ ├───┤ ├────┤
  ours: ├──┤   (finishes earlier)

  replace OPT's first with ours
  → still valid, still the same size
  → greedy is optimal by induction`,
      key: "Greedy needs the greedy-choice property plus optimal substructure. Say both out loud.",
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
        note: "Take everything; when the schedule breaks, drop the least valuable job taken so far.",
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
    why: "Greedy is correct when two properties hold. Greedy-choice: there is an optimal solution containing the greedy first choice — proved by exchange. Optimal substructure: after committing, the rest of the problem is the same problem on a smaller input.",
    variations: [
      { name: "Weighted activities", detail: "Greedy fails. Sort by end and DP with a binary search for the last compatible activity." },
      { name: "Multiple machines", detail: "Assign each activity to the machine that freed up earliest — a min-heap of release times." },
      { name: "Matroid view", detail: "Greedy is exactly optimal on matroids; recognising one is a shortcut to a proof." },
    ],
    mistakes: [
      { title: "Sorting by duration", detail: "Shortest-first is intuitive and wrong — it can block two compatible activities." },
      { title: "Sorting by start", detail: "A long first activity blocks everything after it." },
      { title: "Assuming greedy extends to weights", detail: "The exchange argument breaks the moment items are worth different amounts." },
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
        "Two tests. Downward closure: is every subset of a feasible set feasible?",
        "Exchange: if |A| < |B|, is there an element of B that A can absorb and stay feasible?",
        "Both true → sorting by weight and taking greedily is exactly optimal.",
      ],
      diagram: `  forests in a graph      → matroid → Kruskal is optimal
  intervals by end        → matroid-like → greedy optimal
  coin change {1,3,4}     → NOT → greedy fails
  weighted intervals      → NOT → needs DP`,
      key: "Cannot find the exchange argument in two minutes? Write the DP.",
    },
    templates: [
      {
        name: "Greedy on a matroid",
        filename: "matroid_greedy.go",
        note: "Sort by weight descending, take anything that keeps the set independent.",
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
        note: "Forests form the graphic matroid; DSU is the independence oracle.",
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
        note: "Keep these two counterexamples ready — they are the standard interview follow-up.",
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
      { name: "Graphic matroid", detail: "Independent sets are forests — this is why Kruskal works." },
      { name: "Uniform matroid", detail: "Any set of size at most k is independent — 'pick the k largest'." },
      { name: "Scheduling matroid", detail: "Sets of jobs that can all meet their deadlines — supports greedy with a heap." },
      { name: "Matroid intersection", detail: "Two matroids at once is polynomial; three is NP-hard." },
    ],
    mistakes: [
      { title: "Assuming greedy because it is simple", detail: "Test it on a small adversarial case before committing." },
      { title: "Confusing locally optimal with globally optimal", detail: "The exchange argument is what bridges them." },
      { title: "Ignoring weights", detail: "Unweighted problems are often greedy; adding weights usually breaks it." },
    ],
    related: ["activity-selection", "minimum-spanning-tree", "greedy-sorting", "local-global"],
    problems: [435, 1584, 621, 502],
  },
  {
    slug: "local-global",
    title: "Local → Global Optimisation",
    category: "greedy",
    description: "Sweep once, keeping a running invariant that guarantees the global answer.",
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
        "Carry one number: how far you can currently get.",
        "If the current index passes that, the answer is no.",
        "When a prefix fails, restarting after it is safe — nothing inside it can work either.",
      ],
      diagram: `  nums  2  3  1  1  4
  reach 2  4  4  4  8
        │
        i must never exceed reach

  jump count: reach a boundary → one more jump`,
      key: "Prove that failing at i invalidates every start before i. That is what makes one pass enough.",
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
        note: "Each jump covers an interval of indices — that interval is a BFS level.",
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
        note: "If the tank goes negative at i, no start in [start, i] can work.",
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
        note: "Spend the least flexible resource first; hold the versatile one.",
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
    why: "In the gas-station problem, if the running tank goes negative at index i, then every start from the previous start up to i also fails — because each of those starts begins with a suffix of an already non-negative prefix, so it can only be worse. That is why one pass suffices instead of trying all n starts.",
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
