import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_CONFIG, ENEMY_TYPES, POWERUP_TYPES, COLORS } from './config.js';

export class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT - 90;
    this.vx = 0;
    this.vy = 0;
    this.width = PLAYER_CONFIG.width;
    this.height = PLAYER_CONFIG.height;
    this.health = PLAYER_CONFIG.maxHealth;
    this.shield = PLAYER_CONFIG.maxShield;
    this.shieldTimer = 0;
    this.weaponType = 'NORMAL';
    this.weaponTimer = 0;
    this.fireTimer = 0;
    this.empCooldownTimer = 0;
    this.empCharge = 1;
    this.invulnerableTimer = 0;
  }

  update(dt, input) {
    // Movement
    const move = input.getMovementVector();
    this.vx = move.x * PLAYER_CONFIG.speed;
    this.vy = move.y * PLAYER_CONFIG.speed;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Bounds
    const margin = 24;
    this.x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, this.x));
    this.y = Math.max(margin, Math.min(CANVAS_HEIGHT - margin, this.y));

    // Timers
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
    if (this.fireTimer > 0) this.fireTimer -= dt;
    if (this.empCooldownTimer > 0) this.empCooldownTimer -= dt;

    if (this.weaponTimer > 0) {
      this.weaponTimer -= dt;
      if (this.weaponTimer <= 0) {
        this.weaponType = 'NORMAL';
      }
    }

    // Shield regeneration
    this.shieldTimer += dt;
    if (this.shieldTimer >= PLAYER_CONFIG.shieldRegenDelay && this.shield < PLAYER_CONFIG.maxShield) {
      this.shield = Math.min(PLAYER_CONFIG.maxShield, this.shield + PLAYER_CONFIG.shieldRegenRate * dt);
    }
  }

  takeDamage(amount) {
    if (this.invulnerableTimer > 0) return false;
    this.shieldTimer = 0;
    this.invulnerableTimer = 0.2; // brief i-frame

    if (this.shield > 0) {
      if (this.shield >= amount) {
        this.shield -= amount;
        return 'SHIELD';
      } else {
        const leftover = amount - this.shield;
        this.shield = 0;
        this.health = Math.max(0, this.health - leftover);
        return 'HULL';
      }
    } else {
      this.health = Math.max(0, this.health - amount);
      return 'HULL';
    }
  }

  applyPowerup(type) {
    if (type === 'SHIELD') {
      this.shield = PLAYER_CONFIG.maxShield;
      this.health = Math.min(PLAYER_CONFIG.maxHealth, this.health + 25);
    } else if (type === 'TRIPLE') {
      this.weaponType = 'TRIPLE';
      this.weaponTimer = 10.0;
    } else if (type === 'OVERDRIVE') {
      this.weaponType = 'OVERDRIVE';
      this.weaponTimer = 8.0;
    } else if (type === 'EMP') {
      this.empCharge = Math.min(2, this.empCharge + 1);
    }
  }
}

export class Enemy {
  constructor(spec, x, y) {
    this.type = spec.type;
    this.x = x;
    this.y = y;
    this.hp = spec.hp;
    this.maxHp = spec.hp;
    this.speed = spec.speed;
    this.scoreValue = spec.score;
    this.color = spec.color;
    this.size = spec.size;
    this.fireTimer = Math.random() * (spec.fireRate || 2.0);
    this.fireInterval = spec.fireRate || 2.0;
    this.active = true;
    this.t = Math.random() * 10;
  }

  update(dt) {
    this.t += dt;
    if (this.type === 'SCOUT') {
      this.y += this.speed * dt;
      this.x += Math.sin(this.t * 4) * 120 * dt;
    } else if (this.type === 'INTERCEPTOR') {
      this.y += this.speed * dt;
      this.x += Math.cos(this.t * 2.5) * 80 * dt;
      this.fireTimer -= dt;
    } else if (this.type === 'CRUISER') {
      this.y += this.speed * dt * 0.7;
      this.fireTimer -= dt;
    } else if (this.type === 'DREADNOUGHT') {
      if (this.y < 120) {
        this.y += this.speed * dt;
      } else {
        this.x += Math.sin(this.t * 1.2) * 90 * dt;
      }
      this.fireTimer -= dt;
    }

    if (this.y > CANVAS_HEIGHT + 60) {
      this.active = false;
    }
  }
}

export class Projectile {
  constructor(x, y, vx, vy, isPlayer, color = COLORS.cyan, damage = 25) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.isPlayer = isPlayer;
    this.color = color;
    this.damage = damage;
    this.active = true;
    this.radius = isPlayer ? 3.5 : 4.5;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.x < -20 || this.x > CANVAS_WIDTH + 20 || this.y < -20 || this.y > CANVAS_HEIGHT + 20) {
      this.active = false;
    }
  }
}

export class Powerup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.config = POWERUP_TYPES[type];
    this.radius = 12;
    this.active = true;
    this.t = 0;
  }

  update(dt) {
    this.t += dt;
    this.y += 85 * dt;
    this.x += Math.sin(this.t * 3) * 30 * dt;
    if (this.y > CANVAS_HEIGHT + 40) {
      this.active = false;
    }
  }
}
