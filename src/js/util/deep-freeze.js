export default function deepFreeze(o, levels = Number.POSITIVE_INFINITY) {
  if (levels === 0)
    return;

  Object.freeze(o);

  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (o.hasOwnProperty(prop)
      && o[prop] !== null
      && (typeof o[prop] === "object" || typeof o[prop] === "function")
      && !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop], levels - 1);
    }
  });

  return o;
}

export { deepFreeze };
