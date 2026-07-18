import type { ValCSSConfig } from "../types/index.js";

let cachedConfig: ValCSSConfig | null = null;

/**
 * Stores the resolved config globally so all modules can access it
 * without re-reading the file.
 */
export function setConfig(config: ValCSSConfig): void {
    cachedConfig = config;
}

/**
 * Retrieves the cached config.
 * @throws If `setConfig` has not been called yet.
 */
export function getConfig(): ValCSSConfig {
    if (!cachedConfig) {
        throw new Error("Config not initialized. Call setConfig(config) first.");
    }
    return cachedConfig;
}
