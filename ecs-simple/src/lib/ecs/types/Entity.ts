import type Component from "../Component";
import type { Flags } from "./Flags";

export interface Entity extends Flags {
  add<T extends Component>(component: T): this;
  has<T extends Component>(component: T): boolean;
  get<T extends Component>(component: T): T;
  delete<T extends Component>(component: T): void;
}
