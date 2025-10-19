import CustomError from "./CustomError";
import { CONTEXT_TEST } from "./errors.constants";

/**
 * It's going to be a lot more but for test to be valid we at least need to ensure a bare minimum.
 */
const MIN_STACK_TRACE = 3;
/**
 * These stack lines correspond to the name, message and the error line (diff strings).
 * Testing them would increase complexity with no added value.
 */
const TRACE_SKIP = 2;

describe("CustomError", () => {
  it("should create an error out of a normal Error", () => {
    const normalError = new Error("test");
    const customError = new CustomError(CONTEXT_TEST, normalError);

    expect(customError.name).toBe("[TEST] Error");
    expect(customError.message).toBe("test");
  });

  it("should create an error out of an error ID", () => {
    const errorKey = "error.key";
    const customError = new CustomError(CONTEXT_TEST, errorKey);

    expect(customError.name).toBe("[TEST] error.default");
    expect(customError.message).toBe("error.test.error.key");
  });

  it("should create an error out of a normal Error and ID", () => {
    const errorKey = "error.key";
    const normalError = new Error("test");

    const customError = new CustomError(CONTEXT_TEST, normalError, errorKey);

    expect(customError.name).toBe("[TEST] Error");
    expect(customError.message).toBe("error.test.error.key");
  });

  it("should create a empty error with only the context", () => {
    const customError = new CustomError(CONTEXT_TEST);

    expect(customError.name).toBe("[TEST] error.default");
    expect(customError.message).toBe("error.test.unknown");
  });

  it("should preserve a valid stack trace", () => {
    const normalError = new Error("trace test");
    const customError = new CustomError(CONTEXT_TEST, normalError);

    const normalStack = normalError.stack!.split("\n").splice(TRACE_SKIP);
    const customStack = customError.stack!.split("\n").splice(TRACE_SKIP);

    expect(normalStack.length > MIN_STACK_TRACE).toBeTruthy();

    normalStack.forEach((stackLine, index) => {
      expect(stackLine).toBe(customStack[index]);
    });
  });
});
