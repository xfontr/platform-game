import Assets from "../../shared/assets/Assets";
import Hero from "./Hero";

export const heroAssets = new Assets("character")
  .add(2, "walk")
  .add(1, "stand")
  .add(1, "jump");

export const hero = new Hero({
  height: 40,
  width: 30,
})
  .setAssets(heroAssets)
  .setState("stand");
