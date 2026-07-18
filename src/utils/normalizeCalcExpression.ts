/**
 * Adds proper spacing around math operators inside CSS math function arguments.
 * Also replaces underscores with empty string (used as space-escape in class names).
 *
 * @example
 * normalizeExpression("100%-50px+20px") // "100% - 50px + 20px"
 */
export function normalizeExpression(expr: string): string {
    return expr
        .replace(/_/g, "")
        .replace(/([+\-*/])/g, " $1 ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Normalizes a `calc()` expression.
 *
 * @example
 * normalizeCalcExpression("calc(100%-50px)") // "calc(100% - 50px)"
 */
export function normalizeCalcExpression(value: string): string {
    if (!value.startsWith("calc(")) return value;

    return value.replace(/calc\((.*?)\)/, (_, expr: string) => {
        return `calc(${normalizeExpression(expr)})`;
    });
}

/**
 * Normalizes a `clamp()` expression.
 *
 * @example
 * normalizeClampExpression("clamp(200px,40%+10px,400px)") // "clamp(200px, 40% + 10px, 400px)"
 */
export function normalizeClampExpression(value: string): string {
    if (!value.startsWith("clamp(")) return value;

    return value.replace(/clamp\((.*?)\)/, (_, expr: string) => {
        return `clamp(${normalizeExpression(expr)})`;
    });
}

/**
 * Normalizes `min()` and `max()` expressions.
 *
 * @example
 * normalizeMinMaxExpression("min(100px,50%)") // "min(100px, 50%)"
 */
export function normalizeMinMaxExpression(value: string): string {
    if (!value.startsWith("min(") && !value.startsWith("max(")) return value;

    return value.replace(/(min|max)\((.*?)\)/, (_, func: string, expr: string) => {
        return `${func}(${normalizeExpression(expr)})`;
    });
}

/**
 * Global CSS math normalizer — handles all of: `calc()`, `min()`, `max()`, `clamp()`.
 * Also replaces underscores with spaces (class-name escape convention).
 *
 * @example
 * normalizeCSSMath("calc(100%_-_50px)") // "calc(100% - 50px)"
 */
export function normalizeCSSMath(value: string): string {
    if (typeof value !== "string") return value;

    return value
        .replace(/_/g, " ")
        .replace(/calc\((.*?)\)/g, (_, expr: string) => `calc(${normalizeExpression(expr)})`)
        .replace(/clamp\((.*?)\)/g, (_, expr: string) => `clamp(${normalizeExpression(expr)})`)
        .replace(
            /(min|max)\((.*?)\)/g,
            (_, func: string, expr: string) => `${func}(${normalizeExpression(expr)})`
        );
}
