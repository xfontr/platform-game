import "./style.css";
import { Application, Assets, Ticker } from "pixi.js";
import app from "./shared/app";
import AssetsManifest from "./shared/assets/AssetsManifest";
import heroInstance from "./entities/hero";

const manifest = new AssetsManifest().add("game", heroInstance.assets!);

(async () => {
  await app.init(new Application());
  Assets.init({ manifest: manifest.get() });
  await Assets.loadBundle("game");

  const canvas = app.get();

  heroInstance.state.x = canvas.canvas.width / 2;
  heroInstance.state.y = canvas.canvas.height / 2;

  const hero = heroInstance.animate(heroInstance);
  canvas.stage.addChild(hero.sprite!);

  const keys = new Set<string>();

  const moveHero = () => {
    const isRunning = keys.has("ShiftLeft") || keys.has("ShiftRight");
    if (isRunning) heroInstance.run();
    if (!isRunning) heroInstance.walk();

    // Horizontal movement
    if (keys.has("ArrowRight") || keys.has("KeyD")) {
      heroInstance.moveX(1);
      hero.sprite!.scale.x = Math.abs(hero.sprite!.scale.x); // face right
    }

    if (keys.has("ArrowLeft") || keys.has("KeyA")) {
      heroInstance.moveX(-1);
      hero.sprite!.scale.x = -Math.abs(hero.sprite!.scale.x); // face left (mirrored)
    }

    // Vertical movement
    if (keys.has("ArrowUp") || keys.has("KeyW")) heroInstance.moveY(-1);
    if (keys.has("ArrowDown") || keys.has("KeyS")) heroInstance.moveY(1);
  };

  const ticker = new Ticker().add(moveHero);

  const startWalking = () => {
    if (!heroInstance.isState("walk")) {
      heroInstance.setState("walk");
      hero.sprite!.play();
    }
    if (!ticker.started) ticker.start();
  };

  const stopWalking = () => {
    ticker.stop();
    if (!heroInstance.isState("default")) {
      heroInstance.setState("default");
      hero.sprite!.play();
    }
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
