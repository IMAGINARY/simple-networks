import FeedForwardNetwork from './Network';
import * as ActivationFunctions from './ActivationFunctions';
import cloneDeep from 'lodash/cloneDeep';

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

  updateGradients() {
    for (let u of this.network.nodes) {
      // Compute the rate of change of the cost with respect to the bias of u using
      // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP3
      u.p['dC/dBias'] = u.p.error;

      // Compute the rate of change of the cost with respect to the weights of (u,v) for all v using
      // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP4
      for (let e of u.out) {
        e.p['dC/dWeight'] = u.p.activation * e.to.p.error;
      }
    }
    return this;
  }

  gradientDescentStep(learningRate) {
    for (let u of this.network.nodes) {
      if (u.p.biasProps.train) {
        u.p.bias = limit(u.p.bias - learningRate * u.p['dC/dBias'], u.p.biasProps.range);
      }
      for (let e of u.out) {
        if (e.p.weightProps.train)
          e.p.weight = limit(e.p.weight - learningRate * e.p['dC/dWeight'], e.p.weightProps.range);
      }
    }
    return this;
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
    this.assignInputs(x)
      .feedForward()
      .assignTargets(y)
      .backpropagateError()
      .updateGradients()
      .gradientDescentStep(learningRate);
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
 * @param range {{min:number, max:number}|undefined}
 * @returns {number}
 */
function limit(value, range) {
  if (typeof range === 'undefined') {
    return value;
  } else {
    return Math.min(Math.max(range.min, value), range.max);
  }
}

Object.defineProperty(
  Model,
  'DEFAULT_INNER_NODE_PROPERTIES',
  {
    value: {
      bias: 0,
      biasProps: { range: { min: -1, max: 1 }, train: true },
      sum: 0,
      activation: 0,
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
      weightProps: { range: { min: -1, max: 1 }, train: true },
      'dC/dWeight': 0,
    },
    configurable: false,
    enumerable: true,
  }
);
Object.freeze(Model.DEFAULT_EDGE_PROPERTIES);
