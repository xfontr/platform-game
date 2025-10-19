import { DomainError } from "../errors/errors.mixins";

export type Context = "ASSETS";
export type Error =
  | "manifest"
  | "empty-manifest"
  | "duplicate"
  | "empty-assets";

const AssetsGameError = DomainError<Error, Context>("ASSETS");

export default AssetsGameError;
