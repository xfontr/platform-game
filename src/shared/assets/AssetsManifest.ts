import {
  type AssetsBundle,
  type AssetsManifest as Manifest,
  type UnresolvedAsset,
  Assets,
} from "pixi.js";
import type AssetsType from "./Assets";
import AssetsGameError from "./AssetsGameError";
import assert from "../../utils/assert";

class AssetsManifest {
  private bundles: Record<string, AssetsBundle> = {};

  public add(name: string, ...assetInstances: AssetsType[]): this {
    this.bundles[name] ??= {
      name,
      assets: [],
    };

    assetInstances.forEach((instance) => {
      (this.bundles[name].assets as UnresolvedAsset[]).push(...instance.get());
    });

    return this;
  }

  public async init(): Promise<void> {
    assert(
      () => Object.keys(this.bundles).length,
      () => new AssetsGameError("empty-manifest")
    );

    const manifest: Manifest = { bundles: Object.values(this.bundles) };

    try {
      await Assets.init({ manifest });
    } catch (error) {
      new AssetsGameError(error, "manifest");
    }
  }
}

export default AssetsManifest;
