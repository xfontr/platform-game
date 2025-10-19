import { AnimatedSprite, Graphics, type ContainerChild } from "pixi.js";

/**
 * Mixin to add game entity behavior (like onCollision) to any Pixi DisplayObject.
 *
 * Usage:
 *   class EntitySprite extends EntityMixin(Sprite) { ... }
 *   class EntityBox extends EntityMixin(Graphics) { ... }
 */
function EntityMixin<TBase extends new (...args: any[]) => ContainerChild>(
  Base: TBase
) {
  return class EntityChild extends Base {
    /** Called when this entity collides with another DisplayObject */
    onCollision?(other?: ContainerChild): void;

    /** Optional flag to skip collision checks */
    skipCollision?: boolean;

    /** Optional helper: convenience to attach a name or ID for debugging */
    entityName?: string;

    /** Super clean constructor forwarding */
    constructor(...args: any[]) {
      super(...args);
    }
  };
}

export class EntitySprite extends EntityMixin(AnimatedSprite) {
  onCollision(other?: ContainerChild) {
    console.log("Hero collided with", other?.label ?? other);
  }
}

export class EntityBox extends EntityMixin(Graphics) {
  onCollision(other?: ContainerChild) {
    console.log("Box be colliding with", other?.label ?? other);
  }
}
