type ResizeCallback<T extends Element> = (
  contentRect: DOMRectReadOnly,
  element: T
) => void;

/**
 * Observes size changes of a given DOM element. Recommended to use only
 * once per node.
 *
 * @example
 *
 * const observer = new SizeObserver(element);
 *
 * observer.onResize((contentRect, element) => {
 *   // ...
 * }
 */
class SizeObserver<T extends Element> {
  private resizeObserver: ResizeObserver | undefined;
  private resizeCallbackStack: Set<ResizeCallback<T>> = new Set();
  protected element: T;

  constructor(element: T) {
    this.element = element;
  }

  private observeResize(): void {
    this.resizeObserver = new ResizeObserver(([element]) => {
      this.resizeCallbackStack.forEach((callback) => {
        callback(element.contentRect, this.element);
      });
    });

    this.resizeObserver.observe(this.element);
  }

  /**
   * Registers a callback to run whenever the element is resized.
   */
  public onResize<C extends ResizeCallback<T>>(callback: C): C {
    this.resizeCallbackStack.add(callback);

    if (this.resizeCallbackStack.size !== 1) return callback;

    this.observeResize();
    return callback;
  }

  /**
   * Cleans up a specific callback.
   */
  public removeListener(callback: ResizeCallback<T>): void {
    this.resizeCallbackStack.delete(callback);

    if (this.resizeCallbackStack.size) return;

    this.resizeObserver?.unobserve(this.element);
  }

  /**
   * Ensures no more listeners will ever work
   */
  public destroy() {
    this.resizeCallbackStack = new Set();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }
}

export default SizeObserver;
