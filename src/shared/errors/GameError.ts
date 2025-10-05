import type { OverloadedParameters } from "../types/utility";
import { toErrorKey, toErrorName } from "./errorFormatter";

class GameError<
  T extends Uppercase<string>,
  E extends Error | string
> extends Error {
  declare name: OverloadedParameters<typeof toErrorName<T>>;

  constructor(context: T, error?: E) {
    const isErrorInstance = error instanceof Error;

    const name = isErrorInstance
      ? toErrorName(context, error)
      : toErrorName(context);

    const message = isErrorInstance
      ? error.message
      : toErrorKey(context, error as string);

    super(message);

    this.name = name;
  }
}

export default GameError;
