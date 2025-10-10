import "./style.css";
import { AnimatedSprite, Application, Assets } from "pixi.js";
import app from "./shared/app";
import AssetsManifest from "./shared/assets/AssetsManifest";
import { character } from "./features/character/character.assets";

const manifest = new AssetsManifest().add("game", character);

(async () => {
  await app.init(new Application());

  Assets.init({ manifest: manifest.get() });

  await Assets.loadBundle("game");

  const canvas = app.get();

  const walkTextures = character
    .getSprite("walk")
    .map(({ alias }) => Assets.get(alias as string));

  const hero = new AnimatedSprite(walkTextures);

  hero.animationSpeed = 0.1;
  hero.play();
  hero.x = canvas.canvas.width / 2;
  hero.y = canvas.canvas.height / 2;
  hero.anchor.set(0.5);

  canvas.stage.addChild(hero);

  app.onResize(({ width, height }) => {
    hero.x = width / 2;
    hero.y = height / 2;
  });
})();
