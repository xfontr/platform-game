import type { EntityConfig } from "../../shared/entity/entities.types";
import EntityRender from "../../shared/entity/EntityRender";

class Hero extends EntityRender {
  private baseAnimationSpeed: number;
  private baseSpeed: number;
  private isRunning: boolean = false;
  private runSpeed: number;

  constructor({ runSpeed, ...config }: EntityConfig & { runSpeed: number }) {
    super(config);

    this.runSpeed = runSpeed;
    this.baseSpeed = this.state.speed;
    this.baseAnimationSpeed = this.state.animationSpeed;
  }

  public run(): void {
    if (this.isRunning) return;

    this.state.speed = this.baseSpeed * this.runSpeed;
    this.state.animationSpeed = this.baseAnimationSpeed * this.runSpeed;
    this.isRunning = true;
  }

  public walk(): void {
    if (!this.isRunning) return;

    this.state.speed = this.baseSpeed;
    this.state.animationSpeed = this.baseAnimationSpeed;
    this.isRunning = false;
  }

  public mirror(isLeft: boolean) {
    const sprite = this.animation?.sprite;

    if (!sprite) return;

    if (isLeft) sprite.scale.x = -Math.abs(sprite.scale.x);
    if (!isLeft) sprite.scale.x = Math.abs(sprite.scale.x);
  }
}

export default Hero;
