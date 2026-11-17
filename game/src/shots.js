import { ENEMY_TYPES, POWERUP_TYPES, COLORS, CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { Enemy, Projectile, Powerup } from './entities.js';

export function stageShot(name, world, particles) {
  world.reset();
  particles.clear();

  if (name === 'play') {
    world.score = 14850;
    world.combo = 4;
    world.comboTimer = 3.0;
    world.wave = 2;
    world.kills = 18;

    world.player.x = CANVAS_WIDTH / 2;
    world.player.y = CANVAS_HEIGHT - 130;
    world.player.health = 100;
    world.player.shield = 85;

    // Enemies
    const e1 = new Enemy(ENEMY_TYPES.INTERCEPTOR, CANVAS_WIDTH / 2 - 160, 160);
    const e2 = new Enemy(ENEMY_TYPES.SCOUT, CANVAS_WIDTH / 2 + 100, 130);
    const e3 = new Enemy(ENEMY_TYPES.SCOUT, CANVAS_WIDTH / 2 - 280, 200);
    const e4 = new Enemy(ENEMY_TYPES.CRUISER, CANVAS_WIDTH / 2 + 240, 180);
    world.enemies.push(e1, e2, e3, e4);

    // Player Projectiles
    world.projectiles.push(
      new Projectile(CANVAS_WIDTH / 2 - 10, CANVAS_HEIGHT - 170, 0, -650, COLORS.cyan, true, 25),
      new Projectile(CANVAS_WIDTH / 2 + 10, CANVAS_HEIGHT - 170, 0, -650, COLORS.cyan, true, 25),
      new Projectile(CANVAS_WIDTH / 2 - 24, CANVAS_HEIGHT - 230, -60, -620, COLORS.cyan, true, 20),
      new Projectile(CANVAS_WIDTH / 2 + 24, CANVAS_HEIGHT - 230, 60, -620, COLORS.cyan, true, 20)
    );

    // Hostile Projectiles
    world.projectiles.push(
      new Projectile(CANVAS_WIDTH / 2 - 160, 220, 0, 220, COLORS.pink, false, 15),
      new Projectile(CANVAS_WIDTH / 2 + 240, 240, -40, 200, COLORS.yellow, false, 15)
    );

    // Glowing explosion & particles
    particles.spawnBurst(CANVAS_WIDTH / 2 + 100, 130, COLORS.pink, 24, 280);
    particles.spawnShockwave(CANVAS_WIDTH / 2 + 100, 130, COLORS.pink, 70);
    particles.spawnBurst(CANVAS_WIDTH / 2 - 10, CANVAS_HEIGHT - 170, COLORS.cyan, 10, 120);

    // Floating Powerup
    world.powerups.push(new Powerup(CANVAS_WIDTH / 2 - 70, 290, POWERUP_TYPES.SPREAD));

    return { screen: 'PLAY' };
  }

  if (name === 'end') {
    world.score = 48200;
    world.wave = 5;
    world.kills = 64;
    world.gameOver = true;
    world.player.health = 0;
    world.player.shield = 0;

    // A few explosion remnants
    particles.spawnBurst(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, COLORS.hp, 30, 200);
    particles.spawnShockwave(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, COLORS.hp, 90);

    return { screen: 'GAMEOVER' };
  }

  // Default: start / title screen
  return { screen: 'TITLE' };
}
