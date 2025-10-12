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
}

export type ModifierType<A> = A extends Assets<infer M> ? M : never;

export type WithModifiers<T, M extends string> = T & EntityRender<M>;
