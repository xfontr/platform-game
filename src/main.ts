import "./style.css";
import { Application, Assets, Ticker } from "pixi.js";
import app from "./shared/app";
import AssetsManifest from "./shared/assets/AssetsManifest";
import heroInstance from "./entities/hero";

const manifest = new AssetsManifest().add("game", heroInstance.assets!);

/**
 * Each entity has its own textures, sizes, location, and events
 *
 * I don't want to instantiate each entity ad hoc whenever needed. Instead, i need a lib where each
 * entity is already created. Town, tree, character, apple. Whatever.
 *
 * Then, I just import it and run it like:
 *
 * character.play(); // Prints a character in its original location, listens for event listeners, has already right size.
 *
 * So that the game module does not have to worry about these tiny details
 *
 * Basically, I need kind of singletons for each entity
 */

(async () => {
  await app.init(new Application());
  Assets.init({ manifest: manifest.get() });
  await Assets.loadBundle("game");

  const canvas = app.get();

  heroInstance.x = canvas.canvas.width / 2;
  heroInstance.y = canvas.canvas.height / 2;

  const animationSpeed = 0.1;

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

    hero.update();
  };

  const ticker = new Ticker().add(moveHero);

  const startWalking = () => {
    if (heroInstance.state !== "walk") {
      heroInstance.setState("walk");
      hero.update();
      hero.sprite!.play();
    }
    if (!ticker.started) ticker.start();
  };

  const stopWalking = () => {
    ticker.stop();
    if (heroInstance.state !== "default") {
      heroInstance.setState("default");
      hero.update();
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
