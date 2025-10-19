import {
  type AssetsBundle,
  type AssetsManifest as Manifest,
  type UnresolvedAsset,
} from "pixi.js";
import type AssetsType from "./BaseAssets";
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

  public get(): Manifest {
    assert(
      () => Object.keys(this.bundles).length,
      () => new AssetsGameError("empty-manifest")
    );

    return { bundles: Object.values(this.bundles) };
  }
}

export default AssetsManifest;
