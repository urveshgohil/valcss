import fs from "fs";
import { validators, regex } from "../utils/validators.js";
import { stripComments } from "../utils/stripComments.js";
import { normalizeCalcExpression, normalizeCSSMath } from "../utils/normalizeCalcExpression.js";
import {
    pseudoPrefixes,
    positionValues,
    displayValues,
    individualConstants,
    exactUtilities,
    spacingUtilsDirections,
    spacingUtilsProperties,
    spacingScale,
    sizeScale,
    heightScale,
    maxWidthScale,
    radiusScale,
    fontSizeScale,
    fontWeightScale,
} from "../utils/constants.js";
import { getBreakpointConfig } from "./getBreakpointConfig.js";
import { getUtilitiesMap } from "./pluginEngine.js";
import type { StyleMap, StyleRule, ParsedClass } from "../types/index.js";

// ─── Breakpoints (resolved lazily after config initialization) ─────────────

function getBreakpoints() {
    return getBreakpointConfig().breakpoints;
}

// ─── Style map builders ───────────────────────────────────────────────────────

/**
 * Creates a `StyleRule` map for a CSS property from a list of keyword values.
 * Used for direct (non-bracketed) class matches like `flex`, `absolute`, etc.
 */
function createStyleMap(property: string, values: string[]): StyleMap {
    const map: StyleMap = {};
    for (const value of values) {
        map[value] = {
            validate: () => true,
            generate: (val: string) => `${property}: ${val};`,
        };
    }
    return map;
}

const positionStyleMap = createStyleMap("position", positionValues);
const displayStyleMap = createStyleMap("display", displayValues);
const directStyleMap: StyleMap = {
    ...positionStyleMap,
    ...displayStyleMap,
};

function scaleValue(val: string, scale: Record<string, string>): string {
    const normalized = val.trim().toLowerCase();
    if (normalized.startsWith("-")) {
        const positive = scale[normalized.slice(1)];
        if (positive && positive !== "0px") return `-${positive}`;
    }
    return scale[normalized] ?? normalizeCSSMath(val);
}

function scaleLengthValue(val: string, scale: Record<string, string>): string {
    const normalized = val.trim().toLowerCase();
    if (normalized.startsWith("-")) {
        const positive = scale[normalized.slice(1)];
        if (positive && positive !== "0px") return `-${positive}`;
    }
    if (scale[normalized]) return scale[normalized];
    if (regex.digit.test(normalized)) return `${parseFloat(normalized)}px`;
    return normalizeCSSMath(val);
}

// ─── Spacing utils ────────────────────────────────────────────────────────────

/**
 * Builds `StyleRule` entries for padding/margin in all directions.
 * e.g. `p`, `px`, `py`, `pt`, `pb`, `pl`, `pr`, `m`, `mx`, …
 */
function createSpacingUtils(property: "padding" | "margin"): StyleMap {
    const utils: StyleMap = {};

    const resolveSpacingToken = (token: string): string => {
        const normalized = token.trim().toLowerCase();
        if (normalized.startsWith("-")) {
            const positive = spacingScale[normalized.slice(1)];
            if (positive && positive !== "0px") return `-${positive}`;
        }
        const fromScale = spacingScale[normalized];
        if (fromScale) return fromScale;
        if (regex.digit.test(normalized)) {
            return `${parseFloat(normalized)}px`;
        }
        return normalizeCSSMath(token);
    };

    for (const key of Object.keys(spacingUtilsDirections)) {
        const classKey = spacingUtilsProperties[property] + key; // "p", "px", "pt", …

        utils[classKey] = {
            validate: (val) =>
                (property === "margin" && val === "auto") ||
                validators.spacingValues(val) ||
                val
                    .split("_")
                    .every((part) => spacingScale[part.trim().toLowerCase()] !== undefined),
            generate: (val: string): string => {
                const cssValue = val
                    .split("_")
                    .map((token) => resolveSpacingToken(token))
                    .join(" ");

                const dirs = spacingUtilsDirections[key]!;
                if (dirs[0] === "") {
                    return `${property}: ${cssValue};`;
                }
                return dirs.map((d) => `${property}-${d}: ${cssValue};`).join(" ");
            },
        };
    }

    return utils;
}

const spacingUtils: StyleMap = {
    ...createSpacingUtils("padding"),
    ...createSpacingUtils("margin"),
};

spacingUtils.mx!.validate = (val) => val === "auto" || validators.spacingValues(val);
spacingUtils.mx!.generate = (val) =>
    `margin-left: ${val === "auto" ? "auto" : scaleLengthValue(val, spacingScale)}; margin-right: ${
        val === "auto" ? "auto" : scaleLengthValue(val, spacingScale)
    };`;

spacingUtils.my!.validate = (val) => validators.spacingValues(val);
spacingUtils.my!.generate = (val) =>
    `margin-top: ${scaleLengthValue(val, spacingScale)}; margin-bottom: ${scaleLengthValue(
        val,
        spacingScale
    )};`;

spacingUtils.m!.validate = (val) => val === "auto" || validators.spacingValues(val);
spacingUtils.m!.generate = (val) =>
    `margin: ${val === "auto" ? "auto" : scaleLengthValue(val, spacingScale)};`;

// ─── Size utils ───────────────────────────────────────────────────────────────

function createSizeUtils(
    properties: Record<string, string>,
    scales: Record<string, Record<string, string>> = {}
): StyleMap {
    const utils: StyleMap = {};
    for (const [key, cssProp] of Object.entries(properties)) {
        utils[key] = {
            validate: (val) =>
                validators.lengthUnit(val) || Boolean((scales[key] ?? sizeScale)[val]),
            generate: (val: string) => `${cssProp}: ${scaleValue(val, scales[key] ?? sizeScale)};`,
        };
    }
    return utils;
}

const sizeUtils = createSizeUtils(
    {
        w: "width",
        h: "height",
        "max-w": "max-width",
        "min-w": "min-width",
        "max-h": "max-height",
        "min-h": "min-height",
        size: "width",
    },
    {
        h: heightScale,
        "min-h": heightScale,
        "max-h": heightScale,
        "max-w": maxWidthScale,
    }
);

sizeUtils.size!.generate = (val: string) => {
    const cssValue = scaleValue(val, sizeScale);
    return `width: ${cssValue}; height: ${cssValue};`;
};

const insetUtils = createSizeUtils({
    top: "top",
    left: "left",
    right: "right",
    bottom: "bottom",
    inset: "inset",
    "inset-x": "left",
    "inset-y": "top",
});

insetUtils["inset-x"]!.generate = (val) => {
    const cssValue = scaleValue(val, sizeScale);
    return `left: ${cssValue}; right: ${cssValue};`;
};
insetUtils["inset-y"]!.generate = (val) => {
    const cssValue = scaleValue(val, sizeScale);
    return `top: ${cssValue}; bottom: ${cssValue};`;
};

function createOneToTwelveUtils(
    prefix: string,
    property: string,
    valueBuilder: (n: number) => string
): StyleMap {
    return {
        [prefix]: {
            validate: (val) => regex.integer.test(val) && Number(val) >= 1 && Number(val) <= 12,
            generate: (val) => `${property}: ${valueBuilder(Number(val))};`,
        },
    };
}

const gapUtils: StyleMap = {
    gap: {
        validate: (val) => validators.lengthUnit(val) || spacingScale[val] !== undefined,
        generate: (val) => `gap: ${scaleLengthValue(val, spacingScale)};`,
    },
    "gap-x": {
        validate: (val) => validators.lengthUnit(val) || spacingScale[val] !== undefined,
        generate: (val) => `column-gap: ${scaleLengthValue(val, spacingScale)};`,
    },
    "gap-y": {
        validate: (val) => validators.lengthUnit(val) || spacingScale[val] !== undefined,
        generate: (val) => `row-gap: ${scaleLengthValue(val, spacingScale)};`,
    },
};

const radiusUtils: StyleMap = {
    rounded: {
        validate: (val) =>
            val === "" || validators.lengthUnit(val) || radiusScale[val] !== undefined,
        generate: (val) =>
            `border-radius: ${val === "" ? (radiusScale.DEFAULT ?? "0.25rem") : scaleValue(val, radiusScale)};`,
    },
    "rounded-t": {
        validate: (val) => validators.lengthUnit(val) || radiusScale[val] !== undefined,
        generate: (val) => {
            const cssValue = scaleValue(val, radiusScale);
            return `border-top-left-radius: ${cssValue}; border-top-right-radius: ${cssValue};`;
        },
    },
    "rounded-b": {
        validate: (val) => validators.lengthUnit(val) || radiusScale[val] !== undefined,
        generate: (val) => {
            const cssValue = scaleValue(val, radiusScale);
            return `border-bottom-left-radius: ${cssValue}; border-bottom-right-radius: ${cssValue};`;
        },
    },
    "rounded-l": {
        validate: (val) => validators.lengthUnit(val) || radiusScale[val] !== undefined,
        generate: (val) => {
            const cssValue = scaleValue(val, radiusScale);
            return `border-top-left-radius: ${cssValue}; border-bottom-left-radius: ${cssValue};`;
        },
    },
    "rounded-r": {
        validate: (val) => validators.lengthUnit(val) || radiusScale[val] !== undefined,
        generate: (val) => {
            const cssValue = scaleValue(val, radiusScale);
            return `border-top-right-radius: ${cssValue}; border-bottom-right-radius: ${cssValue};`;
        },
    },
};

const gridUtils: StyleMap = {
    ...createOneToTwelveUtils(
        "grid-cols",
        "grid-template-columns",
        (n) => `repeat(${n}, minmax(0, 1fr))`
    ),
    ...createOneToTwelveUtils(
        "grid-rows",
        "grid-template-rows",
        (n) => `repeat(${n}, minmax(0, 1fr))`
    ),
    "col-span": {
        validate: (val) => val === "full" || regex.integer.test(val),
        generate: (val) =>
            val === "full" ? "grid-column: 1 / -1;" : `grid-column: span ${val} / span ${val};`,
    },
    "row-span": {
        validate: (val) => val === "full" || regex.integer.test(val),
        generate: (val) =>
            val === "full" ? "grid-row: 1 / -1;" : `grid-row: span ${val} / span ${val};`,
    },
};

// ─── Master style map ─────────────────────────────────────────────────────────

const styleMap: StyleMap = {
    ...spacingUtils,
    ...sizeUtils,
    ...insetUtils,
    ...gapUtils,
    ...radiusUtils,
    ...gridUtils,

    text: {
        validate: (val) =>
            validators.color(val) ||
            validators.lengthUnit(val) ||
            fontSizeScale[val] !== undefined ||
            validators.textAlign(val) ||
            validators.textTransform(val),
        generate: (val) =>
            fontSizeScale[val] !== undefined
                ? `font-size: ${scaleValue(val, fontSizeScale)};`
                : validators.color(val)
                  ? `color: ${val};`
                  : validators.textAlign(val)
                    ? `text-align: ${val};`
                    : validators.textTransform(val)
                      ? `text-transform: ${val};`
                      : `font-size: ${scaleValue(val, fontSizeScale)};`,
    },

    font: {
        validate: (val) => validators.fontWeight(val) || fontWeightScale[val] !== undefined,
        generate: (val) => `font-weight: ${fontWeightScale[val] ?? val};`,
    },

    lh: {
        validate: validators.lineHeight,
        generate: (val) => `line-height: ${val};`,
    },

    bg: {
        validate: validators.bg,
        generate: (val) => {
            const trimmed = val.trim().toLowerCase();
            const isColor =
                regex.hex.test(trimmed) ||
                regex.rgb.test(trimmed) ||
                regex.rgba.test(trimmed) ||
                regex.namedColor.test(trimmed);

            const property =
                trimmed === "none" ? "background" : isColor ? "background-color" : "background";
            return `${property}: ${val};`;
        },
    },

    d: {
        validate: validators.display,
        generate: (val) => `display: ${val};`,
    },

    float: {
        validate: validators.float,
        generate: (val) => `float: ${val};`,
    },

    justify: {
        validate: validators.justify,
        generate: (val) => `justify-content: ${val};`,
    },

    items: {
        validate: validators.items,
        generate: (val) => `align-items: ${val};`,
    },

    border: {
        validate: validators.border,
        generate: (val) => {
            const trimmed = val.trim().toLowerCase();

            if (/^-?\d+(\.\d+)?(px|em|rem)?$/.test(trimmed)) {
                return `border-width: ${val};`;
            }
            if (/^(none|solid|dashed|dotted|double|groove|ridge|inset|outset)$/.test(trimmed)) {
                return `border-style: ${val};`;
            }
            if (validators.color(val)) {
                return `border-color: ${val};`;
            }
            return `border: ${val.replaceAll("_", " ")};`;
        },
    },

    radius: radiusUtils.rounded!,

    pos: {
        validate: validators.position,
        generate: (val) => `position: ${val};`,
    },

    opacity: {
        validate: validators.opacity,
        generate: (val) => `opacity: ${val};`,
    },

    z: {
        validate: validators.zIndex,
        generate: (val) => `z-index: ${val};`,
    },

    flex: {
        validate: validators.flex,
        generate: (val) => `flex: ${val};`,
    },
};

// ─── Class parser ─────────────────────────────────────────────────────────────

/**
 * Parses a full utility class string into its component modifiers.
 *
 * @example
 * parseClassString("md:hover:p-[10px]")
 * // { mediaPrefix: "md", isMax: false, pseudo: "hover",
 * //   baseClass: "p-[10px]", cleanBaseClass: "p-[10px]", isImportant: false }
 *
 * @example
 * parseClassString("max-lg:focus:!text-red")
 * // { mediaPrefix: "lg", isMax: true, pseudo: "focus",
 * //   baseClass: "!text-red", cleanBaseClass: "text-red", isImportant: true }
 */
function parseClassString(fullClassName: string): ParsedClass {
    const parts = fullClassName.split(":");
    const potentialBase = parts.at(-1) ?? "";

    let mediaPrefix: string | null = null;
    let isMax = false;
    let pseudo: string | null = null;

    const firstPart = parts[0] ?? "";
    if (firstPart.startsWith("max-")) {
        const bp = firstPart.slice(4);
        if (getBreakpoints()[bp]) {
            mediaPrefix = bp;
            isMax = true;
        }
    } else if (getBreakpoints()[firstPart]) {
        mediaPrefix = firstPart;
    }

    for (let i = mediaPrefix ? 1 : 0; i < parts.length - 1; i++) {
        const part = parts[i] ?? "";
        if (getBreakpoints()[part] || part.startsWith("max-")) {
            console.warn(
                `⚠️  Media prefix "${part}" must appear only as the first segment: "${fullClassName}"`
            );
        }
        if (pseudoPrefixes.includes(part)) {
            pseudo = part;
        }
    }

    const baseClass = potentialBase;
    const isImportant = baseClass.startsWith("!");
    const cleanBaseClass = isImportant ? baseClass.slice(1) : baseClass;

    return { mediaPrefix, isMax, pseudo, baseClass, cleanBaseClass, isImportant };
}

// ─── CSS escaping ─────────────────────────────────────────────────────────────

/**
 * Escapes special characters in a class name so it is safe to use in a CSS selector.
 *
 * @example escapeClass("p-[10px]") // "p-\\[10px\\]"
 */
function escapeClass(className: string): string {
    return className.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
}

// ─── Plugin CSS body builder ──────────────────────────────────────────────────

function getCSSBodyFromStyles(styles: Record<string, string>): string {
    return Object.entries(styles)
        .map(([prop, val]) => `${prop}: ${val};`)
        .join(" ");
}

function addImportantToDeclarations(css: string): string {
    return css
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((declaration) => `${declaration} !important;`)
        .join(" ");
}

// ─── Main class → CSS generator ───────────────────────────────────────────────

/**
 * Converts a single utility class name into its CSS rule string.
 *
 * @param fullClassName - e.g. `"md:hover:p-[10px]"`, `"flex"`, `"!bg-[red]"`
 * @param getCSSOnly    - When `true`, returns only the property declarations
 *                        (no selector or media wrapper). Used when composing
 *                        plugin shorthand strings.
 * @returns CSS rule string, or `null` if the class is invalid/unrecognised.
 */
export function generateCSSFromClass(fullClassName: string, getCSSOnly = false): string | null {
    const { mediaPrefix, isMax, pseudo, baseClass, cleanBaseClass, isImportant } =
        parseClassString(fullClassName);

    let val: string | null = null;
    let rule: StyleRule | undefined;
    let exactCSS: string | null = null;
    const isNegative = cleanBaseClass.startsWith("-");
    const parseableClass = isNegative ? cleanBaseClass.slice(1) : cleanBaseClass;

    if (exactUtilities[cleanBaseClass]) {
        exactCSS = exactUtilities[cleanBaseClass] ?? null;
    } else if (individualConstants.includes(cleanBaseClass)) {
        val = cleanBaseClass;
        rule = directStyleMap[cleanBaseClass];
    } else if (styleMap[cleanBaseClass]) {
        val = "";
        rule = styleMap[cleanBaseClass];
    } else {
        const match = parseableClass.match(/^([\w-]+)-\[(.+)\]$/);
        if (match) {
            const [, ruleKey, ruleValue] = match;
            if (ruleKey && ruleValue) {
                rule = styleMap[ruleKey];
                val = isNegative ? `-${ruleValue}` : ruleValue;
            }
        }
        const plainMatch = parseableClass.match(/^([\w-]+)-(.+)$/);
        if (!rule && plainMatch) {
            const [, ruleKey, ruleValue] = plainMatch;
            if (ruleKey && ruleValue) {
                rule = styleMap[ruleKey];
                val = isNegative ? `-${ruleValue}` : ruleValue;
            }
        }
    }

    // ── Plugin utility ────────────────────────────────────────────────────────
    const utilitiesMap = getUtilitiesMap();
    const pluginEntry = utilitiesMap[cleanBaseClass];

    if (pluginEntry) {
        const { styles, variants } = pluginEntry;

        const buildCSSBody = (): string => {
            if (typeof styles === "string") {
                return styles
                    .split(" ")
                    .map((cls) => generateCSSFromClass(cls, true))
                    .filter(Boolean)
                    .join(" ");
            }
            if (typeof styles === "object" && !Array.isArray(styles)) {
                return getCSSBodyFromStyles(styles as Record<string, string>);
            }
            return "";
        };

        // Base class (no variant)
        if (!mediaPrefix && !pseudo) {
            const cssBody = buildCSSBody();
            return getCSSOnly ? cssBody : `.${fullClassName} { ${cssBody} }`;
        }

        // Variant-specific
        const variantAllowed =
            variants === "*" ||
            (Array.isArray(variants) &&
                (variants.includes("*") ||
                    (mediaPrefix !== null && variants.includes(mediaPrefix)) ||
                    (pseudo !== null && variants.includes(pseudo))));

        if (variantAllowed) {
            const cssBody = buildCSSBody();
            let selector = `.${escapeClass(fullClassName)}`;
            if (pseudo) selector += `:${pseudo}`;
            const cssRule = `${selector} { ${cssBody} }`;

            if (mediaPrefix) {
                const px = getBreakpoints()[mediaPrefix] ?? undefined;
                const query = isMax
                    ? `@media (max-width: ${px !== undefined ? px - 1 : 0}px)`
                    : `@media (min-width: ${px !== undefined ? px : 0}px)`;
                return `${query} {\n  ${cssRule}\n}`;
            }
            return cssRule;
        }

        console.warn(`⚠️ Variant not allowed for: ${fullClassName}`);
        return null;
    }

    // ── Built-in style rule ───────────────────────────────────────────────────
    if (exactCSS || (rule && val !== null && rule.validate(val))) {
        let cssValue = exactCSS ?? rule!.generate(val!);
        if (isImportant) {
            cssValue = addImportantToDeclarations(cssValue);
        }

        if (getCSSOnly) return cssValue;

        let cssRule = `.${escapeClass(fullClassName)}`;
        if (pseudo) cssRule += `:${pseudo}`;
        const declaration = `{ ${cssValue} }`;

        if (mediaPrefix) {
            const px = getBreakpoints()[mediaPrefix] ?? undefined;
            const query = isMax
                ? `@media (max-width: ${px !== undefined ? px - 1 : 0}px)`
                : `@media (min-width: ${px !== undefined ? px : 0}px)`;
            return `${query} {\n  ${cssRule} ${declaration}\n}`;
        }

        return `${cssRule} ${declaration}`;
    }

    console.warn(`⚠️ Invalid class or value: ${fullClassName}`);
    return null;
}

// ─── HTML → CSS extractor ────────────────────────────────────────────────────

/**
 * Scans HTML content for `class="..."` attributes, filters for known
 * valcss patterns, and returns the generated CSS rules.
 */
function readQuotedSegment(source: string, startIndex: number): { value: string; endIndex: number } {
    const quote = source[startIndex];
    let value = "";
    let i = startIndex + 1;

    while (i < source.length) {
        const char = source[i];
        if (char === "\\") {
            value += char;
            i++;
            if (i < source.length) value += source[i];
            i++;
            continue;
        }
        if (char === quote) {
            return { value, endIndex: i };
        }
        value += char;
        i++;
    }

    return { value, endIndex: source.length - 1 };
}

function readBraceExpression(source: string, startIndex: number): { value: string; endIndex: number } {
    let depth = 1;
    let value = "";
    let i = startIndex + 1;

    while (i < source.length) {
        const char = source[i];

        if (char === "'" || char === '"' || char === "`") {
            const segment = readQuotedSegment(source, i);
            value += char + segment.value + source[segment.endIndex];
            i = segment.endIndex + 1;
            continue;
        }

        if (char === "{") {
            depth++;
        } else if (char === "}") {
            depth--;
            if (depth === 0) {
                return { value, endIndex: i };
            }
        }

        value += char;
        i++;
    }

    return { value, endIndex: source.length - 1 };
}

function extractStringLiterals(expression: string): string[] {
    const values: string[] = [];
    let i = 0;

    while (i < expression.length) {
        const char = expression[i];

        if (char === "'" || char === '"') {
            const segment = readQuotedSegment(expression, i);
            values.push(segment.value);
            i = segment.endIndex + 1;
            continue;
        }

        if (char === "`") {
            let templateChunk = "";
            i++;

            while (i < expression.length) {
                const templateChar = expression[i];

                if (templateChar === "\\") {
                    templateChunk += templateChar;
                    i++;
                    if (i < expression.length) templateChunk += expression[i];
                    i++;
                    continue;
                }

                if (templateChar === "`") {
                    if (templateChunk.trim()) {
                        values.push(templateChunk);
                    }
                    i++;
                    break;
                }

                if (templateChar === "$" && expression[i + 1] === "{") {
                    if (templateChunk.trim()) {
                        values.push(templateChunk);
                        templateChunk = "";
                    }
                    const innerExpression = readBraceExpression(expression, i + 1);
                    values.push(...extractStringLiterals(innerExpression.value));
                    i = innerExpression.endIndex + 1;
                    continue;
                }

                templateChunk += templateChar;
                i++;
            }
            continue;
        }

        i++;
    }

    return values;
}

function extractClassAttributeValues(content: string): string[] {
    const values: string[] = [];
    const attrPattern = /\b(?:class|className)\s*=/g;
    let match: RegExpExecArray | null;

    while ((match = attrPattern.exec(content)) !== null) {
        let i = match.index + match[0].length;

        while (i < content.length && /\s/.test(content[i] ?? "")) {
            i++;
        }

        const nextChar = content[i];
        if (!nextChar) continue;

        if (nextChar === "'" || nextChar === '"') {
            const segment = readQuotedSegment(content, i);
            values.push(segment.value);
            attrPattern.lastIndex = segment.endIndex + 1;
            continue;
        }

        if (nextChar === "{") {
            const expression = readBraceExpression(content, i);
            values.push(...extractStringLiterals(expression.value));
            attrPattern.lastIndex = expression.endIndex + 1;
        }
    }

    return values;
}

function extractAndGenerateCSS(htmlContent: string): string {
    const allClasses = extractClassAttributeValues(htmlContent).flatMap((value) =>
        value ? value.trim().split(/\s+/) : []
    );

    const utilitiesMap = getUtilitiesMap();

    const filtered = allClasses.filter((cls) => {
        const baseClass = cls.split(":").pop() ?? "";
        const cleanBaseClass = baseClass.startsWith("!") ? baseClass.slice(1) : baseClass;
        const parseableClass = cleanBaseClass.startsWith("-")
            ? cleanBaseClass.slice(1)
            : cleanBaseClass;

        if (individualConstants.includes(cleanBaseClass)) return true;
        if (exactUtilities[cleanBaseClass]) return true;
        if (styleMap[cleanBaseClass]) return true;
        if (/^[\w-]+-\[(.+)\]$/.test(parseableClass)) return true;
        if (/^[\w-]+-([^\[\]\s]+)$/.test(parseableClass)) return true;

        const baseUtility = cls.split(":").pop() ?? "";
        if (utilitiesMap[baseUtility]) return true;
        if (baseUtility.startsWith("!") || cleanBaseClass.startsWith("float")) return true;

        return false;
    });

    const unique = [...new Set(filtered)];

    return unique
        .map((cls) => generateCSSFromClass(cls, false))
        .filter(Boolean)
        .join("\n") as string;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Reads each file, strips comments, extracts utility classes and returns
 * the combined generated CSS string.
 */
export function generateCombinedCSS(filePaths: string[]): string {
    let combined = "";

    for (const filePath of filePaths) {
        const raw = fs.readFileSync(filePath, "utf8");
        const clean = stripComments(raw);
        combined += extractAndGenerateCSS(clean) + "\n";
    }

    return combined.trim();
}

/**
 * Writes a CSS string to disk and logs confirmation.
 */
export function writeCSS(outputPath: string, css: string): void {
    fs.writeFileSync(outputPath, css);
    console.log(`✅ CSS written to ${outputPath}`);
}
