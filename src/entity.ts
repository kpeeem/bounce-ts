import { Tile } from './tile.ts';

export class Entity {
  game: any;
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(game: any, x: number, y: number) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 0;
    this.height = 0;
  }

  draw(): void {}

  update(): void {}

  kill(): boolean {
    return false;
  }

  getCorners(): [number, number][] {
    const offset = 1;
    const xs = [this.x + offset, this.x + this.width - offset];
    const ys = [this.y, this.y + this.height - offset];
    const corners: [number, number][] = [];

    for (let i = 0; i < ys.length; i++) {
      for (let j = 0; j < xs.length; j++) {
        corners.push([xs[j], ys[i]]);
      }
    }

    return corners;
  }

  getTouchedTiles(): { x: number; y: number; tile: string }[] {
    const touchedTiles: { x: number; y: number; tile: string }[] = [];
    const corners = this.getCorners();

    for (let i = 0; i < corners.length; i++) {
      touchedTiles.push({
        x: corners[i][0],
        y: corners[i][1],
        tile: this.game.level.getTile(corners[i][0], corners[i][1]),
      });
    }

    return touchedTiles;
  }

  clipped(direction: 'up' | 'down' | 'left' | 'right'): boolean {
    const tiles = this.getTouchedTiles();

    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i].tile === 'P' || tiles[i].tile === 'O') {
        this.game.isBig = true;
      } else if (tiles[i].tile === 'D' || tiles[i].tile === '%') {
        this.game.isBig = false;
      } else if (tiles[i].tile === 'I') {
        this.game.canBounce = true;
      }
    }

    const mapping: { [key: string]: string[] } = {
      up: [tiles[0].tile, tiles[1].tile],
      down: [tiles[2].tile, tiles[3].tile],
      left: [tiles[0].tile, tiles[2].tile],
      right: [tiles[1].tile, tiles[3].tile],
    };

    if (
      this.game.isBig &&
      this.game.floatUp &&
      (mapping.up[0] === 'B' || mapping.up[1] === 'B')
    ) {
      this.game.floatUp = false;
    } else if (
      !this.game.floatUp &&
      mapping.up[0] !== 'B' &&
      mapping.up[1] !== 'B'
    ) {
      this.game.floatUp = true;
    }

    return mapping[direction]
      .map(Tile.isSolid)
      .reduce((acc, cur) => acc || cur);
  }

  static pointInRect(
    x: number,
    y: number,
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      x >= rect.x &&
      x <= rect.x + rect.width &&
      y >= rect.y &&
      y <= rect.y + rect.height
    );
  }

  pointCollison(x: number, y: number): boolean {
    return Entity.pointInRect(x, y, this);
  }

  hasCollided(entity: Entity): boolean {
    return (
      this.x < entity.x + entity.width &&
      this.x + this.width > entity.x &&
      this.y < entity.y + entity.height &&
      this.y + this.height > entity.y
    );
  }
}
