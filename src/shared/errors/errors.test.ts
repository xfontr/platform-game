import { CONTEXT_TEST, DEFAULT_ERROR_NAME } from "../../configs/constants";
import { toErrorKey, toErrorName } from "./errors";

const namedContext = `[${CONTEXT_TEST}]`;

describe("toErrorName", () => {
  it(`'${namedContext} ${DEFAULT_ERROR_NAME}' when context is provided`, () => {
    const result = toErrorName(CONTEXT_TEST);

    expect(result).toBe(`${namedContext} ${DEFAULT_ERROR_NAME}`);
  });

  it(`'${namedContext} Error' when context and error are provided`, () => {
    const error = new Error("test");
    const result = toErrorName(CONTEXT_TEST, error);

    expect(result).toBe(`${namedContext} Error`);
  });
});

describe("toErrorKey", () => {
  it("should return error key with default 'unknown'", () => {
    const result = toErrorKey(CONTEXT_TEST);
    expect(result).toBe(`error.${CONTEXT_TEST.toLowerCase()}.unknown`);
  });

  it("should return error key with provided key", () => {
    const result = toErrorKey(CONTEXT_TEST, "INVALID");
    expect(result).toBe(`error.${CONTEXT_TEST.toLowerCase()}.INVALID`);
  });
});
