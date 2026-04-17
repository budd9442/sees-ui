export type CatalogModule = {
    module_id: string;
    code: string;
    name: string;
    // For downstream mapping into semesters
    semester_number?: number | null;
    semester_id?: string | null;
    specialization_id?: string | null;
};

function normalizeDash(s: string) {
    // Unify common dash variants to a plain hyphen.
    return s.replace(/[‐‑‒–—―]/g, '-');
}

export function normalizeLmsCourseCode(code: string) {
    // Digits remain significant; we only normalize whitespace and dash variants.
    const s = normalizeDash(String(code ?? ''))
        .toUpperCase()
        .trim()
        // Most guidebook/module codes store "ACLT11013" style without spaces,
        // while LMS uses "ACLT 11013". Remove all whitespace so both match.
        .replace(/\s+/g, '')
        // Treat dashes as separators only.
        .replace(/-+/g, '');

    return s;
}

export function normalizeLmsCourseName(name: string) {
    return normalizeDash(String(name ?? ''))
        .toUpperCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\s*-\s*/g, '-')
        // Special-case: keep PPD 1 vs PPD2 distinct.
        .replace(/\bPPD\s*(\d)\b/g, 'PPD$1');
}

export function matchByCodeOrName(params: {
    lmsCourseCode: string;
    lmsCourseName: string;
    catalog: CatalogModule[];
}): { matched: true; module: CatalogModule } | { matched: false } {
    const codeNeedle = normalizeLmsCourseCode(params.lmsCourseCode);
    if (codeNeedle) {
        const codeHit = params.catalog.find((m) => normalizeLmsCourseCode(m.code) === codeNeedle);
        if (codeHit) return { matched: true, module: codeHit };
    }

    const nameNeedle = normalizeLmsCourseName(params.lmsCourseName);
    if (nameNeedle) {
        const nameHit = params.catalog.find((m) => normalizeLmsCourseName(m.name) === nameNeedle);
        if (nameHit) return { matched: true, module: nameHit };
    }

    return { matched: false };
}

