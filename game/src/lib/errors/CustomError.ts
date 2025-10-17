import type { DEFAULT_ERROR_NAME } from "./errors.constants";
import CustomErrorFormat from "./CustomErrorFormat";

/**
 * Represents a structured custom error with contextual information.
 *
 * Can be instantiated with either a raw `Error` or a predefined key,
 * or both.
 */
class CustomError<C extends Uppercase<string>> extends CustomErrorFormat<C> {
  declare name: `[${C}] ${string}` | `[${C}] ${typeof DEFAULT_ERROR_NAME}`;

  /**
   * Creates a new `CustomError` instance.
   *
   * - With only an `Error`, it formats a message with a default error message as well.
   * - If a `key` is added, replaces the default error message with a custom one.
   */
  constructor(context: C, error?: Error, key?: string);
  /**
   * Creates a new `CustomError` instance.
   *
   * - With only a `key`, it creates a standardized error message.
   */
  constructor(context: C, key?: string);
  constructor(context: C, errorOrKey?: Error | string, key?: string) {
    super(context, undefined);

    const isError = errorOrKey instanceof Error;

    const keyMessage = key ? this.toErrorKey(key) : undefined;

    this.message = isError
      ? keyMessage ?? errorOrKey.message
      : this.toErrorKey(errorOrKey);

    this.name = isError ? this.toErrorName(errorOrKey) : this.toErrorName();
  }
}

export default CustomError;
