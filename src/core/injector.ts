import fs from "fs";
import { writeCSS } from "./cssGenerator.js";
import { getHeaderComment } from "../utils/getHeaderComment.js";
import type { InjectCSSOptions } from "../types/index.js";

/**
 * Injects generated CSS into one or more HTML target files.
 *
 * - `mode: "link"` → writes the CSS to `outputPath` (with a header comment)
 *   and ensures the file exists.
 * - `mode: "inline"` → inserts a `<style>` block just before `</head>` in
 *   each target HTML file (only once; skipped if already present).
 */
export function injectCSSIntoHTML({
    css = "",
    outputPath = "valcss-main.css",
    mode = "link",
    targets = [],
}: InjectCSSOptions): void {
    if (!css) {
        console.error("❌ No CSS provided.");
        process.exit(1);
    }
    if (!outputPath) {
        console.error("❌ No output path provided.");
        process.exit(1);
    }
    if (!mode) {
        console.error("❌ No injection mode provided.");
        process.exit(1);
    }

    const finalCSS = mode === "link" ? getHeaderComment() + css : css;

    for (const htmlFile of targets) {
        if (!fs.existsSync(htmlFile)) {
            console.warn(`⚠️ Target HTML file not found: ${htmlFile}`);
            continue;
        }

        let html = fs.readFileSync(htmlFile, "utf8");
        let htmlChanged = false;

        if (mode === "inline") {
            const styleTag = `<style>\n${finalCSS}\n</style>`;
            if (!html.includes(styleTag)) {
                html = html.replace(/<\/head>/i, `${styleTag}\n</head>`);
                console.log(`✅ Inlined styles into ${htmlFile}`);
                htmlChanged = true;
            }
        } else if (mode === "link") {
            // Ensure the output CSS file exists before writing
            if (!fs.existsSync(outputPath)) {
                fs.writeFileSync(outputPath, "/* valcss: empty stylesheet created */\n");
                console.log(`📝 Created missing CSS file: ${outputPath}`);
            }
            writeCSS(outputPath, finalCSS);
        }

        if (htmlChanged) {
            fs.writeFileSync(htmlFile, html, "utf8");
        }
    }
}
