import { Entity } from './Entity';

export class Tower extends Entity {
  public health: number = 100;
  public maxHealth: number = 100;
  public level: number = 1;
  private evolutionStages = ['塔', '楼', '阁', '殿', '京'];

  constructor(x: number, y: number) {
    super(x, y, 40, '塔');
    this.fontSize = 48;
  }

  public update(_dt: number) {
    // Evolution logic based on level
    const stageIndex = Math.min(this.level - 1, this.evolutionStages.length - 1);
    this.char = this.evolutionStages[stageIndex];

    // Health-based appearance (fading as health drops)
    const healthPercent = this.health / this.maxHealth;
    this.color = `rgba(26, 26, 26, ${0.3 + 0.7 * healthPercent})`;
  }

  public takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      console.log('Game Over');
      // Handle game over state
    }
  }
}
