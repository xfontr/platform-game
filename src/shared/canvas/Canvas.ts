import CanvasGameError from "./CanvasGameError";

class Canvas {
  public element: HTMLCanvasElement;

  constructor(element?: HTMLCanvasElement) {
    if (!element) {
      throw new CanvasGameError("not-found");
    }

    this.element = element;
  }
}

export default Canvas;
