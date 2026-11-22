// The world: one level at a time, the alarm meter, the loot, the tools, the
// score and the win/lose flow. Guards, cameras and the player all report here.
import { ALARM, CAMERA, FIELD, PLAYER, STEP, TOOLS } from './config.js';
import { distance, lineBlocked } from './geom.js';
import { LEVELS, levelSolids } from './levels.js';
import { Guard } from './guard.js';
import { Camera } from './camera.js';
import { Player } from './player.js';

export const EVENT_NONE = 0;
export const EVENT_LOOT = 1;
export const EVENT_LEVEL = 2;
export const EVENT_CAUGHT = 4;
export const EVENT_OVER = 8;
export const EVENT_WIN = 16;
export const EVENT_ALARM = 32;

export class World {
  constructor(seed) {
    this.seed = seed;
    this.levelIndex = 0;
    this.score = 0;
    this.best = 0;
    this.sound = null;
    this.reset(0);
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  reset(levelIndex) {
    this.levelIndex = levelIndex;
    const level = LEVELS[levelIndex];
    this.solids = levelSolids(level);
    this.player = new Player(level.start);
    this.guards = level.guards.map((g) => new Guard(g));
    this.cameras = level.cameras.map((c) => new Camera(c));
    this.lootTaken = false;
    this.alarm = 0;
    this.alarms = 0;
    this.huntTimer = 0;
    this.time = 0;
    this.levelAlarms = 0;
    this.tools = {
      emp: TOOLS.empPerLevel,
      smoke: TOOLS.smokePerLevel,
      marbles: TOOLS.marblesPerLevel,
    };
    this.smoke = [];
    this.marbles = [];
    this.noise = null;
    this.noiseTimer = 0;
    this.caughtFlash = 0;
    this.alarmFlash = 0;
    this.message = null;
    this.messageTimer = 0;
  }

  resetAll() {
    this.score = 0;
    this.reset(0);
  }

  inShadow(x, y) {
    for (const s of this.level.shadows) {
      if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return true;
    }
    return false;
  }

  onStep(sneaking) {
    if (this.sound) this.sound.step(sneaking);
  }

  onGuardSpotted() {
    if (this.sound) this.sound.spotted();
    this.showMessage('Spotted! Break line of sight!', 2);
  }

  onGuardCaught() {
    this.alarms += 1;
    this.levelAlarms += 1;
    this.caughtFlash = 1;
    if (this.sound) this.sound.caught();
    if (this.alarms >= ALARM.maxAlarms) {
      this.over = true;
      return;
    }
    this.showMessage(`Caught! Alarm ${this.alarms} of ${ALARM.maxAlarms} — back to the door.`, 2.5);
    this.player.reset(this.level.start);
    for (const guard of this.guards) {
      guard.state = 'patrol';
      guard.suspicion = 0;
      guard.lastSeen = null;
    }
  }

  onLootTaken() {
    this.lootTaken = true;
    if (this.sound) {
      this.sound.crack();
      this.sound.pickup();
    }
    this.showMessage(`${this.level.loot.name} is yours. Get to the exit!`, 3);
  }

  onVentUsed() {
    if (this.sound) this.sound.noise(0.4, 0.2, 500);
    this.showMessage('Through the vent…', 1.5);
  }

  useEmp() {
    for (const camera of this.cameras) camera.disable(TOOLS.empSeconds);
    if (this.sound) this.sound.emp();
    this.showMessage(`EMP pulse: cameras dark for ${TOOLS.empSeconds}s.`, 2);
  }

  dropSmoke(x, y) {
    this.smoke.push({ x, y, radius: TOOLS.smokeRadius, left: TOOLS.smokeSeconds });
    if (this.sound) this.sound.smoke();
    this.showMessage('Smoke out. They cannot see through it.', 2);
  }

  throwMarble(fromX, fromY, toX, toY) {
    const d = distance(fromX, fromY, toX, toY);
    const travel = Math.min(d, 240);
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const x = fromX + Math.cos(angle) * travel;
    const y = fromY + Math.sin(angle) * travel;
    this.marbles.push({ x, y, radius: 6, left: 0.5, landed: false });
    if (this.sound) this.sound.marble();
  }

  showMessage(text, seconds) {
    this.message = text;
    this.messageTimer = seconds;
  }

  step(dt, input) {
    let events = EVENT_NONE;
    if (this.over) return EVENT_OVER;
    this.time += dt;
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) this.message = null;
    }
    if (this.caughtFlash > 0) this.caughtFlash = Math.max(0, this.caughtFlash - dt * 1.5);
    if (this.alarmFlash > 0) this.alarmFlash = Math.max(0, this.alarmFlash - dt * 1.5);
    if (this.huntTimer > 0) this.huntTimer -= dt;

    this.player.update(dt, input, this);
    for (const guard of this.guards) guard.update(dt, this);
    for (const camera of this.cameras) camera.update(dt);

    // The alarm meter: rises while any guard or camera sees the thief.
    let seen = false;
    for (const guard of this.guards) {
      if (guard.canSee(this.player, this)) {
        seen = true;
        this.alarm += ALARM.guardRate * dt;
      }
    }
    for (const camera of this.cameras) {
      if (camera.canSee(this.player, this)) {
        seen = true;
        this.alarm += CAMERA.alarmRate * dt;
      }
    }
    if (!seen) this.alarm = Math.max(0, this.alarm - ALARM.decay * dt);
    if (this.alarm >= ALARM.max) {
      this.alarm = ALARM.resetTo;
      this.alarms += 1;
      this.levelAlarms += 1;
      this.huntTimer = ALARM.huntSeconds;
      this.alarmFlash = 1;
      if (this.sound) this.sound.alarm();
      events |= EVENT_ALARM;
      if (this.alarms >= ALARM.maxAlarms) {
        this.over = true;
        return EVENT_OVER;
      }
      this.showMessage(`ALARM ${this.alarms} of ${ALARM.maxAlarms}! They know someone is here.`, 2.5);
      for (const guard of this.guards) {
        guard.state = 'search';
        guard.searchTimer = ALARM.huntSeconds;
        guard.lastSeen = { x: this.player.x, y: this.player.y };
      }
    }

    // Smoke clouds fade; marbles land and make a noise guards hear.
    for (let i = this.smoke.length - 1; i >= 0; i -= 1) {
      this.smoke[i].left -= dt;
      if (this.smoke[i].left <= 0) this.smoke.splice(i, 1);
    }
    for (let i = this.marbles.length - 1; i >= 0; i -= 1) {
      const marble = this.marbles[i];
      marble.left -= dt;
      if (!marble.landed && marble.left <= 0) {
        marble.landed = true;
        this.noise = { x: marble.x, y: marble.y, radius: TOOLS.marbleNoiseRadius };
        this.noiseTimer = 1.2;
      }
      if (marble.left <= -3) this.marbles.splice(i, 1);
    }
    if (this.noiseTimer > 0) {
      this.noiseTimer -= dt;
      if (this.noiseTimer <= 0) this.noise = null;
    }

    // Exit: only open once the loot is taken.
    if (this.lootTaken) {
      const exit = this.level.exit;
      const cx = exit.x + exit.w / 2;
      const cy = exit.y + exit.h / 2;
      if (distance(this.player.x, this.player.y, cx, cy) < 40) {
        const timeBonus = Math.max(0, Math.round(this.level.par - this.time)) * 10;
        const ghostBonus = this.levelAlarms === 0 ? 500 : 0;
        const gained = this.level.loot.points + timeBonus + ghostBonus;
        this.score += gained;
        this.lastGain = { loot: this.level.loot.points, time: timeBonus, ghost: ghostBonus, total: gained };
        this.lastCleared = this.level.name;
        if (this.sound) this.sound.levelClear();
        if (this.levelIndex + 1 >= LEVELS.length) {
          if (this.sound) this.sound.win();
          this.best = Math.max(this.best, this.score);
          return EVENT_WIN;
        }
        this.reset(this.levelIndex + 1);
        return EVENT_LEVEL;
      }
    }
    return events;
  }
}
