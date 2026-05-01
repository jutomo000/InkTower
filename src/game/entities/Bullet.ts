import { Entity } from './Entity';

export class Bullet extends Entity {
  public vx: number;
  public vy: number;
  public damage: number;
  private lifeTime: number = 2.0;

  constructor(x: number, y: number, vx: number, vy: number, char: string, damage: number) {
    super(x, y, 5, char);
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
  }

  public update(dt: number) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    
    this.lifeTime -= dt;
    if (this.lifeTime <= 0) {
      this.active = false;
    }
  }
}
