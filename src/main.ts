import "./style.css";
import { AnimatedSprite, Application, Assets } from "pixi.js";
import app from "./shared/app";
import AssetsManifest from "./shared/assets/AssetsManifest";
import { character } from "./features/character/character.assets";

const manifest = new AssetsManifest().add("game", character);
console.log(character.get());

(async () => {
  await app.init(new Application());
  await manifest.init();

  await Assets.loadBundle("game");

  const canvas = app.get();

  const walkTextures = [
    Assets.get("0.character.walk"),
    Assets.get("1.character.walk"),
  ];

  // 4. Create an AnimatedSprite
  const character = new AnimatedSprite(walkTextures);

  // 5. Set animation speed and start it
  character.animationSpeed = 0.1; // speed (0.1 is slow, 1 is fast)
  character.play();

  // 6. Position the character and add to stage
  character.x = canvas.canvas.width / 2;
  character.y = canvas.canvas.height / 2;
  character.anchor.set(0.5);

  canvas.stage.addChild(character);
})();
