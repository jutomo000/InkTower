import { Entity } from './Entity';

export class Enemy extends Entity {
  public speed: number;
  public health: number;
  private targetX: number;
  private targetY: number;

  constructor(x: number, y: number, char: string, targetX: number, targetY: number) {
    super(x, y, 15, char);
    this.targetX = targetX;
    this.targetY = targetY;
    
    // Default stats for '卒'
    this.speed = 50;
    this.health = 20;
    
    if (char === '贼') {
      this.speed = 100;
      this.health = 10;
    } else if (char === '甲') {
      this.speed = 25;
      this.health = 100;
    }
  }

  public update(dt: number) {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 5) {
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    } else {
      // Reached tower
      this.active = false;
      // Trigger damage to tower outside
    }
  }

  public takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.active = false;
    }
  }
}
