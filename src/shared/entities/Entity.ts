import type Assets from "../assets/Assets";

type ModifierType<A> = A extends Assets<infer M> ? M : never;
interface Config {
  width: number;
  height: number;
  origin?: number;
}

interface SpriteBuilder {
  get: (alias: string) => unknown;
}

// Make Entity generic over asset modifiers
class Entity<Modifiers extends string = never> {
  public x?: number;
  public y?: number;
  public width: number;
  public height: number;
  public origin = 0.5;

  private assets?: Assets<Modifiers>;
  private currentState?: Modifiers;

  constructor({ width, height, origin }: Config) {
    this.width = width;
    this.height = height;
    this.origin = origin ?? this.origin;
  }

  setCoordinates(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  setAssets<A extends Assets<any>>(assets: A): Entity<ModifierType<A>> {
    this.assets = assets;
    return this as unknown as Entity<ModifierType<A>>;
  }

  setState(state: Modifiers): this {
    this.currentState = state;
    return this;
  }

  get<T extends SpriteBuilder>(spriteBuilder: T) {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      origin: this.origin,
      sprite: this.assets
        ?.getSprite(this.currentState!)
        .map(({ alias }) => spriteBuilder.get(alias as string)) as ReturnType<
        T["get"]
      >[],
      currentState: this.currentState,
    };
  }
}

export default Entity;
