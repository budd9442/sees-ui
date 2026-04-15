/**
 * Helpers for relative time windows (used by analytics filters / future compiler).
 */

export function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, n: number) {
    return new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
}

export function monthsBetweenInclusive(start: Date, end: Date): Date[] {
    const out: Date[] = [];
    let cur = startOfMonth(start);
    const endM = startOfMonth(end);
    while (cur <= endM) {
        out.push(new Date(cur));
        cur = addMonths(cur, 1);
    }
    return out;
}
