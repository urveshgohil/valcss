import fs from "fs";
import path from "path";

const ignoredDirs = new Set([
    "node_modules",
    "dist",
    ".git",
    ".next",
    "coverage",
    "build",
    "out",
]);

/**
 * Recursively collects all files under a directory, optionally filtered by extension.
 */
function walkDir(dir: string, exts: string[], results: string[] = []): string[] {
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (ignoredDirs.has(entry.name)) continue;
            walkDir(fullPath, exts, results);
        } else if (exts.length === 0 || exts.some((ext) => entry.name.endsWith(ext))) {
            results.push(fullPath);
        }
    }
    return results;
}

function getExtensionsFromPattern(pattern: string): string[] {
    const braceMatch = pattern.match(/\{([^}]+)\}/);
    if (braceMatch?.[1]) {
        return braceMatch[1]
            .split(",")
            .map((ext) => ext.trim())
            .filter(Boolean)
            .map((ext) => (ext.startsWith(".") ? ext : `.${ext}`));
    }

    const ext = path.extname(pattern);
    return ext ? [ext] : [];
}

/**
 * Minimal glob-like pattern resolver using only Node.js built-ins.
 *
 * Supports:
 *   - Exact file paths          "index.html"
 *   - Single-dir wildcard       "src/*.html"
 *   - Recursive glob            "src/**\/*.html"
 *   - Root-level recursive      "**\/*.html"
 *   - Grouped extensions        "**\/*.{html,js,jsx,ts,tsx}"
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
        const exts = getExtensionsFromPattern(pattern);

        const files = walkDir(baseDir, exts);

        // If there are literal segments after the wildcard zone, use them as a suffix filter
        const suffix = segments
            .slice(starIdx + 1)
            .filter((s) => !s.includes("*") && !s.includes("{"))
            .join("/");

        for (const file of files) {
            if (!suffix || file.endsWith(suffix)) {
                results.push(file);
            }
        }
    }

    return [...new Set(results)];
}
