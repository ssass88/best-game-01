import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './config.js';

export class UIManager {
  constructor(ctx) {
    this.ctx = ctx;
  }

  renderHUD(world) {
    const ctx = this.ctx;
    ctx.save();

    // Top HUD Bar background
    ctx.fillStyle = 'rgba(8, 8, 22, 0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 48);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, 48);

    // Score
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillStyle = COLORS.cyan;
    ctx.textAlign = 'left';
    ctx.shadowColor = COLORS.cyan;
    ctx.shadowBlur = 8;
    ctx.fillText(`SCORE: ${world.score.toString().padStart(6, '0')}`, 20, 31);

    // Wave
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillStyle = COLORS.yellow;
    ctx.shadowColor = COLORS.yellow;
    ctx.fillText(`WAVE: ${world.wave}/5`, 240, 31);

    // Combo Multiplier
    if (world.combo > 1) {
      ctx.font = 'bold 22px "Courier New", monospace';
      ctx.fillStyle = COLORS.pink;
      ctx.shadowColor = COLORS.pink;
      ctx.shadowBlur = 12;
      ctx.fillText(`x${world.combo} COMBO!`, 370, 31);
    }

    // Health & Shield Bars (Top Right)
    const p = world.player;
    const barWidth = 120;
    const barHeight = 12;
    const barX = CANVAS_WIDTH - 280;

    // Shield Bar
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#222';
    ctx.fillRect(barX, 10, barWidth, barHeight);
    const shieldPct = Math.max(0, p.shield / p.maxShield);
    ctx.fillStyle = COLORS.cyan;
    ctx.shadowColor = COLORS.cyan;
    ctx.shadowBlur = 6;
    ctx.fillRect(barX, 10, barWidth * shieldPct, barHeight);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, 10, barWidth, barHeight);
    ctx.font = '10px "Courier New", monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('SHIELD', barX - 48, 20);

    // HP Bar
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#222';
    ctx.fillRect(barX, 26, barWidth, barHeight);
    const hpPct = Math.max(0, p.health / p.maxHealth);
    ctx.fillStyle = COLORS.hp;
    ctx.shadowColor = COLORS.hp;
    ctx.shadowBlur = 6;
    ctx.fillRect(barX, 26, barWidth * hpPct, barHeight);
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, 26, barWidth, barHeight);
    ctx.font = '10px "Courier New", monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('HULL', barX - 48, 36);

    // EMP Status
    const empReady = p.empCooldownTimer <= 0;
    ctx.font = 'bold 12px "Courier New", monospace';
    if (empReady) {
      ctx.fillStyle = COLORS.green;
      ctx.shadowColor = COLORS.green;
      ctx.shadowBlur = 8;
      ctx.fillText('[SPACE / SHIFT] EMP READY', barX + barWidth + 14, 28);
    } else {
      ctx.fillStyle = '#888';
      ctx.shadowBlur = 0;
      ctx.fillText(`EMP: ${Math.ceil(p.empCooldownTimer)}s`, barX + barWidth + 14, 28);
    }

    ctx.restore();
  }

  renderTitleScreen() {
    const ctx = this.ctx;
    ctx.save();

    // Dark backdrop overlay
    ctx.fillStyle = 'rgba(5, 5, 15, 0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Glowing Neon Title
    ctx.textAlign = 'center';
    ctx.font = '900 52px "Arial Black", Gadget, sans-serif';
    ctx.fillStyle = COLORS.cyan;
    ctx.shadowColor = COLORS.cyan;
    ctx.shadowBlur = 24;
    ctx.fillText('CYBER BLADE', CANVAS_WIDTH / 2, 180);

    ctx.font = 'bold 28px "Courier New", monospace';
    ctx.fillStyle = COLORS.pink;
    ctx.shadowColor = COLORS.pink;
    ctx.shadowBlur = 18;
    ctx.fillText('// NEON OVERDRIVE //', CANVAS_WIDTH / 2, 230);

    // Decorative Line
    ctx.strokeStyle = COLORS.yellow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2 - 220, 255);
    ctx.lineTo(CANVAS_WIDTH / 2 + 220, 255);
    ctx.stroke();

    // Controls Guide Box
    const boxX = CANVAS_WIDTH / 2 - 200;
    const boxY = 280;
    ctx.fillStyle = 'rgba(15, 15, 35, 0.8)';
    ctx.fillRect(boxX, boxY, 400, 160);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.strokeRect(boxX, boxY, 400, 160);

    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#00f0ff';
    ctx.fillText('PILOT CONTROLS', CANVAS_WIDTH / 2, boxY + 30);

    ctx.font = '13px "Courier New", monospace';
    ctx.fillStyle = '#aaa';
    ctx.shadowBlur = 0;
    ctx.fillText('MOVE: [W, A, S, D] or Arrow Keys', CANVAS_WIDTH / 2, boxY + 65);
    ctx.fillText('FIRE: [Left Click] or [J] (Hold for Rapid)', CANVAS_WIDTH / 2, boxY + 95);
    ctx.fillText('EMP NOVA: [Space] or [Shift]', CANVAS_WIDTH / 2, boxY + 125);

    // Pulsing Start Prompt
    const pulse = 0.6 + Math.sin(Date.now() / 250) * 0.4;
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.fillStyle = `rgba(0, 255, 102, ${pulse})`;
    ctx.shadowColor = COLORS.green;
    ctx.shadowBlur = 15;
    ctx.fillText('PRESS [SPACE] OR CLICK TO LAUNCH', CANVAS_WIDTH / 2, 500);

    ctx.restore();
  }

  renderGameOver(world) {
    const ctx = this.ctx;
    ctx.save();

    // Dark backdrop overlay
    ctx.fillStyle = 'rgba(20, 5, 10, 0.88)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.font = '900 56px "Arial Black", Gadget, sans-serif';
    ctx.fillStyle = COLORS.hp;
    ctx.shadowColor = COLORS.hp;
    ctx.shadowBlur = 30;
    ctx.fillText('SYSTEM BREACH', CANVAS_WIDTH / 2, 190);

    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = COLORS.pink;
    ctx.shadowBlur = 10;
    ctx.fillText('SHIP DESTROYED - MISSION FAILED', CANVAS_WIDTH / 2, 240);

    // Score Summary
    const boxX = CANVAS_WIDTH / 2 - 180;
    const boxY = 280;
    ctx.fillStyle = 'rgba(30, 10, 20, 0.8)';
    ctx.fillRect(boxX, boxY, 360, 150);
    ctx.strokeStyle = COLORS.hp;
    ctx.strokeRect(boxX, boxY, 360, 150);

    ctx.font = '16px "Courier New", monospace';
    ctx.fillStyle = '#ffcccc';
    ctx.fillText(`FINAL SCORE: ${world.score}`, CANVAS_WIDTH / 2, boxY + 40);
    ctx.fillText(`WAVE REACHED: ${world.wave}`, CANVAS_WIDTH / 2, boxY + 75);
    ctx.fillText(`HOSTILES PURGED: ${world.kills}`, CANVAS_WIDTH / 2, boxY + 110);

    // Restart prompt
    const pulse = 0.6 + Math.sin(Date.now() / 250) * 0.4;
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillStyle = `rgba(0, 240, 255, ${pulse})`;
    ctx.shadowColor = COLORS.cyan;
    ctx.shadowBlur = 12;
    ctx.fillText('PRESS [SPACE] OR CLICK TO REBOOT', CANVAS_WIDTH / 2, 490);

    ctx.restore();
  }

  renderVictory(world) {
    const ctx = this.ctx;
    ctx.save();

    // Dark backdrop overlay
    ctx.fillStyle = 'rgba(5, 20, 15, 0.88)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.font = '900 56px "Arial Black", Gadget, sans-serif';
    ctx.fillStyle = COLORS.green;
    ctx.shadowColor = COLORS.green;
    ctx.shadowBlur = 30;
    ctx.fillText('SECTOR LIBERATED', CANVAS_WIDTH / 2, 190);

    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.fillStyle = COLORS.yellow;
    ctx.shadowColor = COLORS.yellow;
    ctx.shadowBlur = 12;
    ctx.fillText('ALL HOSTILE WAVES ANNIHILATED', CANVAS_WIDTH / 2, 240);

    // Victory Stats Box
    const boxX = CANVAS_WIDTH / 2 - 180;
    const boxY = 280;
    ctx.fillStyle = 'rgba(10, 30, 20, 0.8)';
    ctx.fillRect(boxX, boxY, 360, 150);
    ctx.strokeStyle = COLORS.green;
    ctx.strokeRect(boxX, boxY, 360, 150);

    ctx.font = '16px "Courier New", monospace';
    ctx.fillStyle = '#ccffdd';
    ctx.fillText(`CHAMPION SCORE: ${world.score}`, CANVAS_WIDTH / 2, boxY + 40);
    ctx.fillText(`TOTAL KILLS: ${world.kills}`, CANVAS_WIDTH / 2, boxY + 75);
    ctx.fillText('PILOT RATING: [ RANK S+ ]', CANVAS_WIDTH / 2, boxY + 110);

    // Restart prompt
    const pulse = 0.6 + Math.sin(Date.now() / 250) * 0.4;
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillStyle = `rgba(0, 255, 102, ${pulse})`;
    ctx.shadowColor = COLORS.green;
    ctx.shadowBlur = 12;
    ctx.fillText('PRESS [SPACE] OR CLICK TO PLAY AGAIN', CANVAS_WIDTH / 2, 490);

    ctx.restore();
  }
}
