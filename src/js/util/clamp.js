import IOps from 'interval-arithmetic';

/***
 *
 * @param value {number}
 * @param range {Interval|Number[]}
 * @returns {number}
 */
export default function clamp(value, range) {
  if (IOps.isInterval(range)) {
    return Math.min(Math.max(range.lo, value), range.hi);
  } else if (Array.isArray(range) && range.length > 0) {
    let closest = range[0];
    let closestDist = Math.abs(value - range[0]);
    for (let i = 1; i < range.length; ++i) {
      const dist = Math.abs(value - range[i]);
      if (dist < closestDist) {
        closest = range[i];
        closestDist = dist;
      }
    }
    return closest;
  } else {
    throw Error(`Range must be an interval or non-empty array. Got ${range} instead.`);
  }
}

export { clamp };
