import { Application } from "pixi.js";
import app from "./shared/app";

(async () => {
  await app.init(new Application());
})();
