import type Assets from "../assets/Assets";

export interface EntityConfig {
  width: number;
  height: number;
  origin?: number;
  animationSpeed?: number;
}

export type ModifierType<A> = A extends Assets<infer M> ? M : never;
