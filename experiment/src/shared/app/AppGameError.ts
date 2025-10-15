import { DomainError } from "../errors/errors.mixins";

export type Context = "APP";
export type Error =
  | "not-found"
  | "multiple-instances"
  | "initialization-failed"
  | "not-initialized";

const AppGameError = DomainError<Error, Context>("APP");

export default AppGameError;
