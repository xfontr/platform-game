import type { ComponentRef } from "./types/Component";
import assert from "../../utils/assert";
import type Component from "./Component";
import ECSError from "./ECSError";
import type { Entity as EntityContract } from "./types/Entity";

class Entity implements EntityContract {
  public isDirty = false;
  private components = new Map<ComponentRef, Component>();

  public add<T extends Component>(component: T): this {
    assert(
      () => !this.components.get(component.constructor),
      () => new ECSError("component.add.added")
    );

    this.components.set(component.constructor, component);
    this.isDirty ||= true;
    return this;
  }

  public has<T extends Component>(component: T): boolean {
    return this.components.has(component.constructor);
  }

  public delete<T extends Component>(component: T): void {
    const found = this.components.delete(component.constructor);
    assert(found, () => new ECSError("component.delete.not.found"));
    this.isDirty ||= found;
  }

  public get<T extends Component>(component: T): T {
    const found = this.components.get(component.constructor) as T | undefined;
    assert(found, () => new ECSError("component.get.not.found"));
    return found;
  }
}

export default Entity;
