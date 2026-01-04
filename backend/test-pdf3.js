import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');

console.log('Has default?:', pdfParseModule.default);
console.log('Type of default:', typeof pdfParseModule.default);

// Try calling it
if (typeof pdfParseModule.default === 'function') {
  console.log('✅ Default is a function!');
} else if (typeof pdfParseModule === 'function') {
  console.log('✅ Module itself is a function!');
} else {
  console.log('❌ Neither is a function, checking exports...');
  console.log('Module type:', typeof pdfParseModule);
}
