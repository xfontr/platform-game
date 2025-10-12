import type Assets from "../assets/Assets";
import type { EntityConfig, EntityState, ModifierType } from "./entities.types";
import EntityGameError from "./EntityGameError";
import assert from "../../utils/assert";
import { DEFAULT_MODIFIER } from "../../configs/constants";
import type { UnresolvedAsset } from "pixi.js";
import EntityPubSub from "./EntityPubSub";

const DEFAULT_STATE: Pick<
  EntityState,
  "origin" | "animationSpeed" | "x" | "y" | "speed"
> = {
  origin: 0.5,
  animationSpeed: 0.1,
  x: 0,
  y: 0,
  speed: 1,
};

class Entity<Modifiers extends string = never> extends EntityPubSub {
  public assets?: Assets<Modifiers>;
  public state: EntityState;

  protected modifier: Modifiers | typeof DEFAULT_MODIFIER;

  constructor(config: EntityConfig) {
    super();

    this.state = { ...DEFAULT_STATE, ...config };

    this.state = new Proxy(this.state, {
      set: (target, p, newValue) => {
        const currentValue = this.state[p as keyof typeof this.state];
        if (currentValue === newValue) return true;

        this.publish(p as keyof typeof this.state, newValue, currentValue);

        target[p as keyof typeof this.state] = newValue;

        return true;
      },
    });

    this.modifier = this.modifier = DEFAULT_MODIFIER;
  }

  protected getSprite(): UnresolvedAsset[] {
    assert(this.assets, () => new EntityGameError("asset-not-set"));
    return this.assets.getSprite(this.modifier);
  }

  public setAssets<A extends Assets<any>>(assets: A): Entity<ModifierType<A>> {
    this.assets = assets;
    return this as unknown as Entity<ModifierType<A>>;
  }

  public setState(modifier: Modifiers | typeof DEFAULT_MODIFIER): this {
    this.modifier = modifier;
    return this;
  }

  public isState<M extends Modifiers | typeof DEFAULT_MODIFIER>(
    modifier: M
  ): modifier is M {
    return this.modifier === modifier;
  }

  public moveX(direction: 1 | -1 | (number & {})) {
    const state = this.state;
    state.x = state.x + state.speed * direction;
  }

  public moveY(direction: 1 | -1 | (number & {})) {
    const state = this.state;
    state.y = state.y + state.speed * direction;
  }
}

export default Entity;
