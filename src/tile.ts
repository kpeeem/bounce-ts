type TileType =
  | 'B'
  | 'F'
  | 'D'
  | 'P'
  | 'O'
  | '%'
  | 'S'
  | 'I'
  | '#'
  | 'C'
  | 'L'
  | 'R'
  | 'E'
  | '+'
  | '-'
  | '='
  | '$'
  | '0'
  | 'T'
  | 'Y';

export class Tile {
  static size: number = 45;
  static ballSize: number = 45;

  static isSolid(tile: TileType): boolean {
    return ['B', 'F', 'D', 'P', 'O', '%', 'S', 'I', '#'].includes(tile);
  }

  static isPickable(tile: TileType): boolean {
    return ['C', 'L', 'R', 'E', '+', '-', '=', '$', '0'].includes(tile);
  }

  static isLethal(tile: TileType): boolean {
    return ['T', 'Y'].includes(tile);
  }
}
