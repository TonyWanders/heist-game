// The shell: boots the world, runs the fixed-step loop, owns the screens, and
// stages a screenshot scene when the page opens with ?shot=.
import { CANVAS, STEP } from './config.js';
import { EVENT_LEVEL, EVENT_OVER, EVENT_WIN, World } from './world.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { draw, SCREEN_LEVEL, SCREEN_OVER, SCREEN_PAUSE, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS.width;
canvas.height = CANVAS.height;
const ctx = canvas.getContext('2d');

const input = new Input(canvas);
const sound = new SoundBank();
const world = new World(20261122);
world.sound = sound;
input.onFirstGesture = () => sound.ensure();

let screen = SCREEN_TITLE;
let time = 0;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  const staged = stageShot(shot, world);
  screen = staged.screen;
  draw(ctx, world, screen, time);
} else {
  let last = performance.now();
  let accumulator = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    let elapsed = (now - last) / 1000;
    last = now;
    if (elapsed > 0.25) elapsed = 0.25;
    time += elapsed;

    if (input.wasPressed('m')) {
      const muted = sound.toggleMute();
      world.showMessage(muted ? 'Sound off.' : 'Sound on.', 1.5);
    }
    if (input.wasPressed('r') && (screen === SCREEN_PLAY || screen === SCREEN_PAUSE)) {
      world.reset(world.levelIndex);
      screen = SCREEN_PLAY;
    }
    if (input.wasPressed('p') && (screen === SCREEN_PLAY || screen === SCREEN_PAUSE)) {
      screen = screen === SCREEN_PLAY ? SCREEN_PAUSE : SCREEN_PLAY;
    }
    if (input.wasPressed('enter')) {
      if (screen === SCREEN_TITLE) {
        world.resetAll();
        screen = SCREEN_PLAY;
      } else if (screen === SCREEN_LEVEL) {
        screen = SCREEN_PLAY;
      } else if (screen === SCREEN_OVER || screen === SCREEN_WIN) {
        world.resetAll();
        screen = SCREEN_TITLE;
      }
    }

    if (screen === SCREEN_PLAY) {
      accumulator += elapsed;
      while (accumulator >= STEP) {
        const events = world.step(STEP, input);
        accumulator -= STEP;
        if (events & EVENT_WIN) screen = SCREEN_WIN;
        else if (events & EVENT_OVER) screen = SCREEN_OVER;
        else if (events & EVENT_LEVEL) screen = SCREEN_LEVEL;
      }
    }
    draw(ctx, world, screen, time);
    input.endFrame();
  }
  requestAnimationFrame(frame);
}
