import { DEFAULT_ERROR_NAME } from "../../configs/constants";

/**
 * Builds a standardized error name string like `[CONTEXT]` or `[CONTEXT] ERROR_NAME`.
 *
 * @example
 * toErrorName("CANVAS", new Error());  // → "[CANVAS] Error"
 * toErrorName("CANVAS");  // → "[CANVAS] <default error key>"
 *
 * @warning
 * This specific overloading, as it is right now, serves no purpose
 */
function toErrorName<T extends Uppercase<string>>(
  context: T
): `[${T}] ${typeof DEFAULT_ERROR_NAME}`;
function toErrorName<T extends Uppercase<string>>(
  context: T,
  error: Error
): `[${T}] ${string}`;
function toErrorName<T extends Uppercase<string>>(
  context: T,
  error?: Error
): `[${T}] ${string}` | `[${T}] ${typeof DEFAULT_ERROR_NAME}` {
  return error
    ? `[${context}] ${error.name}`
    : `[${context}] ${DEFAULT_ERROR_NAME}`;
}

/**
 * Builds a standardized error key string.
 *
 * @example
 * toErrorKey("CANVAS"); // → "error.canvas.unknown"
 * toErrorKey("CANVAS", "INVALID"); // → "error.canvas.INVALID"
 */
function toErrorKey<T extends string, K extends string = "unknown">(
  context: T,
  key?: K
): `error.${Lowercase<T>}.${K}` {
  return `error.${context.toLowerCase()}.${
    key ?? "unknown"
  }` as `error.${Lowercase<T>}.${K}`;
}

export { toErrorName, toErrorKey };
