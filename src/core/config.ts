import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import type { ValCSSConfig } from "../types/index.js";

const require = createRequire(import.meta.url);

/**
 * Looks for `valcss.config.cjs`, `valcss.config.js`, or `valcss.config.json` in the current
 * working directory, loads it, and performs basic validation.
 *
 * @throws If no config file is found or the `files` array is missing/empty.
 * @returns The loaded and validated `ValCSSConfig` object.
 */
function loadTsConfig(configPath: string): ValCSSConfig {
    const source = fs.readFileSync(configPath, "utf8");
    const jsLikeSource = source
        .replace(/import\s+type\s+[^;]+;\s*/g, "")
        .replace(/:\s*ValCSSConfig/g, "")
        .replace(/export\s+default\s+([A-Za-z_$][\w$]*);?/g, "return $1;")
        .replace(/export\s+default\s+/g, "return ");

    return Function(jsLikeSource)() as ValCSSConfig;
}

export async function loadConfig(): Promise<ValCSSConfig> {
    const configCandidates = [
        path.resolve("valcss.config.cjs"),
        path.resolve("valcss.config.mjs"),
        path.resolve("valcss.config.js"),
        path.resolve("valcss.config.ts"),
        path.resolve("valcss.config.json"),
    ];

    const configPath = configCandidates.find(fs.existsSync);

    if (!configPath) {
        throw new Error(
            "valcss.config.cjs, valcss.config.mjs, valcss.config.js, valcss.config.ts, or valcss.config.json not found.\n\nRun 'npx valcss init' to create a default config."
        );
    }

    let config: ValCSSConfig;
    try {
        if (configPath.endsWith(".mjs") || configPath.endsWith(".js")) {
            const imported = (await import(pathToFileURL(configPath).href)) as {
                default?: ValCSSConfig;
            };
            config = imported.default ?? (imported as ValCSSConfig);
        } else if (configPath.endsWith(".ts")) {
            config = loadTsConfig(configPath);
        } else {
            config = require(configPath) as ValCSSConfig;
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (
            configPath.endsWith("valcss.config.js") &&
            message.includes("module is not defined in ES module scope")
        ) {
            throw new Error(
                "valcss.config.js is being treated as ESM in this project. Use valcss.config.cjs for CommonJS syntax (module.exports), or switch to valcss.config.json."
            );
        }
        throw new Error(`Failed to load config at ${configPath}: ${message}`);
    }

    if (!config.files || !Array.isArray(config.files) || config.files.length === 0) {
        throw new Error("'files' array is missing or empty in config.");
    }

    return config;
}
