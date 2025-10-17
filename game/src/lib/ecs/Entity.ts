import type { ComponentRef } from "./types/Component";
import assert from "../../utils/assert";
import type Component from "./Component";
import ECSError from "./ECSError";
import type { Entity as EntityContract } from "./types/Entity";

class Entity implements EntityContract {
  private components = new Map<ComponentRef, Component>();

  add<T extends Component>(component: T): this {
    assert(
      () => !this.components.get(component.constructor),
      () => new ECSError("component-already-added")
    );

    this.components.set(component.constructor, component);
    return this;
  }

  has<T extends Component>(component: T): boolean {
    return this.components.has(component.constructor);
  }

  get<T extends Component>(component: T): T {
    const found = this.components.get(component.constructor) as T | undefined;
    assert(found, () => new ECSError("component-not-found"));
    return found;
  }
}

export default Entity;
