import { type UnresolvedAsset } from "pixi.js";
import assert from "../../utils/assert";
import AssetsGameError from "./AssetsGameError";

class Assets {
  private assets: UnresolvedAsset[] = [];
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public add(size: number, modifier: string): this {
    const suffix = modifier ? `${modifier}.png` : "png";

    this.assets.push(
      ...Array.from({ length: size }, (_, index) => ({
        alias: `${index}.${this.name}.${modifier}`,
        src: `/assets/${this.name}/${index}.${suffix}`,
      }))
    );

    return this;
  }

  public get(): UnresolvedAsset[] {
    assert(
      (): boolean => {
        const foundMap: Record<string, undefined> = {};

        return this.assets.reduce((duplicate, { alias }) => {
          if (foundMap[alias as string] || duplicate) return !duplicate;
          foundMap[alias as string] = undefined;
          return true;
        }, true);
      },
      () => new AssetsGameError("duplicate")
    );

    assert(this.assets.length, () => new AssetsGameError("empty-assets"));

    return this.assets;
  }
}

export default Assets;
