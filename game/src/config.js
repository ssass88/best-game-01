export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 600;

export const COLORS = {
  bg: '#080816',
  grid: '#1a103c',
  cyan: '#00f0ff',
  pink: '#ff007f',
  yellow: '#ffe600',
  green: '#00ff66',
  purple: '#9d00ff',
  white: '#ffffff',
  shield: 'rgba(0, 240, 255, 0.4)',
  shieldBorder: '#00f0ff',
  hp: '#ff0055',
  energy: '#00ffaa'
};

export const PLAYER_CONFIG = {
  width: 36,
  height: 28,
  speed: 380,
  maxHealth: 100,
  maxShield: 100,
  shieldRegenRate: 15,
  shieldRegenDelay: 3.0,
  baseFireRate: 0.12, // seconds between shots
  empCooldown: 12.0
};

export const ENEMY_TYPES = {
  SCOUT: {
    type: 'SCOUT',
    hp: 25,
    speed: 220,
    score: 100,
    color: '#00f0ff',
    size: 20
  },
  INTERCEPTOR: {
    type: 'INTERCEPTOR',
    hp: 50,
    speed: 160,
    score: 250,
    color: '#ff007f',
    size: 26,
    fireRate: 1.8
  },
  CRUISER: {
    type: 'CRUISER',
    hp: 120,
    speed: 90,
    score: 600,
    color: '#ffe600',
    size: 38,
    fireRate: 1.2
  },
  DREADNOUGHT: {
    type: 'DREADNOUGHT',
    hp: 600,
    speed: 50,
    score: 3000,
    color: '#9d00ff',
    size: 56,
    fireRate: 0.8
  }
};

export const POWERUP_TYPES = {
  SHIELD: { type: 'SHIELD', color: '#00f0ff', label: 'SHIELD RECHARGE' },
  TRIPLE: { type: 'TRIPLE', color: '#ffe600', label: 'TRIPLE CANNON' },
  OVERDRIVE: { type: 'OVERDRIVE', color: '#ff007f', label: 'OVERDRIVE RAPID' },
  EMP: { type: 'EMP', color: '#00ffaa', label: 'EMP CHARGE' }
};
