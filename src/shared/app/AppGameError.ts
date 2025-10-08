import { DomainError } from "../errors/errors.mixins";

export type AppError =
  | "not-found"
  | "multiple-instances"
  | "initialization-failed"
  | "not-initialized";

const AppGameError = DomainError<"APP", AppError>("APP");

export default AppGameError;
