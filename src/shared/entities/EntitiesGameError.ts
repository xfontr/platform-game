import { DomainError } from "../errors/errors.mixins";

export type Context = "ENTITIES";
export type Error = "asset-not-found";

const EntitiesGameError = DomainError<Error, Context>("ENTITIES");

export default EntitiesGameError;
