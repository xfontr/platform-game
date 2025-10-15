import type { AnimatedSpriteFrames } from "pixi.js";
import BaseAssets from "./BaseAssets";
import { Assets as pixiAssets } from "pixi.js";
import type { DEFAULT_MODIFIER } from "../../configs/constants";

class Assets<Modifiers extends string = never> extends BaseAssets<Modifiers> {
  private cachedTextures: Partial<
    Record<Modifiers | typeof DEFAULT_MODIFIER, AnimatedSpriteFrames>
  > = {};

  public setTextures(
    modifier: Modifiers | typeof DEFAULT_MODIFIER
  ): AnimatedSpriteFrames {
    const cached = this.cachedTextures[modifier];

    if (cached) return cached;

    const newAssets = this.getSprite(modifier).map(({ alias }) =>
      pixiAssets.get(alias as string)
    );

    this.cachedTextures[modifier] = newAssets;

    return newAssets;
  }

  add<NewModifier extends string>(
    size: number,
    modifier: NewModifier
  ): Assets<Modifiers | NewModifier> {
    super.add(size, modifier);
    return this as Assets<Modifiers | NewModifier>;
  }
}

export default Assets;
