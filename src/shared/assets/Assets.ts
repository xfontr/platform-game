import { type UnresolvedAsset } from "pixi.js";
import assert from "../../utils/assert";
import AssetsGameError from "./AssetsGameError";
import type { DEFAULT_STATE } from "../../configs/constants";

class Assets<Modifiers extends string = never> {
  protected assets: Record<string, UnresolvedAsset[]> = {};
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  public add<NewModifier extends string>(
    size: number,
    modifier: NewModifier
  ): Assets<Modifiers | NewModifier> {
    const suffix = modifier ? `${modifier}.png` : "png";

    this.assets[modifier] ??= [];
    this.assets[modifier].push(
      ...Array.from({ length: size }, (_, index) => ({
        alias: `${index}.${this.name}.${modifier}`,
        src: `/assets/${this.name}/${index}.${suffix}`,
      }))
    );

    return this;
  }

  /**
   * Pixi does not provide a more strict type, so for now `unknown[]` will have to do.
   */
  public getSprite(modifier: Modifiers | typeof DEFAULT_STATE) {
    assert(
      this.assets[modifier]?.length,
      () => new AssetsGameError("empty-sprite")
    );

    return this.assets[modifier];
  }

  private checkIfDuplicates(assetList: UnresolvedAsset[]): boolean {
    const seen = new Set<string>();

    for (const { alias } of assetList) {
      if (seen.has(alias as string)) return false;
      seen.add(alias as string);
    }

    return true;
  }

  public get(): UnresolvedAsset[] {
    const assets = Object.values(this.assets).flat();

    assert(
      () => this.checkIfDuplicates(assets),
      () => new AssetsGameError("duplicate")
    );

    assert(assets.length, () => new AssetsGameError("empty-assets"));

    return assets;
  }
}

export default Assets;
