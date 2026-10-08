const fs = require('fs');

const files = ['js/repo.js', 'js/cart.js', 'js/view.js', 'js/app.js'];

let mainJs = '';

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Remove export statements
    content = content.replace(/^export\s+(const|let|var|function|class)\s+/gm, '$1 ');
    content = content.replace(/^export\s+default\s+/gm, '');
    // Remove import statements (matches multiline imports too)
    content = content.replace(/import\s+[^'"]+['"][^'"]+['"]\s*;/g, '');
    mainJs += `// --- File: ${file} ---\n${content}\n\n`;
});

fs.writeFileSync('js/main.js', mainJs);
console.log('js/main.js rebuilt successfully!');

