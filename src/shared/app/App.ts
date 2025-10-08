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

  public async init(app: Application<Renderer>): Promise<typeof this> {
    if (this.app) return this;

    try {
      await app.init({ background: "black" });
    } catch (error) {
      throw new AppGameError(error as Error, "initialization-failed");
    }

    this.app = app;
    this.element.appendChild(app.canvas);

    return this;
  }

  public get(): Application<Renderer> {
    assert(this.app, () => new AppGameError("not-initialized"));
    return this.app;
  }
}

export default App;
