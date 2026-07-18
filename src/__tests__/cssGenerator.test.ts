/// <reference types="jest" />
import fs from "fs";
import os from "os";
import path from "path";
import { generateCSSFromClass } from "../core/cssGenerator.js";
import { setConfig } from "../core/configCache.js";
import { generateCombinedCSS } from "../core/cssGenerator.js";

describe("cssGenerator Tailwind-style utilities", () => {
    beforeAll(() => {
        setConfig({ files: ["index.html"] });
    });

    it("generates spacing scale utilities", () => {
        expect(generateCSSFromClass("m-1")).toBe(".m-1 { margin: 0.25rem; }");
        expect(generateCSSFromClass("p-2")).toBe(".p-2 { padding: 0.5rem; }");
        expect(generateCSSFromClass("mx-auto")).toBe(
            ".mx-auto { margin-left: auto; margin-right: auto; }"
        );
        expect(generateCSSFromClass("-mt-2")).toBe(".-mt-2 { margin-top: -0.5rem; }");
    });

    it("generates common sizing and gap utilities", () => {
        expect(generateCSSFromClass("w-full")).toBe(".w-full { width: 100%; }");
        expect(generateCSSFromClass("h-screen")).toBe(".h-screen { height: 100vh; }");
        expect(generateCSSFromClass("max-w-sm")).toBe(".max-w-sm { max-width: 24rem; }");
        expect(generateCSSFromClass("gap-x-4")).toBe(".gap-x-4 { column-gap: 1rem; }");
    });

    it("generates exact flex, grid, text, and radius utilities", () => {
        expect(generateCSSFromClass("flex-col")).toBe(".flex-col { flex-direction: column; }");
        expect(generateCSSFromClass("grid-cols-3")).toBe(
            ".grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }"
        );
        expect(generateCSSFromClass("text-xl")).toBe(".text-xl { font-size: 1.25rem; }");
        expect(generateCSSFromClass("font-bold")).toBe(".font-bold { font-weight: 700; }");
        expect(generateCSSFromClass("rounded-lg")).toBe(".rounded-lg { border-radius: 0.5rem; }");
        expect(generateCSSFromClass("rounded")).toBe(".rounded { border-radius: 0.25rem; }");
    });

    it("extracts utilities from React and Next-style className usage", () => {
        const tempFile = path.join(os.tmpdir(), `valcss-react-${Date.now()}.tsx`);
        fs.writeFileSync(
            tempFile,
            `
            export function Card({ active }: { active: boolean }) {
              return (
                <div>
                  <section className="m-1 p-2 text-xl" />
                  <article className={'w-full rounded-lg'} />
                  <aside className={active ? "gap-x-4" : "mx-auto"} />
                  <main className={\`h-screen \${active ? "font-bold" : "p-4"}\`} />
                </div>
              );
            }
            `,
            "utf8"
        );

        const css = generateCombinedCSS([tempFile]);

        expect(css).toContain(".m-1 { margin: 0.25rem; }");
        expect(css).toContain(".p-2 { padding: 0.5rem; }");
        expect(css).toContain(".text-xl { font-size: 1.25rem; }");
        expect(css).toContain(".w-full { width: 100%; }");
        expect(css).toContain(".rounded-lg { border-radius: 0.5rem; }");
        expect(css).toContain(".gap-x-4 { column-gap: 1rem; }");
        expect(css).toContain(".mx-auto { margin-left: auto; margin-right: auto; }");
        expect(css).toContain(".h-screen { height: 100vh; }");
        expect(css).toContain(".font-bold { font-weight: 700; }");
        expect(css).toContain(".p-4 { padding: 1rem; }");

        fs.unlinkSync(tempFile);
    });

    it("expands @apply directives in style files", () => {
        const tempFile = path.join(os.tmpdir(), `valcss-apply-${Date.now()}.scss`);
        fs.writeFileSync(
            tempFile,
            `
            .card {
              @apply mx-auto text-xl;
            }

            .hero {
              @apply mx-auto !important;
            }

            .cta {
              @apply !mx-auto;
            }
            `,
            "utf8"
        );

        const css = generateCombinedCSS([tempFile]);

        expect(css).toContain(".card {");
        expect(css).toContain("margin-left: auto; margin-right: auto;");
        expect(css).toContain("font-size: 1.25rem;");
        expect(css).toContain(".hero {");
        expect(css).toContain("margin-left: auto !important; margin-right: auto !important;");
        expect(css).toContain(".cta {");
        expect(css).toContain("margin-left: auto !important; margin-right: auto !important;");

        fs.unlinkSync(tempFile);
    });
});
