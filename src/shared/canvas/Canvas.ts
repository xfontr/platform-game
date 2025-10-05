import CanvasGameError from "./CanvasGameError";

type ResizeCallback = (element: HTMLCanvasElement) => void;

class Canvas {
  private resizeObserver: ResizeObserver | undefined;

  public element: HTMLCanvasElement;
  public contentRect: DOMRectReadOnly;

  private resizeCallbackStack: ResizeCallback[] = [];

  constructor(element?: HTMLCanvasElement | null) {
    if (!element) {
      throw new CanvasGameError("not-found");
    }

    this.element = element;
    this.contentRect = element.getBoundingClientRect();

    this.observeResize(this.element);
  }

  private observeResize<T extends Element>(element: T) {
    this.resizeObserver = new ResizeObserver(([element]) => {
      this.contentRect = element.contentRect;
      this.resizeCallbackStack.forEach((callback) => {
        callback(this.element);
      });
    });

    this.resizeObserver.observe(element);
  }

  onResize(callback: ResizeCallback) {
    this.resizeCallbackStack.push(callback);
  }

  onDestroy() {
    this.resizeObserver?.disconnect();
  }
}

export default Canvas;
