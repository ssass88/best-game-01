import { InputManager } from './input.js';
import { SoundSystem } from './audio.js';
import { ParticleSystem } from './particles.js';
import { GameWorld } from './world.js';
import { Renderer } from './render.js';
import { UIManager } from './ui.js';
import { stageShot } from './shots.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const particles = new ParticleSystem();
const sound = new SoundSystem();
const input = new InputManager(canvas);
const world = new GameWorld(particles, sound);
const renderer = new Renderer(canvas, ctx);
const ui = new UIManager(ctx);

let screen = 'TITLE'; // 'TITLE' | 'PLAY' | 'GAMEOVER' | 'VICTORY'
let lastTime = performance.now();

// Check for shot query parameter
const params = new URLSearchParams(window.location.search);
const shotParam = params.get('shot');

function renderFrame(dt) {
  renderer.clear();
  renderer.renderBackground(dt);

  if (screen === 'PLAY' || shotParam === 'play') {
    renderer.renderProjectiles(world.projectiles);
    renderer.renderPowerups(world.powerups);
    renderer.renderEnemies(world.enemies);
    if (world.player.health > 0) {
      renderer.renderPlayer(world.player);
    }
    particles.render(ctx);
    ui.renderHUD(world);
  } else if (screen === 'TITLE' || shotParam === 'start') {
    renderer.renderPlayer(world.player);
    particles.render(ctx);
    ui.renderTitleScreen();
  } else if (screen === 'GAMEOVER' || shotParam === 'end') {
    renderer.renderProjectiles(world.projectiles);
    renderer.renderEnemies(world.enemies);
    particles.render(ctx);
    ui.renderGameOver(world);
  } else if (screen === 'VICTORY') {
    particles.render(ctx);
    ui.renderVictory(world);
  }
}

if (shotParam) {
  // Headless screenshot capture mode
  const scene = stageShot(shotParam, world, particles);
  screen = scene.screen;

  // Immediate synchronous paint so headless browser grabs the painted canvas
  renderFrame(1 / 60);

  let paintCount = 0;
  function paintShot() {
    renderFrame(1 / 60);
    paintCount++;
    if (paintCount < 2) {
      requestAnimationFrame(paintShot);
    } else {
      window.__shotReady = true;
    }
  }
  requestAnimationFrame(paintShot);
} else {
  // Normal interactive game loop
  function startGame() {
    sound.init();
    world.reset();
    screen = 'PLAY';
  }

  function gameLoop(now) {
    const rawDt = (now - lastTime) / 1000;
    lastTime = now;
    const dt = Math.min(rawDt, 0.1); // prevent huge delta spikes

    if (screen === 'TITLE') {
      if (input.consumeJustPressed('Space') || input.consumeJustPressed('Enter') || (input.mouse.isDown && input.clearFrame())) {
        startGame();
      }
    } else if (screen === 'PLAY') {
      world.update(dt, input);
      particles.update(dt);

      if (world.gameOver) {
        screen = 'GAMEOVER';
        sound.playExplosion(true);
      } else if (world.victory) {
        screen = 'VICTORY';
        sound.playPowerup();
      }
    } else if (screen === 'GAMEOVER' || screen === 'VICTORY') {
      particles.update(dt);
      if (input.consumeJustPressed('Space') || input.consumeJustPressed('Enter') || (input.mouse.isDown && input.clearFrame())) {
        startGame();
      }
    }

    renderFrame(dt);
    input.clearFrame();
    requestAnimationFrame(gameLoop);
  }

  // Handle first user interaction to unlock Web Audio
  window.addEventListener('click', () => sound.init(), { once: true });
  window.addEventListener('keydown', () => sound.init(), { once: true });

  requestAnimationFrame(gameLoop);
}
