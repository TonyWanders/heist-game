// The three rooms of the job. Each level is its own floor of the Aldgate Gallery:
// a grand gallery, a guarded corridor, and the vault itself. Walls, cases and
// statues are solid and block sight; shadow patches slow detection; vents give
// a second route. All names, rooms and layouts are original.
import { FIELD } from './config.js';

function borderWalls() {
  return [
    { x: 0, y: FIELD.y, w: FIELD.width, h: 14 },
    { x: 0, y: FIELD.y + FIELD.height - 14, w: FIELD.width, h: 14 },
    { x: 0, y: FIELD.y, w: 14, h: FIELD.height },
    { x: FIELD.width - 14, y: FIELD.y, w: 14, h: FIELD.height },
  ];
}

function statueSolids(statues) {
  return statues.map((s) => ({ x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 }));
}

export const LEVELS = [
  {
    name: 'The Grand Gallery',
    intro: 'Night at the Aldgate Gallery. The Sunburst Diamond sleeps in its case at the far end. Cross the floor, crack the case, and leave by the skylight stair.',
    loot: { name: 'Sunburst Diamond', points: 1000, x: 835, y: 123 },
    lootCase: { x: 800, y: 100, w: 70, h: 46 },
    start: { x: 90, y: 600 },
    exit: { x: 68, y: 128, w: 56, h: 56, label: 'SKYLIGHT STAIR' },
    par: 90,
    walls: borderWalls(),
    cases: [
      { x: 300, y: 180, w: 70, h: 46 },
      { x: 590, y: 180, w: 70, h: 46 },
      { x: 300, y: 480, w: 70, h: 46 },
      { x: 590, y: 480, w: 70, h: 46 },
      { x: 430, y: 330, w: 100, h: 50 },
    ],
    statues: [
      { x: 200, y: 330, r: 18 },
      { x: 760, y: 330, r: 18 },
    ],
    plants: [
      { x: 150, y: 150, r: 14 },
      { x: 810, y: 540, r: 14 },
    ],
    rugs: [{ x: 330, y: 280, w: 300, h: 180 }],
    shadows: [
      { x: 120, y: 420, w: 180, h: 90 },
      { x: 660, y: 420, w: 180, h: 90 },
    ],
    vents: [],
    guards: [
      { x: 240, y: 160, waypoints: [{ x: 240, y: 160 }, { x: 720, y: 160 }, { x: 720, y: 560 }, { x: 240, y: 560 }] },
      { x: 480, y: 140, waypoints: [{ x: 480, y: 140 }, { x: 480, y: 560 }] },
    ],
    cameras: [
      { x: 480, y: 82, base: Math.PI / 2, sweep: 0.7, period: 5 },
      { x: 938, y: 360, base: Math.PI, sweep: 0.6, period: 6 },
    ],
  },
  {
    name: 'The Vault Corridor',
    intro: 'The corridor to the vault is split into three lanes. The Meridian Tiara waits in the middle lane. The floor vents link the bottom lane to the top: crawl, don\'t walk.',
    loot: { name: 'Meridian Tiara', points: 1500, x: 480, y: 372 },
    lootCase: { x: 445, y: 349, w: 70, h: 46 },
    start: { x: 90, y: 600 },
    exit: { x: 68, y: 128, w: 56, h: 56, label: 'SKYLIGHT STAIR' },
    par: 110,
    walls: [
      ...borderWalls(),
      { x: 200, y: 300, w: 240, h: 16 },
      { x: 520, y: 300, w: 240, h: 16 },
      { x: 200, y: 480, w: 240, h: 16 },
      { x: 520, y: 480, w: 240, h: 16 },
    ],
    cases: [
      { x: 300, y: 150, w: 70, h: 46 },
      { x: 590, y: 150, w: 70, h: 46 },
      { x: 300, y: 560, w: 70, h: 46 },
      { x: 590, y: 560, w: 70, h: 46 },
    ],
    statues: [
      { x: 150, y: 380, r: 16 },
      { x: 810, y: 380, r: 16 },
    ],
    plants: [
      { x: 480, y: 150, r: 14 },
      { x: 480, y: 590, r: 14 },
    ],
    rugs: [{ x: 400, y: 330, w: 160, h: 130 }],
    shadows: [
      { x: 60, y: 330, w: 120, h: 120 },
      { x: 780, y: 330, w: 120, h: 120 },
    ],
    vents: [
      { x: 120, y: 540, to: { x: 840, y: 140 } },
      { x: 840, y: 140, to: { x: 120, y: 540 } },
    ],
    guards: [
      { x: 200, y: 140, waypoints: [{ x: 200, y: 140 }, { x: 760, y: 140 }, { x: 760, y: 260 }, { x: 200, y: 260 }] },
      { x: 200, y: 380, waypoints: [{ x: 200, y: 380 }, { x: 760, y: 380 }] },
      { x: 200, y: 560, waypoints: [{ x: 200, y: 560 }, { x: 760, y: 560 }] },
    ],
    cameras: [
      { x: 480, y: 82, base: Math.PI / 2, sweep: 0.7, period: 5 },
      { x: 938, y: 300, base: Math.PI, sweep: 0.6, period: 6 },
      { x: 480, y: 658, base: -Math.PI / 2, sweep: 0.7, period: 7 },
    ],
  },
  {
    name: 'The Vault',
    intro: 'The vault at last. The Crown of Meridia sits in the middle of the room, ringed by cases, guards and four cameras. Take it, and get to the service lift.',
    loot: { name: 'Crown of Meridia', points: 2500, x: 480, y: 372 },
    lootCase: { x: 445, y: 349, w: 70, h: 46 },
    start: { x: 90, y: 600 },
    exit: { x: 856, y: 572, w: 56, h: 56, label: 'SERVICE LIFT' },
    par: 130,
    walls: borderWalls(),
    cases: [
      { x: 400, y: 280, w: 70, h: 40 },
      { x: 490, y: 280, w: 70, h: 40 },
      { x: 400, y: 420, w: 70, h: 40 },
      { x: 490, y: 420, w: 70, h: 40 },
      { x: 250, y: 150, w: 70, h: 46 },
      { x: 640, y: 150, w: 70, h: 46 },
      { x: 250, y: 540, w: 70, h: 46 },
      { x: 640, y: 540, w: 70, h: 46 },
    ],
    statues: [
      { x: 240, y: 200, r: 18 },
      { x: 720, y: 200, r: 18 },
      { x: 240, y: 540, r: 18 },
      { x: 720, y: 540, r: 18 },
    ],
    plants: [
      { x: 150, y: 380, r: 14 },
      { x: 810, y: 380, r: 14 },
    ],
    rugs: [{ x: 380, y: 300, w: 200, h: 140 }],
    shadows: [
      { x: 60, y: 90, w: 140, h: 100 },
      { x: 760, y: 90, w: 140, h: 100 },
      { x: 60, y: 540, w: 140, h: 100 },
    ],
    vents: [
      { x: 120, y: 600, to: { x: 840, y: 120 } },
      { x: 840, y: 120, to: { x: 120, y: 600 } },
    ],
    guards: [
      { x: 340, y: 240, waypoints: [{ x: 340, y: 240 }, { x: 620, y: 240 }, { x: 620, y: 500 }, { x: 340, y: 500 }] },
      { x: 180, y: 140, waypoints: [{ x: 180, y: 140 }, { x: 180, y: 580 }] },
      { x: 780, y: 140, waypoints: [{ x: 780, y: 140 }, { x: 780, y: 580 }] },
    ],
    cameras: [
      { x: 480, y: 82, base: Math.PI / 2, sweep: 0.7, period: 5 },
      { x: 938, y: 372, base: Math.PI, sweep: 0.6, period: 6 },
      { x: 480, y: 658, base: -Math.PI / 2, sweep: 0.7, period: 7 },
      { x: 22, y: 372, base: 0, sweep: 0.6, period: 6.5 },
    ],
  },
];

/** All solid rectangles for a level: walls, cases and statues. */
export function levelSolids(level) {
  return [...level.walls, ...level.cases, ...statueSolids(level.statues)];
}
