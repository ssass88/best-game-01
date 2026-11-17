import { CANVAS_WIDTH, CANVAS_HEIGHT, ENEMY_TYPES, POWERUP_TYPES, PLAYER_CONFIG, COLORS } from './config.js';
import { Player, Enemy, Projectile, Powerup } from './entities.js';

export class GameWorld {
  constructor(particles, sound) {
    this.particles = particles;
    this.sound = sound;
    this.player = new Player();
    this.enemies = [];
    this.projectiles = [];
    this.powerups = [];
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.wave = 1;
    this.waveTimer = 0;
    this.spawnTimer = 0;
    this.kills = 0;
    this.gameOver = false;
    this.victory = false;
    this.screenShake = 0;
  }

  reset() {
    this.player.reset();
    this.enemies = [];
    this.projectiles = [];
    this.powerups = [];
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.wave = 1;
    this.waveTimer = 0;
    this.spawnTimer = 0;
    this.kills = 0;
    this.gameOver = false;
    this.victory = false;
    this.screenShake = 0;
    this.particles.clear();
  }

  update(dt, input) {
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 18);
    }

    if (this.gameOver || this.victory) return;

    // Player update
    this.player.update(dt, input);
    this.particles.spawnTrail(this.player.x, this.player.y + 14, COLORS.cyan, 3);

    // Combo decay
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
      }
    }

    // Firing logic
    if (input.isActionActive() && this.player.fireTimer <= 0) {
      this.firePlayerWeapon();
    }

    // EMP Nova
    if (input.isEmpActive() && this.player.empCharge > 0 && this.player.empCooldownTimer <= 0) {
      this.triggerEmp();
    }

    // Wave spawning
    this.handleSpawning(dt);

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt);
      if (!p.active) {
        this.projectiles.splice(i, 1);
      }
    }

    // Update powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pu = this.powerups[i];
      pu.update(dt);
      if (!pu.active) {
        this.powerups.splice(i, 1);
        continue;
      }
      // Check player pickup
      const dist = Math.hypot(this.player.x - pu.x, this.player.y - pu.y);
      if (dist < this.player.width / 2 + pu.radius) {
        this.player.applyPowerup(pu.type);
        this.sound.playPowerup();
        this.particles.spawnBurst(pu.x, pu.y, pu.config.color, 24, 200);
        this.score += 200 * this.combo;
        this.powerups.splice(i, 1);
      }
    }

    // Update enemies & enemy attacks
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(dt);

      if (e.fireTimer <= 0 && e.active) {
        this.enemyShoot(e);
      }

      if (!e.active) {
        this.enemies.splice(i, 1);
        continue;
      }

      // Check collision with player
      const dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
      if (dist < (this.player.width + e.size) / 2.2) {
        this.playerHit(35);
        e.hp -= 40;
        this.particles.spawnBurst(e.x, e.y, COLORS.yellow, 16, 200);
        if (e.hp <= 0) {
          this.killEnemy(e, i);
        }
      }
    }

    // Projectile collisions
    this.handleCollisions();

    // Check player death
    if (this.player.health <= 0) {
      this.gameOver = true;
      this.sound.playExplosion(true);
      this.particles.spawnBurst(this.player.x, this.player.y, COLORS.hp, 48, 350);
      this.screenShake = 14;
    }
  }

  firePlayerWeapon() {
    const fireInterval = this.player.weaponType === 'OVERDRIVE' ? 0.06 : PLAYER_CONFIG.baseFireRate;
    this.player.fireTimer = fireInterval;
    this.sound.playLaser();

    if (this.player.weaponType === 'TRIPLE') {
      this.projectiles.push(new Projectile(this.player.x, this.player.y - 14, 0, -680, true, COLORS.cyan, 28));
      this.projectiles.push(new Projectile(this.player.x - 10, this.player.y - 10, -120, -660, true, COLORS.yellow, 24));
      this.projectiles.push(new Projectile(this.player.x + 10, this.player.y - 10, 120, -660, true, COLORS.yellow, 24));
    } else if (this.player.weaponType === 'OVERDRIVE') {
      this.projectiles.push(new Projectile(this.player.x - 8, this.player.y - 14, (Math.random() - 0.5) * 40, -800, true, COLORS.pink, 20));
      this.projectiles.push(new Projectile(this.player.x + 8, this.player.y - 14, (Math.random() - 0.5) * 40, -800, true, COLORS.pink, 20));
    } else {
      this.projectiles.push(new Projectile(this.player.x - 7, this.player.y - 14, 0, -700, true, COLORS.cyan, 28));
      this.projectiles.push(new Projectile(this.player.x + 7, this.player.y - 14, 0, -700, true, COLORS.cyan, 28));
    }
  }

  enemyShoot(e) {
    e.fireTimer = e.fireInterval;
    if (e.type === 'INTERCEPTOR') {
      this.projectiles.push(new Projectile(e.x, e.y + e.size / 2, 0, 280, false, COLORS.pink, 18));
    } else if (e.type === 'CRUISER') {
      this.projectiles.push(new Projectile(e.x - 12, e.y + e.size / 2, -60, 260, false, COLORS.yellow, 22));
      this.projectiles.push(new Projectile(e.x + 12, e.y + e.size / 2, 60, 260, false, COLORS.yellow, 22));
    } else if (e.type === 'DREADNOUGHT') {
      for (let angle = -0.4; angle <= 0.4; angle += 0.2) {
        const vx = Math.sin(angle) * 320;
        const vy = Math.cos(angle) * 320;
        this.projectiles.push(new Projectile(e.x, e.y + e.size / 2, vx, vy, false, COLORS.purple, 25));
      }
    }
  }

  triggerEmp() {
    this.player.empCharge -= 1;
    this.player.empCooldownTimer = PLAYER_CONFIG.empCooldown;
    this.sound.playEmp();
    this.screenShake = 12;
    this.particles.spawnShockwave(this.player.x, this.player.y, COLORS.cyan, 360);

    // Destroy all enemy projectiles
    for (const p of this.projectiles) {
      if (!p.isPlayer) {
        p.active = false;
        this.particles.spawnBurst(p.x, p.y, COLORS.cyan, 6, 120);
      }
    }

    // Damage all visible enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.hp -= 150;
      this.particles.spawnBurst(e.x, e.y, COLORS.cyan, 18, 220);
      if (e.hp <= 0) {
        this.killEnemy(e, i);
      }
    }
  }

  handleCollisions() {
    for (const p of this.projectiles) {
      if (!p.active) continue;

      if (p.isPlayer) {
        // Player bullet vs enemies
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          if (!e.active) continue;
          const dist = Math.hypot(p.x - e.x, p.y - e.y);
          if (dist < e.size / 1.8 + p.radius) {
            p.active = false;
            e.hp -= p.damage;
            this.particles.spawnBurst(p.x, p.y, p.color, 6, 140);
            if (e.hp <= 0) {
              this.killEnemy(e, j);
            }
            break;
          }
        }
      } else {
        // Enemy bullet vs player
        const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
        if (dist < this.player.width / 2.2 + p.radius) {
          p.active = false;
          this.playerHit(p.damage);
        }
      }
    }
  }

  playerHit(damage) {
    const res = this.player.takeDamage(damage);
    if (res) {
      this.screenShake = 6;
      this.sound.playExplosion(false);
      this.particles.spawnShockwave(this.player.x, this.player.y, res === 'SHIELD' ? COLORS.cyan : COLORS.hp, 45);
    }
  }

  killEnemy(e, index) {
    e.active = false;
    this.enemies.splice(index, 1);
    this.kills += 1;
    this.sound.playExplosion(e.type === 'DREADNOUGHT' || e.type === 'CRUISER');

    // Combo system
    this.score += e.scoreValue * this.combo;
    this.combo = Math.min(8, this.combo + 1);
    this.comboTimer = 2.8;

    this.particles.spawnBurst(e.x, e.y, e.color, e.type === 'DREADNOUGHT' ? 64 : 24, e.type === 'DREADNOUGHT' ? 360 : 250);
    this.particles.spawnShockwave(e.x, e.y, e.color, e.size * 2.2);

    // Random powerup drop (18% chance)
    if (Math.random() < 0.22) {
      const keys = Object.keys(POWERUP_TYPES);
      const chosen = keys[Math.floor(Math.random() * keys.length)];
      this.powerups.push(new Powerup(e.x, e.y, chosen));
    }

    if (e.type === 'DREADNOUGHT') {
      this.screenShake = 18;
      this.victory = true;
      this.score += 10000;
    }
  }

  handleSpawning(dt) {
    this.waveTimer += dt;
    this.spawnTimer -= dt;

    if (this.waveTimer > 35 && this.wave < 5) {
      this.wave += 1;
      this.waveTimer = 0;
      this.particles.spawnShockwave(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, COLORS.cyan, 450);
    }

    if (this.spawnTimer <= 0) {
      if (this.wave === 5 && !this.enemies.some(e => e.type === 'DREADNOUGHT') && !this.victory) {
        this.enemies.push(new Enemy(ENEMY_TYPES.DREADNOUGHT, CANVAS_WIDTH / 2, -70));
        this.spawnTimer = 6.0;
        return;
      }

      const spawnInterval = Math.max(0.6, 2.2 - this.wave * 0.3);
      this.spawnTimer = spawnInterval;

      const x = 50 + Math.random() * (CANVAS_WIDTH - 100);
      const roll = Math.random();

      if (this.wave >= 3 && roll < 0.25) {
        this.enemies.push(new Enemy(ENEMY_TYPES.CRUISER, x, -50));
      } else if (this.wave >= 2 && roll < 0.6) {
        this.enemies.push(new Enemy(ENEMY_TYPES.INTERCEPTOR, x, -40));
      } else {
        this.enemies.push(new Enemy(ENEMY_TYPES.SCOUT, x, -30));
      }
    }
  }
}
