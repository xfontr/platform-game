import "./style.css";
import { Application, Assets, Ticker } from "pixi.js";
import app from "./shared/app";
import AssetsManifest from "./shared/assets/AssetsManifest";
import hero from "./entities/hero";

const manifest = new AssetsManifest().add("game", hero.assets!);

(async () => {
  await app.init(new Application());

  Assets.init({ manifest: manifest.get() });

  await Assets.loadBundle("game");

  const canvas = app.get();

  hero.state.x = canvas.canvas.width / 2;
  hero.state.y = canvas.canvas.height / 2;

  hero.startAnimation();
  const { sprite } = hero.animation!;
  canvas.stage.addChild(sprite!);

  const keys = new Set<string>();

  const moveHero = () => {
    const isRunning = keys.has("ShiftLeft") || keys.has("ShiftRight");
    if (isRunning) hero.run();
    if (!isRunning) hero.walk();

    // Horizontal movement
    if (keys.has("ArrowRight") || keys.has("KeyD")) {
      hero.moveX(1);
      hero.mirror(false);
    }

    if (keys.has("ArrowLeft") || keys.has("KeyA")) {
      hero.moveX(-1);
      hero.mirror(true);
    }

    // Vertical movement
    if (keys.has("ArrowUp") || keys.has("KeyW")) hero.moveY(-1);
    if (keys.has("ArrowDown") || keys.has("KeyS")) hero.moveY(1);
  };

  const ticker = new Ticker().add(moveHero);

  const startWalking = () => {
    hero.setModifier("walk");
    if (!ticker.started) ticker.start();
  };

  const stopWalking = () => {
    ticker.stop();
    hero.setModifier("default");
  };

  window.addEventListener("keydown", (e) => {
    if (
      [
        "ArrowRight",
        "ArrowLeft",
        "ArrowUp",
        "ArrowDown",
        "ShiftLeft",
        "ShiftRight",
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
      ].includes(e.code)
    ) {
      keys.add(e.code);
      startWalking();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (
      [
        "ArrowRight",
        "ArrowLeft",
        "ArrowUp",
        "ArrowDown",
        "ShiftLeft",
        "ShiftRight",
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
      ].includes(e.code)
    ) {
      keys.delete(e.code);
      if (keys.size === 0) stopWalking();
    }
  });
})();
