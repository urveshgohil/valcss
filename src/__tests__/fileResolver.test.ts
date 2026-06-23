/// <reference types="jest" />
import fs from "fs";
import os from "os";
import path from "path";
import { resolveFiles } from "../utils/fileResolver.js";

describe("fileResolver", () => {
    it("supports grouped extension globs and skips ignored directories", () => {
        const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "valcss-resolver-"));
        const srcDir = path.join(fixtureRoot, "src");
        const pagesDir = path.join(fixtureRoot, "pages");
        const nextDir = path.join(fixtureRoot, ".next");
        const nodeModulesDir = path.join(fixtureRoot, "node_modules");

        fs.mkdirSync(srcDir, { recursive: true });
        fs.mkdirSync(pagesDir, { recursive: true });
        fs.mkdirSync(nextDir, { recursive: true });
        fs.mkdirSync(nodeModulesDir, { recursive: true });

        fs.writeFileSync(path.join(srcDir, "app.tsx"), "export {};", "utf8");
        fs.writeFileSync(path.join(srcDir, "view.jsx"), "export {};", "utf8");
        fs.writeFileSync(path.join(pagesDir, "home.ts"), "export {};", "utf8");
        fs.writeFileSync(path.join(nextDir, "ignored.js"), "export {};", "utf8");
        fs.writeFileSync(path.join(nodeModulesDir, "ignored.tsx"), "export {};", "utf8");

        const previousCwd = process.cwd();
        process.chdir(fixtureRoot);

        try {
            const files = resolveFiles(["**/*.{html,js,jsx,ts,tsx}"]).map((file) =>
                path.relative(fixtureRoot, file).replaceAll("\\", "/")
            );

            expect(files).toContain("src/app.tsx");
            expect(files).toContain("src/view.jsx");
            expect(files).toContain("pages/home.ts");
            expect(files).not.toContain(".next/ignored.js");
            expect(files).not.toContain("node_modules/ignored.tsx");
        } finally {
            process.chdir(previousCwd);
            fs.rmSync(fixtureRoot, { recursive: true, force: true });
        }
    });
});
