// Geometry helpers: distances, angles and line-of-sight against rectangles.
export function clamp(value, low, high) {
  return value < low ? low : value > high ? high : value;
}

export function distance(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function turnToward(current, target, maxStep) {
  const d = angleDiff(target, current);
  if (Math.abs(d) <= maxStep) return target;
  return current + Math.sign(d) * maxStep;
}

function segmentHitsRect(x1, y1, x2, y2, rect) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tMin = 0;
  let tMax = 1;
  const axes = [
    [dx, x1 - rect.x, rect.w],
    [dy, y1 - rect.y, rect.h],
  ];
  for (const [d, origin, size] of axes) {
    if (Math.abs(d) < 1e-9) {
      if (origin < 0 || origin > size) return false;
    } else {
      let t1 = -origin / d;
      let t2 = (size - origin) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tMin = Math.max(tMin, t1);
      tMax = Math.min(tMax, t2);
      if (tMin > tMax) return false;
    }
  }
  return true;
}

/** True when the straight line between two points crosses any solid rectangle. */
export function lineBlocked(x1, y1, x2, y2, solids) {
  for (let i = 0; i < solids.length; i += 1) {
    if (segmentHitsRect(x1, y1, x2, y2, solids[i])) return true;
  }
  return false;
}

/** True when the straight line passes through a smoke cloud (a circle). */
export function lineThroughSmoke(x1, y1, x2, y2, clouds) {
  for (let i = 0; i < clouds.length; i += 1) {
    const c = clouds[i];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    let t = len2 === 0 ? 0 : ((c.x - x1) * dx + (c.y - y1) * dy) / len2;
    t = clamp(t, 0, 1);
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    if (Math.hypot(px - c.x, py - c.y) < c.radius) return true;
  }
  return false;
}

/** Push a circle out of every solid rectangle it overlaps; returns true when it moved. */
export function resolveCircle(x, y, radius, solids) {
  let moved = false;
  for (let i = 0; i < solids.length; i += 1) {
    const r = solids[i];
    const nearestX = clamp(x, r.x, r.x + r.w);
    const nearestY = clamp(y, r.y, r.y + r.h);
    const dx = x - nearestX;
    const dy = y - nearestY;
    const d2 = dx * dx + dy * dy;
    if (d2 >= radius * radius) continue;
    moved = true;
    if (d2 > 1e-9) {
      const d = Math.sqrt(d2);
      x = nearestX + (dx / d) * radius;
      y = nearestY + (dy / d) * radius;
    } else {
      const left = x - (r.x - radius);
      const right = r.x + r.w + radius - x;
      const top = y - (r.y - radius);
      const bottom = r.y + r.h + radius - y;
      const m = Math.min(left, right, top, bottom);
      if (m === left) x = r.x - radius;
      else if (m === right) x = r.x + r.w + radius;
      else if (m === top) y = r.y - radius;
      else y = r.y + r.h + radius;
    }
  }
  return { x, y, moved };
}
