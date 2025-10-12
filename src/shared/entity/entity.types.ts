import type { AnimatedSpriteFrames } from "pixi.js";
import type Assets from "../assets/Assets";
import type EntityRender from "./EntityRender";

export interface EntityConfig {
  width: number;
  height: number;
  origin?: number;
  animationSpeed?: number;
  speed?: number;
}

export interface EntityState extends Required<EntityConfig> {
  x: number;
  y: number;
  textures?: AnimatedSpriteFrames;
}

export type ModifierType<A> = A extends Assets<infer M> ? M : never;

export type WithModifiers<T, M extends string> = T & EntityRender<M>;

export type Watcher<T extends object = object> = (
  key: keyof T,
  newValue: unknown,
  oldValue: unknown
) => void;
