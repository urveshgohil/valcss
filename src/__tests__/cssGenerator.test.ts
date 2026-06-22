/// <reference types="jest" />
import { generateCSSFromClass } from "../core/cssGenerator.js";
import { setConfig } from "../core/configCache.js";

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
});
