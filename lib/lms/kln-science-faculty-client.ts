/**
 * KLN Science Faculty "sfkn.aspx" scraper for registration + grades.
 *
 * Implementation notes:
 * - This is ASP.NET Web Forms, so we must carry `__VIEWSTATE` and
 *   `__EVENTVALIDATION` across postbacks.
 * - Year navigation is done by posting `__EVENTTARGET` (FirstYearResultBT,
 *   SecondYearResultBT, ...).
 */

export type LmsModuleRow = {
    courseCode: string;
    courseName: string;
    acYear: string;
    attempt: string;
    examStatus: string;
    examNote: string;
    grade: string;
};

export type LmsYearResult = {
    year: 1 | 2 | 3 | 4;
    rows: LmsModuleRow[];
};

export type LmsStudentInfo = {
    nameWithInitial: string | null;
    fullName: string | null;
    universityId: string | null;
    handbookAcademicYear: string | null;
};

export type LmsKlnScrapeResult = {
    lmsStudent: LmsStudentInfo;
    years: Record<1 | 2 | 3 | 4, LmsYearResult>;
};

const START_URL =
    'http://www.science.kln.ac.lk:8080/sfkn.aspx';

// ASP.NET postback event targets + GridView table IDs.
const YEAR_CONTROLS = [
    { year: 1 as const, eventTarget: 'FirstYearResultBT', tableId: 'GV_FirstYearResult' },
    { year: 2 as const, eventTarget: 'SecondYearResultBT', tableId: 'GV_SecondYearResult' },
    { year: 3 as const, eventTarget: 'ThirdYearResultBT', tableId: 'GV_ThirdYearResult' },
    { year: 4 as const, eventTarget: 'FourthYearResultBT', tableId: 'GV_FourthYearResult' },
];

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

function decodeHtmlEntities(s: string) {
    if (!s) return '';
    let out = s;
    out = out.replace(/&nbsp;/gi, ' ');
    out = out.replace(/&amp;/gi, '&');
    out = out.replace(/&quot;/gi, '"');
    out = out.replace(/&#39;/gi, "'");
    out = out.replace(/&#(\d+);/g, (_, n) => {
        const codePoint = Number(n);
        if (!Number.isFinite(codePoint)) return '';
        try {
            return String.fromCharCode(codePoint);
        } catch {
            return '';
        }
    });
    return out.replace(/\s+/g, ' ').trim();
}

function stripTags(html: string) {
    return html.replace(/<[^>]+>/g, ' ');
}

function normalizeText(s: string) {
    return decodeHtmlEntities(stripTags(s));
}

function extractStudentInfoFromHtml(html: string): LmsStudentInfo {
    const text = normalizeText(html);

    const between = (re: RegExp) => {
        const m = text.match(re);
        return m ? m[1].trim() : null;
    };

    return {
        nameWithInitial: between(/Student Name with Initial\s*:\s*(.+?)\s*Student Full Name\s*:/i),
        fullName: between(/Student Full Name\s*:\s*(.+?)\s*Student University ID No\s*:/i),
        universityId: between(/Student University ID No\s*:\s*(.+?)\s*Relevant Student\s*hand Book/i),
        handbookAcademicYear: between(/Acadamic Year\s*:\s*(.+?)(?:\s*©|$)/i),
    };
}

function parseHiddenFields(html: string) {
    const getValue = (id: string) => {
        const m = html.match(new RegExp(`id="${id}"[^>]*value="([^"]*)"`, 'i'));
        return m ? m[1] : '';
    };

    return {
        __VIEWSTATE: getValue('__VIEWSTATE'),
        __VIEWSTATEGENERATOR: getValue('__VIEWSTATEGENERATOR'),
        __EVENTVALIDATION: getValue('__EVENTVALIDATION'),
    };
}

function parseGridViewTable(html: string, tableId: string) {
    const tableRe = new RegExp(
        `<table\\b[^>]*id="${tableId}"[^>]*>[\\s\\S]*?<\\/table>`,
        'i'
    );
    const tableMatch = html.match(tableRe);
    if (!tableMatch) return [] as LmsModuleRow[];

    const tableHtml = tableMatch[0];

    const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    const out: LmsModuleRow[] = [];

    for (const m of tableHtml.matchAll(rowRe)) {
        const rowHtml = m[1];
        const cellRe = /<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi;

        const cells: string[] = [];
        for (const cm of rowHtml.matchAll(cellRe)) {
            cells.push(decodeHtmlEntities(stripTags(cm[2])));
        }

        if (!cells.length) continue;
        if (cells.length !== 7) continue;
        if (/Course Code/i.test(cells[0])) continue;

        const [courseCode, courseName, acYear, attempt, examStatus, examNote, grade] = cells;
        out.push({
            courseCode: courseCode || '',
            courseName: courseName || '',
            acYear: acYear || '',
            attempt: attempt || '',
            examStatus: examStatus || '',
            examNote: examNote || '',
            grade: grade || '',
        });
    }

    return out;
}

function dedupeRows(rows: LmsModuleRow[]): LmsModuleRow[] {
    const map = new Map<string, LmsModuleRow>();

    const norm = (s: string) => String(s ?? '').trim();
    const scoreRow = (r: LmsModuleRow) => {
        const courseNameScore = norm(r.courseName) ? Math.min(3, norm(r.courseName).length / 25) : 0;
        const examStatusScore = norm(r.examStatus) ? 1 : 0;
        const examNoteScore = norm(r.examNote) ? 1 : 0;
        const gradeScore = norm(r.grade) ? 1 : 0;
        return courseNameScore + examStatusScore + examNoteScore + gradeScore;
    };

    for (const r of rows) {
        const key = [
            norm(r.courseCode).toUpperCase(),
            norm(r.acYear),
            norm(r.attempt),
            norm(r.examStatus),
            norm(r.examNote),
            norm(r.grade),
        ].join('|');

        const prev = map.get(key);
        if (!prev) {
            map.set(key, r);
            continue;
        }

        if (scoreRow(r) > scoreRow(prev)) map.set(key, r);
    }

    return [...map.values()];
}

async function fetchText(url: string, opts?: RequestInit) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
        const res = await fetch(url, {
            ...opts,
            signal: controller.signal,
        });
        const text = await res.text();
        return { res, html: text };
    } finally {
        clearTimeout(timeout);
    }
}

export async function fetchKlnScienceFacultyRegistrationYears(params: {
    username: string;
    password: string;
    onStage?: (stage: string, progressPct: number) => void;
}): Promise<LmsKlnScrapeResult> {
    let lastErr: unknown = null;

    // The LMS might be flaky; retry the whole scrape.
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const loginGet = await fetchText(START_URL, { redirect: 'follow' });
            const hidden = parseHiddenFields(loginGet.html);
            if (!hidden.__VIEWSTATE || !hidden.__EVENTVALIDATION) {
                throw new Error('Failed to parse ASP.NET hidden fields from LMS login page.');
            }

            const body = new URLSearchParams({
                '__EVENTTARGET': '',
                '__EVENTARGUMENT': '',
                '__VIEWSTATE': hidden.__VIEWSTATE,
                '__VIEWSTATEGENERATOR': hidden.__VIEWSTATEGENERATOR,
                '__EVENTVALIDATION': hidden.__EVENTVALIDATION,
                Usernametxt: params.username,
                PasswordTxt: params.password,
                LoginBT: 'Sign in',
            });

            const loginPost = await fetchText(loginGet.res.url, {
                method: 'POST',
                redirect: 'follow',
                headers: { 'content-type': 'application/x-www-form-urlencoded', referer: loginGet.res.url },
                body: body.toString(),
            });

            // If still shows login fields, treat as login failure.
            if (/(name="Usernametxt"|id="Usernametxt"|name="PasswordTxt"|id="PasswordTxt")/i.test(loginPost.html)) {
                throw new Error('LMS login appears to have failed (still shows username/password inputs).');
            }

            let lmsStudent = extractStudentInfoFromHtml(loginPost.html);

            let pageUrl = loginPost.res.url;
            let pageHtml = loginPost.html;

            const years = {} as Record<1 | 2 | 3 | 4, LmsYearResult>;
            for (const yc of YEAR_CONTROLS) {
                params.onStage?.(`FETCH_YEAR_${yc.year}`, 10 + yc.year * 20);
                const hiddenNow = parseHiddenFields(pageHtml);
                if (!hiddenNow.__VIEWSTATE || !hiddenNow.__EVENTVALIDATION) {
                    throw new Error('Could not parse ASP.NET hidden fields from year page (viewstate expired).');
                }
                const yearBody = new URLSearchParams({
                    '__EVENTTARGET': yc.eventTarget,
                    '__EVENTARGUMENT': '',
                    '__VIEWSTATE': hiddenNow.__VIEWSTATE,
                    '__VIEWSTATEGENERATOR': hiddenNow.__VIEWSTATEGENERATOR,
                    '__EVENTVALIDATION': hiddenNow.__EVENTVALIDATION,
                });

                const yearPost = await fetchText(pageUrl, {
                    method: 'POST',
                    redirect: 'follow',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        referer: pageUrl,
                    },
                    body: yearBody.toString(),
                });

                const rows = dedupeRows(parseGridViewTable(yearPost.html, yc.tableId));

                // For Year 1-3, a missing GridView likely means we posted with invalid viewstate.
                // Year 4 can legitimately be empty (Level 3 rule), so we only require the scrape succeeded.
                const tableFound = new RegExp(`<table\\b[^>]*id="${yc.tableId}"`, 'i').test(yearPost.html);
                if (yc.year !== 4 && !tableFound) {
                    throw new Error(`Missing LMS GridView table (${yc.tableId}) for year ${yc.year}.`);
                }
                if (yc.year !== 4 && rows.length === 0) {
                    throw new Error(`Failed to parse any LMS rows for year ${yc.year} (${yc.tableId}).`);
                }

                // Student footer sometimes isn't present on the immediate login response.
                if (yc.year === 1 && (!lmsStudent?.universityId || !lmsStudent?.fullName)) {
                    const parsedStudent = extractStudentInfoFromHtml(yearPost.html);
                    if (parsedStudent) lmsStudent = parsedStudent;
                }
                years[yc.year] = { year: yc.year, rows };

                pageUrl = yearPost.res.url;
                pageHtml = yearPost.html;
            }

            const totalCoreRows = years[1].rows.length + years[2].rows.length + years[3].rows.length;
            if (totalCoreRows === 0) {
                throw new Error('Scrape produced zero parsed rows for Years 1-3 (parsing likely failed).');
            }

            return { lmsStudent, years };
        } catch (e) {
            lastErr = e;
            if (attempt < 3) await sleep(900 * attempt);
        }
    }

    throw lastErr instanceof Error ? lastErr : new Error('LMS scrape failed');
}

