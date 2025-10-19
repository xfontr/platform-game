import type Entity from "./Entity";
import type { ComponentRef } from "./types/Component";
import type { System as SystemContract } from "./types/System";

class System implements SystemContract {
  public isDirty = true;

  private components: ComponentRef[] = [];
  private cache = new Set<Entity>();

  public needs(...components: ComponentRef[]): this {
    this.components.push(...components);
    this.isDirty = true;
    return this;
  }

  private matches(entity: Entity): boolean {
    return this.components.every((toMatch) => entity.has(toMatch));
  }

  private rebuildCache(entities: Entity[]): void {
    this.cache.clear();

    for (const entity of entities) {
      if (!this.matches(entity)) continue;
      this.cache.add(entity);
    }
  }

  private updateCache(): void {
    for (const entity of this.cache) {
      if (!entity.isDirty) continue;
      if (!this.matches(entity)) this.cache.delete(entity);
    }
  }

  protected command(_entity: Entity) {}

  public update(entities: Entity[]): void {
    if (this.isDirty) {
      this.rebuildCache(entities);
      this.isDirty = false;
    } else {
      this.updateCache();
    }

    for (const entity of this.cache) {
      this.command(entity);
    }
  }
}

export default System;
