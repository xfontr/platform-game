/**
 * Development-only assertion utility.
 *
 * Throws an error created by the provided `errorFactory` **only in non-production environments**
 * when the given condition evaluates to `false`.
 *
 * @example
 * ```ts
 * assert(user != null, () => new Error("User must be defined"));
 * // After this line, `user` is treated as non-null.
 * ```
 */
function assert<T>(condition: T, errorFactory: () => Error): asserts condition {
  if (process.env.NODE_ENV !== "production" && !Boolean(condition)) {
    throw errorFactory();
  }
}

export default assert;
