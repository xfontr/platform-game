import type Assets from "../assets/Assets";
import type {
  EntityConfig,
  EntityState,
  ModifierType,
  WithModifiers,
} from "./entity.types";
import EntityGameError from "./EntityGameError";
import assert from "../../utils/assert";
import { DEFAULT_MODIFIER } from "../../configs/constants";
import type { UnresolvedAsset } from "pixi.js";
import EntityPubSub from "./EntityPubSub";
import { reactive } from "./entity.utils";

export const DEFAULT_STATE: Pick<
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

  private toReactive() {
    this.state = reactive(this.state, (key, newValue, currentValue) => {
      this.publish(key, newValue, currentValue);
    });
  }

  constructor(config: EntityConfig) {
    super();

    this.state = { ...DEFAULT_STATE, ...config };
    this.modifier = DEFAULT_MODIFIER;

    this.toReactive();
  }

  protected getSprite(): UnresolvedAsset[] {
    assert(this.assets, () => new EntityGameError("asset-not-set"));
    return this.assets.getSprite(this.modifier);
  }

  public setAssets<A extends Assets<any>>(
    assets: A
  ): WithModifiers<this, ModifierType<A>> {
    this.assets = assets;
    return this as WithModifiers<this, ModifierType<A>>;
  }

  protected onModifierChange(): void {}

  public setModifier(modifier: Modifiers | typeof DEFAULT_MODIFIER): this {
    if (this.modifier === modifier) return this;

    this.modifier = modifier;
    this.onModifierChange();

    return this;
  }

  public isModifier<M extends Modifiers | typeof DEFAULT_MODIFIER>(
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
