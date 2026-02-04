const fs = require('fs');
const path = require('path');

const response = JSON.parse(fs.readFileSync('hero-response.json', 'utf8'));
const matches = JSON.parse(response.text);

// Pick the first match (Hero Section)
const component = matches[0];
console.log(`Installing component: ${component.componentName}`);

// Helper to write file ensuring dir exists
function writeFile(filePath, content) {
    const absolutePath = path.resolve(__dirname, filePath.replace(/^\//, '')); // remove leading /
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(absolutePath, content);
    console.log(`Created: ${filePath}`);
}

// 1. Write the main component
// The demo code imports form @/components/blocks/hero-section, so let's put it there
writeFile('components/blocks/hero-section.tsx', component.componentCode);

// 2. Write registry dependencies
if (component.registryDependencies && component.registryDependencies.filesWithRegistry) {
    for (const [filePath, fileData] of Object.entries(component.registryDependencies.filesWithRegistry)) {
        writeFile(filePath, fileData.code);
    }
}

console.log('Done installing hero components.');
