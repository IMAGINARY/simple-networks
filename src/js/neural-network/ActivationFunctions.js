const binary = { f: z => z < 0 ? 0 : 1, dF: z => 0 };
const linear = { f: z => z, dF: _ => 1 };
const relu = { f: z => Math.max(0, z), dF: z => z < 0 ? 0 : 1 };
const sigmoid = {
  f: z => 1 / (1 + Math.exp(-z)),
  dF: z => {
    const e = Math.exp(-z);
    return e / ((1 + e) * (1 + e));
  }
};

export {
  binary,
  linear,
  relu,
  sigmoid,
};
