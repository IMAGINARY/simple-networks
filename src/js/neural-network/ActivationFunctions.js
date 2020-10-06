const linear = { f: z => z, dF: _ => 1 };
const relu = { f: z => Math.max(0, z), dF: z => z < 0 ? 0 : 1 };

export {
  linear,
  relu,
};
