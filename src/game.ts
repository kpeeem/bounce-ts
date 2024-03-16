interface GameData {
  locked: boolean;
  stars: number;
}

import { Input } from './input.ts';
import { Canvas } from './canvas.ts';
import { Level } from './level.ts';

export class Game {
  input: Input;
  score: number;
  level: Level;
  canvas: Canvas;
  frame: number;
  animator: number | null;
  lives: number;
  restart: boolean;
  nextLevel: boolean;
  currentLevel: number;
  lastLevel: number;
  options: any;
  containerId: string;
  levelComplete: boolean;
  gameOver: boolean;
  gameWon: boolean;
  stars: number;
  checkpoint: { x: number; y: number; big: boolean };
  levelsCompleted: number;
  isBig: boolean;
  canBounce: boolean;
  floatUp: boolean;
  inWater: boolean;
  passedAllRings: boolean;
  gameData: GameData[];
  bg: HTMLImageElement;
  startCanvas: HTMLCanvasElement | null;

  constructor(containerId: string, options: any) {
    this.input = undefined!;
    this.score = 0;
    this.level = undefined!;
    this.canvas = undefined!;
    this.frame = 1;
    this.animator = null;
    this.lives = 3;
    this.restart = false;
    this.nextLevel = false;
    this.currentLevel = 0;
    this.lastLevel = 4;
    this.options = options;
    this.containerId = containerId;
    this.levelComplete = false;
    this.gameOver = false;
    this.gameWon = false;
    this.stars = 0;
    this.checkpoint = { x: 0, y: 0, big: false };
    this.levelsCompleted = 0;
    this.isBig = false;
    this.canBounce = false;
    this.passedAllRings = false;
    this.floatUp = true;
    this.inWater = false;
    this.gameData = this.readGameData();
    this.bg = new Image();
    // this.bg.src = '/public/assets/bg/level-select.png';
    this.startCanvas = null;
    this.start();
  }

  loop() {
    if (this.update()) {
      this.render();
      this.animator = window.requestAnimationFrame(this.loop.bind(this));
    }
    console.log(this.currentLevel >= this.lastLevel - 1);
  }

  update(): boolean {
    if (this.lives <= 0) {
      this.gameWon = false;
      this.isBig = false;
      this.end();
      if (this.animator !== null) {
        window.cancelAnimationFrame(this.animator);
      }
      return false;
    }

    if (this.levelComplete) {
      this.gameWon = true;
      this.isBig = false;
      this.passedAllRings = false;
      if (this.level) {
        this.level.ringsCollected = 0;
      }
      this.end();
      this.score = 0;
      this.lives = 3;
      if (this.animator !== null) {
        window.cancelAnimationFrame(this.animator);
      }
      return false;
    }

    if (this.nextLevel) {
      this.currentLevel++;
    }

    if (this.restart || this.nextLevel) {
      this.restart = false;
      this.nextLevel = false;
      this.gameWon = false;
      this.level = new Level(this, this.currentLevel);
      this.input.clear();
      this.frame = 1;
    }

    this.input.update();
    if (this.level) {
      this.level.update();
    }
    this.frame++;
    return true;
  }

  render(): void {
    if (this.level) {
      this.level.draw();
    }
  }

  readGameData(): GameData[] {
    let gameData: GameData[];

    if (localStorage.getItem('gameData') === null) {
      gameData = [
        {
          locked: false,
          stars: 0,
        },
        {
          locked: true,
          stars: 0,
        },
        {
          locked: true,
          stars: 0,
        },
        {
          locked: true,
          stars: 0,
        },
      ];
    } else {
      gameData = JSON.parse(localStorage.getItem('gameData') || '');
    }

    return gameData;
  }

  saveGameData(): void {
    localStorage.setItem('gameData', JSON.stringify(this.gameData));
  }

  initGameObjects(n: number): void {
    this.input = new Input();
    this.canvas = new Canvas(this.containerId, this.options);
    this.level = new Level(this, n);
  }

  start(): void {
    const self = this;
    self.startCanvas = document.createElement('canvas');
    const startCanvas = self.startCanvas;
    const startCtx = startCanvas?.getContext('2d');
    const playBtn = new Image();
    playBtn.src = '/public/assets/tile/menu_button_play.png';
    const logo = new Image();
    logo.src = '/public/assets/tile/menu_logo.png';
    const ball = new Image();
    ball.src = '/public/assets/tile/ball_small.png';
    const container = document.getElementById(self.containerId);
    if (container && startCanvas) {
      container.appendChild(startCanvas);
    }

    if (startCanvas) {
      startCanvas.width = 640;
      startCanvas.height = 360;
    }

    setInterval(drawStartScreen, 500);
    window.addEventListener('click', startScreenEventHandler);

    function drawStartScreen() {
      if (startCtx) {
        // startCtx.drawImage(self.bg, 0, 0, 640, 360);
        startCtx.drawImage(playBtn, 380, 220, 178, 50);
        startCtx.drawImage(logo, 40, 115, 250, 112);
        startCtx.drawImage(ball, 132, 254, 45, 45);
      }
    }

    let canvasX = container?.offsetLeft
      ? container.offsetLeft - (startCanvas?.width || 0) / 2
      : 0;
    let canvasY = container?.offsetTop
      ? container.offsetTop - (startCanvas?.height || 0) / 2
      : 0;

    function startScreenEventHandler(e: MouseEvent) {
      let xVal = e.pageX - canvasX;
      let yVal = e.pageY - canvasY;

      if (xVal > 380 && xVal < 558 && yVal > 220 && yVal < 270) {
        window.removeEventListener('click', startScreenEventHandler);
        self.levelSelect();
      }
    }
  }

  levelSelect(): void {
    this.currentLevel = 0;
    const self = this;
    const container = document.getElementById(self.containerId);
    const levelCanvas = document.createElement('canvas');
    const levelCtx = levelCanvas.getContext('2d');
    if (self.startCanvas && container) {
      container.insertBefore(levelCanvas, self.startCanvas.nextSibling);
    }
    levelCanvas.classList.add('level-menu');
    const levelUnlocked = new Image();
    levelUnlocked.src = '/public/assets/tile/lselect_level.png';
    const levelLocked = new Image();
    levelLocked.src = '/public/assets/tile/lselect_level_locked.png';
    const lockIcon = new Image();
    lockIcon.src = '/public/assets/tile/lselect_keylock.png';
    const yellowStarIcon = new Image();
    yellowStarIcon.src = '/public/assets/tile/lselect_star.png';
    const greyStarIcon = new Image();
    greyStarIcon.src = '/public/assets/tile/lselect_star_grey.png';

    levelCanvas.width = 640;
    levelCanvas.height = 360;

    setInterval(drawLevelScreen, 500);
    window.addEventListener('click', levelEventHandler);

    function drawLevelScreen() {
      if (levelCtx) {
        levelCtx.drawImage(self.bg, 0, 0, 640, 360);
        levelCtx.fillStyle = '#fff';
        levelCtx.font = '70px GameFont';
        levelCtx.textAlign = 'center';
        let levelX;
        for (let i = 0; i < self.lastLevel; i++) {
          levelX = 120 + i * 100;
          if (!self.gameData[i].locked) {
            levelCtx.drawImage(levelUnlocked, levelX, 100, 100, 100);
            levelCtx.fillText(self.currentLevel + 1 + i, levelX + 50, 155);
            let smallStarX = 0;
            for (let j = 0; j < self.gameData[i].stars; j++) {
              smallStarX = levelX + 10 + j * 30;
              levelCtx.drawImage(yellowStarIcon, smallStarX, 170, 20, 20);
            }
            for (let k = self.gameData[i].stars; k < 3; k++) {
              smallStarX = levelX + 10 + k * 30;
              levelCtx.drawImage(greyStarIcon, smallStarX, 170, 20, 20);
            }
          } else {
            levelCtx.drawImage(levelLocked, levelX, 100, 100, 100);
            levelCtx.drawImage(lockIcon, levelX + 30, 125, 40, 50);
          }
        }
        levelCtx.font = '40px GameFont';
        levelCtx.fillText('SELECT LEVEL', 315, 290);
      }
    }

    let canvasX = container?.offsetLeft
      ? container.offsetLeft - (levelCanvas?.width || 0) / 2
      : 0;
    let canvasY = container?.offsetTop
      ? container.offsetTop - (levelCanvas?.height || 0) / 2
      : 0;

    function levelEventHandler(e: MouseEvent) {
      let xVal = e.pageX - canvasX;
      let yVal = e.pageY - canvasY;
      if (xVal > 120 && xVal < 220 && yVal > 100 && yVal < 200) {
        if (!self.gameData[0].locked) {
          self.frame = 1;
          self.score = 0;
          self.lives = 3;
          if (container) {
            container.removeChild(levelCanvas);
            container.removeChild(self.startCanvas!);
          }
          self.initGameObjects(0);
          self.loop();
          window.removeEventListener('click', levelEventHandler);
        }
      }

      if (xVal > 220 && xVal < 320 && yVal > 100 && yVal < 200) {
        if (!self.gameData[1].locked) {
          self.frame = 1;
          self.score = 0;
          self.lives = 3;
          if (container) {
            container.removeChild(levelCanvas);
            container.removeChild(self.startCanvas!);
          }
          self.initGameObjects(1);
          self.loop();
          window.removeEventListener('click', levelEventHandler);
        }
      }

      if (xVal > 320 && xVal < 420 && yVal > 100 && yVal < 200) {
        if (!self.gameData[2].locked) {
          self.frame = 1;
          self.score = 0;
          self.lives = 3;
          if (container) {
            container.removeChild(levelCanvas);
            container.removeChild(self.startCanvas!);
          }
          self.initGameObjects(2);
          self.loop();
          window.removeEventListener('click', levelEventHandler);
        }
      }

      if (xVal > 420 && xVal < 520 && yVal > 100 && yVal < 200) {
        if (!self.gameData[3].locked) {
          self.frame = 1;
          self.score = 0;
          self.lives = 3;
          if (container) {
            container.removeChild(levelCanvas);
            container.removeChild(self.startCanvas!);
          }
          self.initGameObjects(3);
          self.loop();
          window.removeEventListener('click', levelEventHandler);
        }
      }
    }
  }

  end(): void {
    const score = this.score;
    // const lastLevel = this.lastLevel;
    // const levelsCompleted = this.levelsCompleted;
    const gameWon = this.gameWon;
    const self = this;
    const container = document.getElementById(self.containerId);
    const endCanvas = document.createElement('canvas');
    if (self.canvas && self.canvas.canvas) {
      self.canvas.canvas.insertAdjacentElement('afterend', endCanvas);
    }
    const endCtx = endCanvas.getContext('2d');
    const crown = new Image();
    crown.src = '/public/assets/tile/crown.png';
    const failed = new Image();
    failed.src = '/public/assets/tile/failed_title.png';
    const yellowstar = new Image();
    yellowstar.src = '/public/assets/tile/star_yellow.png';
    const greystar = new Image();
    greystar.src = '/public/assets/tile/star_gray.png';
    const nextBtn = new Image();
    nextBtn.src = '/public/assets/tile/button_next.png';
    const retryBtnSmall = new Image();
    retryBtnSmall.src = '/public/assets/tile/small_button_retry.png';
    const retryBtnLarge = new Image();
    retryBtnLarge.src = '/public/assets/tile/button_retry.png';
    const menuBtn = new Image();
    menuBtn.src = '/public/assets/tile/button_menu.png';

    endCanvas.width = 480;
    endCanvas.height = 270;
    endCanvas.classList.add('game-finished');

    setInterval(drawEndScreen, 500);

    function drawEndScreen() {
      if (endCtx) {
        endCtx.fillStyle = '#fff';
        endCtx.fillRect(0, 0, 480, 270);
        endCtx.fillStyle = '#000';
        endCtx.lineWidth = 10;
        endCtx.strokeRect(0, 0, 480, 270);

        endCtx.font = '25px GameFont';
        endCtx.textAlign = 'center';

        let starX;
        let stars = self.gameData[self.currentLevel].stars;

        if (gameWon) {
          endCtx.drawImage(crown, 40, 60, 120, 60);
          endCtx.fillStyle = '#000';
          endCtx.fillText('LEVEL ' + (self.currentLevel + 1), 100, 150);
          endCtx.fillText('COMPLETE', 100, 175);
          endCtx.drawImage(nextBtn, 277, 185, 148, 50);
          endCtx.drawImage(retryBtnSmall, 217, 185, 50, 50);
          endCtx.drawImage(menuBtn, 157, 185, 50, 50);
          for (let j = 0; j < stars; j++) {
            starX = 295 + j * 40;
            endCtx.drawImage(yellowstar, starX, 130);
          }

          for (let i = stars; i < 3; i++) {
            starX = 295 + i * 40;
            endCtx.drawImage(greystar, starX, 130);
          }
        } else {
          endCtx.drawImage(failed, 40, 30, 120, 100);
          endCtx.fillStyle = '#000';
          endCtx.fillText('NICE TRY!', 100, 150);
          endCtx.fillText('LEVEL FAILED', 100, 175);
          endCtx.drawImage(retryBtnLarge, 277, 185, 148, 50);
          endCtx.drawImage(menuBtn, 217, 185, 50, 50);
          for (let i = 0; i < 3; i++) {
            starX = 295 + i * 40;
            endCtx.drawImage(greystar, starX, 130);
          }
        }

        endCtx.fillStyle = 'red';
        endCtx.textAlign = 'right';
        endCtx.font = '50px GameFont';
        endCtx.fillText(score, 390, 110);
      }

      let canvasX = container && container.offsetLeft - endCanvas.width / 2;
      let canvasY = container && container.offsetTop - endCanvas.height / 2;

      function endScreenEventHandler(e) {
        let xVal = e.pageX - canvasX;
        let yVal = e.pageY - canvasY;

        if (gameWon) {
          if (xVal > 277 && xVal < 425 && yVal > 185 && yVal < 235) {
            self.frame = 1;
            self.score = 0;
            self.lives = 3;
            if (self.currentLevel >= self.lastLevel - 1) {
              self.levelComplete = false;
              container && container.removeChild(endCanvas);
              container && container.removeChild(self.canvas.canvas);
              container && container.removeChild(self.canvas.gbarCanvas);
              window.removeEventListener('click', endScreenEventHandler);
              self.start();
            } else {
              self.nextLevel = true;
              self.levelComplete = false;
              container && container.removeChild(endCanvas);
              window.removeEventListener('click', endScreenEventHandler);
              self.loop();
            }
          }
          if (xVal > 217 && xVal < 267 && yVal > 185 && yVal < 235) {
            self.restart = true;
            self.lives = 3;
            self.score = 0;
            self.levelComplete = false;
            container && container.removeChild(endCanvas);
            window.removeEventListener('click', endScreenEventHandler);
            self.loop();
          }
          if (xVal > 157 && xVal < 207 && yVal > 185 && yVal < 235) {
            self.lives = 3;
            self.score = 0;
            self.levelComplete = false;
            container && container.removeChild(endCanvas);
            container && container.removeChild(self.canvas.canvas);
            container && container.removeChild(self.canvas.gbarCanvas);
            window.removeEventListener('click', endScreenEventHandler);
            self.start();
          }
        } else {
          if (xVal > 277 && xVal < 425 && yVal > 185 && yVal < 235) {
            self.restart = true;
            self.lives = 3;
            self.score = 0;
            container && container.removeChild(endCanvas);
            window.removeEventListener('click', endScreenEventHandler);
            self.loop();
          }

          if (xVal > 217 && xVal < 267 && yVal > 185 && yVal < 235) {
            container && container.removeChild(endCanvas);
            container && container.removeChild(self.canvas.canvas);
            container && container.removeChild(self.canvas.gbarCanvas);
            window.removeEventListener('click', endScreenEventHandler);
            self.start();
          }
        }
      }
      window.addEventListener('click', endScreenEventHandler);
    }
  }
}
