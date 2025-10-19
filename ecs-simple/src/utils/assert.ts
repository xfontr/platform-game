type Computed<T> = () => T;
type AsyncComputed<T> = () => Promise<T>;

// TODO: Overload JSDocs
// TODO: Test async and sync callbacks

/**
 * Development-only assertion utility.
 *
 * Throws an error created by the provided `errorFactory` **only in non-production environments**
 * when the condition fails. Supports:
 * - **Synchronous values** (direct checks)
 * - **Synchronous callbacks** (lazy/deferred checks)
 * - **Asynchronous callbacks** (promise-based checks)
 *
 * This avoids doing expensive checks or async work unnecessarily in production.
 */
function assert<T>(condition: T, errorFactory: () => Error): asserts condition;

function assert<T>(
  condition: Computed<T>,
  errorFactory: () => Error
): asserts condition;

function assert<T>(
  condition: AsyncComputed<T>,
  errorFactory: () => Error
): Promise<void>;

function assert<T>(
  condition: T | Computed<T> | AsyncComputed<T>,
  errorFactory: () => Error
): void | Promise<void> {
  if (import.meta.env.NODE_ENV === "production") return;

  if (isFunction(condition)) handlePromise(condition, errorFactory);

  if (!Boolean(condition)) throw errorFactory();
}

//#region Private methods

function isFunction(value: unknown): value is Function {
  return typeof value === "function";
}

function handlePromise<T>(
  condition: Computed<T> | AsyncComputed<T>,
  errorFactory: () => Error
) {
  if (condition instanceof Promise) {
    condition.then((res) => {
      if (!res) throw errorFactory();
    });
  } else if (!condition()) throw errorFactory();
}

//#endregion

export default assert;
