import { Container, type Application, type Renderer } from "pixi.js";

/**
 * Creates a full hierarchical layer structure for a Pixi application stage.
 *
 * The resulting structure:
 * ```
 * stage
 * ├── backgroundLayer          // static backgrounds (e.g. gradients, sky)
 * ├── worldLayer               // main camera-movable world
 * │   ├── backgroundDecorLayer // parallax / distant scenery
 * │   ├── obstaclesLayer       // walls, crates, platforms
 * │   ├── itemsLayer           // collectibles, ammo, pickups
 * │   ├── entitiesLayer        // hero, enemies, NPCs
 * │   ├── projectilesLayer     // bullets, missiles, fireballs
 * │   └── effectsLayer         // dust, explosions, particles
 * ├── uiLayer                  // HUD, menus, screen-fixed UI
 * └── debugLayer               // hitboxes, dev overlays
 * ```
 *
 * @param {Application<Renderer>} app - The initialized Pixi application instance.
 * @returns {Object} An object containing all created layer containers for easy access.
 *
 * @property {Container} backgroundLayer - Static non-interactive backgrounds.
 * @property {Container} worldLayer - Movable world containing all interactive sublayers.
 * @property {Container} backgroundDecorLayer - Background decorations inside the world.
 * @property {Container} obstaclesLayer - Static obstacles and map geometry.
 * @property {Container} itemsLayer - Collectibles and pickups in the world.
 * @property {Container} entitiesLayer - Main actors (player, NPCs, enemies).
 * @property {Container} projectilesLayer - Bullets, missiles, or any fired projectiles.
 * @property {Container} effectsLayer - Temporary visual effects like explosions or dust.
 * @property {Container} uiLayer - Fixed HUD and UI elements.
 * @property {Container} debugLayer - Visual debugging overlays.
 */
export function createSceneLayers(app: Application<Renderer>) {
  // Enable zIndex-based sorting for all stage children
  app.stage.sortableChildren = true;

  //#region ROOT LAYERS
  const backgroundLayer = new Container();
  const worldLayer = new Container();
  const uiLayer = new Container();
  const debugLayer = new Container();
  //#endregion

  //#region WORLD SUBLAYERS
  const backgroundDecorLayer = new Container();
  const obstaclesLayer = new Container();
  const itemsLayer = new Container();
  const entitiesLayer = new Container();
  const projectilesLayer = new Container();
  const effectsLayer = new Container();
  //#endregion

  //#region Z-INDEX
  backgroundLayer.zIndex = 0;
  worldLayer.zIndex = 1;
  uiLayer.zIndex = 2;
  debugLayer.zIndex = 3;

  backgroundDecorLayer.zIndex = 0;
  obstaclesLayer.zIndex = 1;
  itemsLayer.zIndex = 2;
  entitiesLayer.zIndex = 3;
  projectilesLayer.zIndex = 4;
  effectsLayer.zIndex = 5;
  //#endregion

  //#region BUILD HIERARCHY
  worldLayer.addChild(
    backgroundDecorLayer,
    obstaclesLayer,
    itemsLayer,
    entitiesLayer,
    projectilesLayer,
    effectsLayer
  );

  app.stage.addChild(backgroundLayer, worldLayer, uiLayer, debugLayer);
  //#endregion

  return {
    backgroundLayer,
    worldLayer,
    backgroundDecorLayer,
    obstaclesLayer,
    itemsLayer,
    entitiesLayer,
    projectilesLayer,
    effectsLayer,
    uiLayer,
    debugLayer,
  };
}
