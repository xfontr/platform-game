import "./style.css";
import { Application, Assets, Graphics, Ticker } from "pixi.js";
import app from "./shared/app";
import AssetsManifest from "./shared/assets/AssetsManifest";
import hero from "./entities/hero";
import { initDevtools } from "@pixi/devtools";

const manifest = new AssetsManifest().add("game", hero.assets!);

(async () => {
  await app.init(new Application());

  Assets.init({ manifest: manifest.get() });

  await Assets.loadBundle("game");

  const canvas = app.get();

  initDevtools({ app: canvas });
  //
  const box = new Graphics();
  const boxSize = 200;
  const centerX = canvas.canvas.width / 2;
  const centerY = canvas.canvas.height / 2;

  box
    .stroke({ width: 2, color: 0xffffff, alpha: 1 }) // draw white border
    .rect(centerX - boxSize / 2, centerY - boxSize / 2, boxSize, boxSize)
    .stroke(); // finalize stroke
  canvas.stage.addChild(box);
  //

  hero.state.x = canvas.canvas.width / 2;
  hero.state.y = canvas.canvas.height / 2;

  hero.startAnimation();
  const { sprite } = hero.animation!;
  canvas.stage.addChild(sprite!);

  needsRefactorHeroMovingLogic();

  function needsRefactorHeroMovingLogic() {
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

      // Collision boundaries for hero inside the 200x200 box
      const heroSprite = hero.animation?.sprite;
      if (heroSprite) {
        const halfBox = boxSize / 2;
        const halfHero = heroSprite.width / 2;

        // boundaries of the box
        const minX = centerX - halfBox + halfHero;
        const maxX = centerX + halfBox - halfHero;
        const minY = centerY - halfBox + halfHero;
        const maxY = centerY + halfBox - halfHero;

        // clamp hero position
        hero.state.x = Math.min(Math.max(hero.state.x, minX), maxX);
        hero.state.y = Math.min(Math.max(hero.state.y, minY), maxY);

        // update sprite position (if not already bound)
        heroSprite.x = hero.state.x;
        heroSprite.y = hero.state.y;
      }
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
  }
})();
