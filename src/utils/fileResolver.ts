import fs from "fs";
import path from "path";

/**
 * Recursively collects all files under a directory, optionally filtered by extension.
 */
function walkDir(dir: string, ext: string, results: string[] = []): string[] {
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(fullPath, ext, results);
        } else if (!ext || entry.name.endsWith(ext)) {
            results.push(fullPath);
        }
    }
    return results;
}

/**
 * Minimal glob-like pattern resolver using only Node.js built-ins.
 *
 * Supports:
 *   - Exact file paths          "index.html"
 *   - Single-dir wildcard       "src/*.html"
 *   - Recursive glob            "src/**\/*.html"
 *   - Root-level recursive      "**\/*.html"
 *
 * @param patterns - Array of file paths or simple glob patterns.
 * @returns Unique list of resolved absolute file paths that exist on disk.
 */
export function resolveFiles(patterns: string[]): string[] {
    const results: string[] = [];

    for (const pattern of patterns) {
        if (!pattern.includes("*")) {
            // Plain file path — no globbing needed
            if (fs.existsSync(pattern)) {
                results.push(path.resolve(pattern));
            }
            continue;
        }

        // Split into path segments and find the first one containing a wildcard
        const segments = pattern.split("/");
        const starIdx = segments.findIndex((s) => s.includes("*"));
        const baseDir = segments.slice(0, starIdx).join("/") || ".";
        const ext = pattern.includes(".") ? "." + pattern.split(".").pop()! : "";

        const files = walkDir(baseDir, ext);

        // If there are literal segments after the wildcard zone, use them as a suffix filter
        const suffix = segments
            .slice(starIdx + 1)
            .filter((s) => !s.includes("*"))
            .join("/");

        for (const file of files) {
            if (!suffix || file.endsWith(suffix)) {
                results.push(file);
            }
        }
    }

    return [...new Set(results)];
}
