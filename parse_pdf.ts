
import fs from 'fs';
import path from 'path';

const text = fs.readFileSync('guide_book_text.txt', 'utf-8');
const lines = text.split('\n');

const programs: any[] = [];
const modules: Record<string, any> = {};

let currentProgram: any = null;
let currentYear: number = 0;
let currentSemester: number = 0;

// Regex patterns
const programStartRegex = /(B\.Sc\.|Bachelor of Science) Honours in (Management and Information Technology|Information Technology)/i;
const yearRegex = /Year of Study\s+(\d+)/i;
const tableHeaderRegex = /Course Code.*Course.*Semester.*Credits/i;
// INTE 11213 Fundamentals of Computing 1 3 C
// MGTE 11233 Business Statistics and Economics 1 3 C
// Note: Sometimes the title spans multiple lines. Code is usually 4 letters + space + 5 digits.
const moduleLineRegex = /^([A-Z]{4}\s\d{5}[ab]?)\s+(.+?)\s+(\d+(?:\s?&\s?\d+)?|1\s?OR\s?2)\s+(\d+)\s+([CO].*)/i;
// Matches: Code (Group 1), Title (Group 2), Semester (Group 3), Credits (Group 4), Type (Group 5)

// Additional regex for detailed module info later in the file
const courseCodeRegex = /^Course Code\s+([A-Z]{4}\s\d{5}[ab]?)/i;
const courseNameRegex = /^Course Name\s+(.+)/i;
// We can extract descriptions if needed, but the structure is the main priority for now.

function parse() {
    // 1. First pass: Identify Programs and Structure from tables
    // The text has tables like "Table 1. Detailed programme structure..."
    // We can assume the order in file: MIT -> IT

    // Quick fix: Hardcode extraction of MIT and IT blocks based on known text markers
    // MIT starts early. IT starts around line 231 "B.Sc. Honours in Information Technology Degree Programme"

    const mitProgram = {
        name: "B.Sc. Honours in Management and Information Technology",
        code: "MIT",
        structure: [] as any[]
    };

    const itProgram = {
        name: "B.Sc. Honours in Information Technology",
        code: "IT",
        structure: [] as any[]
    };

    programs.push(mitProgram);
    programs.push(itProgram);

    let activeProgram = mitProgram;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Switch program
        if (line.includes("B.Sc. Honours in Information Technology Degree Programme")) {
            activeProgram = itProgram;
        }

        // Detect Year
        const yearMatch = line.match(yearRegex);
        if (yearMatch) {
            currentYear = parseInt(yearMatch[1]);
        }

        // Detect Module Line
        const moduleMatch = line.match(moduleLineRegex);
        if (moduleMatch && currentYear > 0) {
            const code = moduleMatch[1].trim();
            const name = moduleMatch[2].trim();
            let semesterStr = moduleMatch[3].trim(); // "1", "2", "1 & 2", "1 OR 2"
            const credits = parseInt(moduleMatch[4].trim());
            const typeStr = moduleMatch[5].trim();

            // Normalize semester
            let semesters = [];
            if (semesterStr.includes('&') || semesterStr.toLowerCase().includes('or')) {
                semesters = [1, 2]; // Valid for both or covers full year
            } else {
                semesters = [parseInt(semesterStr)];
            }
            if (isNaN(semesters[0])) semesters = [1]; // Fallback

            // Determine type (Compulsory vs Optional)
            // The string might be "C", "O", "C C C", "C O O" (for different specializations)
            // For simple seeding, we can store the raw type string or assume generic "Core" if "C" is present.
            let type = "ELECTIVE";
            if (typeStr.startsWith("C")) type = "CORE";

            // Add to modules list if not exists
            if (!modules[code]) {
                modules[code] = {
                    code,
                    name,
                    credits,
                    level: `L${currentYear}` // Approximate level from year
                };
            }

            // Add to structure
            semesters.forEach(sem => {
                activeProgram.structure.push({
                    year: currentYear,
                    semester: sem,
                    moduleCode: code,
                    type: type, // This might need refinement for specializations
                    rawType: typeStr // Keep raw to debug/refine
                });
            });
        }
    }

    // 2. Second pass (Optional): Enrich module details from "Detailed Course Modules" section
    // Can be done if we want descriptions. For now, structure is key.

    const output = {
        programs,
        modules: Object.values(modules)
    };

    fs.writeFileSync('guide_data.json', JSON.stringify(output, null, 2));
    console.log("Parsed guide_data.json");
}

parse();
