import Assets from "../../shared/assets/Assets";
import EntityAnimation from "../../shared/entity/EntityAnimation";
import Hero from "./Hero";

const assets = new Assets("character")
  .add(2, "walk")
  .add(1, "default")
  .add(1, "jump");

const hero = new Hero({
  width: 30,
  height: 40,
  speed: 3,
  runSpeed: 1.5,
}).setAssets(assets);

hero.setAnimation(new EntityAnimation(hero));

export default hero;
