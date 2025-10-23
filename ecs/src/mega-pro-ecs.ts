// ecs-demo.ts
// Single-file TypeScript ECS demo demonstrating DoD patterns, typed arrays, bitmasks, systems, and a tiny DOM renderer.

// ---------- Basic types ----------
type Entity = number; // simple integer id
type ComponentBit = number; // 1<<n

// ---------- Component schema helpers ----------
// A field in the component schema: name and typed array constructor
type FieldDef = { name: string; type: "f32" | "i32" | "u32" | "u8" };

// Schema is an array of fields. We'll lay them out in AoS (actually SoA per field).
type ComponentSchema = FieldDef[];

/*
  ComponentPool:
  - stores data in typed arrays (SoA style per field) for capacity entries.
  - maintains dense array of entity ids and a sparse map entity->index.
  - provides addEntity/removeEntity/read/write helpers.
*/
class ComponentPool {
  readonly schema: ComponentSchema;
  capacity: number;
  size = 0;
  dense: Int32Array; // dense index -> entity
  sparse: Int32Array; // entity -> dense index (entity space limited by maxEntities)
  buffers: {
    [k: string]: Float32Array | Int32Array | Uint32Array | Uint8Array;
  }; // per-field arrays
  entityMax: number;

  constructor(schema: ComponentSchema, capacity = 256, maxEntities = 10000) {
    this.schema = schema;
    this.capacity = capacity;
    this.entityMax = maxEntities;
    this.dense = new Int32Array(capacity);
    this.sparse = new Int32Array(maxEntities);
    this.sparse.fill(-1);
    this.buffers = {};
    for (const f of schema) {
      const arr = ComponentPool.createTypedArrayForField(f, capacity);
      this.buffers[f.name] = arr;
    }
  }

  static createTypedArrayForField(f: FieldDef, capacity: number) {
    switch (f.type) {
      case "f32":
        return new Float32Array(capacity);
      case "i32":
        return new Int32Array(capacity);
      case "u32":
        return new Uint32Array(capacity);
      case "u8":
        return new Uint8Array(capacity);
    }
  }

  ensureCapacity(min: number) {
    if (min <= this.capacity) return;
    let newCap = this.capacity;
    while (newCap < min) newCap *= 2;
    // grow dense
    const newDense = new Int32Array(newCap);
    newDense.set(this.dense);
    this.dense = newDense;
    // grow buffers
    for (const f of this.schema) {
      const old = this.buffers[f.name] as any;
      let created;
      if (f.type === "f32") {
        created = new Float32Array(newCap);
      } else if (f.type === "i32") {
        created = new Int32Array(newCap);
      } else if (f.type === "u32") {
        created = new Uint32Array(newCap);
      } else {
        created = new Uint8Array(newCap);
      }
      created.set(old);
      this.buffers[f.name] = created;
    }
    this.capacity = newCap;
  }

  has(entity: Entity) {
    if (entity >= this.entityMax) return false;
    const idx = this.sparse[entity];
    return idx !== -1 && idx < this.size && this.dense[idx] === entity;
  }

  add(entity: Entity, initialValues?: Partial<Record<string, number>>) {
    if (this.has(entity)) return; // already present
    if (entity >= this.entityMax) {
      // extend sparse table (rare path)
      const oldMax = this.entityMax;
      this.entityMax = Math.max(entity + 1, this.entityMax * 2);
      const newSparse = new Int32Array(this.entityMax);
      newSparse.fill(-1);
      newSparse.set(this.sparse);
      this.sparse = newSparse;
    }
    if (this.size >= this.capacity) this.ensureCapacity(this.size + 1);
    const idx = this.size++;
    this.dense[idx] = entity;
    this.sparse[entity] = idx;
    // set defaults if provided
    if (initialValues) {
      for (const k of Object.keys(initialValues)) {
        const buf = this.buffers[k];
        if (buf) (buf as any)[idx] = (initialValues as any)[k];
      }
    }
  }

  remove(entity: Entity) {
    if (!this.has(entity)) return;
    const idx = this.sparse[entity];
    const last = --this.size;
    const lastEntity = this.dense[last];
    // swap-remove
    if (idx !== last) {
      this.dense[idx] = lastEntity;
      this.sparse[lastEntity] = idx;
      // copy field values from last to idx
      for (const f of this.schema) {
        const buf = this.buffers[f.name] as any;
        buf[idx] = buf[last];
      }
    }
    // clear last
    this.sparse[entity] = -1;
    this.dense[last] = -1;
  }

  // get and set single-field accessor helpers (fast)
  getFieldArray<T extends Float32Array | Int32Array | Uint32Array | Uint8Array>(
    fieldName: string
  ) {
    return this.buffers[fieldName] as T;
  }

  getIndex(entity: Entity) {
    const idx = this.sparse[entity];
    if (idx === -1) return null;
    return idx;
  }
}

// ---------- Component registry (bitmask assignment) ----------
class ComponentType {
  name: string;
  bit: ComponentBit;
  pool: ComponentPool;
  constructor(
    name: string,
    bit: ComponentBit,
    schema: ComponentSchema,
    initialCapacity = 256,
    maxEntities = 10000
  ) {
    this.name = name;
    this.bit = bit;
    this.pool = new ComponentPool(schema, initialCapacity, maxEntities);
  }
}

class ComponentRegistry {
  private registry = new Map<string, ComponentType>();
  private nextBit = 0;

  register(
    name: string,
    schema: ComponentSchema,
    initialCapacity = 512,
    maxEntities = 20000
  ): ComponentType {
    if (this.registry.has(name))
      throw new Error(`Component ${name} already registered`);
    if (this.nextBit >= 32)
      throw new Error(
        "Registry supports up to 32 components (use 64-bit bitmask variant if needed)"
      );
    const bit = 1 << this.nextBit++;
    const ct = new ComponentType(
      name,
      bit,
      schema,
      initialCapacity,
      maxEntities
    );
    this.registry.set(name, ct);
    return ct;
  }

  get(name: string) {
    return this.registry.get(name) ?? null;
  }

  all() {
    return Array.from(this.registry.values());
  }
}

// ---------- Entity manager ----------
class EntityManager {
  private nextEntity = 1;
  private freeList: number[] = [];
  signatures: Uint32Array; // entity id -> bitmask signature
  maxEntities: number;

  constructor(maxEntities = 20000) {
    this.maxEntities = maxEntities;
    this.signatures = new Uint32Array(maxEntities);
    this.signatures.fill(0);
  }

  create(): Entity {
    const id = this.freeList.length ? this.freeList.pop()! : this.nextEntity++;
    if (id >= this.maxEntities) {
      // rare: grow
      const old = this.maxEntities;
      this.maxEntities = Math.max(id + 1, this.maxEntities * 2);
      const newSign = new Uint32Array(this.maxEntities);
      newSign.set(this.signatures);
      this.signatures = newSign;
    }
    this.signatures[id] = 0;
    return id;
  }

  destroy(e: Entity) {
    this.signatures[e] = 0;
    this.freeList.push(e);
  }

  getSignature(e: Entity) {
    return this.signatures[e] ?? 0;
  }
  setSignature(e: Entity, sig: number) {
    this.signatures[e] = sig;
  }
}

// ---------- World (ties everything) ----------
class World {
  em: EntityManager;
  components: ComponentRegistry;
  systems: System[] = [];
  maxEntities: number;

  constructor(maxEntities = 20000) {
    this.maxEntities = maxEntities;
    this.em = new EntityManager(maxEntities);
    this.components = new ComponentRegistry();
  }

  registerComponent(name: string, schema: ComponentSchema) {
    return this.components.register(name, schema, 256, this.maxEntities);
  }

  createEntity() {
    return this.em.create();
  }

  destroyEntity(e: Entity) {
    // remove from all component pools that have it
    for (const ct of this.components.all()) {
      if (ct.pool.has(e)) ct.pool.remove(e);
    }
    this.em.destroy(e);
  }

  addComponent(
    e: Entity,
    componentName: string,
    initialValues?: Partial<Record<string, number>>
  ) {
    const ct = this.components.get(componentName);
    if (!ct) throw new Error("component not registered: " + componentName);
    ct.pool.add(e, initialValues);
    const sig = this.em.getSignature(e) | ct.bit;
    this.em.setSignature(e, sig);
  }

  removeComponent(e: Entity, componentName: string) {
    const ct = this.components.get(componentName);
    if (!ct) return;
    ct.pool.remove(e);
    const sig = this.em.getSignature(e) & ~ct.bit;
    this.em.setSignature(e, sig);
  }

  hasComponent(e: Entity, componentName: string) {
    const ct = this.components.get(componentName);
    if (!ct) return false;
    return ct.pool.has(e);
  }

  getComponentPool(componentName: string) {
    const ct = this.components.get(componentName);
    if (!ct) throw new Error("component not registered: " + componentName);
    return ct.pool;
  }

  addSystem(s: System) {
    s.world = this;
    s.onRegister();
    this.systems.push(s);
  }

  // run all systems (simple sequential)
  tick(dt: number) {
    for (const s of this.systems) s.update(dt);
  }
}

// ---------- Query helper ----------
class Query {
  readonly requiredMask: number;
  world: World;
  constructor(world: World, requiredComponents: string[]) {
    let mask = 0;
    for (const name of requiredComponents) {
      const ct = world.components.get(name);
      if (!ct) throw new Error("component not registered: " + name);
      mask |= ct.bit;
    }
    this.requiredMask = mask;
    this.world = world;
  }

  // iterate over matching entities and call fn(entity)
  forEach(fn: (e: Entity) => void) {
    const em = this.world.em;
    const sigs = em.signatures;
    // compact iteration: scan all entities and check bitmask (fast)
    // alternative: keep archetypes / buckets for extra perf.
    for (let e = 1; e < sigs.length; e++) {
      if (!sigs[e]) continue;
      if ((sigs[e] & this.requiredMask) === this.requiredMask) fn(e);
    }
  }

  // fast iter that yields entity + indices into pools (dense idx) for component pools
  forEachWithIndexes(
    componentNames: string[],
    fn: (e: Entity, idxs: number[]) => void
  ) {
    // Pre-get pools
    const pools = componentNames.map((n) => this.world.getComponentPool(n));
    const requiredMask = this.requiredMask;
    const sigs = this.world.em.signatures;
    for (let e = 1; e < sigs.length; e++) {
      if (!sigs[e]) continue;
      if ((sigs[e] & requiredMask) !== requiredMask) continue;
      const idxs: number[] = [];
      let ok = true;
      for (const p of pools) {
        const idx = p.getIndex(e);
        if (idx === null) {
          ok = false;
          break;
        }
        idxs.push(idx);
      }
      if (ok) fn(e, idxs);
    }
  }
}

// ---------- System base ----------
abstract class System {
  world!: World;
  abstract requiredComponents(): string[];
  onRegister() {}
  abstract update(dt: number): void;
}

// ---------- Example components used in demo ----------
/*
  Position: x,y floats
  Velocity: dx,dy floats
  Render: width,height (f32), colorKey (u32) -> color palette index (we'll keep simple)
*/

// ---------- Demo & small DOM renderer system ----------
class MovementSystem extends System {
  q: Query | null = null;
  requiredComponents() {
    return ["Position", "Velocity"];
  }
  onRegister() {
    this.q = new Query(this.world, this.requiredComponents());
  }

  update(dt: number) {
    if (!this.q) return;
    const world = this.world;
    const posPool = world.getComponentPool("Position");
    const velPool = world.getComponentPool("Velocity");

    const px = posPool.getFieldArray<Float32Array>("x");
    const py = posPool.getFieldArray<Float32Array>("y");
    const vx = velPool.getFieldArray<Float32Array>("dx");
    const vy = velPool.getFieldArray<Float32Array>("dy");

    this.q.forEachWithIndexes(["Position", "Velocity"], (e, [pIdx, vIdx]) => {
      // all arrays indexed by dense index; move pos by velocity
      px[pIdx] += vx[vIdx] * dt;
      py[pIdx] += vy[vIdx] * dt;
    });
  }
}

class DOMRenderSystem extends System {
  q: Query | null = null;
  root: HTMLElement;
  poolMap = new Map<number, HTMLElement>(); // entity -> element
  palette = ["#2f80ed", "#f2994a", "#27ae60", "#bdbdbd", "#eb5757"];

  constructor(root?: HTMLElement) {
    super();
    this.root = root ?? document.body;
    // root styles
    this.root.style.position = "relative";
  }

  requiredComponents() {
    return ["Position", "Renderable"];
  }
  onRegister() {
    this.q = new Query(this.world, this.requiredComponents());
  }

  update(dt: number) {
    if (!this.q) return;
    const world = this.world;
    const posPool = world.getComponentPool("Position");
    const rendPool = world.getComponentPool("Renderable");

    const px = posPool.getFieldArray<Float32Array>("x");
    const py = posPool.getFieldArray<Float32Array>("y");

    const wA = rendPool.getFieldArray<Float32Array>("w");
    const hA = rendPool.getFieldArray<Float32Array>("h");
    const colorIdx = rendPool.getFieldArray<Uint32Array>("color");

    // For simplicity: ensure elements exist for entities, then update transforms
    this.q.forEachWithIndexes(["Position", "Renderable"], (e, [pIdx, rIdx]) => {
      let el = this.poolMap.get(e);
      if (!el) {
        el = document.createElement("div");
        el.style.position = "absolute";
        el.style.transform = "translate(-50%, -50%)";
        el.style.borderRadius = "4px";
        el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.12)";
        this.root.appendChild(el);
        this.poolMap.set(e, el);
      }
      el.style.width = `${wA[rIdx]}px`;
      el.style.height = `${hA[rIdx]}px`;
      const color =
        this.palette[(colorIdx as any)[rIdx] % this.palette.length] ?? "#333";
      (el.style as any).background = color;
      el.style.left = `${px[pIdx]}px`;
      el.style.top = `${py[pIdx]}px`;
    });
  }
}

// ---------- Demo bootstrap ----------
function demoMount(root?: HTMLElement) {
  const world = new World(2000);

  // register components
  world.registerComponent("Position", [
    { name: "x", type: "f32" },
    { name: "y", type: "f32" },
  ]);
  world.registerComponent("Velocity", [
    { name: "dx", type: "f32" },
    { name: "dy", type: "f32" },
  ]);
  world.registerComponent("Renderable", [
    { name: "w", type: "f32" },
    { name: "h", type: "f32" },
    { name: "color", type: "u32" },
  ]);

  // systems
  const mover = new MovementSystem();
  const renderer = new DOMRenderSystem(root);
  world.addSystem(mover);
  world.addSystem(renderer);

  // create some entities
  // spawn center box and few moving boxes
  const center = world.createEntity();
  world.addComponent(center, "Position", { x: 400, y: 250 });
  world.addComponent(center, "Renderable", { w: 80, h: 80, color: 0 });

  for (let i = 0; i < 10; i++) {
    const e = world.createEntity();
    world.addComponent(e, "Position", {
      x: 100 + i * 60,
      y: 400 + (i % 3) * 30,
    });
    world.addComponent(e, "Velocity", {
      dx: (Math.random() - 0.5) * 40,
      dy: (Math.random() - 0.5) * 30,
    });
    world.addComponent(e, "Renderable", {
      w: 22 + Math.random() * 30,
      h: 22 + Math.random() * 30,
      color: i % 5,
    });
  }

  // basic game loop
  let last = performance.now();
  function loop(t: number) {
    const dt = (t - last) / 1000;
    last = t;
    world.tick(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  return world;
}

// If running in browser auto-mount to body with a centered demo root
if (typeof window !== "undefined" && typeof document !== "undefined") {
  const root = document.createElement("div");
  root.style.width = "100%";
  root.style.height = "100vh";
  root.style.display = "flex";
  root.style.alignItems = "center";
  root.style.justifyContent = "center";
  document.body.style.margin = "0";
  document.body.appendChild(root);

  const demoRoot = document.createElement("div");
  demoRoot.style.width = "800px";
  demoRoot.style.height = "500px";
  demoRoot.style.position = "relative";
  demoRoot.style.background = "#0f1720";
  demoRoot.style.borderRadius = "8px";
  demoRoot.style.overflow = "hidden";
  root.appendChild(demoRoot);

  demoMount(demoRoot);
}

// Export API for programmatic usage
export {
  World,
  Query,
  System,
  demoMount,
  ComponentRegistry,
  ComponentPool,
  ComponentType,
};
