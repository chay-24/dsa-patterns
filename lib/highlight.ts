/**
 * A small Go tokenizer.
 *
 * Runs at build time inside server components, so the browser ships zero
 * highlighting JavaScript. It handles the subset of Go that appears in
 * algorithm templates — which is all of Go except generics edge cases.
 */

export type TokenType =
  | "plain"
  | "comment"
  | "keyword"
  | "type"
  | "func"
  | "string"
  | "number"
  | "punct";

export type Token = { t: TokenType; v: string };

const KEYWORDS = new Set([
  "break", "case", "chan", "const", "continue", "default", "defer", "else",
  "fallthrough", "for", "func", "go", "goto", "if", "import", "interface",
  "map", "package", "range", "return", "select", "struct", "switch", "type",
  "var",
]);

const TYPES = new Set([
  "int", "int8", "int16", "int32", "int64",
  "uint", "uint8", "uint16", "uint32", "uint64", "uintptr",
  "float32", "float64", "complex64", "complex128",
  "string", "bool", "byte", "rune", "error", "any",
  "nil", "true", "false", "iota",
  "len", "cap", "make", "new", "append", "copy", "delete",
  "panic", "recover", "print", "println", "close", "complex", "real", "imag",
  "min", "max", "clear",
]);

const IDENT_START = /[A-Za-z_]/;
const IDENT_PART = /[A-Za-z0-9_]/;
const DIGIT = /[0-9]/;
const PUNCT = new Set([
  "{", "}", "(", ")", "[", "]", ",", ";", ":", ".",
  "+", "-", "*", "/", "%", "=", "<", ">", "!", "&", "|", "^", "~", "?",
]);

export function tokenizeGo(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  const n = src.length;

  const push = (t: TokenType, v: string) => {
    if (!v) return;
    const last = out[out.length - 1];
    if (last && last.t === t) last.v += v;
    else out.push({ t, v });
  };

  while (i < n) {
    const c = src[i];

    // line comment
    if (c === "/" && src[i + 1] === "/") {
      let j = i;
      while (j < n && src[j] !== "\n") j++;
      push("comment", src.slice(i, j));
      i = j;
      continue;
    }

    // block comment
    if (c === "/" && src[i + 1] === "*") {
      let j = i + 2;
      while (j < n && !(src[j] === "*" && src[j + 1] === "/")) j++;
      j = Math.min(j + 2, n);
      push("comment", src.slice(i, j));
      i = j;
      continue;
    }

    // interpreted string or rune literal
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c) {
        if (src[j] === "\\") j++;
        if (src[j] === "\n") break;
        j++;
      }
      j = Math.min(j + 1, n);
      push("string", src.slice(i, j));
      i = j;
      continue;
    }

    // number
    if (DIGIT.test(c) || (c === "." && DIGIT.test(src[i + 1] ?? ""))) {
      let j = i;
      while (j < n && /[0-9a-fA-FxXoObB._]/.test(src[j])) {
        // stop at a dot that starts a selector rather than a decimal point
        if (src[j] === "." && !DIGIT.test(src[j + 1] ?? "")) break;
        j++;
      }
      // exponent
      if (/[eE]/.test(src[j] ?? "") && /[-+0-9]/.test(src[j + 1] ?? "")) {
        j += 2;
        while (j < n && DIGIT.test(src[j])) j++;
      }
      push("number", src.slice(i, j));
      i = j;
      continue;
    }

    // identifier or keyword
    if (IDENT_START.test(c)) {
      let j = i;
      while (j < n && IDENT_PART.test(src[j])) j++;
      const word = src.slice(i, j);

      // look ahead for a call or declaration
      let k = j;
      while (k < n && (src[k] === " " || src[k] === "\t")) k++;
      const isCall = src[k] === "(";

      if (KEYWORDS.has(word)) push("keyword", word);
      else if (TYPES.has(word)) push("type", word);
      else if (isCall) push("func", word);
      else push("plain", word);

      i = j;
      continue;
    }

    if (PUNCT.has(c)) {
      push("punct", c);
      i++;
      continue;
    }

    push("plain", c);
    i++;
  }

  return out;
}

/** Split tokens into lines so line numbers can be rendered. */
export function tokenizeGoLines(src: string): Token[][] {
  const lines: Token[][] = [[]];

  for (const tok of tokenizeGo(src)) {
    const parts = tok.v.split("\n");
    parts.forEach((part, idx) => {
      if (idx > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ t: tok.t, v: part });
    });
  }

  // drop a trailing blank line
  if (lines.length > 1 && lines[lines.length - 1].length === 0) lines.pop();
  return lines;
}

export const tokenClass: Record<TokenType, string> = {
  plain: "text-[#e4e4e7]",
  comment: "text-[#52525b] italic",
  keyword: "text-[#c4b5fd]",
  type: "text-[#93c5fd]",
  func: "text-[#a3e635]",
  string: "text-[#86efac]",
  number: "text-[#fbbf24]",
  punct: "text-[#71717a]",
};
