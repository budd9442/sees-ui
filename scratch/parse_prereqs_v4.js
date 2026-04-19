import fs from 'fs';

const content = fs.readFileSync('d:\\dev\\sees-ui\\guide_book_text.txt', 'utf8');
const lines = content.split('\n');

const prerequisitesMapping = {};

let currentModuleCodes = [];

// Allow for optional suffix like 'a' or 'b'
const codeRegex = /[A-Z]{4}\s\d{5}[a-z]?/g;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('Course Code')) {
        const matches = line.match(codeRegex);
        if (matches) {
            currentModuleCodes = matches;
        } else {
            // Check next line if not on this line
            const nextLine = lines[i+1]?.trim();
            const nextMatches = nextLine?.match(codeRegex);
            if (nextMatches) {
                currentModuleCodes = nextMatches;
            }
        }
    } else if (line.startsWith('Pre-requisites') || line.startsWith('Pre-Requisites')) {
        const prereqText = line.replace(/Pre-requisites|Pre-Requisites/i, '').trim();
        if (currentModuleCodes.length > 0 && prereqText && prereqText.toLowerCase() !== 'none') {
            const prereqCodes = prereqText.match(codeRegex) || [];
            if (prereqCodes.length > 0) {
                currentModuleCodes.forEach(targetCode => {
                    if (!prerequisitesMapping[targetCode]) {
                        prerequisitesMapping[targetCode] = new Set();
                    }
                    prereqCodes.forEach(code => prerequisitesMapping[targetCode].add(code));
                });
            }
        }
    }
}

// Convert Sets to Arrays for JSON
const finalMapping = {};
for (const [code, prereqs] of Object.entries(prerequisitesMapping)) {
    finalMapping[code] = Array.from(prereqs);
}

console.log(JSON.stringify(finalMapping, null, 2));
