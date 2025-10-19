import "./style.css";
import { Application, Assets, Graphics, Ticker } from "pixi.js";
import mainApp from "./shared/app";
import AssetsManifest from "./shared/assets/AssetsManifest";
import hero from "./entities/hero";
import { initDevtools } from "@pixi/devtools";
import { createSceneLayers } from "./REFACTOR.main.helpers";
import CollisionSystem from "./shared/systems/CollisionSystem";

const manifest = new AssetsManifest().add("game", hero.assets!);

(async () => {
  await mainApp.init(new Application());

  Assets.init({ manifest: manifest.get() });

  await Assets.loadBundle("game");

  const app = mainApp.get();

  initDevtools({ app });

  const layers = createSceneLayers(app);

  const collisionSystem = new CollisionSystem(
    layers.obstaclesLayer,
    layers.entitiesLayer
  );

  // 💙 blue box obstacle
  const box = new Graphics().rect(0, 0, 100, 100).fill({ color: 0x0000ff });
  box.position.set(100, 100);
  box.onCollision = () => {
    console.log("box be colliding");
  };
  layers.obstaclesLayer.addChild(box);

  hero.state.x = app.canvas.width / 2;
  hero.state.y = app.canvas.height / 2;

  hero.startAnimation();

  const { sprite } = hero.animation!;

  app.ticker.add(() => {
    collisionSystem.update();
  });

  layers.entitiesLayer.addChild(sprite!);

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
    };

    const ticker = app.ticker.add(moveHero);

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
