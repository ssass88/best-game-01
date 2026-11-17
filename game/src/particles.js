export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.rings = [];
  }

  spawnBurst(x, y, color, count = 16, maxSpeed = 240) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.2 + Math.random() * 0.8) * maxSpeed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 3,
        alpha: 1.0,
        decay: 1.2 + Math.random() * 1.5
      });
    }
  }

  spawnShockwave(x, y, color, maxRadius = 80) {
    this.rings.push({
      x,
      y,
      radius: 4,
      maxRadius,
      color,
      alpha: 1.0,
      growRate: 180
    });
  }

  spawnTrail(x, y, color, size = 3) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 4,
      y: y + (Math.random() - 0.5) * 4,
      vx: (Math.random() - 0.5) * 20,
      vy: 40 + Math.random() * 60,
      color,
      size,
      alpha: 0.8,
      decay: 3.0
    });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.radius += r.growRate * dt;
      r.alpha = Math.max(0, 1 - r.radius / r.maxRadius);
      if (r.radius >= r.maxRadius || r.alpha <= 0) {
        this.rings.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }

    for (const r of this.rings) {
      ctx.globalAlpha = r.alpha;
      ctx.strokeStyle = r.color;
      ctx.shadowColor = r.color;
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  clear() {
    this.particles.length = 0;
    this.rings.length = 0;
  }
}
