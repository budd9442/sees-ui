#!/usr/bin/env node
/**
 * Extracts the 4 year registration tables from:
 *  http://www.science.kln.ac.lk:8080/(S(m1v2h3jkc5xguxlh40axodgm))/sfkn.aspx
 *
 * Notes:
 * - This is ASP.NET Web Forms (uses __VIEWSTATE / __EVENTVALIDATION and __doPostBack-like event targets).
 * - Run only with credentials you are authorized to use.
 */

const fs = require("fs");
const path = require("path");

const START_URL =
  "http://www.science.kln.ac.lk:8080/(S(m1v2h3jkc5xguxlh40axodgm))/sfkn.aspx";

// ASP.NET postback event targets + the corresponding GridView table IDs.
const YEAR_CONTROLS = [
  { year: 1, eventTarget: "FirstYearResultBT", tableId: "GV_FirstYearResult" },
  { year: 2, eventTarget: "SecondYearResultBT", tableId: "GV_SecondYearResult" },
  { year: 3, eventTarget: "ThirdYearResultBT", tableId: "GV_ThirdYearResult" },
  { year: 4, eventTarget: "FourthYearResultBT", tableId: "GV_FourthYearResult" },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getEnvOrThrow(key) {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

function parseArgs(argv) {
  const out = {
    retries: 3,
    outDir: path.join(process.cwd(), "analysis"),
    writeJson: true,
    writeCsv: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--retries") out.retries = Number(argv[++i]);
    else if (a === "--outDir") out.outDir = argv[++i];
    else if (a === "--no-json") out.writeJson = false;
    else if (a === "--csv") out.writeCsv = true;
    else if (a === "--retries-wait") out.retriesWaitMs = Number(argv[++i]);
    else if (a === "--help") {
      // eslint-disable-next-line no-console
      console.log(
        [
          "Usage:",
          "  CAL_USN='...' CAL_PASS='...' node scripts/extract-kln-registration-years.js [--retries N] [--outDir PATH] [--csv]",
          "",
          "Env vars:",
          "  CAL_USN, CAL_PASS (defaults; for Kelaniya credentials)",
          "",
          "Outputs:",
          "  analysis/kln-registration-years-<YYYY-MM-DD>.json",
          "  (optional) analysis/kln-registration-years-<YYYY-MM-DD>.csv",
        ].join("\n")
      );
      process.exit(0);
    }
  }

  return out;
}

function decodeHtmlEntities(s) {
  if (!s) return "";
  let out = s;
  out = out.replace(/&nbsp;/gi, " ");
  out = out.replace(/&amp;/gi, "&");
  out = out.replace(/&quot;/gi, '"');
  out = out.replace(/&#39;/gi, "'");

  // Numeric entities: &#12345;
  out = out.replace(/&#(\d+);/g, (_, n) => {
    const codePoint = Number(n);
    if (!Number.isFinite(codePoint)) return "";
    try {
      return String.fromCharCode(codePoint);
    } catch {
      return "";
    }
  });

  // Cleanup
  return out.replace(/\s+/g, " ").trim();
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, " ");
}

function normalizeText(s) {
  return String(s ?? "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractStudentInfo(html) {
  const text = normalizeText(stripTags(html));

  const between = (re) => {
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

function parseHiddenFields(html) {
  const getValue = (id) => {
    const m = html.match(new RegExp(`id="${id}"[^>]*value="([^"]*)"`, "i"));
    return m ? m[1] : "";
  };

  return {
    "__VIEWSTATE": getValue("__VIEWSTATE"),
    "__VIEWSTATEGENERATOR": getValue("__VIEWSTATEGENERATOR"),
    "__EVENTVALIDATION": getValue("__EVENTVALIDATION"),
  };
}

function extractYearTotals(html, year) {
  // The page embeds totals as plain text within the HTML (after stripping tags becomes easy).
  const text = stripTags(html).replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();

  const grabNumberAfter = (labelRegex) => {
    const m = text.match(labelRegex);
    if (!m) return null;
    // First numeric-ish capture group
    return m[1] ?? null;
  };

  const totalCredit = grabNumberAfter(
    new RegExp(`Total Credit\\s*\\(\\s*${year}\\s*Year\\s*\\)\\s*[: ]?\\s*([0-9.]+)`, "i")
  );

  const nonGpaValue = grabNumberAfter(
    new RegExp(
      `Non\\s*GPA\\s*\\/\\s*Credit\\s*Not\\s*Count\\s*for\\s*GPA\\s*\\(\\s*${year}\\s*Year\\s*\\)\\s*[: ]?\\s*([0-9.]+)`,
      "i"
    )
  );

  // Sometimes the table shows the label but not the numeric value yet.
  // If the label exists and we couldn't parse a number, treat it as 0.
  const nonGpaLabelExists = new RegExp(
    `Non\\s*GPA\\s*\\/\\s*Credit\\s*Not\\s*Count\\s*for\\s*GPA\\s*\\(\\s*${year}\\s*Year\\s*\\)`,
    "i"
  ).test(text);

  const totalCreditNonGpa = nonGpaValue ?? (nonGpaLabelExists ? "0" : null);

  // There may be multiple occurrences of `GPA (N Year)` inside the line; use the last match.
  const gpa = (() => {
    const re = new RegExp(
      `GPA\\s*\\(\\s*${year}\\s*Year\\s*\\)\\s*[: ]?\\s*([0-9.]+)`,
      "gi"
    );
    const matches = [...text.matchAll(re)].map((m) => m[1]).filter((v) => v !== undefined && v !== null);
    if (!matches.length) return null;
    return matches[matches.length - 1] ?? null;
  })();

  return { totalCredit, totalCreditNonGpa, gpa };
}

function parseGridViewTable(html, tableId) {
  // Extract the specific grid table (e.g. id="GV_FirstYearResult").
  const tableRe = new RegExp(
    `<table\\b[^>]*id="${tableId}"[^>]*>[\\s\\S]*?<\\/table>`,
    "i"
  );
  const tableMatch = html.match(tableRe);
  if (!tableMatch) return { rows: [], raw: "" };

  const tableHtml = tableMatch[0];

  // Extract rows.
  const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows = [];

  for (const m of tableHtml.matchAll(rowRe)) {
    const rowHtml = m[1];

    // Extract td/th cells in order.
    const cellRe = /<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi;
    const cells = [];
    for (const cm of rowHtml.matchAll(cellRe)) {
      cells.push(decodeHtmlEntities(stripTags(cm[2])));
    }

    // Header row has "Course Code" etc.
    if (!cells.length) continue;
    if (cells.length !== 7) continue;
    if (/Course Code/i.test(cells[0])) continue;

    const [courseCode, courseName, acYear, attempt, examStatus, examNote, grade] = cells;
    rows.push({
      courseCode: courseCode || "",
      courseName: courseName || "",
      acYear: acYear || "",
      attempt: attempt || "",
      examStatus: examStatus || "",
      examNote: examNote || "",
      grade: grade || "",
    });
  }

  return { rows, raw: tableHtml };
}

function dedupeRows(rows) {
  // The table sometimes repeats the same course row with different casing,
  // and occasionally one duplicate has an empty `courseName` (ex: `&nbsp;`).
  // Deduplicate by stable identifiers, but prefer the "more complete" row.
  const map = new Map();

  const norm = (s) => String(s ?? "").trim();
  const scoreRow = (r) => {
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
    ].join("|");

    const prev = map.get(key);
    if (!prev) {
      map.set(key, r);
      continue;
    }

    // Replace if the new row is more complete.
    if (scoreRow(r) > scoreRow(prev)) map.set(key, r);
  }

  return [...map.values()];
}

async function fetchText(url, opts) {
  const res = await fetch(url, opts);
  const html = await res.text();
  return { res, html };
}

async function login({ usn, pass, retries }) {
  let lastErr = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const startRes = await fetchText(START_URL, { redirect: "follow" });

      const hidden = parseHiddenFields(startRes.html);
      if (!hidden.__VIEWSTATE || !hidden.__EVENTVALIDATION) {
        throw new Error("Could not parse ASP.NET hidden fields from login page.");
      }

      const body = new URLSearchParams({
        "__EVENTTARGET": "",
        "__EVENTARGUMENT": "",
        "__VIEWSTATE": hidden.__VIEWSTATE,
        "__VIEWSTATEGENERATOR": hidden.__VIEWSTATEGENERATOR,
        "__EVENTVALIDATION": hidden.__EVENTVALIDATION,
        "Usernametxt": usn,
        "PasswordTxt": pass,
        "LoginBT": "Sign in",
      });

      const postRes = await fetch(startRes.res.url, {
        method: "POST",
        redirect: "follow",
        headers: { "content-type": "application/x-www-form-urlencoded", referer: startRes.res.url },
        body,
      });

      const authedHtml = await postRes.text();
      // If still shows login form, treat as login failure.
      if (/(name="Usernametxt"|id="Usernametxt")/i.test(authedHtml)) {
        throw new Error("Login appears to have failed (still shows username/password inputs).");
      }

      return { authedUrl: postRes.url, authedHtml };
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await sleep(800 * attempt);
    }
  }

  throw lastErr || new Error("Login failed.");
}

async function fetchYearTable({ pageUrl, pageHtml, eventTarget, tableId, year, retries, usn, pass }) {
  let lastErr = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const hidden = parseHiddenFields(pageHtml);
      if (!hidden.__VIEWSTATE || !hidden.__EVENTVALIDATION) {
        throw new Error("Could not parse ASP.NET hidden fields from current page.");
      }

      const body = new URLSearchParams({
        "__EVENTTARGET": eventTarget,
        "__EVENTARGUMENT": "",
        "__VIEWSTATE": hidden.__VIEWSTATE,
        "__VIEWSTATEGENERATOR": hidden.__VIEWSTATEGENERATOR,
        "__EVENTVALIDATION": hidden.__EVENTVALIDATION,
      });

      const postRes = await fetch(pageUrl, {
        method: "POST",
        redirect: "follow",
        headers: { "content-type": "application/x-www-form-urlencoded", referer: pageUrl },
        body,
      });

      const yearHtml = await postRes.text();
      const { rows } = parseGridViewTable(yearHtml, tableId);

      // Some students may not have a GridView for a later year yet. In that
      // case, we still return totals if present.
      const totals = extractYearTotals(yearHtml, year);
      return { rows: dedupeRows(rows), totals, yearHtml, finalUrl: postRes.url };
    } catch (e) {
      lastErr = e;
      // If it fails, re-login (viewstate may have expired).
      if (attempt < retries) {
        await sleep(800 * attempt);
        const relogin = await login({ usn, pass, retries: 1 });
        pageUrl = relogin.authedUrl;
        pageHtml = relogin.authedHtml;
      }
    }
  }

  throw lastErr || new Error("Year fetch failed.");
}

function toCsv(records, delimiter = ",") {
  const esc = (v) => {
    const s = String(v ?? "");
    if (/[\"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    if (/[,\r]/.test(s)) return `"${s}"`;
    return s;
  };

  const headers = [
    "year",
    "courseCode",
    "courseName",
    "acYear",
    "attempt",
    "examStatus",
    "examNote",
    "grade",
  ];
  const lines = [headers.join(delimiter)];

  for (const r of records) {
    lines.push(
      [
        r.year,
        r.courseCode,
        r.courseName,
        r.acYear,
        r.attempt,
        r.examStatus,
        r.examNote,
        r.grade,
      ].map(esc).join(delimiter)
    );
  }
  return lines.join("\n");
}

(async () => {
  const args = parseArgs(process.argv);
  const usn = getEnvOrThrow("CAL_USN");
  const pass = getEnvOrThrow("CAL_PASS");

  fs.mkdirSync(args.outDir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);

  const { authedUrl, authedHtml } = await login({ usn, pass, retries: args.retries });
  let student = extractStudentInfo(authedHtml);
  let pageUrl = authedUrl;
  let pageHtml = authedHtml;

  const out = {
    fetchedAt: new Date().toISOString(),
    authedUrl,
    student,
    years: {},
  };

  for (const yc of YEAR_CONTROLS) {
    // eslint-disable-next-line no-console
    console.log(`Fetching year ${yc.year} (${yc.tableId})...`);
    const year = await fetchYearTable({
      pageUrl,
      pageHtml,
      eventTarget: yc.eventTarget,
      tableId: yc.tableId,
      year: yc.year,
      retries: args.retries,
      usn,
      pass,
    });

    // Student footer sometimes isn't present on the immediate login response
    // (depends on server postback flow). If missing, parse it from the first
    // year page we successfully fetch.
    if ((!out.student?.fullName || !out.student?.universityId) && year?.yearHtml) {
      const parsedStudent = extractStudentInfo(year.yearHtml);
      out.student = parsedStudent || out.student;
    }

    out.years[String(yc.year)] = {
      totals: year.totals,
      rows: year.rows,
    };

    // Next postback can use the newly returned page/viewstate.
    pageUrl = year.finalUrl;
    pageHtml = year.yearHtml;
  }

  const jsonPath = path.join(args.outDir, `kln-registration-years-${date}.json`);
  if (args.writeJson) {
    fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2), "utf8");
    // eslint-disable-next-line no-console
    console.log(`Wrote ${jsonPath}`);
  }

  if (args.writeCsv) {
    const flat = [];
    for (const yc of YEAR_CONTROLS) {
      const yr = out.years[String(yc.year)];
      for (const r of yr.rows) flat.push({ year: yc.year, ...r });
    }
    const csvPath = path.join(args.outDir, `kln-registration-years-${date}.csv`);
    fs.writeFileSync(csvPath, toCsv(flat), "utf8");
    // eslint-disable-next-line no-console
    console.log(`Wrote ${csvPath}`);
  }
})();

