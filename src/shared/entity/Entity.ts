import type Assets from "../assets/Assets";
import type { EntityConfig, ModifierType } from "./entities.types";
import EntityGameError from "./EntityGameError";
import assert from "../../utils/assert";
import { DEFAULT_STATE } from "../../configs/constants";
import type { UnresolvedAsset } from "pixi.js";

class Entity<Modifiers extends string = never> {
  public x = 0;
  public y = 0;
  public width: number;
  public height: number;
  public origin = 0.5;
  public animationSpeed = 0.1;
  public state: Modifiers | typeof DEFAULT_STATE = DEFAULT_STATE;
  public speed: number;

  public assets?: Assets<Modifiers>;

  constructor({ width, height, animationSpeed, origin, speed }: EntityConfig) {
    this.width = width;
    this.height = height;
    this.origin = origin ?? this.origin;
    this.animationSpeed = animationSpeed ?? this.animationSpeed;
    this.speed = speed ?? 1;
  }

  protected getSprite(): UnresolvedAsset[] {
    assert(this.assets, () => new EntityGameError("asset-not-set"));
    return this.assets.getSprite(this.state);
  }

  public setAssets<A extends Assets<any>>(assets: A): Entity<ModifierType<A>> {
    this.assets = assets;
    return this as unknown as Entity<ModifierType<A>>;
  }

  public setState(state: Modifiers | typeof DEFAULT_STATE): this {
    this.state = state;
    return this;
  }

  public moveX(direction: 1 | -1 | (number & {})) {
    this.x = this.x + this.speed * direction;
  }

  public moveY(direction: 1 | -1 | (number & {})) {
    this.y = this.y + this.speed * direction;
  }

  public get() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      origin: this.origin,
      animationSpeed: this.animationSpeed,
    };
  }
}

export default Entity;
