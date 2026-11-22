// Tuning for The Gilded Vault Job: canvas size, field, speeds, detection and tools.
// One clear job: every number the game balances on lives here.
export const CANVAS = { width: 960, height: 680 };
export const HUD = { height: 64 };
export const FIELD = { x: 0, y: HUD.height, width: 960, height: CANVAS.height - HUD.height };
export const STEP = 1 / 60;

export const PLAYER = {
  radius: 11,
  walkSpeed: 118,
  sneakSpeed: 62,
  crackSeconds: 1.5,
  ventSeconds: 0.8,
  catchRadius: 20,
};

export const GUARD = {
  radius: 12,
  patrolSpeed: 46,
  suspiciousSpeed: 72,
  chaseSpeed: 98,
  searchSpeed: 60,
  coneRange: 168,
  coneHalfAngle: 0.56,
  suspicionRate: 1.15,
  suspicionDecay: 0.55,
  loseSightSeconds: 2.5,
};

export const CAMERA = {
  range: 190,
  halfAngle: 0.42,
  alarmRate: 42,
};

export const ALARM = {
  max: 100,
  guardRate: 26,
  decay: 14,
  resetTo: 35,
  maxAlarms: 3,
  huntSeconds: 5,
};

export const TOOLS = {
  empPerLevel: 2,
  empSeconds: 6,
  smokePerLevel: 1,
  smokeSeconds: 8,
  smokeRadius: 72,
  marblesPerLevel: 3,
  marbleSpeed: 260,
  marbleNoiseRadius: 130,
};

export const COLORS = {
  floor: '#2b2620',
  floorAlt: '#322c25',
  wall: '#171310',
  wallTop: '#4a3f33',
  hud: '#14100d',
  hudLine: '#c9a227',
  gold: '#e8c15a',
  goldDim: '#a8842f',
  loot: '#7fe7ff',
  lootGlow: '#bff3ff',
  exit: '#58d68d',
  exitDim: '#2e7d52',
  shadow: 'rgba(10, 14, 40, 0.42)',
  rug: '#5d1f24',
  rugEdge: '#7d2a30',
  caseGlass: 'rgba(140, 210, 235, 0.20)',
  caseFrame: '#8a6d2f',
  statue: '#9a938a',
  plant: '#2f6b34',
  cone: 'rgba(232, 193, 90, 0.20)',
  coneEdge: 'rgba(232, 193, 90, 0.55)',
  coneSuspicious: 'rgba(255, 150, 40, 0.26)',
  coneChase: 'rgba(255, 60, 50, 0.30)',
  camCone: 'rgba(255, 70, 60, 0.16)',
  camConeEdge: 'rgba(255, 70, 60, 0.5)',
  smoke: 'rgba(200, 200, 210, 0.34)',
  player: '#33475c',
  playerTrim: '#e8c15a',
  guard: '#3a3f4a',
  guardTrim: '#d8d8d8',
  text: '#f2ead8',
  textDim: '#b8ab8d',
  danger: '#ff5148',
  safe: '#58d68d',
};
