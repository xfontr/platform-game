import { CONTEXT } from "../../configs/constants";
import GameError from "../errors/GameError";

type CanvasError = "not-found";

class CanvasGameError<E extends Error | CanvasError> extends GameError<
  typeof CONTEXT.canvas,
  E
> {
  constructor(error: E) {
    super(CONTEXT.canvas, error);
  }
}

export default CanvasGameError;
