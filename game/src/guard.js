// A patrolling guard: walks a route, sweeps a vision cone, grows suspicious when
// the thief is inside it, chases when sure, searches the last seen spot, then
// walks back to patrol. A thrown marble pulls a guard to investigate the noise.
import { GUARD } from './config.js';
import { angleDiff, angleTo, clamp, distance, lineBlocked, lineThroughSmoke, turnToward } from './geom.js';

export const GUARD_PATROL = 'patrol';
export const GUARD_SUSPICIOUS = 'suspicious';
export const GUARD_CHASE = 'chase';
export const GUARD_SEARCH = 'search';
export const GUARD_INVESTIGATE = 'investigate';

export class Guard {
  constructor(def) {
    this.x = def.x;
    this.y = def.y;
    this.waypoints = def.waypoints;
    this.targetIndex = 1 % def.waypoints.length;
    this.facing = angleTo(def.x, def.y, def.waypoints[this.targetIndex].x, def.waypoints[this.targetIndex].y);
    this.state = GUARD_PATROL;
    this.suspicion = 0;
    this.lastSeen = null;
    this.loseSight = 0;
    this.searchTimer = 0;
    this.investigatePoint = null;
    this.pauseTimer = 0;
    this.stepPhase = Math.random() * Math.PI * 2;
  }

  /** True when the thief is inside this guard's cone and the view is clear. */
  canSee(player, world) {
    const d = distance(this.x, this.y, player.x, player.y);
    if (d > GUARD.coneRange) return false;
    const toPlayer = angleTo(this.x, this.y, player.x, player.y);
    if (Math.abs(angleDiff(toPlayer, this.facing)) > GUARD.coneHalfAngle) return false;
    if (lineBlocked(this.x, this.y, player.x, player.y, world.solids)) return false;
    if (lineThroughSmoke(this.x, this.y, player.x, player.y, world.smoke)) return false;
    return true;
  }

  /** How fast suspicion grows: closer and standing out in the open counts more. */
  detectionRate(player, world) {
    const d = distance(this.x, this.y, player.x, player.y);
    let rate = GUARD.suspicionRate * (1.25 - (d / GUARD.coneRange) * 0.7);
    if (player.sneaking) rate *= 0.45;
    if (world.inShadow(player.x, player.y)) rate *= 0.5;
    return rate;
  }

  moveToward(tx, ty, speed, dt, world) {
    const d = distance(this.x, this.y, tx, ty);
    if (d < 2) return true;
    const step = Math.min(d, speed * dt);
    const nx = this.x + ((tx - this.x) / d) * step;
    const ny = this.y + ((ty - this.y) / d) * step;
    this.facing = turnToward(this.facing, angleTo(this.x, this.y, tx, ty), 6 * dt);
    const resolved = this.tryMove(nx, ny, world);
    this.x = resolved.x;
    this.y = resolved.y;
    return d <= speed * dt + 2;
  }

  tryMove(nx, ny, world) {
    const r = GUARD.radius;
    const blocked = (x, y) => {
      for (const s of world.solids) {
        const cx = clamp(x, s.x, s.x + s.w);
        const cy = clamp(y, s.y, s.y + s.h);
        if (Math.hypot(x - cx, y - cy) < r) return true;
      }
      return false;
    };
    if (!blocked(nx, this.y)) this.x = nx;
    if (!blocked(this.x, ny)) this.y = ny;
    return { x: this.x, y: this.y };
  }

  update(dt, world) {
    const player = world.player;
    const sees = this.canSee(player, world);
    if (sees) {
      this.lastSeen = { x: player.x, y: player.y };
      this.loseSight = 0;
      this.suspicion = clamp(this.suspicion + this.detectionRate(player, world) * dt, 0, 1);
      if (this.suspicion >= 1 && this.state !== GUARD_CHASE) {
        this.state = GUARD_CHASE;
        world.onGuardSpotted(this);
      }
    } else {
      this.loseSight += dt;
      this.suspicion = clamp(this.suspicion - GUARD.suspicionDecay * dt, 0, 1);
    }

    if (world.noise && this.state !== GUARD_CHASE) {
      const d = distance(this.x, this.y, world.noise.x, world.noise.y);
      if (d < world.noise.radius) {
        this.state = GUARD_INVESTIGATE;
        this.investigatePoint = { x: world.noise.x, y: world.noise.y };
      }
    }

    if (this.state === GUARD_PATROL || this.state === GUARD_SUSPICIOUS) {
      if (this.suspicion > 0.35 && sees) this.state = GUARD_SUSPICIOUS;
      else if (this.suspicion <= 0.05 && this.state === GUARD_SUSPICIOUS) this.state = GUARD_PATROL;
      if (this.state === GUARD_SUSPICIOUS && this.lastSeen) {
        if (this.moveToward(this.lastSeen.x, this.lastSeen.y, GUARD.suspiciousSpeed, dt, world)) {
          this.state = GUARD_SEARCH;
          this.searchTimer = 2.5;
        }
        return;
      }
      if (this.pauseTimer > 0) {
        this.pauseTimer -= dt;
        return;
      }
      const target = this.waypoints[this.targetIndex];
      if (this.moveToward(target.x, target.y, GUARD.patrolSpeed, dt, world)) {
        this.targetIndex = (this.targetIndex + 1) % this.waypoints.length;
        this.pauseTimer = 0.8;
      }
      return;
    }

    if (this.state === GUARD_CHASE) {
      if (sees) {
        this.moveToward(player.x, player.y, GUARD.chaseSpeed, dt, world);
        if (distance(this.x, this.y, player.x, player.y) < 22) world.onGuardCaught(this);
      } else if (this.loseSight > GUARD.loseSightSeconds) {
        this.state = GUARD_SEARCH;
        this.searchTimer = 3;
      } else if (this.lastSeen) {
        this.moveToward(this.lastSeen.x, this.lastSeen.y, GUARD.chaseSpeed, dt, world);
      }
      return;
    }

    if (this.state === GUARD_SEARCH) {
      this.searchTimer -= dt;
      this.facing += dt * 1.6;
      if (this.searchTimer <= 0) {
        this.state = GUARD_PATROL;
        this.suspicion = 0;
      }
      return;
    }

    if (this.state === GUARD_INVESTIGATE) {
      if (this.investigatePoint && this.moveToward(this.investigatePoint.x, this.investigatePoint.y, GUARD.searchSpeed, dt, world)) {
        this.investigatePoint = null;
        this.state = GUARD_SEARCH;
        this.searchTimer = 2;
      }
    }
  }
}
