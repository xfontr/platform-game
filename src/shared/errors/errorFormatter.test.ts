import { CONTEXT, DEFAULT_ERROR_NAME } from "../../configs/constants";
import { toErrorKey, toErrorName } from "./errorFormatter";

const context = CONTEXT.test;
const namedContext = `[${context}]`;

describe("toErrorName", () => {
  it(`'${namedContext} ${DEFAULT_ERROR_NAME}' when context is provided`, () => {
    const result = toErrorName(context);

    expect(result).toBe(`${namedContext} ${DEFAULT_ERROR_NAME}`);
  });

  it(`'${namedContext} Error' when context and error are provided`, () => {
    const error = new Error("test");
    const result = toErrorName(context, error);

    expect(result).toBe(`${namedContext} Error`);
  });
});

describe("toErrorKey", () => {
  it("should return error key with default 'unknown'", () => {
    const result = toErrorKey(CONTEXT.test);
    expect(result).toBe(`error.${CONTEXT.test.toLowerCase()}.unknown`);
  });

  it("should return error key with provided key", () => {
    const result = toErrorKey(CONTEXT.test, "INVALID");
    expect(result).toBe(`error.${CONTEXT.test.toLowerCase()}.INVALID`);
  });
});
