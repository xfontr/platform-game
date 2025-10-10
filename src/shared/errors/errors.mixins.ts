import GameError from "./GameError";
import assert from "../../utils/assert";

/**
 * Mixin to create domain-specific error classes.
 *
 * @template T - The context/domain of the error (e.g., "APP", "USER").
 * @template Errors - The union of string keys representing possible errors in this domain.
 *
 * @example
 * ```ts
 * type AppErrorKeys = "not-found" | "init-failed";
 * const AppError = DomainError<"APP", AppErrorKeys>("APP");
 *
 * new AppError("not-found");                    // string key only
 * new AppError(new Error("oops"));   // native Error
 * new AppError(new Error("oops"), "init-failed"); // native Error + key
 * ```
 *
 * @source Mixins: https://www.typescriptlang.org/docs/handbook/mixins.html
 * @source Constructor overloading: https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads
 */
export function DomainError<
  Errors extends string,
  T extends Uppercase<string> = Uppercase<string>
>(context: T) {
  return class DomainError extends GameError<T> {
    /** Construct an error using a native Error instance and optional domain key. */
    constructor(error: Error | unknown, key?: Errors);

    /** Construct an error using only a domain-specific key. */
    constructor(key: Errors);
    constructor(errorOrKey: Error | unknown | Errors, key?: Errors) {
      if (errorOrKey instanceof Error) {
        super(context, errorOrKey, key);
        return;
      }

      assert(typeof errorOrKey === "string", () => {
        console.warn(errorOrKey, key);
        throw new Error("Unexpected error type");
      });

      super(context, errorOrKey);
    }
  };
}
