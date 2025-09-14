import { readFileSync, writeFileSync } from 'fs';

// Read the file
let content = readFileSync('./components/ui/button.tsx', 'utf8');

// Fix the variant mapping - change "default" to "primary"
content = content.replace(
  /variant:\s*{\s*primary:\s*'[^']*',[^}]*default:\s*'[^']*'/g,
  (match) => {
    // Replace "default:" with "primary:" in the variant object
    return match.replace(/default:/g, 'primary:');
  }
);

// Write the file back
writeFileSync('./components/ui/button.tsx', content);

console.log('Fixed button variant mapping');