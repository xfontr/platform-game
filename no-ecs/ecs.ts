// ISSUES AND TODOS:
//
//// 1.- caching => we dont want to run a filter loop every single time over every single entity. we should instead only run it over units that we expect to change, or when a new entity or component is added or removed
//// 2.- rendersystem is too complex => we instead want small syustems. like: renderDeadSystem, renderGreenSystem, whatever. example:
//
// class ColorRenderSystem extends System {
//   constructor() {
//     super();
//     this.requiredComponents = [Color, HTMLElementRef];
//   }
//
//   update() {
//     for (const entity of this.entities) {
//       const color = entity.getComponent(Color);
//       if (!color.dirty) continue;
//
//       const el = entity.getComponent(HTMLElementRef).element;
//       el.style.background = color.value;
//       color.dirty = false;
//     }
//   }
// }
//
//// 4.- exclusions! => the same way we have requiredEntities, we can also have excluded ones. We dont want to even consider Dead components, for example
//// 5.- `dirty` flag pattern => a warning to the world that this entity needs to be updated
// https://gameprogrammingpatterns.com/dirty-flag.html

// This is a purely vibe coded minimal ECS sample I might use as a reference

// === BASE CLASSES ===
class Entity {
  constructor(id) {
    this.id = id;
    this.components = new Map();
  }

  addComponent(component) {
    this.components.set(component.constructor, component);
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
  }
  update(dt) {}
}

// === MANAGERS ===
class EntityManager {
  constructor() {
    this.entities = [];
  }

  createEntity() {
    const entity = new Entity(this.entities.length);
    this.entities.push(entity);
    return entity;
  }

  getEntities() {
    return this.entities;
  }
}

class SystemManager {
  constructor(entityManager) {
    this.entityManager = entityManager;
    this.systems = [];
  }

  addSystem(system) {
    this.systems.push(system);
  }

  update(dt) {
    for (const system of this.systems) {
      // Refresh entity list for each system
      system.entities = this.entityManager
        .getEntities()
        .filter((e) =>
          system.requiredComponents?.every((c) => e.hasComponent(c))
        );

      system.update(dt);
    }
  }
}

// === WORLD ===
class World {
  constructor() {
    this.entityManager = new EntityManager();
    this.systemManager = new SystemManager(this.entityManager);
    this.commandQueue = []; // 🧠 Command buffer
    this.lastTime = performance.now();
  }

  createEntity() {
    return this.entityManager.createEntity();
  }

  addSystem(system) {
    this.systemManager.addSystem(system);
  }

  // queue a command for next frame
  enqueueCommand(command) {
    this.commandQueue.push(command);
  }

  // process all commands before system updates
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

class PlayerControlled extends Component {} // marker component

// === SYSTEMS ===
class MovementSystem extends System {
  constructor() {
    super();
    this.requiredComponents = [Position, Velocity];
  }

  update(dt) {
    for (const entity of this.entities) {
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
    this.requiredComponents = [Position, HTMLElementRef];
  }

  update() {
    for (const entity of this.entities) {
      const pos = entity.getComponent(Position);
      const el = entity.getComponent(HTMLElementRef).element;
      el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
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
    if (!vel) return;
    vel.x = this.newX;
    vel.y = this.newY;
    console.log(
      `%cVelocity updated: (${vel.x}, ${vel.y})`,
      "color: limegreen; font-weight: bold;"
    );
  }
}

// === INPUT MANAGER ===
// This part is NOT part of ECS — it's just a bridge between the DOM and the ECS.
class InputManager {
  constructor() {
    this.listeners = new Set(); // Systems that want input updates
    this.keys = new Set();

    window.addEventListener("keydown", (e) => this.handleKey(e.key, true));
    window.addEventListener("keyup", (e) => this.handleKey(e.key, false));
  }

  handleKey(key, down) {
    if (down) this.keys.add(key);
    else this.keys.delete(key);
    this.notify();
  }

  // Systems can subscribe to input updates
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
    this.requiredComponents = [PlayerControlled, Velocity];
    this.activeKeys = new Set();

    // Subscribe to input manager updates
    inputManager.subscribe((keys) => {
      this.activeKeys = new Set(keys);
    });
  }

  update() {
    for (const entity of this.entities) {
      let x = 0,
        y = 0;

      if (this.activeKeys.has("ArrowUp")) y -= 100;
      if (this.activeKeys.has("ArrowDown")) y += 100;
      if (this.activeKeys.has("ArrowLeft")) x -= 100;
      if (this.activeKeys.has("ArrowRight")) x += 100;

      // Now we just *signal intent*, no DOM knowledge
      entity.world.enqueueCommand(new ChangeVelocityCommand(entity, x, y));
    }
  }
}
// === DEMO ===
const world = new World();
Entity.prototype.world = world;

const div = document.createElement("div");
Object.assign(div.style, {
  position: "absolute",
  width: "50px",
  height: "50px",
  background: "tomato",
});
document.body.appendChild(div);

const player = world.createEntity();
player.addComponent(new Position(200, 200));
player.addComponent(new Velocity(0, 0));
player.addComponent(new HTMLElementRef(div));
player.addComponent(new PlayerControlled());

// Create the DOM listener (outside ECS)
const inputManager = new InputManager();

// Add systems — note how InputSystem is now pure and decoupled
world.addSystem(new InputSystem(inputManager));
world.addSystem(new MovementSystem());
world.addSystem(new RenderSystem());

world.run();
