export abstract class Entity {
  public x: number;
  public y: number;
  public radius: number;
  public char: string;
  public color: string = '#1a1a1a';
  public fontSize: number = 24;
  public active: boolean = true;

  constructor(x: number, y: number, radius: number, char: string) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.char = char;
  }

  public abstract update(dt: number): void;

  public draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.font = `${this.fontSize}px "Noto Serif SC", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Subtle ink vibration effect for all entities
    const offsetX = (Math.random() - 0.5) * 0.5;
    const offsetY = (Math.random() - 0.5) * 0.5;
    
    ctx.fillText(this.char, this.x + offsetX, this.y + offsetY);
    ctx.restore();
  }
}
