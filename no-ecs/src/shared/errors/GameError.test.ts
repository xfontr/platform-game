import { CONTEXT_TEST } from "./errors.constants";
import GameError from "./GameError";

/**
 * It's going to be a lot more but for test to be valid we at least need to ensure a bare minimum.
 */
const MIN_STACK_TRACE = 3;
/**
 * These stack lines correspond to the name, message and the error line (diff strings).
 * Testing them would increase complexity with no added value.
 */
const TRACE_SKIP = 2;

describe("GameError", () => {
  it("should create an error out of a normal Error", () => {
    const normalError = new Error("test");
    const gameError = new GameError(CONTEXT_TEST, normalError);

    expect(gameError.name).toBe("[TEST] Error");
    expect(gameError.message).toBe("test");
  });

  it("should create an error out of an error ID", () => {
    const errorKey = "error.key";
    const gameError = new GameError(CONTEXT_TEST, errorKey);

    expect(gameError.name).toBe("[TEST] error.default");
    expect(gameError.message).toBe("error.test.error.key");
  });

  it("should create an error out of a normal Error and ID", () => {
    const errorKey = "error.key";
    const normalError = new Error("test");

    const gameError = new GameError(CONTEXT_TEST, normalError, errorKey);

    expect(gameError.name).toBe("[TEST] Error");
    expect(gameError.message).toBe("error.test.error.key");
  });

  it("should create a empty error with only the context", () => {
    const gameError = new GameError(CONTEXT_TEST);

    expect(gameError.name).toBe("[TEST] error.default");
    expect(gameError.message).toBe("error.test.unknown");
  });

  it("should preserve a valid stack trace", () => {
    const normalError = new Error("trace test");
    const gameError = new GameError(CONTEXT_TEST, normalError);

    const normalStack = normalError.stack!.split("\n").splice(TRACE_SKIP);
    const gameStack = gameError.stack!.split("\n").splice(TRACE_SKIP);

    expect(normalStack.length > MIN_STACK_TRACE).toBeTruthy();

    normalStack.forEach((stackLine, index) => {
      expect(stackLine).toBe(gameStack[index]);
    });
  });
});
