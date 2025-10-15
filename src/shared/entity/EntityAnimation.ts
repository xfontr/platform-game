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

  private setInitialValues(): void {
    assert(this.sprite, () => new EntityGameError("animated-sprite-not-found"));

    const { x, y, width, height, animationSpeed, origin } = this.entity.state;

    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.width = width;
    this.sprite.height = height;
    this.sprite.animationSpeed = animationSpeed;
    this.sprite.anchor = origin;
    this.sprite.textures = this.entity.state.textures!;
  }

  private subscriber(key: string, newValue: unknown) {
    this.sprite[key] = newValue;
  }

  public init(): AnimatedSprite {
    if (this.sprite) return this.sprite;

    this.sprite = new AnimatedSprite(this.entity.state.textures!);

    this.entity.subscribe(this.subscriber.bind(this));

    this.setInitialValues();

    this.sprite.play();

    return this.sprite;
  }
}

export default EntityAnimation;
