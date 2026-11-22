// The screenshot scenes behind ?shot=start|gallery|alarm|vault. Each one plays the
// real rules forward from a fresh world for a fixed number of steps, steered by a
// simple waypoint autopilot, so the frame is what real play looks like and the
// same seed always gives the same frame.
import { FIELD, STEP } from './config.js';
import { LEVELS } from './levels.js';
import { SCREEN_PLAY, SCREEN_TITLE } from './render.js';

/** A fake input that steers the thief toward a waypoint and can hold E. */
class FakeInput {
  constructor() {
    this.target = null;
    this.holdE = false;
    this.sneak = false;
    this.stallTimer = 0;
  }

  moveVector() {
    if (!this.target) return { x: 0, y: 0 };
    const dx = this.target.x - this._x;
    const dy = this.target.y - this._y;
    const d = Math.hypot(dx, dy);
    if (d < 1) return { x: 0, y: 0 };
    return { x: dx / d, y: dy / d };
  }

  down(key) {
    if (key === 'e') return this.holdE;
    if (key === 'shift') return this.sneak;
    return false;
  }

  wasPressed() {
    return false;
  }

  takeClicks() {
    return [];
  }
}

function runSteps(world, seconds, input) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    if (input && input.target) {
      input._x = world.player.x;
      input._y = world.player.y;
    }
    world.step(STEP, input || new FakeInput());
  }
}

/** Walk the waypoints in order, moving on when close or after a stall. */
function walkWaypoints(world, waypoints, input, secondsPerLeg) {
  for (const point of waypoints) {
    input.target = point;
    input.holdE = false;
    let waited = 0;
    while (waited < secondsPerLeg) {
      runSteps(world, STEP, input);
      waited += STEP;
      const d = Math.hypot(world.player.x - point.x, world.player.y - point.y);
      if (d < 14) break;
    }
  }
  input.target = null;
}

/**
 * Set `world` to the named scene (start, gallery, alarm or vault; any other name
 * is start) and return the screen to draw over it.
 */
export function stageShot(name, world) {
  const input = new FakeInput();
  if (name === 'gallery') {
    world.reset(0);
    runSteps(world, 2, input);
    walkWaypoints(world, [
      { x: 200, y: 500 },
      { x: 480, y: 520 },
      { x: 700, y: 420 },
      { x: 720, y: 280 },
      { x: 800, y: 200 },
      { x: 835, y: 165 },
    ], input, 4);
    runSteps(world, 0.6, input);
    return { screen: SCREEN_PLAY };
  }
  if (name === 'alarm') {
    world.reset(0);
    runSteps(world, 1, input);
    // Stand in the right-hand camera's sweep, out of every guard's cone:
    // the red cone falls on the thief and the alarm meter climbs, but no
    // guard is close enough to catch them in the frame.
    world.player.x = 800;
    world.player.y = 360;
    runSteps(world, 1.6, input);
    return { screen: SCREEN_PLAY };
  }
  if (name === 'vault') {
    world.reset(2);
    runSteps(world, 2, input);
    // Stage the thief beside the Crown's case, out of every cone, crack it,
    // then slip away toward the exit with the loot.
    world.player.x = 480;
    world.player.y = 406;
    input.holdE = true;
    runSteps(world, 2.2, input);
    input.holdE = false;
    input.sneak = true;
    walkWaypoints(world, [{ x: 650, y: 520 }], input, 3);
    input.sneak = false;
    runSteps(world, 0.4, input);
    return { screen: SCREEN_PLAY };
  }
  world.reset(0);
  runSteps(world, 4, input);
  return { screen: SCREEN_TITLE };
}

export { LEVELS, FIELD };
