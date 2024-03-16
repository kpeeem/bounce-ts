import { Tile } from './tile.ts';

export class Sprite {
  private static image: HTMLImageElement | null = null;
  private size: number = 40;
  private sw: number;
  private sh: number;
  private sx: number;
  private sy: number;
  private dw: number;
  private dh: number;

  constructor(i: number, j: number, sw?: number, sh?: number) {
    this.sw = sw || this.size;
    this.sh = sh || this.size;
    this.sx = i;
    this.sy = j;
    this.dw = this.sw * (Tile.size / this.size);
    this.dh = this.sh * (Tile.size / this.size);

    if (!Sprite.image) {
      Sprite.image = new Image();
      Sprite.image.src = '/public/assets/tile/spritesheet.png';
    }
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (Sprite.image) {
      ctx.drawImage(
        Sprite.image,
        this.sx,
        this.sy,
        this.sw,
        this.sh,
        x,
        y,
        this.dw,
        this.dh
      );
    }
  }
}
