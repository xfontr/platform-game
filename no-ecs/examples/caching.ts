// @ts-nocheck
// ecs with caching!

// === BASE CLASSES ===
class Entity {
  constructor(id, world) {
    this.id = id;
    this.components = new Map();
    this.world = world;
  }

  addComponent(component) {
    this.components.set(component.constructor, component);
    this.world.entityManager.markDirty();
  }

  getComponent(ComponentClass) {
    return this.components.get(ComponentClass);
  }

  hasComponent(ComponentClass) {
    return this.components.has(ComponentClass);
  }
}

class Component {}
class System {
  constructor() {
    this.entities = [];
    this._cacheValid = false;
  }
  update(dt) {}
}

// === MANAGERS ===
class EntityManager {
  constructor(world) {
    this.entities = [];
    this.world = world;
    this._dirty = false;
  }

  createEntity() {
    const entity = new Entity(this.entities.length, this.world);
    this.entities.push(entity);
    this._dirty = true;
    return entity;
  }

  getEntities() {
    return this.entities;
  }

  markDirty() {
    this._dirty = true;
  }

  clearDirty() {
    this._dirty = false;
  }

  isDirty() {
    return this._dirty;
  }
}

class SystemManager {
  constructor(entityManager) {
    this.entityManager = entityManager;
    this.systems = [];
  }

  addSystem(system) {
    this.systems.push(system);
    // Force cache build on add
    system._cacheValid = false;
  }

  _refreshSystemEntities(system) {
    console.log(
      `%c[${system.constructor.name}] refreshing entity cache...`,
      "color: orange;"
    );
    system.entities = this.entityManager
      .getEntities()
      .filter((e) =>
        system.requiredComponents?.every((c) => e.hasComponent(c))
      );
    system._cacheValid = true;
  }

  update(dt) {
    const dirty = this.entityManager.isDirty();
    if (dirty) {
      console.log(
        "%c[SystemManager] Entities changed, rebuilding caches...",
        "color: yellow;"
      );
    }

    for (const system of this.systems) {
      if (dirty || !system._cacheValid) {
        this._refreshSystemEntities(system);
      } else {
        console.log(
          `%c[${system.constructor.name}] using cached entities (${system.entities.length})`,
          "color: gray;"
        );
      }

      console.count(`[${system.constructor.name}] update calls`);
      system.update(dt);
    }

    if (dirty) this.entityManager.clearDirty();
  }
}

// === WORLD ===
class World {
  constructor() {
    this.entityManager = new EntityManager(this);
    this.systemManager = new SystemManager(this.entityManager);
    this.commandQueue = [];
    this.lastTime = performance.now();
  }

  createEntity() {
    return this.entityManager.createEntity();
  }

  addSystem(system) {
    this.systemManager.addSystem(system);
  }

  enqueueCommand(command) {
    this.commandQueue.push(command);
  }

  processCommands() {
    for (const cmd of this.commandQueue) {
      cmd.execute(this);
    }
    this.commandQueue.length = 0;
  }

  run() {
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.processCommands();
    this.systemManager.update(dt);

    requestAnimationFrame(() => this.run());
  }
}

// === COMPONENTS ===
class Position extends Component {
  constructor(x = 0, y = 0) {
    super();
    this.x = x;
    this.y = y;
    this._lastX = x;
    this._lastY = y;
  }
}

class Velocity extends Component {
  constructor(x = 0, y = 0) {
    super();
    this.x = x;
    this.y = y;
  }
}

class HTMLElementRef extends Component {
  constructor(element) {
    super();
    this.element = element;
  }
}

class PlayerControlled extends Component {}

class Color extends Component {
  constructor(value = "tomato") {
    super();
    this.value = value;
    this._lastValue = value;
  }
}

class Dead extends Component {} // Marker when entity is "dead"

// === SYSTEMS ===
class MovementSystem extends System {
  constructor() {
    super();
    this.requiredComponents = [Position, Velocity];
  }

  update(dt) {
    for (const entity of this.entities) {
      if (entity.hasComponent(Dead)) continue;

      const pos = entity.getComponent(Position);
      const vel = entity.getComponent(Velocity);
      pos.x += vel.x * dt;
      pos.y += vel.y * dt;
    }
  }
}

class RenderSystem extends System {
  constructor() {
    super();
    this.requiredComponents = [HTMLElementRef];
  }

  update() {
    for (const entity of this.entities) {
      const el = entity.getComponent(HTMLElementRef).element;

      // Skip if dead
      if (entity.hasComponent(Dead)) {
        el.style.background = "black";
        el.style.transform = "scale(0)";
        continue;
      }

      const pos = entity.getComponent(Position);
      const color = entity.getComponent(Color);

      // Only update transform if it changed
      if (pos.x !== pos._lastX || pos.y !== pos._lastY) {
        el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        pos._lastX = pos.x;
        pos._lastY = pos.y;
      }

      // Only update color if it changed
      if (color.value !== color._lastValue) {
        el.style.background = color.value;
        color._lastValue = color.value;
      }
    }
  }
}

// === COMMANDS ===
class ChangeVelocityCommand {
  constructor(entity, newX, newY) {
    this.entity = entity;
    this.newX = newX;
    this.newY = newY;
  }

  execute(world) {
    const vel = this.entity.getComponent(Velocity);
    if (!vel || this.entity.hasComponent(Dead)) return;
    vel.x = this.newX;
    vel.y = this.newY;
  }
}

class ChangeColorCommand {
  constructor(entity, newColor) {
    this.entity = entity;
    this.newColor = newColor;
  }

  execute(world) {
    const color = this.entity.getComponent(Color);
    if (!color || this.entity.hasComponent(Dead)) return;
    color.value = this.newColor;
  }
}

class DieCommand {
  constructor(entity) {
    this.entity = entity;
  }

  execute(world) {
    if (!this.entity.hasComponent(Dead)) {
      this.entity.addComponent(new Dead());
      console.log(
        `%cEntity ${this.entity.id} died`,
        "color:red; font-weight:bold;"
      );
    }
  }
}

// === INPUT MANAGER ===
class InputManager {
  constructor() {
    this.listeners = new Set();
    this.keys = new Set();

    window.addEventListener("keydown", (e) => this.handleKey(e.key, true));
    window.addEventListener("keyup", (e) => this.handleKey(e.key, false));
  }

  handleKey(key, down) {
    if (down) this.keys.add(key);
    else this.keys.delete(key);
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.keys);
    }
  }
}

// === INPUT SYSTEM ===
class InputSystem extends System {
  constructor(inputManager) {
    super();
    this.requiredComponents = [PlayerControlled, Velocity, Color];
    this.activeKeys = new Set();

    inputManager.subscribe((keys) => {
      this.activeKeys = new Set(keys);
    });
  }

  update() {
    for (const entity of this.entities) {
      if (entity.hasComponent(Dead)) continue;

      let x = 0,
        y = 0;

      if (this.activeKeys.has("ArrowUp")) y -= 100;
      if (this.activeKeys.has("ArrowDown")) y += 100;
      if (this.activeKeys.has("ArrowLeft")) x -= 100;
      if (this.activeKeys.has("ArrowRight")) x += 100;

      entity.world.enqueueCommand(new ChangeVelocityCommand(entity, x, y));

      // Color handling: green when no keys, red when any key down
      if (this.activeKeys.size === 0) {
        entity.world.enqueueCommand(new ChangeColorCommand(entity, "green"));
      } else {
        entity.world.enqueueCommand(new ChangeColorCommand(entity, "red"));
      }

      // Death on space
      if (this.activeKeys.has(" ")) {
        entity.world.enqueueCommand(new DieCommand(entity));
      }
    }
  }
}

function cachingEcs() {
  const world = new World();

  const div = document.createElement("div");
  Object.assign(div.style, {
    position: "absolute",
    width: "50px",
    height: "50px",
    background: "tomato",
    transition: "all 0.2s ease",
  });
  document.body.appendChild(div);

  const player = world.createEntity();
  player.addComponent(new Position(200, 200));
  player.addComponent(new Velocity(0, 0));
  player.addComponent(new HTMLElementRef(div));
  player.addComponent(new PlayerControlled());
  player.addComponent(new Color("tomato"));

  const inputManager = new InputManager();

  world.addSystem(new InputSystem(inputManager));
  world.addSystem(new MovementSystem());
  world.addSystem(new RenderSystem());

  world.run();

  setInterval(() => {
    const e = world.createEntity();
    e.addComponent(new Position(Math.random() * 400, Math.random() * 400));
    e.addComponent(new Velocity(Math.random() - 0.5, Math.random() - 0.5));
    e.addComponent(new Color("cyan"));

    const el = document.createElement("div");
    el.className = "entity";
    el.style.width = "10px";
    el.style.height = "10px";
    el.style.position = "absolute";
    el.style.background = "cyan";
    document.body.appendChild(el);
    e.addComponent(new HTMLElementRef(el));

    console.log("✨ New entity spawned!", e.id);
  }, 5000);
}

export default cachingEcs;
