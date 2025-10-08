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
 *   console.log('Element resized:', contentRect, element);
 * }
 */
class SizeObserver<T extends Element> {
  public contentRect: DOMRectReadOnly;

  private resizeObserver: ResizeObserver | undefined;
  private resizeCallbackStack: ResizeCallback<T>[] = [];
  protected element: T;

  constructor(element: T) {
    this.element = element;
    this.contentRect = element.getBoundingClientRect();
  }

  private observeResize(): void {
    this.resizeObserver = new ResizeObserver(([element]) => {
      this.contentRect = element.contentRect;
      this.resizeCallbackStack.forEach((callback) => {
        callback(element.contentRect, this.element);
      });
    });

    this.resizeObserver.observe(this.element);
  }

  /**
   * Registers a callback to run whenever the element is resized.
   */
  onResize(callback: ResizeCallback<T>): void {
    this.resizeCallbackStack.push(callback);

    if (this.resizeCallbackStack.length !== 1) return;

    this.observeResize();
  }

  /**
   * Cleans up the observer.
   */
  onDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}

export default SizeObserver;
