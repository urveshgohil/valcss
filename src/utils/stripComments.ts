/**
 * Strips HTML and JS comments from a string.
 *
 * Removes:
 * - HTML comments  `<!-- ... -->`
 * - Multi-line JS comments  `/* ... *​/`
 * - Single-line JS comments  `// ...`
 */
export function stripComments(content: string): string {
    return content
        .replace(/<!--[\s\S]*?-->/g, "") // HTML comments
        .replace(/\/\*[\s\S]*?\*\//g, "") // multi-line JS comments
        .replace(/\/\/.*/g, ""); // single-line JS comments
}
