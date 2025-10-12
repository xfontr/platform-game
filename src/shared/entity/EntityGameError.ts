import { DomainError } from "../errors/errors.mixins";

export type Context = "ENTITIES";
export type Error =
  | "asset-not-found"
  | "asset-not-set"
  | "animated-sprite-not-found"
  | "animation-not-set";

const EntityGameError = DomainError<Error, Context>("ENTITIES");

export default EntityGameError;
