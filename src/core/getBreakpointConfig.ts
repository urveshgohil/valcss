import { getConfig } from "./configCache.js";
import type { BreakpointConfig, BreakpointMap } from "../types/index.js";

export const defaultBreakpoints: BreakpointMap = {
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536,
};

/**
 * Merges user-defined breakpoints with the defaults.
 *
 * - String values like `"990px"` are coerced to numbers.
 * - Invalid (non-numeric) values produce a warning and fall back to the default.
 *
 * @returns `{ breakpoints, getValue }` — the merged map and a lookup helper.
 */
export function getBreakpointConfig(): BreakpointConfig {
    const userConfig = getConfig();
    const rawBreakpoints: Record<string, number | string> = userConfig.breakpoints ?? {};

    const sanitized: BreakpointMap = {};

    for (const key of Object.keys(rawBreakpoints)) {
        const rawValue = rawBreakpoints[key];
        if (rawValue === undefined) continue;

        let value: number | string = rawValue;

        if (typeof value === "string") {
            if (value.endsWith("px")) {
                value = value.slice(0, -2);
            }
            const num = parseInt(value, 10);
            if (!isNaN(num)) {
                sanitized[key] = num;
            } else {
                console.warn(
                    `⚠️  Invalid breakpoint value for "${key}": ${rawBreakpoints[key]}. ` +
                        `Using default "${defaultBreakpoints[key] ?? "none"}" instead.`
                );
            }
        } else {
            sanitized[key] = value;
        }
    }

    const breakpoints: BreakpointMap = { ...defaultBreakpoints, ...sanitized };

    const getValue = (key: string): number | null => breakpoints[key] ?? null;

    return { breakpoints, getValue };
}
