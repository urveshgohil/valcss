// ─── Inject Config ───────────────────────────────────────────────────────────

export type InjectMode = "inline" | "link";

export interface InjectConfig {
    mode: InjectMode;
    targets: string[];
}

// ─── Breakpoints ─────────────────────────────────────────────────────────────

export type BreakpointKey = "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | string;

export type BreakpointMap = Record<BreakpointKey, number>;

// ─── Plugin API ───────────────────────────────────────────────────────────────

/**
 * Styles can be either a plain CSS object or a shorthand class string
 * (e.g. "flex justify-[center] items-[center]")
 */
export type UtilityStyles = Record<string, string> | string;

export interface AddUtilitiesAPI {
    addUtilities: (utilities: Record<string, UtilityStyles>, variants?: string | string[]) => void;
}

export type PluginFn = (api: AddUtilitiesAPI) => void;

// ─── User Config ─────────────────────────────────────────────────────────────

export interface ValCSSConfig {
    files: string[];
    output?: string;
    inject?: InjectConfig;
    breakpoints?: Record<string, number | string>;
    plugins?: PluginFn[];
}

// ─── Plugin Engine internals ──────────────────────────────────────────────────

export interface UtilityEntry {
    styles: UtilityStyles;
    variants: string | string[];
}

export type UtilitiesMap = Record<string, UtilityEntry>;

// ─── CSS Generator internals ──────────────────────────────────────────────────

export interface StyleRule {
    validate: (val: string) => boolean;
    generate: (val: string) => string;
}

export type StyleMap = Record<string, StyleRule>;

export interface ParsedClass {
    mediaPrefix: string | null;
    isMax: boolean;
    pseudo: string | null;
    baseClass: string;
    cleanBaseClass: string;
    isImportant: boolean;
}

// ─── Injector options ────────────────────────────────────────────────────────

export interface InjectCSSOptions {
    css: string;
    outputPath?: string;
    mode?: InjectMode;
    targets?: string[];
}

// ─── Breakpoint config return ────────────────────────────────────────────────

export interface BreakpointConfig {
    breakpoints: BreakpointMap;
    getValue: (key: string) => number | null;
}
