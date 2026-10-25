import type { ReactNode } from 'react';

const KEYWORDS = new Set([
  // C / C++
  'if', 'else', 'for', 'while', 'do', 'return', 'switch', 'case', 'break', 'continue',
  'static', 'const', 'volatile', 'struct', 'union', 'enum', 'typedef', 'extern', 'inline',
  'sizeof', 'void', 'auto', 'class', 'namespace', 'template', 'constexpr', 'nullptr',
  'true', 'false', 'unsigned', 'signed',
  // Rust
  'fn', 'let', 'mut', 'impl', 'pub', 'use', 'mod', 'match', 'loop', 'in', 'as', 'unsafe',
  'move', 'ref', 'self', 'Self', 'trait', 'where', 'dyn', 'crate', 'super',
  // PHP / JavaScript
  'function', 'public', 'private', 'protected', 'new', 'echo', 'foreach', 'try', 'catch',
  'throw', 'finally', 'null', 'var', 'this', 'readonly', 'abstract', 'interface', 'extends',
  'implements', 'instanceof', 'typeof', 'async', 'await', 'import', 'export', 'from', 'of',
  'fn', 'isset', 'empty', 'array', 'undefined', 'elseif', 'endif',
]);

const TYPE_RE =
  /^(u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize|f32|f64|bool|char|str|int|long|short|float|double|size_t|u?int\d+_t|String|Vec|Option|Result|Some|None|Ok|Err)$/;

// comment | "string" | 'c' or 'php/js string' | number | #preprocessor | $php_var | ident | space | other
const TOKEN_RE =
  /(\/\/.*$|^\s*#(?![[!]|\s*(?:include|define|if|ifdef|ifndef|endif|else|pragma|undef)\b).*$|\{#.*?#\}|<!--.*?-->)|("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*'(?!\w))|(\b0x[0-9a-fA-F]+[uUlL]*\b|\b\d+(?:\.\d+)?[uUlLf]*\b)|(^\s*#\s*\w+)|(\$[A-Za-z_]\w*)|([A-Za-z_]\w*!?)|(\s+)|(.)/g;

function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let m: RegExpExecArray | null;
  let i = 0;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(line)) !== null) {
    const [tok, com, str, chr, num, pre, phpVar, ident] = m;
    let cls = '';
    if (com) cls = 'text-syn-com italic';
    else if (str || chr) cls = 'text-syn-str';
    else if (num) cls = 'text-syn-num';
    else if (pre) cls = 'text-syn-kw';
    else if (phpVar) cls = 'text-syn-type';
    else if (ident) {
      const next = line.slice(m.index + tok.length).trimStart()[0];
      if (ident.endsWith('!')) cls = 'text-syn-macro';
      else if (KEYWORDS.has(ident)) cls = 'text-syn-kw';
      else if (TYPE_RE.test(ident)) cls = 'text-syn-type';
      else if (next === '(') cls = 'text-syn-fn';
      else if (/^[A-Z][A-Z0-9_]+$/.test(ident)) cls = 'text-syn-macro';
    }
    out.push(cls ? <span key={i++} className={cls}>{tok}</span> : tok);
    if (tok.length === 0) TOKEN_RE.lastIndex++;
  }
  return out;
}

export type LineMark = 'picked-wrong' | 'answer' | 'diff-add' | 'diff-del' | undefined;

const markClass: Record<NonNullable<LineMark>, string> = {
  'picked-wrong': 'bg-bad/20 outline outline-1 outline-bad/60',
  answer: 'bg-ok/20 outline outline-1 outline-ok/60',
  'diff-add': 'bg-ok/10',
  'diff-del': 'bg-bad/10',
};

interface CodeProps {
  code: string;
  /** Unified diff: first char of each line is '+', '-' or ' '. */
  diff?: boolean;
  onLineClick?: (lineNo: number) => void;
  markLine?: (lineNo: number) => LineMark;
}

export function Code({ code, diff = false, onLineClick, markLine }: CodeProps) {
  const lines = code.split('\n');
  return (
    <div className="no-scrollbar overflow-x-auto rounded-xl border border-line bg-surface font-mono text-[12.5px] leading-[1.65]">
      <div className="min-w-max py-2">
        {lines.map((raw, idx) => {
          const n = idx + 1;
          const sign = diff ? raw[0] ?? ' ' : '';
          const text = diff ? raw.slice(1) : raw;
          const mark: LineMark = diff
            ? sign === '+'
              ? 'diff-add'
              : sign === '-'
                ? 'diff-del'
                : undefined
            : markLine?.(n);
          const Tag = onLineClick ? 'button' : 'div';
          return (
            <Tag
              key={idx}
              type={onLineClick ? 'button' : undefined}
              onClick={onLineClick ? () => onLineClick(n) : undefined}
              className={`flex w-full pr-4 text-left ${mark ? markClass[mark] : ''} ${
                onLineClick ? 'cursor-pointer active:bg-surface-2 hover:bg-surface-2/70' : ''
              }`}
            >
              <span className="w-9 shrink-0 select-none pr-3 text-right text-muted/50">
                {diff ? (sign === ' ' ? '' : sign) : n}
              </span>
              <span className="whitespace-pre">{highlight(text)}{text === '' ? ' ' : ''}</span>
            </Tag>
          );
        })}
      </div>
    </div>
  );
}
