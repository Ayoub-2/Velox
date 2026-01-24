const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDirectory = path.join(__dirname, '../knowledge-base');
const outputFile = path.join(__dirname, '../src/data/code-snippets.json');

function getAllSnippets() {
    if (!fs.existsSync(postsDirectory)) return [];

    const fileNames = fs.readdirSync(postsDirectory);
    const snippets = [];

    fileNames.forEach(fileName => {
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        const id = fileName.replace(/\.md$/, '');

        // Regex to find code blocks: ```lang ... ```
        const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
        let match;
        let index = 0;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            const lang = match[1] || 'text';
            const code = match[2].trim();

            // Skip empty blocks
            if (!code) continue;

            snippets.push({
                id: `${id}-${index++}`,
                title: `${data.title} - Snippet ${index}`,
                description: `Code example from ${data.title}`,
                language: lang,
                code: code,
                articleId: id,
                articleTitle: data.title,
                tags: data.tags || []
            });
        }
    });

    return snippets;
}

const allSnippets = getAllSnippets();
fs.writeFileSync(outputFile, JSON.stringify(allSnippets, null, 2));

console.log(`Successfully extracted ${allSnippets.length} snippets to ${outputFile}`);
