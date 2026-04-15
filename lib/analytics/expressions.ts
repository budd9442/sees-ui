/**
 * Safe calculated "measure" expressions: numbers, + - * / parentheses, and
 * placeholders [field] resolved from a numeric row object (no eval).
 */
const TOKEN = /(\s+|[0-9]+\.?[0-9]*|[+\-*/()]|\[[a-zA-Z0-9_]+\])/g;

function tokenize(expr: string): string[] {
    const out: string[] = [];
    let m: RegExpExecArray | null;
    const re = new RegExp(TOKEN.source, 'g');
    let last = 0;
    while ((m = re.exec(expr)) !== null) {
        if (m.index > last) {
            const gap = expr.slice(last, m.index).trim();
            if (gap) throw new Error(`Invalid expression: unexpected "${gap}"`);
        }
        const t = m[0].trim();
        if (t) out.push(t);
        last = re.lastIndex;
    }
    if (last < expr.length) {
        const gap = expr.slice(last).trim();
        if (gap) throw new Error(`Invalid expression: unexpected "${gap}"`);
    }
    return out;
}

function toRpn(tokens: string[]): string[] {
    const prec: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const out: string[] = [];
    const ops: string[] = [];
    for (const t of tokens) {
        if (/^[0-9]/.test(t) || /^\[[a-zA-Z0-9_]+\]$/.test(t)) {
            out.push(t);
            continue;
        }
        if (t === '(') {
            ops.push(t);
            continue;
        }
        if (t === ')') {
            while (ops.length && ops[ops.length - 1] !== '(') out.push(ops.pop()!);
            if (!ops.length || ops.pop() !== '(') throw new Error('Mismatched parentheses');
            continue;
        }
        if ('+-*/'.includes(t)) {
            while (ops.length && prec[ops[ops.length - 1]] >= prec[t]) {
                const o = ops.pop()!;
                if (o === '(') break;
                out.push(o);
            }
            ops.push(t);
            continue;
        }
        throw new Error(`Invalid token: ${t}`);
    }
    while (ops.length) {
        const o = ops.pop()!;
        if (o === '(') throw new Error('Mismatched parentheses');
        out.push(o);
    }
    return out;
}

function resolveField(token: string, row: Record<string, number>): number {
    const m = token.match(/^\[([a-zA-Z0-9_]+)\]$/);
    if (!m) throw new Error('Expected [field]');
    const v = row[m[1]];
    if (typeof v !== 'number' || Number.isNaN(v)) throw new Error(`Missing numeric field: ${m[1]}`);
    return v;
}

export function evaluateMeasureExpression(expr: string, row: Record<string, number>): number {
    const tokens = tokenize(expr);
    if (!tokens.length) throw new Error('Empty expression');
    const rpn = toRpn(tokens);
    const stack: number[] = [];
    for (const t of rpn) {
        if (/^[0-9]/.test(t)) {
            stack.push(parseFloat(t));
            continue;
        }
        if (/^\[[a-zA-Z0-9_]+\]$/.test(t)) {
            stack.push(resolveField(t, row));
            continue;
        }
        if ('+-*/'.includes(t)) {
            const b = stack.pop();
            const a = stack.pop();
            if (a === undefined || b === undefined) throw new Error('Invalid expression');
            if (t === '+') stack.push(a + b);
            else if (t === '-') stack.push(a - b);
            else if (t === '*') stack.push(a * b);
            else stack.push(b === 0 ? NaN : a / b);
            continue;
        }
        throw new Error(`Invalid RPN token: ${t}`);
    }
    if (stack.length !== 1) throw new Error('Invalid expression');
    const r = stack[0];
    if (Number.isNaN(r)) throw new Error('Result is NaN');
    return r;
}
