/**
 * CSS pseudo-class prefixes supported as variant modifiers.
 */
export const pseudoPrefixes: string[] = [
    "hover",
    "focus",
    "active",
    "visited",
    "disabled",
    "enabled",
    "empty",
    "checked",
];

/**
 * Valid CSS `position` values.
 */
export const positionValues: string[] = ["static", "relative", "absolute", "fixed", "sticky"];

/**
 * Valid CSS `display` values.
 */
export const displayValues: string[] = [
    "block",
    "inline",
    "inline-block",
    "flex",
    "grid",
    "hidden",
    "inline-flex",
    "inline-grid",
];

/**
 * CSS declarations for exact utility classes that do not take a value suffix.
 */
export const exactUtilities: Record<string, string> = {
    container: "width: 100%;",
    "box-border": "box-sizing: border-box;",
    "box-content": "box-sizing: content-box;",
    clear: "clear: both;",
    "clear-left": "clear: left;",
    "clear-right": "clear: right;",
    "clear-both": "clear: both;",
    "clear-none": "clear: none;",
    "overflow-auto": "overflow: auto;",
    "overflow-hidden": "overflow: hidden;",
    "overflow-clip": "overflow: clip;",
    "overflow-visible": "overflow: visible;",
    "overflow-scroll": "overflow: scroll;",
    "overflow-x-auto": "overflow-x: auto;",
    "overflow-x-hidden": "overflow-x: hidden;",
    "overflow-x-scroll": "overflow-x: scroll;",
    "overflow-y-auto": "overflow-y: auto;",
    "overflow-y-hidden": "overflow-y: hidden;",
    "overflow-y-scroll": "overflow-y: scroll;",
    "flex-row": "flex-direction: row;",
    "flex-row-reverse": "flex-direction: row-reverse;",
    "flex-col": "flex-direction: column;",
    "flex-col-reverse": "flex-direction: column-reverse;",
    "flex-wrap": "flex-wrap: wrap;",
    "flex-wrap-reverse": "flex-wrap: wrap-reverse;",
    "flex-nowrap": "flex-wrap: nowrap;",
    "grow": "flex-grow: 1;",
    "grow-0": "flex-grow: 0;",
    "shrink": "flex-shrink: 1;",
    "shrink-0": "flex-shrink: 0;",
    "basis-auto": "flex-basis: auto;",
    "grid-flow-row": "grid-auto-flow: row;",
    "grid-flow-col": "grid-auto-flow: column;",
    "grid-flow-dense": "grid-auto-flow: dense;",
    "items-start": "align-items: flex-start;",
    "items-end": "align-items: flex-end;",
    "items-center": "align-items: center;",
    "items-baseline": "align-items: baseline;",
    "items-stretch": "align-items: stretch;",
    "justify-normal": "justify-content: normal;",
    "justify-start": "justify-content: flex-start;",
    "justify-end": "justify-content: flex-end;",
    "justify-center": "justify-content: center;",
    "justify-between": "justify-content: space-between;",
    "justify-around": "justify-content: space-around;",
    "justify-evenly": "justify-content: space-evenly;",
    "content-center": "align-content: center;",
    "content-start": "align-content: flex-start;",
    "content-end": "align-content: flex-end;",
    "content-between": "align-content: space-between;",
    "content-around": "align-content: space-around;",
    "content-evenly": "align-content: space-evenly;",
    "self-auto": "align-self: auto;",
    "self-start": "align-self: flex-start;",
    "self-end": "align-self: flex-end;",
    "self-center": "align-self: center;",
    "self-stretch": "align-self: stretch;",
    "text-left": "text-align: left;",
    "text-center": "text-align: center;",
    "text-right": "text-align: right;",
    "text-justify": "text-align: justify;",
    uppercase: "text-transform: uppercase;",
    lowercase: "text-transform: lowercase;",
    capitalize: "text-transform: capitalize;",
    normalcase: "text-transform: none;",
    truncate: "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;",
    "sr-only":
        "position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;",
    "not-sr-only":
        "position: static; width: auto; height: auto; padding: 0; margin: 0; overflow: visible; clip: auto; white-space: normal;",
};

/**
 * Valid CSS `visibility` values.
 */
export const visibilityValues: string[] = ["visible", "invisible"];

/**
 * Union of position + display values for direct (non-bracketed) class matches.
 * e.g. `<div class="flex absolute">` — no square bracket syntax needed.
 */
export const individualConstants: string[] = [...positionValues, ...displayValues];

/**
 * Maps spacing direction shorthand keys to actual CSS side names.
 * @example  "x" → ["left", "right"]
 */
export const spacingUtilsDirections: Record<string, string[]> = {
    "": [""], // p  / m  → padding / margin (all sides)
    x: ["left", "right"],
    y: ["top", "bottom"],
    t: ["top"],
    b: ["bottom"],
    l: ["left"],
    r: ["right"],
};

/**
 * Maps CSS property name to its single-character shorthand prefix.
 * @example  "padding" → "p"
 */
export const spacingUtilsProperties: Record<string, string> = {
    padding: "p",
    margin: "m",
};

/**
 * Tailwind-like spacing scale for non-bracket spacing utilities.
 * Examples: `m-1` => `0.25rem`, `p-2` => `0.5rem`, `mx-0.5` => `0.125rem`.
 */
export const spacingScale: Record<string, string> = {
    "0": "0px",
    px: "1px",
    "0.5": "0.125rem",
    "1": "0.25rem",
    "1.5": "0.375rem",
    "2": "0.5rem",
    "2.5": "0.625rem",
    "3": "0.75rem",
    "3.5": "0.875rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "7": "1.75rem",
    "8": "2rem",
    "9": "2.25rem",
    "10": "2.5rem",
    "11": "2.75rem",
    "12": "3rem",
    "14": "3.5rem",
    "16": "4rem",
    "20": "5rem",
    "24": "6rem",
    "28": "7rem",
    "32": "8rem",
    "36": "9rem",
    "40": "10rem",
    "44": "11rem",
    "48": "12rem",
    "52": "13rem",
    "56": "14rem",
    "60": "15rem",
    "64": "16rem",
    "72": "18rem",
    "80": "20rem",
    "96": "24rem",
};

export const fractionScale: Record<string, string> = {
    "1/2": "50%",
    "1/3": "33.333333%",
    "2/3": "66.666667%",
    "1/4": "25%",
    "2/4": "50%",
    "3/4": "75%",
    "1/5": "20%",
    "2/5": "40%",
    "3/5": "60%",
    "4/5": "80%",
    "1/6": "16.666667%",
    "2/6": "33.333333%",
    "3/6": "50%",
    "4/6": "66.666667%",
    "5/6": "83.333333%",
    full: "100%",
};

export const sizeScale: Record<string, string> = {
    ...spacingScale,
    ...fractionScale,
    auto: "auto",
    full: "100%",
    screen: "100vw",
    svw: "100svw",
    lvw: "100lvw",
    dvw: "100dvw",
    min: "min-content",
    max: "max-content",
    fit: "fit-content",
};

export const heightScale: Record<string, string> = {
    ...sizeScale,
    screen: "100vh",
    svh: "100svh",
    lvh: "100lvh",
    dvh: "100dvh",
};

export const maxWidthScale: Record<string, string> = {
    none: "none",
    xs: "20rem",
    sm: "24rem",
    md: "28rem",
    lg: "32rem",
    xl: "36rem",
    "2xl": "42rem",
    "3xl": "48rem",
    "4xl": "56rem",
    "5xl": "64rem",
    "6xl": "72rem",
    "7xl": "80rem",
    full: "100%",
    min: "min-content",
    max: "max-content",
    fit: "fit-content",
    prose: "65ch",
    screen: "100vw",
};

export const radiusScale: Record<string, string> = {
    none: "0px",
    sm: "0.125rem",
    DEFAULT: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
};

export const fontSizeScale: Record<string, string> = {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
    "8xl": "6rem",
    "9xl": "8rem",
};

export const fontWeightScale: Record<string, string> = {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
};
