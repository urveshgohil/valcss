import fs from "fs";
import path from "path";
import { loadConfig } from "./core/config.js";
import { setConfig, getConfig } from "./core/configCache.js";
import { addUtilities, resetUtilitiesMap } from "./core/pluginEngine.js";
import { resolveFiles } from "./utils/fileResolver.js";
import { generateCombinedCSS } from "./core/cssGenerator.js";
import { injectCSSIntoHTML } from "./core/injector.js";

const args = process.argv.slice(2);

// ─── init command ─────────────────────────────────────────────────────────────

if (args[0] === "init") {
    const requestedFormat = args[1] ?? "--cjs";
    const configFormat = requestedFormat.replace(/^--/, "");
    const validFormats = ["cjs", "js", "ts", "json"];

    if (!validFormats.includes(configFormat)) {
        console.error("❌ Invalid init format. Use one of: --cjs, --js, --ts, --json");
        process.exit(1);
    }

    const configPath = `valcss.config.${configFormat}`;

    if (fs.existsSync(configPath)) {
        console.warn(`⚠️  ${configPath} already exists.`);
        process.exit(1);
    }

    const configObject = `{
  files: ["index.html", "src/**/*.html"],
  output: "valcss-main.css",
  inject: {
    mode: "link", // "inline" or "link"
    targets: ["index.html"]
  },
  plugins: [
    ({ addUtilities }) => {
      addUtilities(
        {
          "flex-center": {
            display: "flex",
            "justify-content": "center",
            "align-items": "center"
          },
          "flex-between": {
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center"
          }
        },
        "*"
      );
    }
  ]
}`;

    const defaultConfig =
        configFormat === "json"
            ? `{
  "files": ["index.html", "src/**/*.html"],
  "output": "valcss-main.css",
  "inject": {
    "mode": "link",
    "targets": ["index.html"]
  }
}
`
            : configFormat === "js"
              ? `// valcss.config.js
export default ${configObject};
`
              : configFormat === "ts"
                ? `// valcss.config.ts
import type { ValCSSConfig } from "./dist/types/index";

const config: ValCSSConfig = ${configObject};

export default config;
`
                : `// valcss.config.cjs
module.exports = ${configObject};
`;

    fs.writeFileSync(configPath, defaultConfig);
    console.log(`✅ ${configPath} created!`);
    process.exit(0);
}

// ─── help command ─────────────────────────────────────────────────────────────

if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    console.log(`
------------------------------------------------------

📦 valcss - Utility CSS Extractor

Usage:
  valcss                 Uses valcss.config.cjs/js/ts/json
  valcss init            Create valcss.config.cjs
  valcss init --js       Create valcss.config.js
  valcss init --ts       Create valcss.config.ts
  valcss --output <file> Override output file
  valcss --watch         Watch input files and regenerate CSS on changes
  valcss --dry-run       Output CSS to console without writing files
  valcss --help          Show this help message

Options:
  --output <file>        Write final CSS to given file
  --watch | -w           Enable watch mode
  --dry-run              Output CSS without writing files
  init --cjs|--js|--ts|--json
                          Create a config file
  --help  | -h           Show this help message

------------------------------------------------------
`);
    process.exit(0);
}

// ─── argument validation ──────────────────────────────────────────────────────

const validArgs = ["--output", "--watch", "-w", "--dry-run", "--help", "-h"];

const invalidArg = args.find(
    (arg, i) => !validArgs.includes(arg) && !args[i - 1]?.includes("--output")
);

if (invalidArg) {
    console.error(`❌ Invalid argument: ${invalidArg}`);
    process.exit(1);
}

// ─── flags ────────────────────────────────────────────────────────────────────

const watchMode = args.includes("--watch") || args.includes("-w");
const dryMode = args[0] === "--dry-run";

let cliOutputPath: string | null = null;

if (args.includes("--output")) {
    const i = args.indexOf("--output");
    if (i !== -1 && args[i + 1]) {
        cliOutputPath = args[i + 1] ?? null;
    } else {
        console.error("❌ Missing value for --output");
        process.exit(1);
    }
}

// ─── bootstrap: load config & plugins ────────────────────────────────────────

// ─── build function ───────────────────────────────────────────────────────────

function buildCSS(): void {
    try {
        const { files: patterns, output: configOutput = "valcss-main.css", inject } = getConfig();

        const resolvedFiles = resolveFiles(patterns);

        if (resolvedFiles.length === 0) {
            console.error("❌ No matching files found.");
            return;
        }

        const finalOutputPath = cliOutputPath ?? configOutput;
        console.log(`📝 Generating CSS for ${resolvedFiles.length} file(s)…`);

        const css = generateCombinedCSS(resolvedFiles);

        if (dryMode) {
            console.log("\n------------------------------------------------------");
            console.log("DRY MODE ENABLED");
            console.log("------------------------------------------------------\n");
            console.log(css);
            console.log("\n------------------------------------------------------");
            return;
        }

        if (inject && Array.isArray(inject.targets)) {
            injectCSSIntoHTML({
                css,
                outputPath: finalOutputPath,
                mode: inject.mode ?? "link",
                targets: inject.targets,
            });
        } else {
            console.error("❌ No inject targets found.");
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`❌ ${message}`);
    }
}

// ─── watch mode using Node built-in fs.watch ─────────────────────────────────

function startWatch(): void {
    const { files: patterns } = getConfig();
    const resolvedFiles = resolveFiles(patterns);

    if (resolvedFiles.length === 0) {
        console.error("❌ No files to watch.");
        process.exit(1);
    }

    console.log(`👀 Watching ${resolvedFiles.length} file(s) for changes…`);

    // Track active watchers so we don't double-register
    const watchers = new Map<string, fs.FSWatcher>();

    const watch = (filePath: string): void => {
        if (watchers.has(filePath)) return;

        const watcher = fs.watch(filePath, (eventType) => {
            if (eventType === "change") {
                console.log(`🔄 File changed: ${path.relative(process.cwd(), filePath)}`);
                buildCSS();
            }
            // If the file is renamed/deleted, close and re-watch after a short delay
            if (eventType === "rename") {
                watcher.close();
                watchers.delete(filePath);
                setTimeout(() => {
                    if (fs.existsSync(filePath)) watch(filePath);
                }, 300);
            }
        });

        watcher.on("error", (err) => {
            console.warn(`⚠️  Watch error on ${filePath}: ${err.message}`);
            watcher.close();
            watchers.delete(filePath);
        });

        watchers.set(filePath, watcher);
    };

    for (const file of resolvedFiles) {
        watch(file);
    }

    // Graceful shutdown
    process.on("SIGINT", () => {
        console.log("\n👋 Stopping watcher…");
        for (const w of watchers.values()) w.close();
        process.exit(0);
    });
}

// ─── execution ────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    resetUtilitiesMap();
    const __CONFIG = await loadConfig();

    if (Array.isArray(__CONFIG.plugins)) {
        for (const plugin of __CONFIG.plugins) {
            if (typeof plugin === "function") {
                plugin({ addUtilities });
            }
        }
    }

    setConfig(__CONFIG);

    if (watchMode) {
        try {
            buildCSS(); // initial run
            startWatch();
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`❌ ${message}`);
            process.exit(1);
        }
    } else {
        buildCSS();
    }
}

main().catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ ${message}`);
    process.exit(1);
});
