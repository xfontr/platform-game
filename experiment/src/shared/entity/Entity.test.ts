import type { UnresolvedAsset } from "pixi.js";
import { simulateProduction } from "../../utils/test";
import Assets from "../assets/BaseAssets";
import type { EntityConfig, EntityState } from "./entity.types";
import Entity, { DEFAULT_STATE } from "./Entity";
import EntityGameError from "./EntityGameError";
import { DEFAULT_MODIFIER } from "../../configs/constants";

const modifierChange = vi.fn();

class EntityTest<Modifiers extends string = never> extends Entity<Modifiers> {
  getSpriteTest() {
    return this.assets?.getSprite("default");
  }

  protected override onModifierChange(): void {
    modifierChange();
  }
}

const mockEntityConfig: Required<EntityConfig> = {
  height: 10,
  width: 5,
  animationSpeed: 1,
  origin: 0,
  speed: 2,
};

const mockEntityState: EntityState = {
  x: DEFAULT_STATE.x,
  y: DEFAULT_STATE.y,
  ...mockEntityConfig,
};

const mockUnresolvedAssets: UnresolvedAsset[] = [
  {
    alias: "0.assets.default",
    src: "/assets/assets/0.default.png",
  },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Entity", () => {
  it("should apply default state values", () => {
    const requiredConfig = {
      height: mockEntityConfig.height,
      width: mockEntityConfig.width,
    };

    const entity = new Entity(requiredConfig);

    expect(entity.state).toStrictEqual({
      ...requiredConfig,
      ...DEFAULT_STATE,
    });
  });

  it("should have a valid state with the forwarded values", () => {
    const entity = new Entity(mockEntityConfig);

    expect(entity.state).toStrictEqual(mockEntityState);
  });

  it("should notify each specific state update", () => {
    const entity = new Entity(mockEntityConfig);
    type Key = keyof typeof entity.state;

    const calls: [Key, unknown, unknown][] = [];

    const originalState = { ...entity.state };

    entity.subscribe((key, newValue, oldValue) => {
      calls.push([key as Key, newValue, oldValue]);
    });

    const stateKeys = Object.keys(entity.state) as Key[];

    stateKeys.forEach((key) => {
      // We don't care about setting wrong values for this case
      entity.state[key] = 123;
    });

    // We expect a separate, single call for each key (this is the most important part of this test)
    expect(calls.length).toBe(stateKeys.length);

    calls.forEach(([key, newValue, oldValue]) => {
      expect(originalState[key]).toBe(oldValue);
      expect(entity.state[key]).toBe(newValue);
    });
  });

  it("should not notify each specific state update, if the value is the same", () => {
    const entity = new Entity(mockEntityConfig);
    type Key = keyof typeof entity.state;

    const calls: [Key, unknown, unknown][] = [];

    entity.subscribe((key, newValue, oldValue) => {
      calls.push([key as Key, newValue, oldValue]);
    });

    const stateKeys = Object.keys(entity.state) as Key[];

    stateKeys.forEach((key) => {
      entity.state[key] = entity.state[key];
    });

    expect(calls.length).toBeFalsy();
  });

  it("should throw a dev-only error if no assets are set when getting the sprites", () => {
    const expectedError = new EntityGameError("asset-not-set");
    const entity = new EntityTest(mockEntityConfig);

    expect(() => entity.getSpriteTest()).toThrowError(expectedError);

    expect(() => {
      simulateProduction(entity.getSpriteTest);
    }).not.toThrowError(expectedError);
  });

  it("should return the asset sprites if set", () => {
    const entity = new EntityTest(mockEntityConfig);

    entity.setAssets(new Assets("assets").add(1, "default"));

    const sprite = entity.getSpriteTest();

    expect(sprite).toStrictEqual(mockUnresolvedAssets);
  });

  it("should update the modifier", () => {
    const entity = new Entity<"test">(mockEntityConfig);

    expect(entity.isModifier(DEFAULT_MODIFIER)).toBeTruthy();

    entity.setModifier("test");
    expect(entity.isModifier(DEFAULT_MODIFIER)).toBeFalsy();

    entity.setModifier(DEFAULT_MODIFIER);
    expect(entity.isModifier(DEFAULT_MODIFIER)).toBeTruthy();
  });

  it("should trigger a modifier change method", () => {
    const entity = new EntityTest<"test">(mockEntityConfig);

    entity.setModifier("test");

    expect(modifierChange).toHaveBeenCalledOnce();
  });

  it("should not trigger a modifier change method if states were the same", () => {
    const entity = new EntityTest(mockEntityConfig);

    expect(entity.isModifier(DEFAULT_MODIFIER)).toBeTruthy();
    entity.setModifier(DEFAULT_MODIFIER);

    expect(modifierChange).not.toHaveBeenCalledOnce();
  });

  it("should move in the X axis, accounting the state speed", () => {
    const speed = 2;
    const entity = new Entity({ ...mockEntityConfig, speed });

    entity.moveX(1);
    expect(entity.state.x).toBe(1 * speed);

    entity.moveX(-1);
    expect(entity.state.x).toBe(0);

    entity.moveX(10);
    expect(entity.state.x).toBe(10 * speed);

    entity.moveX(-20);
    expect(entity.state.x).toBe(-10 * speed);
  });

  it("should move in the Y axis, accounting the state speed", () => {
    const speed = 2;
    const entity = new Entity({ ...mockEntityConfig, speed });

    entity.moveY(1);
    expect(entity.state.y).toBe(1 * speed);

    entity.moveY(-1);
    expect(entity.state.y).toBe(0);

    entity.moveY(10);
    expect(entity.state.y).toBe(10 * speed);

    entity.moveY(-20);
    expect(entity.state.y).toBe(-10 * speed);
  });
});
