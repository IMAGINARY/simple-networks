import IOps, { Interval } from 'interval-arithmetic';

class ActivationFunction {
  constructor() {
  }

  f(z) {
    throw new Error('unimplemented');
  }

  dF(z) {
    throw new Error('unimplemented');
  }

  range(i) {
    return new Interval(this.f(i.lo), this.f(i.hi));
  }
}

class BinaryActivationFunction extends ActivationFunction {
  constructor() {
    super();
  }

  f(z) {
    return z < 0 ? 0 : 1;
  }

  dF(z) {
    return z => 0;
  }
}

class LinearActivationFunction extends ActivationFunction {
  constructor() {
    super();
  }

  f(z) {
    return z;
  }

  dF(z) {
    return 1;
  }
}

class ReLUActivationFunction extends ActivationFunction {
  constructor() {
    super();
  }

  f(z) {
    return Math.max(0, z);
  }

  dF(z) {
    return z < 0 ? 0 : 1;
  }
}

class SigmoidActivationFunction extends ActivationFunction {
  constructor() {
    super();
  }

  f(z) {
    return 1 / (1 + Math.exp(-z));
  }

  dF(z) {
    const e = Math.exp(-z);
    return e / ((1 + e) * (1 + e));
  }

  range(i) {
    return IOps.div(Interval.ONE, IOps.add(Interval.ONE, IOps.exp(IOps.negative(i))));
  }
}

const binary = new BinaryActivationFunction();
const linear = new LinearActivationFunction();
const relu = new ReLUActivationFunction();
const sigmoid = new SigmoidActivationFunction();

export {
  binary,
  linear,
  relu,
  sigmoid,
};
