import Entity from "./Entity";
import type { EntityConfig, EntityState } from "./entity.types";
import type EntityAnimation from "./EntityAnimation";
import EntityGameError from "./EntityGameError";
import assert from "../../utils/assert";

class EntityRender<Modifiers extends string = never> extends Entity<Modifiers> {
  public animation?: EntityAnimation<this>;
  declare state: EntityState;

  constructor(config: EntityConfig) {
    super(config);
  }

  protected override onModifierChange(): void {
    this.state.textures = this.assets?.getTextures(this.modifier);
    this.animation?.sprite?.play();
  }

  public setAnimation(animation: EntityAnimation<this>) {
    this.animation = animation;
  }

  public startAnimation() {
    assert(this.animation, () => new EntityGameError("animation-not-set"));
    this.state.textures = this.assets?.getTextures(this.modifier);
    this.animation.init();
  }
}

export default EntityRender;
