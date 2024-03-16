interface KeyMap {
  [key: string]: {
    hold: boolean;
    pulse: boolean;
  };
}

interface KeycodeMap {
  [keyCode: number]: string;
}

export class Input {
  down: KeyMap;
  up: KeyMap;
  pressed: KeyMap;
  keys: KeyMap;
  keymap: KeycodeMap;

  constructor() {
    this.down = {};
    this.up = {};
    this.pressed = {};
    this.keys = {};
    this.keymap = {
      32: 'space',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down',
    };

    for (let code in this.keymap) {
      const key = this.keymap[code as unknown as number];
      this.keys[key] = { hold: false, pulse: false };
    }

    window.addEventListener('keydown', this.handler.bind(this));
    window.addEventListener('keyup', this.handler.bind(this));
  }

  handler(e: KeyboardEvent): boolean {
    const key = this.keymap[e.which];
    if (!key) {
      return true;
    }

    if (e.type === 'keydown') {
      if (!this.pressed[key]) {
        this.pressed[key] = true;
        this.down[key] = true;
      }
    }

    if (e.type === 'keyup') {
      this.pressed[key] = false;
      this.up[key] = true;
    }

    return false;
  }

  update(): void {
    for (let code in this.keymap) {
      let key = this.keymap[code as unknown as number];
      let up = this.up[key];
      let down = this.down[key];

      this.keys[key].pulse = down;

      if (down && up) {
        this.keys[key].hold = true;
        this.down[key] = false;
      }

      if (down && !up) {
        this.keys[key].hold = true;
        this.down[key] = false;
      }

      if (!down && up) {
        this.keys[key].hold = false;
        this.up[key] = false;
      }
    }
  }

  clear(): void {
    for (let code in this.keymap) {
      let key = this.keymap[code as unknown as number];
      this.keys[key] = { hold: false, pulse: false };
    }
  }
}
