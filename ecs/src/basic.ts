// bitmask-ecs-caching.js
const COMPONENT = {
  POSITION: 1 << 0,
  VELOCITY: 1 << 1,
  HEALTH: 1 << 2,
};

const entityMask = [];
const world = {
  entities: [],
  systems: [],
};

// --- Entity helpers ---
function createEntity() {
  const id = world.entities.length;
  entityMask[id] = 0;
  world.entities.push(id);
  return id;
}

function addComponent(id, componentBit) {
  entityMask[id] |= componentBit;
  invalidateCaches();
}

function removeComponent(id, componentBit) {
  entityMask[id] &= ~componentBit;
  invalidateCaches();
}

// --- Caching magic ---
let cacheInvalid = true;
function invalidateCaches() {
  cacheInvalid = true;
}

// Rebuild system entity lists when needed
function rebuildCaches() {
  for (const system of world.systems) {
    system.entities.length = 0;
    for (const id of world.entities) {
      // we do the & because otherwise partial matches would not count
      // e.g. system with POSITION and VELOCITY should match another one with these plus HEALTH
      // without the &, it would not
      if ((entityMask[id] & system.mask) === system.mask) {
        system.entities.push(id);
      }
    }
  }
  cacheInvalid = false;
}

// --- System creation ---
function createSystem(requiredMask, updateFn) {
  const system = { mask: requiredMask, updateFn, entities: [] };
  world.systems.push(system);
  return system;
}

// --- Example Components data ---
const Position = { x: new Float32Array(100), y: new Float32Array(100) };
const Velocity = { x: new Float32Array(100), y: new Float32Array(100) };

// --- Systems ---
const movementSystem = createSystem(
  COMPONENT.POSITION | COMPONENT.VELOCITY,
  (entities) => {
    for (const id of entities) {
      Position.x[id] += Velocity.x[id];
      Position.y[id] += Velocity.y[id];
    }
  }
);

function update() {
  if (cacheInvalid) rebuildCaches();

  for (const system of world.systems) {
    system.updateFn(system.entities);
  }
}

// --- DEMO ---
const e1 = createEntity();
const e2 = createEntity();

addComponent(e1, COMPONENT.POSITION | COMPONENT.VELOCITY);
addComponent(e2, COMPONENT.POSITION);

Position.x[e1] = 0;
Velocity.x[e1] = 2;
Position.y[e1] = 0;
Velocity.y[e1] = 1;

console.log("Before update:", Position.x[e1], Position.y[e1]);
update();
console.log("After update:", Position.x[e1], Position.y[e1]);

// Try removing VELOCITY -> cached entities will auto-update next tick
removeComponent(e1, COMPONENT.VELOCITY);
update(); // cache rebuilds once, movement system now ignores e1
console.log("After removing velocity:", Position.x[e1], Position.y[e1]);
