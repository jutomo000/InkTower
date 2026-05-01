import { EntityManager } from './EntityManager';

export type ElementType = '火' | '水' | '木' | '金' | '土';

export class FiveElementsSystem {
  private manager: EntityManager;
  public cooldowns: Record<ElementType, number> = {
    '火': 0,
    '水': 0,
    '木': 0,
    '金': 0,
    '土': 0
  };
  public maxCooldown: number = 30; // 30 seconds default

  constructor(manager: EntityManager) {
    this.manager = manager;
  }

  public update(dt: number) {
    for (const el in this.cooldowns) {
      if (this.cooldowns[el as ElementType] > 0) {
        this.cooldowns[el as ElementType] -= dt;
      }
    }
  }

  public trigger(type: ElementType): boolean {
    if (this.cooldowns[type] > 0) return false;

    switch (type) {
      case '火': this.triggerFire(); break;
      case '水': this.triggerWater(); break;
      case '木': this.triggerWood(); break;
      case '金': this.triggerMetal(); break;
      case '土': this.triggerEarth(); break;
    }

    this.cooldowns[type] = this.maxCooldown;
    return true;
  }

  private triggerFire() {
    // Continuous burn around tower
    console.log('Triggered Fire: Burning ink surrounding');
    this.manager.particles.emit(this.manager.tower.x, this.manager.tower.y, 50, '#8b0000');
    // Actual logic: Damage nearby enemies for 5 seconds
    this.manager.addTemporaryEffect('fire', 5);
  }

  private triggerWater() {
    // Screen-wide slow
    console.log('Triggered Water: Slowing all enemies');
    this.manager.addTemporaryEffect('water', 10);
  }

  private triggerWood() {
    // Character fences
    console.log('Triggered Wood: Summoning fences');
    this.manager.addTemporaryEffect('wood', 8);
  }

  private triggerMetal() {
    // Golden blades from sky
    console.log('Triggered Metal: Golden blades falling');
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        this.manager.particles.emit(x, y, 15, '#ffd700');
        this.manager.damageArea(x, y, 100, 50); // True damage
      }, i * 100);
    }
  }

  private triggerEarth() {
    // Knockback
    console.log('Triggered Earth: Earth tremor');
    this.manager.knockbackAll(200);
    this.manager.particles.emit(this.manager.tower.x, this.manager.tower.y, 100, '#5c4033');
  }
}
