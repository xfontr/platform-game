import SizeObserver from "../../helpers/SizeObserver";
import CanvasGameError from "./CanvasGameError";
import assert from "../../utils/assert";

let instantiated = false;

class Canvas extends SizeObserver<HTMLCanvasElement> {
  public ctx;

  constructor(element?: HTMLCanvasElement | null) {
    assert(!instantiated, () => new CanvasGameError("multiple-instances"));

    if (!element) throw new CanvasGameError("not-found");

    instantiated = true;

    super(element);

    this.ctx = element.getContext("2d");
  }
}

export default Canvas;
