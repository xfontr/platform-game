import GameError from "../errors/GameError";

type CanvasError = "not-found" | "multiple-instances";

class CanvasGameError<E extends Error | CanvasError> extends GameError<
  "CANVAS",
  E
> {
  constructor(error: E) {
    super("CANVAS", error);
  }
}

export default CanvasGameError;
