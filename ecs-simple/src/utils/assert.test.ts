import assert from "./assert";

describe("assert", () => {
  it("should throw error in non-production when condition is false", () => {
    const error = new Error("fail");
    const factory = vi.fn(() => error);
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    expect(() => assert(false, factory)).toThrow(error);
    expect(factory).toHaveBeenCalledOnce();

    process.env.NODE_ENV = originalEnv;
  });

  it("should not throw when condition is true", () => {
    const factory = vi.fn(() => new Error("fail"));
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    expect(() => assert(true, factory)).not.toThrow();
    expect(factory).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });

  it("should not throw in production mode even if condition is false", () => {
    const factory = vi.fn(() => new Error("fail"));
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    expect(() => assert(false, factory)).not.toThrow();
    expect(factory).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });
});
