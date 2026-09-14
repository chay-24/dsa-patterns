export type Difficulty = "Easy" | "Medium" | "Hard";

export type CodeTemplate = {
  /** Short name shown in the tab strip, e.g. "Lower Bound". */
  name: string;
  /** Shown in the code block header, e.g. "lower_bound.go". */
  filename: string;
  /** One line of context above the code. Keep it to a single sentence. */
  note?: string;
  code: string;
};

export type ComplexityRow = {
  label: string;
  value: string;
  /** Optional one-line qualifier, e.g. "amortised over n pushes". */
  note?: string;
};

export type Variation = {
  name: string;
  detail: string;
};

export type Mistake = {
  title: string;
  detail: string;
};

export type Pattern = {
  slug: string;
  title: string;
  /** Category slug from data/categories.ts */
  category: string;
  /** One or two lines. Shown on cards and at the top of the detail page. */
  description: string;
  /** "Fixed · Variable · Frequency" — rendered as a dot-separated concept line. */
  concepts: string[];
  /** Bulleted "used for" list under the page title. */
  usedFor: string[];
  /** Short chips: the words in a problem statement that trigger this pattern. */
  signals: string[];
  /** The recognition checklist — full phrases, ticked. */
  recognition: string[];
  /** A sample question stem that should map to this pattern. */
  typicalQuestion?: string;
  /**
   * The lesson. Short paragraphs, written to a student who has never seen
   * this before: what you would try first, why it falls over, the one
   * observation that fixes it, and why the fix is correct.
   */
  teach: string[];
  mentalModel: {
    /** The recap: 2–5 short lines for revision. No paragraphs. */
    lines: string[];
    /** Monospace diagram. Rendered verbatim in a bordered block. */
    diagram?: string;
    /** The single sentence worth remembering. */
    key?: string;
  };
  templates: CodeTemplate[];
  complexity: ComplexityRow[];
  /** Expandable "why does this work?" text. Optional. */
  why?: string;
  variations: Variation[];
  mistakes: Mistake[];
  /** Slugs of related patterns. */
  related: string[];
  /** LeetCode ids, resolved against data/problems.ts */
  problems: number[];
};

export type Category = {
  slug: string;
  /** "01" */
  number: string;
  title: string;
  description: string;
  /** Short concept line for the category card. */
  concepts: string[];
};

export type Problem = {
  id: number;
  title: string;
  difficulty: Difficulty;
  /** LeetCode problem slug. The URL is derived from it. */
  leetcode: string;
  /** Pattern slugs. First one is treated as primary. */
  patterns: string[];
  /** LeetCode Premium: the link works but the problem is paywalled. */
  premium?: boolean;
  /** One line: why this problem belongs to that pattern. */
  note?: string;
  /** Optional deeper write-up shown on the problem page. */
  insight?: {
    why: string;
    key: string;
    code?: CodeTemplate;
  };
};

export type Snippet = {
  title: string;
  /** Cheatsheet section slug. */
  section: string;
  note?: string;
  code: string;
  /** Extra searchable keywords. */
  keywords?: string[];
};

export type DecisionNode = {
  id: string;
  /** A yes/no question, or a leaf with `pattern` set. */
  question?: string;
  hint?: string;
  yes?: string;
  no?: string;
  /** Leaf: the pattern slug this branch lands on. */
  pattern?: string;
  /** Leaf: extra candidate patterns worth a look. */
  alternates?: string[];
};
