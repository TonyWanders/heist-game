// The thief, Wren: moves with WASD or arrows, sneaks on Shift, cracks the loot
// case with E, crawls vents with E, throws a marble with a mouse click.
import { FIELD, PLAYER, TOOLS } from './config.js';
import { clamp, distance } from './geom.js';

export class Player {
  constructor(start) {
    this.x = start.x;
    this.y = start.y;
    this.facing = -Math.PI / 2;
    this.sneaking = false;
    this.moving = false;
    this.crackProgress = 0;
    this.ventProgress = 0;
    this.ventTarget = null;
    this.stepTimer = 0;
  }

  reset(start) {
    this.x = start.x;
    this.y = start.y;
    this.facing = -Math.PI / 2;
    this.sneaking = false;
    this.moving = false;
    this.crackProgress = 0;
    this.ventProgress = 0;
    this.ventTarget = null;
  }

  nearLoot(world) {
    const loot = world.level.loot;
    return !world.lootTaken && distance(this.x, this.y, loot.x, loot.y) < 58;
  }

  nearVent(world) {
    for (const vent of world.level.vents) {
      if (distance(this.x, this.y, vent.x, vent.y) < 34) return vent;
    }
    return null;
  }

  update(dt, input, world) {
    const move = input.moveVector();
    this.sneaking = input.down('shift');
    const speed = this.sneaking ? PLAYER.sneakSpeed : PLAYER.walkSpeed;
    this.moving = move.x !== 0 || move.y !== 0;
    if (this.moving) {
      this.facing = Math.atan2(move.y, move.x);
      const nx = clamp(this.x + move.x * speed * dt, FIELD.x + 16 + PLAYER.radius, FIELD.x + FIELD.width - 16 - PLAYER.radius);
      const ny = clamp(this.y + move.y * speed * dt, FIELD.y + 16 + PLAYER.radius, FIELD.y + FIELD.height - 16 - PLAYER.radius);
      // Axis-separated movement, so the thief slides along walls instead of sticking.
      const blockedAt = (x, y) => {
        for (const s of world.solids) {
          const cx = clamp(x, s.x, s.x + s.w);
          const cy = clamp(y, s.y, s.y + s.h);
          if (Math.hypot(x - cx, y - cy) < PLAYER.radius) return true;
        }
        return false;
      };
      if (!blockedAt(nx, this.y)) this.x = nx;
      if (!blockedAt(this.x, ny)) this.y = ny;
      this.stepTimer -= dt;
      if (this.stepTimer <= 0) {
        this.stepTimer = this.sneaking ? 0.55 : 0.34;
        world.onStep(this.sneaking);
      }
    }

    // Cracking the loot case: hold E beside it. Letting go bleeds the progress.
    if (this.nearLoot(world) && input.down('e')) {
      this.crackProgress += dt / PLAYER.crackSeconds;
      if (this.crackProgress >= 1) {
        this.crackProgress = 0;
        world.onLootTaken();
      }
    } else {
      this.crackProgress = Math.max(0, this.crackProgress - dt * 1.5);
    }

    // Vents: hold E on a grate to crawl to its pair.
    const vent = this.nearVent(world);
    if (vent && input.down('e') && !this.nearLoot(world)) {
      this.ventProgress += dt / PLAYER.ventSeconds;
      if (this.ventProgress >= 1) {
        this.ventProgress = 0;
        this.x = vent.to.x;
        this.y = vent.to.y;
        world.onVentUsed();
      }
    } else {
      this.ventProgress = 0;
    }

    // EMP pulse: Q disables every camera for a while.
    if (input.wasPressed('q') && world.tools.emp > 0) {
      world.tools.emp -= 1;
      world.useEmp();
    }
    // Smoke bomb: F drops a cloud that blocks all sight.
    if (input.wasPressed('f') && world.tools.smoke > 0) {
      world.tools.smoke -= 1;
      world.dropSmoke(this.x, this.y);
    }
    // Mouse click: throw a marble that rolls and makes a noise.
    for (const click of input.takeClicks()) {
      if (world.tools.marbles > 0 && click.y > FIELD.y) {
        world.tools.marbles -= 1;
        world.throwMarble(this.x, this.y, click.x, click.y);
      }
    }
  }
}
