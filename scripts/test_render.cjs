const fs = require('fs');

console.log('Testing data and imports...');
const compiled = JSON.parse(fs.readFileSync('./src/data/compiledDistricts.json', 'utf8'));


console.log('Compiled districts count:', compiled.length);
if (compiled.length !== 64) {
  console.error('Error: compiledDistricts is not 64!');
}

// Check paths
let invalidPaths = 0;
for (const d of compiled) {
  if (!d.path || typeof d.path !== 'string') {
    invalidPaths++;
  }
}
console.log('Invalid paths:', invalidPaths);
