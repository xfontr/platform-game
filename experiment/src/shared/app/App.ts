import SizeObserver from "../../helpers/SizeObserver";
import assert from "../../utils/assert";
import AppGameError from "./AppGameError";
import type { Application, Renderer } from "pixi.js";

let instantiated = false;

class App extends SizeObserver<HTMLDivElement> {
  private app?: Application<Renderer>;

  constructor(container: HTMLDivElement | null) {
    assert(!instantiated, () => new AppGameError("multiple-instances"));

    if (!container) throw new AppGameError("not-found");

    instantiated = true;

    super(container);
  }

  private mount(app: Application<Renderer>): void {
    this.element.appendChild(app.canvas);
    this.app = app;

    this.onResize(({ width, height }) => {
      this.app!.renderer.resize(width, height);
    });
  }

  public async init(app: Application<Renderer>): Promise<void> {
    if (this.app) return;

    const { clientHeight, clientWidth } = this.element;

    try {
      await app.init({
        background: "black",
        width: clientWidth,
        height: clientHeight,
        resizeTo: this.element,
      });
      app.canvas.style.position = "absolute";
    } catch (error) {
      throw new AppGameError(error, "initialization-failed");
    }

    this.mount(app);
  }

  public get(): Application<Renderer> {
    assert(this.app, () => new AppGameError("not-initialized"));
    return this.app;
  }
}

export default App;
