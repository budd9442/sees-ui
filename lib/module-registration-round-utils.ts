/** Normalize e.g. "L2", "l2", "Level 2" -> "L2" */
export function normalizeStudentLevel(raw: string | null | undefined): string | null {
    if (!raw) return null;
    const t = raw.trim();
    const m = t.match(/^L\s*(\d+)$/i);
    if (m) return `L${m[1]}`;
    const m2 = t.match(/level\s*(\d+)/i);
    if (m2) return `L${m2[1]}`;
    return t;
}

export function levelsOverlap(a: string[], b: string[]): boolean {
    if (a.length === 0 || b.length === 0) return true;
    const na = a.map(x => normalizeStudentLevel(x) || x);
    const nb = b.map(x => normalizeStudentLevel(x) || x);
    return na.some(x => nb.includes(x));
}

export function studentMatchesRoundLevels(roundLevels: string[], studentLevel: string | null | undefined): boolean {
    if (roundLevels.length === 0) return true;
    const n = normalizeStudentLevel(studentLevel);
    if (!n) return false;
    return roundLevels.some(l => (normalizeStudentLevel(l) || l) === n);
}
