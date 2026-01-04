import { createRequire } from 'module';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

async function testPDF() {
  try {
    console.log('Testing PDF parse...');
    
    // Create a minimal PDF buffer for testing
    const testBuffer = Buffer.from('test');
    
    console.log('pdf-parse module:', typeof pdfParse);
    console.log('Is function?', typeof pdfParse === 'function');
    
    // Try to parse
    // const result = await pdfParse(testBuffer);
    // console.log('Result:', result);
    
    console.log('✅ PDF parse module loaded successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPDF();
