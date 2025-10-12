import { Assets as pixiAssets, type AnimatedSpriteFrames } from "pixi.js";
import Entity from "./Entity";
import Assets from "../assets/Assets";
import type {
  EntityState,
  ModifierType,
  WithModifiers,
} from "./entities.types";
import type { DEFAULT_MODIFIER } from "../../configs/constants";
import EntityAnimation from "./EntityAnimation";

class EntityRender<Modifiers extends string = never> extends Entity<Modifiers> {
  private cachedTextures: Partial<
    Record<Modifiers | typeof DEFAULT_MODIFIER, AnimatedSpriteFrames>
  > = {};
  private animatedSprite?: EntityAnimation<EntityRender<Modifiers>>;
  declare state: EntityState & { textures?: AnimatedSpriteFrames };

  constructor(config: ConstructorParameters<typeof Entity>[0]) {
    super(config);
  }

  private setTextures(): AnimatedSpriteFrames {
    const cached = this.cachedTextures[this.modifier];

    if (cached) {
      this.state.textures = cached;
      return cached;
    }

    const newAssets = this.getSprite().map(({ alias }) =>
      pixiAssets.get(alias as string)
    );

    this.cachedTextures[this.modifier] = newAssets;
    this.state.textures = newAssets;

    return newAssets;
  }

  public override setState(
    modifier: Modifiers | typeof DEFAULT_MODIFIER
  ): this {
    if (this.modifier === modifier) return this;

    this.modifier = modifier;
    this.setTextures();

    return this;
  }

  public override setAssets<A extends Assets<any>>(
    assets: A
  ): WithModifiers<this, ModifierType<A>> {
    this.assets = assets;

    return this as any;
  }

  public animate<T extends EntityRender<Modifiers>>(
    entity: T
  ): EntityAnimation<T> {
    this.animatedSprite = new EntityAnimation(entity);

    this.setTextures();
    this.animatedSprite.init();

    return this.animatedSprite as EntityAnimation<T>;
  }
}

export default EntityRender;
