// Canvas drawing: the gallery floor, the cones, the loot, the thief, and the HUD
// with its alarm meter. Cones are drawn before the walls, so a wall cuts a cone
// off exactly where sight stops.
import { ALARM, CAMERA, CANVAS, COLORS, FIELD, GUARD, HUD, PLAYER, TOOLS } from './config.js';
import { LEVELS } from './levels.js';
import { GUARD_CHASE, GUARD_SUSPICIOUS } from './guard.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSE = 'pause';
export const SCREEN_LEVEL = 'level';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

function drawCone(ctx, x, y, angle, range, halfAngle, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawFloor(ctx, level) {
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(FIELD.x, FIELD.y, FIELD.width, FIELD.height);
  const tile = 48;
  for (let y = FIELD.y; y < FIELD.y + FIELD.height; y += tile) {
    for (let x = FIELD.x; x < FIELD.x + FIELD.width; x += tile) {
      const odd = ((x / tile) | 0) % 2 === ((y / tile) | 0) % 2;
      ctx.fillStyle = odd ? COLORS.floor : COLORS.floorAlt;
      ctx.fillRect(x, y, tile, tile);
    }
  }
  for (const rug of level.rugs) {
    ctx.fillStyle = COLORS.rug;
    ctx.fillRect(rug.x, rug.y, rug.w, rug.h);
    ctx.strokeStyle = COLORS.rugEdge;
    ctx.lineWidth = 4;
    ctx.strokeRect(rug.x + 6, rug.y + 6, rug.w - 12, rug.h - 12);
    ctx.strokeStyle = COLORS.goldDim;
    ctx.lineWidth = 1;
    ctx.strokeRect(rug.x + 14, rug.y + 14, rug.w - 28, rug.h - 28);
  }
  for (const shadow of level.shadows) {
    ctx.fillStyle = COLORS.shadow;
    ctx.fillRect(shadow.x, shadow.y, shadow.w, shadow.h);
  }
}

function drawWalls(ctx, level) {
  for (const wall of level.walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = COLORS.wallTop;
    if (wall.h <= 16) ctx.fillRect(wall.x, wall.y, wall.w, 4);
    else ctx.fillRect(wall.x, wall.y, 4, wall.h);
  }
}

function drawCases(ctx, level) {
  for (const c of level.cases) {
    ctx.fillStyle = '#1a1512';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = COLORS.caseGlass;
    ctx.fillRect(c.x + 3, c.y + 3, c.w - 6, c.h - 6);
    ctx.strokeStyle = COLORS.caseFrame;
    ctx.lineWidth = 3;
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = 'rgba(232, 193, 90, 0.75)';
    ctx.beginPath();
    ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const statue of level.statues) {
    ctx.fillStyle = '#241d18';
    ctx.beginPath();
    ctx.arc(statue.x, statue.y, statue.r + 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.statue;
    ctx.beginPath();
    ctx.arc(statue.x, statue.y, statue.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9c2b8';
    ctx.beginPath();
    ctx.arc(statue.x - 4, statue.y - 5, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const plant of level.plants) {
    ctx.fillStyle = COLORS.plant;
    ctx.beginPath();
    ctx.arc(plant.x, plant.y, plant.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3f8a44';
    ctx.beginPath();
    ctx.arc(plant.x - 3, plant.y - 3, plant.r - 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVents(ctx, level) {
  for (const vent of level.vents) {
    ctx.fillStyle = '#0d0b09';
    ctx.fillRect(vent.x - 16, vent.y - 12, 32, 24);
    ctx.strokeStyle = '#6b6258';
    ctx.lineWidth = 2;
    ctx.strokeRect(vent.x - 16, vent.y - 12, 32, 24);
    ctx.beginPath();
    for (let i = -1; i <= 1; i += 1) {
      ctx.moveTo(vent.x - 13, vent.y + i * 6);
      ctx.lineTo(vent.x + 13, vent.y + i * 6);
    }
    ctx.stroke();
  }
}

function drawLootCase(ctx, world, time) {
  const level = world.level;
  const c = level.lootCase;
  const sparkle = 0.6 + 0.4 * Math.sin(time * 3);
  ctx.fillStyle = '#1a1512';
  ctx.fillRect(c.x, c.y, c.w, c.h);
  ctx.fillStyle = COLORS.caseGlass;
  ctx.fillRect(c.x + 3, c.y + 3, c.w - 6, c.h - 6);
  ctx.strokeStyle = world.lootTaken ? COLORS.exitDim : COLORS.gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(c.x, c.y, c.w, c.h);
  if (!world.lootTaken) {
    const cx = level.loot.x;
    const cy = level.loot.y;
    ctx.save();
    ctx.shadowColor = COLORS.loot;
    ctx.shadowBlur = 14 * sparkle;
    ctx.fillStyle = COLORS.lootGlow;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx + 8, cy);
    ctx.lineTo(cx, cy + 10);
    ctx.lineTo(cx - 8, cy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(level.loot.name.toUpperCase(), cx, c.y - 8);
  }
}

function drawExit(ctx, world, time) {
  const exit = world.level.exit;
  const open = world.lootTaken;
  const pulse = 0.5 + 0.5 * Math.sin(time * (open ? 5 : 1.5));
  ctx.fillStyle = open ? `rgba(88, 214, 141, ${0.25 + 0.3 * pulse})` : 'rgba(88, 214, 141, 0.12)';
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  ctx.strokeStyle = open ? COLORS.exit : COLORS.exitDim;
  ctx.lineWidth = 3;
  ctx.strokeRect(exit.x, exit.y, exit.w, exit.h);
  ctx.fillStyle = open ? COLORS.exit : COLORS.textDim;
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', exit.x + exit.w / 2, exit.y + exit.h / 2 + 3);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '9px sans-serif';
  ctx.fillText(exit.label, exit.x + exit.w / 2, exit.y + exit.h + 12);
  if (open) {
    ctx.strokeStyle = `rgba(88, 214, 141, ${0.6 * pulse})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(exit.x - 4, exit.y - 4, exit.w + 8, exit.h + 8);
  }
}

function drawGuards(ctx, world) {
  for (const guard of world.guards) {
    const coneFill = guard.state === GUARD_CHASE ? COLORS.coneChase : guard.state === GUARD_SUSPICIOUS ? COLORS.coneSuspicious : COLORS.cone;
    drawCone(ctx, guard.x, guard.y, guard.facing, GUARD.coneRange, GUARD.coneHalfAngle, coneFill, COLORS.coneEdge);
  }
}

function drawCameras(ctx, world) {
  for (const camera of world.cameras) {
    if (!camera.disabled) {
      drawCone(ctx, camera.x, camera.y, camera.angle, CAMERA.range, CAMERA.halfAngle, COLORS.camCone, COLORS.camConeEdge);
    }
  }
}

function drawActors(ctx, world, time) {
  for (const camera of world.cameras) {
    ctx.fillStyle = '#101010';
    ctx.fillRect(camera.x - 8, camera.y - 6, 16, 12);
    ctx.fillStyle = camera.disabled ? '#555' : '#ff3b30';
    ctx.beginPath();
    ctx.arc(camera.x + (camera.base === 0 ? 8 : camera.base === Math.PI ? -8 : 0), camera.y + (camera.base === Math.PI / 2 ? 6 : camera.base === -Math.PI / 2 ? -6 : 0), 3.5, 0, Math.PI * 2);
    ctx.fill();
    if (camera.disabled) {
      ctx.strokeStyle = COLORS.textDim;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(camera.x - 10, camera.y - 10);
      ctx.lineTo(camera.x + 10, camera.y + 10);
      ctx.stroke();
    }
  }
  for (const guard of world.guards) {
    ctx.fillStyle = COLORS.guard;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, GUARD.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = guard.state === GUARD_CHASE ? COLORS.danger : COLORS.guardTrim;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#e8dcc0';
    ctx.beginPath();
    ctx.arc(guard.x + Math.cos(guard.facing) * 5, guard.y + Math.sin(guard.facing) * 5, 5, 0, Math.PI * 2);
    ctx.fill();
    if (guard.suspicion > 0.05 && guard.state !== GUARD_CHASE) {
      ctx.fillStyle = guard.suspicion > 0.35 ? '#ff9632' : COLORS.gold;
      ctx.fillRect(guard.x - 12, guard.y - GUARD.radius - 12, 24 * guard.suspicion, 4);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(guard.x - 12, guard.y - GUARD.radius - 12, 24, 4);
    }
    if (guard.state === GUARD_CHASE) {
      ctx.fillStyle = COLORS.danger;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', guard.x, guard.y - GUARD.radius - 8);
    }
  }
}

function drawSmokeAndMarbles(ctx, world) {
  for (const cloud of world.smoke) {
    ctx.fillStyle = COLORS.smoke;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(220, 220, 230, 0.25)';
    ctx.beginPath();
    ctx.arc(cloud.x - 18, cloud.y - 10, cloud.radius * 0.55, 0, Math.PI * 2);
    ctx.arc(cloud.x + 20, cloud.y + 12, cloud.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const marble of world.marbles) {
    ctx.fillStyle = '#cfd6dd';
    ctx.beginPath();
    ctx.arc(marble.x, marble.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (world.noise) {
    ctx.strokeStyle = 'rgba(232, 193, 90, 0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(world.noise.x, world.noise.y, world.noise.radius * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawPlayer(ctx, world, time) {
  const player = world.player;
  const r = player.sneaking ? PLAYER.radius - 2 : PLAYER.radius;
  // A soft halo so the thief reads against the dark floor at a glance.
  ctx.fillStyle = 'rgba(232, 193, 90, 0.10)';
  ctx.beginPath();
  ctx.arc(player.x, player.y, r + 9, 0, Math.PI * 2);
  ctx.fill();
  if (player.sneaking) {
    ctx.strokeStyle = 'rgba(232, 193, 90, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(player.x, player.y, r + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(player.x, player.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.playerTrim;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = COLORS.playerTrim;
  ctx.beginPath();
  ctx.moveTo(player.x + Math.cos(player.facing) * (r + 5), player.y + Math.sin(player.facing) * (r + 5));
  ctx.lineTo(player.x + Math.cos(player.facing + 2.5) * r * 0.7, player.y + Math.sin(player.facing + 2.5) * r * 0.7);
  ctx.lineTo(player.x + Math.cos(player.facing - 2.5) * r * 0.7, player.y + Math.sin(player.facing - 2.5) * r * 0.7);
  ctx.closePath();
  ctx.fill();
  if (world.lootTaken) {
    ctx.fillStyle = COLORS.loot;
    ctx.beginPath();
    ctx.arc(player.x - 7, player.y + 7, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (player.crackProgress > 0) {
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(player.x, player.y, r + 9, -Math.PI / 2, -Math.PI / 2 + player.crackProgress * Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CRACKING…', player.x, player.y - r - 14);
  }
  if (player.ventProgress > 0) {
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(player.x, player.y, r + 9, -Math.PI / 2, -Math.PI / 2 + player.ventProgress * Math.PI * 2);
    ctx.stroke();
  }
}

function drawHud(ctx, world) {
  ctx.fillStyle = COLORS.hud;
  ctx.fillRect(0, 0, CANVAS.width, HUD.height);
  ctx.fillStyle = COLORS.hudLine;
  ctx.fillRect(0, HUD.height - 2, CANVAS.width, 2);
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('THE GILDED VAULT JOB', 14, 24);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '12px sans-serif';
  ctx.fillText(`${world.level.name}  ·  Room ${world.levelIndex + 1} of ${LEVELS.length}`, 14, 44);

  // Alarm meter: the heart of the HUD.
  const meterX = 330;
  const meterW = 220;
  const ratio = world.alarm / ALARM.max;
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', meterX, 24);
  ctx.fillStyle = '#241a12';
  ctx.fillRect(meterX, 30, meterW, 14);
  const meterColor = ratio < 0.5 ? '#c9a227' : ratio < 0.8 ? '#ff9632' : COLORS.danger;
  ctx.fillStyle = meterColor;
  ctx.fillRect(meterX, 30, meterW * ratio, 14);
  ctx.strokeStyle = COLORS.goldDim;
  ctx.lineWidth = 1;
  ctx.strokeRect(meterX, 30, meterW, 14);
  for (let i = 0; i < ALARM.maxAlarms; i += 1) {
    ctx.fillStyle = i < world.alarms ? COLORS.danger : '#3a2f22';
    ctx.beginPath();
    ctx.arc(meterX + 8 + i * 18, 54, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.goldDim;
    ctx.stroke();
  }
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '11px sans-serif';
  ctx.fillText(world.alarms >= ALARM.maxAlarms ? 'BUSTED' : `${world.alarms} / ${ALARM.maxAlarms} alarms`, meterX + 70, 58);

  // Loot, tools, score and time.
  const rightX = 600;
  ctx.fillStyle = world.lootTaken ? COLORS.loot : COLORS.textDim;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(world.lootTaken ? `◆ ${world.level.loot.name}` : `◇ ${world.level.loot.name}`, rightX, 24);
  ctx.fillStyle = COLORS.text;
  ctx.font = '12px sans-serif';
  ctx.fillText(`EMP ×${world.tools.emp} (Q)   Smoke ×${world.tools.smoke} (F)   Marbles ×${world.tools.marbles} (click)`, rightX, 44);
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`SCORE ${world.score}`, CANVAS.width - 14, 24);
  const minutes = Math.floor(world.time / 60);
  const seconds = Math.floor(world.time % 60);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '12px sans-serif';
  ctx.fillText(`${minutes}:${String(seconds).padStart(2, '0')}  ·  par ${world.level.par}s`, CANVAS.width - 14, 44);
  ctx.textAlign = 'left';
}

function drawMessage(ctx, world) {
  if (!world.message) return;
  ctx.fillStyle = 'rgba(10, 8, 6, 0.85)';
  const w = ctx.measureText(world.message).width + 28;
  ctx.fillRect((CANVAS.width - w) / 2, FIELD.y + 14, w, 30);
  ctx.strokeStyle = COLORS.goldDim;
  ctx.lineWidth = 1;
  ctx.strokeRect((CANVAS.width - w) / 2, FIELD.y + 14, w, 30);
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(world.message, CANVAS.width / 2, FIELD.y + 34);
  ctx.textAlign = 'left';
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(8, 6, 5, 0.78)';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  ctx.fillStyle = accent || COLORS.gold;
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, CANVAS.width / 2, 250);
  ctx.fillStyle = COLORS.text;
  ctx.font = '16px sans-serif';
  let y = 300;
  for (const line of lines) {
    ctx.fillText(line, CANVAS.width / 2, y);
    y += 28;
  }
  ctx.textAlign = 'left';
}

/** Draw the whole game for a screen state. `time` is the wall clock in seconds. */
export function draw(ctx, world, screen, time) {
  ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
  const level = world.level;
  drawFloor(ctx, level);
  drawGuards(ctx, world);
  drawCameras(ctx, world);
  drawWalls(ctx, level);
  drawCases(ctx, level);
  drawVents(ctx, level);
  drawLootCase(ctx, world, time);
  drawExit(ctx, world, time);
  drawSmokeAndMarbles(ctx, world);
  drawActors(ctx, world, time);
  drawPlayer(ctx, world, time);
  drawHud(ctx, world);
  drawMessage(ctx, world);

  if (world.caughtFlash > 0) {
    ctx.fillStyle = `rgba(255, 40, 30, ${world.caughtFlash * 0.25})`;
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  }
  if (world.alarmFlash > 0) {
    ctx.fillStyle = `rgba(255, 40, 30, ${world.alarmFlash * 0.18})`;
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  }

  if (screen === SCREEN_TITLE) {
    overlay(ctx, 'THE GILDED VAULT JOB', [
      'Three rooms. Three treasures. One quiet thief.',
      '',
      'Move: WASD or arrows    Sneak: hold Shift    Crack the case: hold E',
      'EMP cameras: Q    Smoke bomb: F    Throw a marble: click',
      'Vents: hold E on a grate to crawl through    Mute: M    Retry: R',
      '',
      'Stay out of the cones. Keep the alarm meter down. Three alarms and the job is off.',
      '',
      'Press Enter to start the job',
    ]);
    if (world.best > 0) {
      ctx.fillStyle = COLORS.gold;
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Best score: ${world.best}`, CANVAS.width / 2, 560);
      ctx.textAlign = 'left';
    }
  } else if (screen === SCREEN_PAUSE) {
    overlay(ctx, 'PAUSED', ['The gallery waits. Press P to keep moving.']);
  } else if (screen === SCREEN_LEVEL) {
    const gain = world.lastGain || { loot: 0, time: 0, ghost: 0, total: 0 };
    overlay(ctx, 'CLEAN GETAWAY', [
      `${world.lastCleared || world.level.name} cleared.`,
      `Loot ${gain.loot}  +  time ${gain.time}  +  ghost ${gain.ghost}  =  ${gain.total}`,
      `Score so far: ${world.score}`,
      '',
      'Press Enter for the next room',
    ]);
  } else if (screen === SCREEN_OVER) {
    overlay(ctx, 'BUSTED', [
      'Three alarms. The gallery locks down and the job is off.',
      `Score: ${world.score}`,
      '',
      'Press Enter to try the job again',
    ], COLORS.danger);
  } else if (screen === SCREEN_WIN) {
    overlay(ctx, 'THE JOB IS DONE', [
      'Three treasures, one quiet thief, no alarms that mattered.',
      `Final score: ${world.score}`,
      '',
      'Press Enter to run it again',
    ], COLORS.exit);
  }
}
