/**
 * Regular expressions for validating CSS values.
 */
export const regex = {
    length: /^-?\d+(\.\d+)?(px|em|rem|%|vh|vw)?$/,
    calc: /^calc\(.+\)$/,
    clamp: /^clamp\(.+\)$/,
    min: /^min\(.+\)$/,
    max: /^max\(.+\)$/,
    hex: /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
    rgb: /^rgb\((\s*\d{1,3}\s*,){2}\s*\d{1,3}\s*\)$/,
    rgba: /^rgba\((\s*\d{1,3}\s*,){3}\s*(0|1|0?\.\d+)\)$/,
    namedColor: /^(transparent|[a-zA-Z]+)$/,
    fontWeight: /^(100|200|300|400|500|600|700|800|900)$/,
    normal: /^normal$/,
    none: /^none$/,
    textAlign: /^(left|right|center|justify)$/,
    textTransform: /^(uppercase|lowercase|capitalize|none)$/,
    display: /^(block|inline|inline-block|flex|grid|none|inline-flex|inline-grid)$/,
    justify: /^(flex-start|flex-end|center|space-between|space-around|space-evenly)$/,
    items: /^(stretch|flex-start|flex-end|center|baseline)$/,
    borderStyle: /^(none|solid|dashed|dotted|double|groove|ridge|inset|outset)$/,
    opacity: /^(0(\.\d+)?|1(\.0+)?)$/,
    digit: /^[-+]?(?:\d+|\d*\.\d+)$/,
    position: /^(static|relative|absolute|fixed|sticky)$/,
    float: /^(left|right|none)$/,
    flex: /^\d+(\s\d+(\s.+)?)?$|^(auto|none|initial)$/,
    integer: /^-?\d+$/,
} as const;

/**
 * Validator functions for CSS property values.
 * Each function returns `true` if the value is valid for that property.
 */
export const validators = {
    lengthUnit: (val: string): boolean =>
        regex.length.test(val) ||
        regex.calc.test(val) ||
        regex.clamp.test(val) ||
        regex.min.test(val) ||
        regex.max.test(val),

    color: (val: string): boolean =>
        regex.hex.test(val) ||
        regex.rgb.test(val) ||
        regex.rgba.test(val) ||
        regex.namedColor.test(val),

    fontWeight: (val: string): boolean => regex.fontWeight.test(val),
    lineHeight: (val: string): boolean => regex.digit.test(val) || regex.normal.test(val),
    textAlign: (val: string): boolean => regex.textAlign.test(val),
    textTransform: (val: string): boolean => regex.textTransform.test(val),
    display: (val: string): boolean => regex.display.test(val),
    justify: (val: string): boolean => regex.justify.test(val),
    items: (val: string): boolean => regex.items.test(val),
    opacity: (val: string): boolean => regex.opacity.test(val),
    zIndex: (val: string): boolean => regex.digit.test(val),
    position: (val: string): boolean => regex.position.test(val),
    float: (val: string): boolean => regex.float.test(val),
    flex: (val: string): boolean => regex.flex.test(val),

    border: (val: string): boolean => {
        const trimmed = val.trim().toLowerCase();
        const parts = trimmed.split("_");

        return parts.every(
            (part) =>
                regex.length.test(part) ||
                regex.borderStyle.test(part) ||
                regex.hex.test(part) ||
                regex.rgb.test(part) ||
                regex.rgba.test(part) ||
                regex.namedColor.test(part)
        );
    },

    bg: (val: string): boolean => {
        const trimmed = val.trim().toLowerCase();
        return (
            regex.hex.test(trimmed) ||
            regex.rgb.test(trimmed) ||
            regex.none.test(trimmed) ||
            regex.namedColor.test(trimmed)
        );
    },

    spacingValues: (val: string): boolean => {
        const trimmed = val.trim().toLowerCase();
        const parts = trimmed.split("_");

        if (parts.length < 1 || parts.length > 4) return false;

        return parts.every(
            (part) =>
                regex.length.test(part) ||
                regex.calc.test(part) ||
                regex.clamp.test(part) ||
                regex.min.test(part) ||
                regex.max.test(part)
        );
    },
} as const;
