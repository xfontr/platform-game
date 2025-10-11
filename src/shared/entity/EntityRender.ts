import { Assets as pixiAssets, type AnimatedSpriteFrames } from "pixi.js";
import Entity from "./Entity";
import Assets from "../assets/Assets";
import type { ModifierType } from "./entities.types";
import type { DEFAULT_STATE } from "../../configs/constants";
import EntityAnimation from "./EntityAnimation";

class EntityRender<Modifiers extends string = never> extends Entity<Modifiers> {
  private cachedSprites: Partial<
    Record<Modifiers | typeof DEFAULT_STATE, AnimatedSpriteFrames>
  > = {};
  private animatedSprite?: EntityAnimation<EntityRender<Modifiers>>;

  constructor(config: ConstructorParameters<typeof Entity>[0]) {
    super(config);
  }

  public getFrames(): AnimatedSpriteFrames {
    const cached = this.cachedSprites[this.state];

    if (cached) return cached;

    const newAssets = this.getSprite().map(({ alias }) =>
      pixiAssets.get(alias as string)
    );

    this.cachedSprites[this.state] = newAssets;

    return newAssets;
  }

  public override setState(state: Modifiers | typeof DEFAULT_STATE): this {
    if (this.state === state) return this;

    this.state = state;

    // this.updateAnimatedSprite();

    return this;
  }

  public override setAssets<A extends Assets<any>>(
    assets: A
  ): EntityRender<ModifierType<A>> {
    this.assets = assets;
    return this as EntityRender<ModifierType<A>>;
  }

  public animate<T extends EntityRender<Modifiers>>(
    entity: T
  ): EntityAnimation<T> {
    this.animatedSprite = new EntityAnimation(entity);

    this.animatedSprite.init();

    return this.animatedSprite as EntityAnimation<T>;
  }
}

export default EntityRender;
