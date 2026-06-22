import type { UtilitiesMap, UtilityStyles } from "../types/index.js";

const utilitiesMap: UtilitiesMap = {};

/**
 * Registers custom utility classes with optional variant support.
 *
 * @param newUtilities - Map of class name → styles (object or shorthand string)
 * @param variants     - List of allowed variants, e.g. `["md", "hover"]`
 *
 * @example
 * addUtilities(
 *   { "flex-center": { display: "flex", "align-items": "center" } },
 *   ["md", "hover"]
 * );
 */
export function addUtilities(
    newUtilities: Record<string, UtilityStyles>,
    variants: string | string[] = []
): void {
    for (const className of Object.keys(newUtilities)) {
        utilitiesMap[className] = {
            styles: newUtilities[className] as UtilityStyles,
            variants,
        };
    }
}

/**
 * Returns the current map of all registered utilities.
 */
export function getUtilitiesMap(): UtilitiesMap {
    return utilitiesMap;
}

/**
 * Clears all registered utilities.
 * Should be called before each rebuild in watch mode to prevent stale entries.
 */
export function resetUtilitiesMap(): void {
    for (const key of Object.keys(utilitiesMap)) {
        delete utilitiesMap[key];
    }
}
