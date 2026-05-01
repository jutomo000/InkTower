export interface Point {
  x: number;
  y: number;
}

export class Engine {
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private lastTime: number = 0;
  private running: boolean = false;

  public width: number = 0;
  public height: number = 0;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize() {
    // Standardize coordinates for mobile (e.g., width = 750)
    // But for now, we'll use full screen and handle scaling in entities
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    console.log(`Canvas resized to: ${this.width}x${this.height}`);
  }

  public start(update: (dt: number) => void, render: (ctx: CanvasRenderingContext2D) => void) {
    this.running = true;
    this.lastTime = performance.now();
    
    const loop = (currentTime: number) => {
      if (!this.running) return;
      
      const dt = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;
      
      // Clear canvas
      this.ctx.clearRect(0, 0, this.width, this.height);
      
      update(dt);
      render(this.ctx);
      
      requestAnimationFrame(loop);
    };
    
    requestAnimationFrame(loop);
  }

  public stop() {
    this.running = false;
  }
}
