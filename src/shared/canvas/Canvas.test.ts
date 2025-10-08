import Canvas from "./Canvas";
import CanvasGameError from "./CanvasGameError";

describe("Canvas", () => {
  it("should throw a canvas error if node not found", () => {
    const expectedError = new CanvasGameError("not-found");

    expect(() => new Canvas(undefined)).toThrowError(expectedError);
  });
});
