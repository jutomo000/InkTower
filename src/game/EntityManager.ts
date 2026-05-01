import { Tower } from './entities/Tower';
import { Enemy } from './entities/Enemy';
import { Bullet } from './entities/Bullet';
import { ParticleSystem } from './ParticleSystem';
import { FiveElementsSystem, ElementType } from './FiveElementsSystem';

export class EntityManager {
  public tower: Tower;
  public enemies: Enemy[] = [];
  public bullets: Bullet[] = [];
  public particles: ParticleSystem = new ParticleSystem();
  public elements: FiveElementsSystem;
  
  public currency: number = 0;
  
  private spawnTimer: number = 0;
  private spawnRate: number = 2.0;

  // Upgrade stats
  private stats = {
    damage: 10,
    fireRate: 0.5,
    bulletSpeed: 300,
    towerHealth: 100,
    goldGain: 1.0
  };

  private upgradeData = [
    { id: '力', name: '力 (伤害)', tab: '攻', level: 1, cost: 10, desc: '提升基础攻击力' },
    { id: '速', name: '速 (攻速)', tab: '攻', level: 1, cost: 15, desc: '提升攻击频率' },
    { id: '命', name: '命 (生命)', tab: '防', level: 1, cost: 20, desc: '提升塔的最大生命值' },
    { id: '财', name: '财 (收益)', tab: '术', level: 1, cost: 25, desc: '击杀获得更多墨水' }
  ];

  private temporaryEffects: Record<string, number> = {};

  constructor(width: number, height: number) {
    this.tower = new Tower(width / 2, height / 2);
    this.elements = new FiveElementsSystem(this);
  }

  public getElementCooldowns() {
    return this.elements.cooldowns;
  }

  public triggerElement(type: ElementType) {
    return this.elements.trigger(type);
  }

  public addTemporaryEffect(id: string, duration: number) {
    this.temporaryEffects[id] = (this.temporaryEffects[id] || 0) + duration;
  }

  public damageArea(x: number, y: number, radius: number, damage: number) {
    for (const enemy of this.enemies) {
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        enemy.takeDamage(damage);
      }
    }
  }

  public knockbackAll(force: number) {
    for (const enemy of this.enemies) {
      const dx = enemy.x - this.tower.x;
      const dy = enemy.y - this.tower.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        enemy.x += (dx / dist) * force;
        enemy.y += (dy / dist) * force;
      }
    }
  }


  public getUpgradesByTab(tab: string) {
    return this.upgradeData.filter(u => u.tab === tab);
  }

  public buyUpgrade(id: string): boolean {
    const up = this.upgradeData.find(u => u.id === id);
    if (up && this.currency >= up.cost) {
      this.currency -= up.cost;
      up.level++;
      up.cost = Math.floor(up.cost * 1.5);
      
      // Apply effects
      if (id === '力') this.stats.damage += 5;
      if (id === '速') this.stats.fireRate = Math.max(0.1, this.stats.fireRate * 0.9);
      if (id === '命') {
        this.tower.maxHealth += 50;
        this.tower.health += 50;
      }
      if (id === '财') this.stats.goldGain += 0.2;

      // Evolution check
      const totalLevel = this.upgradeData.reduce((sum, u) => sum + u.level, 0);
      this.tower.level = Math.floor(totalLevel / 5) + 1;
      
      return true;
    }
    return false;
  }

  public update(dt: number, width: number, height: number) {
    this.tower.update(dt);
    this.particles.update(dt);
    this.elements.update(dt);
    
    // Update temporary effects timers
    for (const id in this.temporaryEffects) {
      if (this.temporaryEffects[id] > 0) {
        this.temporaryEffects[id] -= dt;
      }
    }

    const isSlowing = (this.temporaryEffects['water'] || 0) > 0;
    const isBurning = (this.temporaryEffects['fire'] || 0) > 0;

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Apply water slow
      const currentDt = isSlowing ? dt * 0.3 : dt;
      enemy.update(currentDt);
      
      // Apply fire burn
      if (isBurning) {
        const dx = enemy.x - this.tower.x;
        const dy = enemy.y - this.tower.y;
        if (Math.sqrt(dx * dx + dy * dy) < 200) {
          enemy.takeDamage(10 * dt); // 10 damage per second
        }
      }
      
      // Collision with tower
      const dx = enemy.x - this.tower.x;
      const dy = enemy.y - this.tower.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < enemy.radius + this.tower.radius) {
        this.tower.takeDamage(5);
        enemy.active = false;
      }

      if (!enemy.active) {
        // If enemy died from damage (not tower collision), gain currency
        if (enemy.health <= 0) {
          this.currency += 5 * this.stats.goldGain;
          this.particles.emit(enemy.x, enemy.y, 10); // Ink splatter
        }
        this.enemies.splice(i, 1);
      }
    }


    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(dt);

      // Collision with enemies
      for (const enemy of this.enemies) {
        const dx = bullet.x - enemy.x;
        const dy = bullet.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < bullet.radius + enemy.radius) {
          enemy.takeDamage(bullet.damage);
          bullet.active = false;
          break;
        }
      }

      if (!bullet.active) {
        this.bullets.splice(i, 1);
      }
    }

    // Spawning logic
    this.spawnTimer += dt;
    if (this.spawnTimer > this.spawnRate) {
      this.spawnEnemy(width, height);
      this.spawnTimer = 0;
      this.spawnRate = Math.max(0.3, this.spawnRate * 0.99); 
    }

    // Shooting logic (auto-attack nearest)
    this.autoShoot(dt);
  }

  private spawnEnemy(width: number, height: number) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(width, height) * 0.6;
    const x = width / 2 + Math.cos(angle) * dist;
    const y = height / 2 + Math.sin(angle) * dist;
    
    const types = ['卒', '卒', '卒', '贼', '甲'];
    const char = types[Math.floor(Math.random() * types.length)];
    
    this.enemies.push(new Enemy(x, y, char, width / 2, height / 2));
  }

  private shootTimer: number = 0;
  private autoShoot(dt: number) {
    this.shootTimer += dt;
    if (this.shootTimer > this.stats.fireRate && this.enemies.length > 0) {
      // Find nearest enemy
      let nearest: Enemy | null = null;
      let minDist = Infinity;
      
      for (const enemy of this.enemies) {
        const dx = enemy.x - this.tower.x;
        const dy = enemy.y - this.tower.y;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          nearest = enemy;
        }
      }

      if (nearest) {
        const dx = nearest.x - this.tower.x;
        const dy = nearest.y - this.tower.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        this.bullets.push(new Bullet(
          this.tower.x, 
          this.tower.y, 
          (dx / dist) * this.stats.bulletSpeed, 
          (dy / dist) * this.stats.bulletSpeed, 
          '点', 
          this.stats.damage
        ));
      }
      this.shootTimer = 0;
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    this.tower.draw(ctx);
    this.particles.draw(ctx);
    for (const enemy of this.enemies) enemy.draw(ctx);
    for (const bullet of this.bullets) bullet.draw(ctx);
  }
}
