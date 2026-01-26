
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function extract() {
    try {
        const pdfPath = path.join(process.cwd(), 'guide_book.pdf');
        const dataBuffer = fs.readFileSync(pdfPath);

        const parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();

        console.log("Extraction complete. Writing to guide_book_text.txt");
        fs.writeFileSync('guide_book_text.txt', result.text);

        // Clean up
        if (parser.destroy) {
            await parser.destroy();
        }
    } catch (err) {
        console.error("Error extraction PDF:", err);
    }
}

extract();
