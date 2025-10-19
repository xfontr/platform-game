import { DomainError } from "../errors/errors.mixins";

export type ECS = "ECS";
export type Error =
  | "component.delete.not.found"
  | "component.get.not.found"
  | "component.add.added";

const ECSError = DomainError<Error, ECS>("ECS");

export default ECSError;
