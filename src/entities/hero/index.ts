import Assets from "../../shared/assets/Assets";
import Hero from "./Hero";

const assets = new Assets("character")
  .add(2, "walk")
  .add(1, "default")
  .add(1, "jump");

const hero = new Hero({
  width: 30,
  height: 40,
}).setAssets(assets);

export default hero;
