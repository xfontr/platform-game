import { AnimatedSprite } from "pixi.js";
import type EntityRender from "./EntityRender";
import EntityGameError from "./EntityGameError";
import assert from "../../utils/assert";

class EntityAnimation<T extends EntityRender<any>> {
  private entity: T;
  public sprite?: AnimatedSprite;

  constructor(entity: T) {
    this.entity = entity;
  }

  // TODO: Improve redundant setters. This basically needs to be reactive in a far more efficient way
  public update(): void {
    assert(this.sprite, () => new EntityGameError("animated-sprite-not-found"));

    const { x, y, width, height, animationSpeed, origin } = this.entity.get();

    this.sprite.x = x;
    this.sprite.y = y;

    this.sprite.width = width;
    this.sprite.height = height;

    this.sprite.animationSpeed = animationSpeed;
    this.sprite.anchor.set(origin);

    const currentFrames = this.entity.getFrames();

    if (this.sprite.textures !== currentFrames)
      this.sprite.textures = currentFrames;
  }

  public init(): AnimatedSprite {
    if (this.sprite) return this.sprite;

    this.sprite = new AnimatedSprite(this.entity.getFrames());

    this.update();

    this.sprite.play();

    return this.sprite;
  }
}

export default EntityAnimation;
