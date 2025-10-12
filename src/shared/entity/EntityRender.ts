import { Assets as pixiAssets, type AnimatedSpriteFrames } from "pixi.js";
import Entity from "./Entity";
import type { EntityConfig, EntityState } from "./entities.types";
import type { DEFAULT_MODIFIER } from "../../configs/constants";
import type EntityAnimation from "./EntityAnimation";
import EntityGameError from "./EntityGameError";
import assert from "../../utils/assert";

class EntityRender<Modifiers extends string = never> extends Entity<Modifiers> {
  private cachedTextures: Partial<
    Record<Modifiers | typeof DEFAULT_MODIFIER, AnimatedSpriteFrames>
  > = {};
  public animation?: EntityAnimation<this>;
  declare state: EntityState & { textures?: AnimatedSpriteFrames };

  constructor(config: EntityConfig) {
    super(config);
  }

  private getAssets() {
    return this.getSprite().map(({ alias }) => pixiAssets.get(alias as string));
  }

  public setTextures(): AnimatedSpriteFrames {
    const cached = this.cachedTextures[this.modifier];

    if (cached) {
      this.state.textures = cached;
      return cached;
    }

    const newAssets = this.getAssets();

    this.cachedTextures[this.modifier] = newAssets;
    this.state.textures = newAssets;

    return newAssets;
  }

  protected override onModifierChange(): void {
    this.setTextures();
    this.animation?.sprite?.play();
  }

  public setAnimation(animation: EntityAnimation<this>) {
    this.animation = animation;
  }

  public startAnimation() {
    assert(this.animation, () => new EntityGameError("animation-not-set"));
    this.setTextures();
    this.animation.init();
  }
}

export default EntityRender;
