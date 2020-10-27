import FeedForwardNetwork from './network';
import * as ActivationFunctions from './activation-functions';
import cloneDeep from 'lodash/cloneDeep';
import IOps, { Interval } from 'interval-arithmetic';

export default class Model {
  constructor(nodes, edges) {
    const n = new FeedForwardNetwork(nodes, edges);

    n.inputNodes.forEach(n => assignUndefinedCloneDeep(n.p, Model.DEFAULT_INPUT_NODE_PROPERTIES));
    n.innerNodes.forEach(n => assignUndefinedCloneDeep(n.p, Model.DEFAULT_INNER_NODE_PROPERTIES));
    n.outputNodes.forEach(n => assignUndefinedCloneDeep(n.p, Model.DEFAULT_OUTPUT_NODE_PROPERTIES));
    n.edges.forEach(e => assignUndefinedCloneDeep(e.p, Model.DEFAULT_EDGE_PROPERTIES));

    this.network = n;
  }

  feedForward() {
    for (let node of this.network.topSortNoInputs) {
      node.p.sum = node.in.reduce(
        (a, inEdge) => a + inEdge.from.p.activation * inEdge.p.weight,
        node.p.bias
      );
      node.p.activation = node.p.activationFunc.f(node.p.sum);
    }
    return this;
  }

  static C(a, y) {
    const diff = a - y;
    return (1.0 / 2.0) * diff * diff;
  }

  static dC(a, y) {
    return a - y;
  }

  backpropagateError() {
    // Take care of output nodes first
    for (let u of this.network.outputNodes) {
      // Compute the error in the output node u using
      // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP1
      u.p.error = Model.dC(u.p.activation, u.p.target) * u.p.activationFunc.dF(u.p.sum);
    }

    // Backpropagate through network
    for (let u of this.network.reverseTopSortNoOutputs) {
      // Compute the error in the non-output node u using
      // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP2
      u.p.error = u.out.reduce((delta_tmp, e) => delta_tmp + e.p.weight * e.to.p.error, 0)
        * u.p.activationFunc.dF(u.p.sum);
    }
    return this;
  }

  resetGradients() {
    for (let u of this.network.nodes) {
      u.p['dC/dBias'] = 0;
      for (let e of u.out) {
        e.p['dC/dWeight'] = 0;
      }
    }
    return this;
  }

  updateGradients() {
    for (let u of this.network.nodes) {
      // Compute the rate of change of the cost with respect to the bias of u using
      // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP3
      u.p['dC/dBias'] += u.p.error;

      // Compute the rate of change of the cost with respect to the weights of (u,v) for all v using
      // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP4
      for (let e of u.out) {
        e.p['dC/dWeight'] += u.p.activation * e.to.p.error;
      }
    }
    return this;
  }

  gradientDescentStep(learningRate) {
    for (let u of this.network.nodes) {
      if (u.p.biasProps.train) {
        u.p.bias = clamp(u.p.bias - learningRate * u.p['dC/dBias'], u.p.biasProps.range);
      }
      for (let e of u.out) {
        if (e.p.weightProps.train)
          e.p.weight = clamp(e.p.weight - learningRate * e.p['dC/dWeight'], e.p.weightProps.range);
      }
    }
    return this;
  }

  clampBias(mixed) {
    const nodes = typeof mixed === 'undefined' ?
      this.network.nodes :
      this.network.toNodeArray(mixed);
    for (let u of nodes) {
      u.p.bias = clamp(u.p.bias, u.p.biasProps.range);
    }
  }

  clampInput(mixed) {
    const nodes = typeof mixed === 'undefined' ?
      this.network.inputNodes :
      this.network.toNodeArray(mixed).filter(n => n.isInput());
    for (let u of nodes) {
      u.p.activation = clamp(u.p.activation, u.p.inputProps.range);
    }
  }

  clampWeight(mixed) {
    const edges = typeof mixed === 'undefined' ?
      this.network.edges :
      this.network.toEdgeArray(mixed);
    for (let uv of edges) {
      uv.p.weight = clamp(uv.p.weight, uv.p.weightProps.range);
    }
  }

  clamp() {
    this.clampBias();
    this.clampInput();
    this.clampWeight();
  }

  assignInputs(x) {
    this.network.inputNodes.forEach((n, i) => n.p.activation = x[i]);
    return this;
  }

  readOutputs() {
    return this.network.outputNodes.map(n => n.p.activation);
  }

  assignTargets(y) {
    this.network.outputNodes.forEach((n, i) => n.p.target = y[i]);
    return this;
  }

  train(x, y, learningRate) {
    this.resetGradients()
      .assignInputs(x)
      .feedForward()
      .assignTargets(y)
      .backpropagateError()
      .updateGradients()
      .gradientDescentStep(learningRate);
    return this;
  }

  trainBatch(batch, learningRate) {
    this.resetGradients();
    for (let [x, y] of batch) {
      this.assignInputs(x)
        .feedForward()
        .assignTargets(y)
        .backpropagateError()
        .updateGradients();
    }
    this.gradientDescentStep(learningRate);
    return this;
  }

  trainBatches(batches, learningRate) {
    for (let batch of batches) {
      this.trainBatch(batch, learningRate);
    }
    return this;
  }
}

function assignUndefined(target, ...sources) {
  return Object.assign(target, ...(sources.map(s => Object.assign({}, s, target))));
}

function assignUndefinedCloneDeep(target, ...sources) {
  return Object.assign(target, ...(sources.map(s => Object.assign({}, cloneDeep(s), target))));
}

/***
 *
 * @param value {number}
 * @param range {Interval|Number[]}
 * @returns {number}
 */
function clamp(value, range) {
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

Object.defineProperty(
  Model,
  'DEFAULT_INNER_NODE_PROPERTIES',
  {
    value: {
      bias: 0,
      biasProps: { range: new Interval(-1, 1), train: true },
      sum: 0,
      sumProps: {},
      activation: 0,
      activationProps: {},
      activationFunc: ActivationFunctions.relu,
      error: 0,
      'dC/dBias': 0,
    },
    configurable: false,
    enumerable: true,
  }
);
Object.freeze(Model.DEFAULT_INNER_NODE_PROPERTIES);

Object.defineProperty(
  Model,
  'DEFAULT_INPUT_NODE_PROPERTIES',
  {
    value: Object.assign(
      cloneDeep(Model.DEFAULT_INNER_NODE_PROPERTIES),
      {
        input: 0,
        inputProps: { range: new Interval(0, 1) },
        activationFunc: ActivationFunctions.linear,
      }),
    configurable: false,
    enumerable: true,
  }
);
Object.freeze(Model.DEFAULT_INPUT_NODE_PROPERTIES);

Object.defineProperty(
  Model,
  'DEFAULT_OUTPUT_NODE_PROPERTIES',
  {
    value: Object.assign(
      cloneDeep(Model.DEFAULT_INNER_NODE_PROPERTIES),
      {
        activationFunc: ActivationFunctions.linear,
        target: 0,
        targetProps: {},
      }),
    configurable: false,
    enumerable: true,
  }
);
Object.freeze(Model.DEFAULT_OUTPUT_NODE_PROPERTIES);


Object.defineProperty(
  Model,
  'DEFAULT_EDGE_PROPERTIES',
  {
    value: {
      weight: 1,
      weightProps: { range: new Interval(-1, 1), train: true },
      'dC/dWeight': 0,
    },
    configurable: false,
    enumerable: true,
  }
);
Object.freeze(Model.DEFAULT_EDGE_PROPERTIES);