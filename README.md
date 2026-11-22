[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/TonyWanders/heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/TonyWanders/heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

# The Gilded Vault Job

A complete, original top-down heist game that plays offline in a desktop browser. Wren, a quiet thief, crosses three rooms of the Aldgate Gallery at night: the Grand Gallery, the Vault Corridor, and the Vault itself. Guards patrol with vision cones, cameras sweep the floor, and the alarm meter climbs whenever the thief is seen. Crack each room's case, take the treasure, and slip out the exit before the third alarm.

## How to play

Open `game/index.html` in a desktop browser (or run `node serve.ts` and open http://localhost:8080).

- **Move:** WASD or arrow keys
- **Sneak:** hold Shift (slower, harder to spot)
- **Crack the case / crawl a vent:** hold E beside the case or on a grate
- **EMP pulse:** Q, kills every camera for 6 seconds (2 per room)
- **Smoke bomb:** F, a cloud no one can see through (1 per room)
- **Throw a marble:** click, the noise pulls a guard to investigate (3 per room)
- **Mute:** M, **Retry room:** R, **Pause:** P, **Start:** Enter

## The heist

- Guards patrol fixed routes with bright vision cones. Walls, cases and statues block their sight. Getting seen fills a guard's suspicion; a sure guard gives chase, and a chase that catches the thief raises an alarm.
- Cameras sweep their red cones across the floor. An EMP pulse darkens them; smoke blocks them.
- Being seen fills the alarm meter in the HUD. A full meter is an alarm: guards hunt the thief's last spot. Three alarms and the job is off.
- Shadow patches slow detection. Vents link far corners of a room for a second route. A marble's clink sends a guard to look the wrong way.
- Each room pays loot points, a time bonus against par, and a 500-point ghost bonus for finishing with no alarm.

## What is in here

- `game/index.html` plus `game/src/`: the game, plain ES modules, no libraries, no network requests, no audio files (all sound is synthesized with WebAudio).
- `game/src/config.js` tuning, `random.js` seeded numbers, `geom.js` sight lines, `input.js` keyboard and mouse, `audio.js` synthesized sound, `levels.js` the three rooms, `guard.js` patrol and chase AI, `camera.js` sweeping cameras, `player.js` the thief and the tools, `world.js` the alarm meter, loot and scoring, `render.js` canvas art and HUD, `shots.js` staged screenshot scenes, `main.js` the shell.
- `screenshots/`: 4 real renders of the game's own code (title, gallery, alarm, vault).
- `main.ts`: the make.fun hand-in program. `vendor/makefun-game.ts`: the kit's library, unchanged.

## Entry

Built for the make.fun bounty [Make the best heist game](https://make.fun/bounty/best-heist-game-20261122-0559) ($50, ends 22 Nov 2026 18:59 WAT). Serve and check with `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.
