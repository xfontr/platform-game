import { Rectangle } from "pixi.js";

/**
 * Very small AABB helper (Rect objs from getBounds())
 */
function aabbIntersects(a: Rectangle, b: Rectangle) {
  return !(
    a.x + a.width <= b.x ||
    a.x >= b.x + b.width ||
    a.y + a.height <= b.y ||
    a.y >= b.y + b.height
  );
}

/**
 * SimpleCollisionSystem
 * - checks every child in entitiesLayer against every child in obstaclesLayer
 * - calls entity.onCollision(obstacle) if available, otherwise console.log
 * - you can mark any entity with `skipCollision = true` to exclude it
 */
class CollisionSystem {
  constructor(obstaclesLayer, entitiesLayer) {
    this.obstaclesLayer = obstaclesLayer;
    this.entitiesLayer = entitiesLayer;
    // map entity -> Set<obstacle> currently colliding (prevents repeated logs)
    this._currentCollisions = new WeakMap();
  }

  update() {
    const obstacles = this.obstaclesLayer.children;
    const entities = this.entitiesLayer.children;

    for (const entity of entities) {
      // skip explicit opt-out
      if ((entity as any).skipCollision) continue;

      // if entity has no geometry, skip
      if (typeof entity.getBounds !== "function") continue;

      const eBounds = entity.getBounds();

      // ensure map entry exists
      if (!this._currentCollisions.has(entity)) {
        this._currentCollisions.set(entity, new Set());
      }
      const currently = this._currentCollisions.get(entity);

      // for each obstacle, check an AABB intersection
      for (const obstacle of obstacles) {
        if (typeof obstacle.getBounds !== "function") continue;
        const oBounds = obstacle.getBounds();

        const colliding = aabbIntersects(eBounds, oBounds);

        if (colliding) {
          // if this collision is new (wasn't in currently), trigger
          if (!currently.has(obstacle)) {
            // call handler if present, otherwise console.log
            if (typeof (entity as any).onCollision === "function") {
              try {
                (entity as any).onCollision(obstacle);
              } catch (err) {
                console.error("onCollision handler threw:", err);
              }
            } else {
              console.log("Collision:", entity, "↔", obstacle);
            }
            if (typeof obstacle.onCollision === "function") {
              obstacle.onCollision(entity);
            }

            currently.add(obstacle);
          }
        } else {
          // no collision: ensure obstacle is removed from current set
          if (currently.has(obstacle)) currently.delete(obstacle);
        }
      }
    }
  }
}
export default CollisionSystem;
