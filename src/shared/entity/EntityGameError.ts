import { DomainError } from "../errors/errors.mixins";

export type Context = "ENTITIES";
export type Error =
  | "asset-not-found"
  | "asset-not-set"
  | "position-not-set"
  | "animated-sprite-not-found";

const EntityGameError = DomainError<Error, Context>("ENTITIES");

export default EntityGameError;
