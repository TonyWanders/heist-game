// A wall-mounted security camera: sweeps its cone back and forth on a timer.
// A thief inside the live cone feeds the alarm meter. An EMP pulse kills it
// for a while; smoke blocks its view.
import { CAMERA } from './config.js';
import { angleDiff, angleTo, distance, lineBlocked, lineThroughSmoke } from './geom.js';

export class Camera {
  constructor(def) {
    this.x = def.x;
    this.y = def.y;
    this.base = def.base;
    this.sweep = def.sweep;
    this.period = def.period;
    this.time = Math.random() * def.period;
    this.disabledUntil = 0;
  }

  get angle() {
    return this.base + Math.sin((this.time / this.period) * Math.PI * 2) * this.sweep;
  }

  get disabled() {
    return this.time < this.disabledUntil;
  }

  update(dt) {
    this.time += dt;
  }

  disable(seconds) {
    this.disabledUntil = this.time + seconds;
  }

  canSee(player, world) {
    if (this.disabled) return false;
    const d = distance(this.x, this.y, player.x, player.y);
    if (d > CAMERA.range) return false;
    const toPlayer = angleTo(this.x, this.y, player.x, player.y);
    if (Math.abs(angleDiff(toPlayer, this.angle)) > CAMERA.halfAngle) return false;
    if (lineBlocked(this.x, this.y, player.x, player.y, world.solids)) return false;
    if (lineThroughSmoke(this.x, this.y, player.x, player.y, world.smoke)) return false;
    return true;
  }
}
