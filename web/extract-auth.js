const fs = require('fs');
const path = require('path');

const response = JSON.parse(fs.readFileSync('auth-ui-response.json', 'utf8'));
const matches = JSON.parse(response.text);

// Pick the first match
const component = matches[0];
console.log(`Installing component: ${component.componentName}`);

function writeFile(filePath, content) {
    const absolutePath = path.resolve(__dirname, 'src', filePath.replace(/^\//, ''));
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(absolutePath, content);
    console.log(`Created: ${filePath}`);
}

writeFile('components/blocks/auth-form.tsx', component.componentCode);

if (component.registryDependencies && component.registryDependencies.filesWithRegistry) {
    for (const [filePath, fileData] of Object.entries(component.registryDependencies.filesWithRegistry)) {
        writeFile(filePath, fileData.code);
    }
}

console.log('Done installing auth components.');
