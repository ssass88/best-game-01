import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './config.js';

export class Renderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.stars = this.initStars(90);
    this.gridOffset = 0;
  }

  initStars(count) {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        speed: 25 + Math.random() * 80,
        size: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.7
      });
    }
    return stars;
  }

  clear() {
    this.ctx.fillStyle = COLORS.bg;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  renderBackground(dt) {
    const ctx = this.ctx;

    // Draw synthwave starry background
    ctx.save();
    for (const s of this.stars) {
      s.y += s.speed * dt;
      if (s.y > CANVAS_HEIGHT) {
        s.y = 0;
        s.x = Math.random() * CANVAS_WIDTH;
      }
      ctx.fillStyle = COLORS.white;
      ctx.globalAlpha = s.alpha;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.restore();

    // Perspective neon grid at bottom
    ctx.save();
    this.gridOffset = (this.gridOffset + 70 * dt) % 40;
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1.2;

    const horizon = 220;
    // Horizontal lines
    for (let y = horizon; y < CANVAS_HEIGHT; y += 32) {
      const py = y + this.gridOffset;
      if (py > CANVAS_HEIGHT) continue;
      const progress = (py - horizon) / (CANVAS_HEIGHT - horizon);
      ctx.globalAlpha = Math.min(0.6, progress * 0.7);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(CANVAS_WIDTH, py);
      ctx.stroke();
    }

    // Perspective converging vertical lines
    const vpX = CANVAS_WIDTH / 2;
    for (let x = -CANVAS_WIDTH; x <= CANVAS_WIDTH * 2; x += 64) {
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(vpX, horizon);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderPlayer(player) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(player.x, player.y);

    // Thruster glow
    const thrustLen = 14 + Math.random() * 8;
    const grad = ctx.createLinearGradient(0, 10, 0, 10 + thrustLen);
    grad.addColorStop(0, COLORS.cyan);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-6, 10);
    ctx.lineTo(6, 10);
    ctx.lineTo(0, 10 + thrustLen);
    ctx.fill();

    // Ship body (sleek neon arrow)
    ctx.strokeStyle = COLORS.cyan;
    ctx.fillStyle = '#0c1a2e';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = COLORS.cyan;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(0, -player.height / 2);
    ctx.lineTo(player.width / 2, player.height / 2);
    ctx.lineTo(player.width / 4, player.height / 3);
    ctx.lineTo(0, player.height / 2.2);
    ctx.lineTo(-player.width / 4, player.height / 3);
    ctx.lineTo(-player.width / 2, player.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit neon core
    ctx.fillStyle = COLORS.pink;
    ctx.shadowColor = COLORS.pink;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(0, -2, 3.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shield bubble if active
    if (player.shield > 0) {
      const shieldRatio = player.shield / 100;
      ctx.strokeStyle = COLORS.shieldBorder;
      ctx.fillStyle = COLORS.shield;
      ctx.globalAlpha = 0.2 + shieldRatio * 0.35;
      ctx.shadowColor = COLORS.cyan;
      ctx.shadowBlur = 14;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, player.width * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  renderEnemies(enemies) {
    const ctx = this.ctx;
    for (const e of enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.strokeStyle = e.color;
      ctx.fillStyle = '#180a22';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 12;

      if (e.type === 'SCOUT') {
        ctx.beginPath();
        ctx.moveTo(0, e.size / 2);
        ctx.lineTo(e.size / 2, -e.size / 2);
        ctx.lineTo(-e.size / 2, -e.size / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (e.type === 'INTERCEPTOR') {
        ctx.beginPath();
        ctx.moveTo(0, e.size / 2);
        ctx.lineTo(e.size / 1.8, 0);
        ctx.lineTo(e.size / 3, -e.size / 2);
        ctx.lineTo(-e.size / 3, -e.size / 2);
        ctx.lineTo(-e.size / 1.8, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (e.type === 'CRUISER') {
        ctx.beginPath();
        ctx.moveTo(0, e.size / 2);
        ctx.lineTo(e.size / 1.5, e.size / 4);
        ctx.lineTo(e.size / 2, -e.size / 2);
        ctx.lineTo(-e.size / 2, -e.size / 2);
        ctx.lineTo(-e.size / 1.5, e.size / 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (e.type === 'DREADNOUGHT') {
        // Boss
        ctx.beginPath();
        ctx.moveTo(0, e.size / 1.5);
        ctx.lineTo(e.size, 0);
        ctx.lineTo(e.size * 0.7, -e.size / 2);
        ctx.lineTo(-e.size * 0.7, -e.size / 2);
        ctx.lineTo(-e.size, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Boss health bar
        const hpWidth = 140;
        const hpRatio = e.hp / e.maxHp;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(-hpWidth / 2, -e.size / 2 - 16, hpWidth, 8);
        ctx.fillStyle = COLORS.pink;
        ctx.shadowColor = COLORS.pink;
        ctx.fillRect(-hpWidth / 2, -e.size / 2 - 16, hpWidth * hpRatio, 8);
      }

      ctx.restore();
    }
  }

  renderProjectiles(projectiles) {
    const ctx = this.ctx;
    ctx.save();
    for (const p of projectiles) {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderPowerups(powerups) {
    const ctx = this.ctx;
    for (const pu of powerups) {
      ctx.save();
      ctx.translate(pu.x, pu.y);
      ctx.strokeStyle = pu.config.color;
      ctx.fillStyle = '#0a1a20';
      ctx.lineWidth = 2.0;
      ctx.shadowColor = pu.config.color;
      ctx.shadowBlur = 14;

      // Rotating diamond
      ctx.rotate(pu.t * 3);
      ctx.beginPath();
      ctx.moveTo(0, -pu.radius);
      ctx.lineTo(pu.radius, 0);
      ctx.lineTo(0, pu.radius);
      ctx.lineTo(-pu.radius, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }
}
