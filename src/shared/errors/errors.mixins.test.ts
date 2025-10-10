import { describe, it, expect } from "vitest";
import { DomainError } from "./errors.mixins";
import { DEFAULT_ERROR_NAME } from "./errors.constants";

describe("DomainError", () => {
  const CONTEXT = "APP" as const;
  const AppError = DomainError<"not-found" | "init-failed", typeof CONTEXT>(
    CONTEXT
  );

  it("should create an error from a key", () => {
    const error = new AppError("not-found");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe(`[${CONTEXT}] ${DEFAULT_ERROR_NAME}`);
    expect(error.message).toBe(`error.${CONTEXT.toLowerCase()}.not-found`);
  });

  it("should create an error from a native Error", () => {
    const baseError = new Error("crash");
    const error = new AppError(baseError);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe(`[${CONTEXT}] Error`);
    expect(error.message).toBe("crash");
  });

  it("should create an error from a native Error and a key", () => {
    const baseError = new Error("boom");
    const error = new AppError(baseError, "init-failed");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe(`[${CONTEXT}] Error`);
    expect(error.message).toBe(`error.${CONTEXT.toLowerCase()}.init-failed`);
  });
});
