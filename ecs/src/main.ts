// =========================================================
// BITMASK ECS — Teaching Demo (10/10 version)
// Core ideas: bitmasks, typed arrays, caching, and SoA layout
// =========================================================

// --- Component bits ----------------------------------------------------------
const COMPONENT = {
  POSITION: 1 << 0,
  VELOCITY: 1 << 1,
  HEALTH: 1 << 2,
};
// NOTE: This demo supports up to 32 components (using 32-bit masks).

// --- ECS World ---------------------------------------------------------------
const world = {
  entities: [],
  systems: [],
  entityMask: [], // bitmask per entity
  cacheInvalid: true,
};

// --- Entity Management -------------------------------------------------------
function createEntity() {
  const id = world.entities.length;
  world.entities.push(id);
  world.entityMask[id] = 0; // start with no components
  world.cacheInvalid = true;
  return id;
}

function destroyEntity(id) {
  // NOTE: No recycling for simplicity, but this invalidates the entity slot.
  world.entityMask[id] = 0;
  world.cacheInvalid = true;
}

function addComponent(id, componentBit) {
  world.entityMask[id] |= componentBit;
  world.cacheInvalid = true;
}

function removeComponent(id, componentBit) {
  world.entityMask[id] &= ~componentBit;
  world.cacheInvalid = true;
}

// --- Component Data (Structure of Arrays) -----------------------------------
const MAX_ENTITIES = 100; // NOTE: In a real ECS, this would grow dynamically.
const Position = {
  x: new Float32Array(MAX_ENTITIES),
  y: new Float32Array(MAX_ENTITIES),
};
const Velocity = {
  x: new Float32Array(MAX_ENTITIES),
  y: new Float32Array(MAX_ENTITIES),
};
const Health = new Float32Array(MAX_ENTITIES);

// NOTE: Component data is stored densely and accessed by entity ID.
// Always check an entity has the component before reading/writing!

// --- Systems -----------------------------------------------------------------
function createSystem(requiredMask, updateFn, label = "UnnamedSystem") {
  const system = { label, mask: requiredMask, updateFn, entities: [] };
  world.systems.push(system);
  world.cacheInvalid = true;
  return system;
}

// Rebuild system entity caches only when needed
function rebuildCaches() {
  for (const system of world.systems) {
    system.entities.length = 0;
    for (const id of world.entities) {
      const mask = world.entityMask[id];
      // Entity qualifies if it contains all required bits
      if ((mask & system.mask) === system.mask) {
        system.entities.push(id);
      }
    }
  }
  world.cacheInvalid = false;
  // NOTE: In a real ECS, caching would be *incremental*, not global rebuilds.
}

// --- Example Systems ---------------------------------------------------------
const movementSystem = createSystem(
  COMPONENT.POSITION | COMPONENT.VELOCITY,
  (entities) => {
    for (const id of entities) {
      // Reads Velocity, writes Position
      Position.x[id] += Velocity.x[id];
      Position.y[id] += Velocity.y[id];
    }
  },
  "MovementSystem"
);

const decaySystem = createSystem(
  COMPONENT.HEALTH,
  (entities) => {
    for (const id of entities) {
      // Writes Health
      Health[id] = Math.max(0, Health[id] - 0.1);
    }
  },
  "HealthDecaySystem"
);

// --- Update Loop -------------------------------------------------------------
function update() {
  if (world.cacheInvalid) rebuildCaches();
  for (const system of world.systems) {
    system.updateFn(system.entities);
  }
}

// --- DEMO --------------------------------------------------------------------
const e1 = createEntity();
const e2 = createEntity();

// Give e1: Position + Velocity + Health
addComponent(e1, COMPONENT.POSITION | COMPONENT.VELOCITY | COMPONENT.HEALTH);
Position.x[e1] = 0;
Position.y[e1] = 0;
Velocity.x[e1] = 2;
Velocity.y[e1] = 1;
Health[e1] = 1.0;

// Give e2: Position + Health only
addComponent(e2, COMPONENT.POSITION | COMPONENT.HEALTH);
Position.x[e2] = 10;
Position.y[e2] = 5;
Health[e2] = 0.8;

console.log("Before update:");
console.table({
  e1: { x: Position.x[e1], y: Position.y[e1], health: Health[e1] },
  e2: { x: Position.x[e2], y: Position.y[e2], health: Health[e2] },
});

update();

console.log("After update:");
console.table({
  e1: { x: Position.x[e1], y: Position.y[e1], health: Health[e1] },
  e2: { x: Position.x[e2], y: Position.y[e2], health: Health[e2] },
});

// Now remove VELOCITY from e1 — movement stops next frame, caches auto-rebuild.
removeComponent(e1, COMPONENT.VELOCITY);
update();

console.log("After removing velocity:");
console.table({
  e1: { x: Position.x[e1], y: Position.y[e1], health: Health[e1] },
  e2: { x: Position.x[e2], y: Position.y[e2], health: Health[e2] },
});
