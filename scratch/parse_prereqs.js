import fs from 'fs';

const content = fs.readFileSync('d:\\dev\\sees-ui\\guide_book_text.txt', 'utf8');
const lines = content.split('\n');

const prerequisites = [];
let currentModule = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('Course Code')) {
        currentModule = line.replace('Course Code', '').trim();
    } else if (line.startsWith('Pre-requisites') || line.startsWith('Pre-Requisites')) {
        const prereqText = line.replace(/Pre-requisites|Pre-Requisites/i, '').trim();
        if (currentModule && prereqText && prereqText.toLowerCase() !== 'none') {
            prerequisites.push({
                module: currentModule,
                prerequisites: prereqText
            });
        }
    }
}

console.log(JSON.stringify(prerequisites, null, 2));
