import type Component from "../Component";

export interface Entity {
  add<T extends Component>(component: T): this;
  has<T extends Component>(component: T): boolean;
  get<T extends Component>(component: T): T;
}
