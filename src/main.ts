import "./style.css";
import { AnimatedSprite, Application, Assets, Ticker } from "pixi.js";
import app from "./shared/app";
import AssetsManifest from "./shared/assets/AssetsManifest";
import { hero as heroInstance } from "./entities/hero";

const manifest = new AssetsManifest().add("game", hero.assets!);

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

  // const walkTextures = character
  //   .getSprite("walk")
  //   .map(({ alias }) => Assets.get(alias as string));

  // const standTextures = character
  //   .getSprite("stand")
  //   .map(({ alias }) => Assets.get(alias as string));

  // const jumpTextures = character
  //   .getSprite("jump")
  //   .map(({ alias }) => Assets.get(alias as string));

  // const mainHero = new Character({
  //   x: canvas.canvas.width / 2,
  //   y: canvas.canvas.height / 2,
  //   height: 40,
  //   width: 40,
  // });

  heroInstance.setCoordinates(
    canvas.canvas.width / 2,
    canvas.canvas.height / 2
  );

  const initialSprite = heroInstance.get(Assets).sprite!;

  const hero = new AnimatedSprite(initialSprite);
  const animationSpeed = 0.1;
  hero.animationSpeed = animationSpeed;
  hero.play();
  // hero.x = canvas.canvas.width / 2;
  // hero.y = canvas.canvas.height / 2;
  // hero.width = 30;
  // hero.height = 40;
  // hero.anchor.set(0.5);
  canvas.stage.addChild(hero);

  const cleanUpKey = app.onResize(({ width, height }) => {
    heroInstance.x = width / 2;
    heroInstance.y = height / 2;
  });

  setTimeout(() => {
    app.removeListener(cleanUpKey);
  }, 3000);

  const keys = new Set<string>();
  const baseSpeed = 3;

  const moveHero = () => {
    const isRunning = keys.has("ShiftLeft") || keys.has("ShiftRight");
    const speed = isRunning ? baseSpeed * 1.5 : baseSpeed;
    hero.animationSpeed = isRunning ? animationSpeed * 1.5 : animationSpeed;

    // Horizontal movement
    if (keys.has("ArrowRight") || keys.has("KeyD")) {
      hero.x += speed;
      hero.scale.x = Math.abs(hero.scale.x); // face right
    }

    if (keys.has("ArrowLeft") || keys.has("KeyA")) {
      hero.x -= speed;
      hero.scale.x = -Math.abs(hero.scale.x); // face left (mirrored)
    }

    // Vertical movement
    if (keys.has("ArrowUp") || keys.has("KeyW")) hero.y -= speed;
    if (keys.has("ArrowDown") || keys.has("KeyS")) hero.y += speed;
  };

  const ticker = new Ticker().add(moveHero);

  const startWalking = () => {
    if (hero.textures !== walkTextures) {
      heroInstance.setState("walk");
      hero.play();
    }
    if (!ticker.started) ticker.start();
  };

  const stopWalking = () => {
    ticker.stop();
    if (hero.textures !== standTextures) {
      heroInstance.setState("stand");
      hero.play();
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
