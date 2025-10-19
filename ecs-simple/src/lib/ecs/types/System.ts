import type Entity from "../Entity";
import type { ComponentRef } from "./Component";
import type { Flags } from "./Flags";

export interface System extends Flags {
  needs(...components: ComponentRef[]): this;
  update(entities: Entity[]): void;
}
