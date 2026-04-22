const fs = require('fs');
const path = require('path');

const actionsDir = path.join(__dirname, '../lib/actions');

function auditFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fileName = path.basename(filePath);
    
    let currentSwagger = null;
    let foundGaps = false;

    lines.forEach((line, index) => {
        if (line.includes('@swagger')) {
            currentSwagger = index;
        }
        
        // Match exported async functions
        const exportMatch = line.match(/export async function (\w+)/);
        if (exportMatch) {
            const functionName = exportMatch[1];
            // Check if the previous few lines had @swagger
            const lookbackLines = lines.slice(Math.max(0, index - 20), index).join('\n');
            if (!lookbackLines.includes('@swagger')) {
                console.log(`${fileName} MISSING: ${functionName}`);
                foundGaps = true;
            }
        }
    });
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            auditFile(fullPath);
        }
    });
}

console.log('--- Documentation Audit Start ---');
walk(actionsDir);
console.log('--- Documentation Audit End ---');
