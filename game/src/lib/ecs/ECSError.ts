import { DomainError } from "../errors/errors.mixins";

export type ECS = "ECS";
export type Error = "component-not-found" | "component-already-added";

const ECSError = DomainError<Error, ECS>("ECS");

export default ECSError;
