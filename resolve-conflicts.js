const fs = require('fs');
const path = require('path');

// Read the conflicted file
const filePath = path.join(__dirname, 'src/app/api/restaurants/search/route.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Remove conflict markers and keep the persist-searches version (HEAD)
content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)\n=======\n[\s\S]*?\n>>>>>>> [a-f0-9]+/g, '$1');

// Write the resolved content back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Conflict resolved successfully!');
console.log('📝 Kept the persist-searches branch version (HEAD)');
