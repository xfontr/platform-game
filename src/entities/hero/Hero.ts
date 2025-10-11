import type { EntityConfig } from "../../shared/entity/entities.types";
import EntityRender from "../../shared/entity/EntityRender";

const RUN_SPEED = 1.5;

class Hero extends EntityRender {
  private baseAnimationSpeed: number;
  private baseSpeed: number;

  constructor(config: EntityConfig) {
    super(config);

    this.baseSpeed = this.speed;
    this.baseAnimationSpeed = this.animationSpeed;
  }

  public run(): void {
    this.speed = this.baseSpeed * RUN_SPEED;
    this.animationSpeed = this.baseAnimationSpeed * RUN_SPEED;
  }

  public walk(): void {
    this.speed = this.baseSpeed;
    this.animationSpeed = this.baseAnimationSpeed;
  }
}

export default Hero;
