import { type UnresolvedAsset, Assets as PixiAssets } from "pixi.js";
import assert from "../../utils/assert";
import AssetsGameError from "./AssetsGameError";

class Assets {
  private assets: Record<string, UnresolvedAsset[]> = {};
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public add(size: number, modifier: string): this {
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

  public getSprite(modifier: string): ReturnType<(typeof PixiAssets)["get"]>[] {
    assert(
      this.assets[modifier].length,
      () => new AssetsGameError("empty-sprite")
    );

    return this.assets[modifier];
  }

  public get(): UnresolvedAsset[] {
    const unresolvedAssets = Object.values(this.assets).flat();

    assert(
      (): boolean => {
        const foundMap: Record<string, undefined> = {};

        return unresolvedAssets.reduce((duplicate, { alias }) => {
          if (foundMap[alias as string] || duplicate) return !duplicate;
          foundMap[alias as string] = undefined;
          return true;
        }, true);
      },
      () => new AssetsGameError("duplicate")
    );

    assert(unresolvedAssets.length, () => new AssetsGameError("empty-assets"));

    return unresolvedAssets;
  }
}

export default Assets;
