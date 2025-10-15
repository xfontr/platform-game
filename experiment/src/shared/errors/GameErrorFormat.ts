import { DEFAULT_ERROR_NAME, UNKNOWN_ERROR_NAME } from "./errors.constants";

class GameErrorFormat<C extends Uppercase<string>> extends Error {
  readonly context: C;

  constructor(context: C, message?: string) {
    super(message);
    this.context = context;
  }
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
  protected toErrorName(): `[${C}] ${typeof DEFAULT_ERROR_NAME}`;
  protected toErrorName(error: Error): `[${C}] ${string}`;
  protected toErrorName(
    error?: Error
  ): `[${C}] ${string}` | `[${C}] ${typeof DEFAULT_ERROR_NAME}` {
    return error
      ? `[${this.context}] ${error.name}`
      : `[${this.context}] ${DEFAULT_ERROR_NAME}`;
  }

  /**
   * Builds a standardized error key string.
   *
   * @example
   * toErrorKey("CANVAS"); // → "error.canvas.unknown"
   * toErrorKey("CANVAS", "INVALID"); // → "error.canvas.INVALID"
   */
  protected toErrorKey<K extends string = "unknown">(
    key?: K
  ): `error.${Lowercase<C>}.${K}` {
    return `error.${this.context.toLowerCase()}.${
      key ?? UNKNOWN_ERROR_NAME
    }` as `error.${Lowercase<C>}.${K}`;
  }
}

export default GameErrorFormat;
