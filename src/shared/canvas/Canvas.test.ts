import Canvas from "./Canvas";
import CanvasGameError from "./CanvasGameError";

describe("Canvas", () => {
  it("should allow direct access to the canvas node", () => {
    const canvasElement = document.createElement("canvas");

    const canvas = new Canvas(canvasElement);

    expect(canvas.element).toStrictEqual(canvasElement);
  });

  it("should throw a canvas error if node not found", () => {
    const expectedError = new CanvasGameError("not-found");

    expect(() => new Canvas(undefined)).toThrowError(expectedError);
  });
});
