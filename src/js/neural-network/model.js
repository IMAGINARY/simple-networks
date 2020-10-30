import { EventEmitter } from 'events';
import { cloneDeep, defaultsDeep } from 'lodash';
import { Interval } from 'interval-arithmetic';

import * as ActivationFunctions from './activation-functions';
import clamp from '../util/clamp';

export default class Model extends EventEmitter {
  constructor(network, properties) {
    super();

    const p = Object.assign(
      {},
      ...network.nodeIds.map(id => ({ [id]: properties[id] ?? {} })),
      ...network.edgeIds.map(id => ({ [id]: properties[id] ?? {} })),
    );

    this.network = network;
    this.properties = p;

    network.inputNodeIds.forEach(id => p[id] = defaultsForInputNode(p[id]));
    network.innerNodeIds.forEach(id => p[id] = defaultsForInnerNode(p[id]));
    network.outputNodeIds.forEach(id => p[id] = defaultsForOutputNode(p[id]));
    network.edgeIds.forEach(id => p[id] = defaultsForEdge(p[id]));

    // Ensure all properties are within their ranges
    this._clamp();
  }

  static C(a, y) {
    const diff = a - y;
    return (1.0 / 2.0) * diff * diff;
  }

  static relC(a, y) {
    const diff = (a - y) / y;
    return (1.0 / 2.0) * diff * diff;
  }

  static dC(a, y) {
    return a - y;
  }

  setBias(mixed, value) {
    const id = typeof mixed === 'string' ? mixed : mixed.id;
    const clampedValue = clamp(value, this.properties[id].biasProps.range);
    this._setPropIfChangedAndNotify(id, 'bias', clampedValue);
  }

  setWeight(mixed, value) {
    const id = typeof mixed === 'string' ? mixed : mixed.id;
    const clampedValue = clamp(value, this.properties[id].weightProps.range);
    this._setPropIfChangedAndNotify(id, 'weight', clampedValue);
  }

  train(x, y, learningRate) {
    this._resetGradients()
      ._assignInputs(x)
      ._assignTargets(y)
      ._feedForward()
      ._backpropagateError()
      ._updateGradients()
      ._gradientDescentStep(learningRate);
    return this;
  }

  trainBatch(batch, learningRate) {
    this._resetGradients();
    for (let [x, y] of batch) {
      this._assignInputs(x)
        ._feedForward()
        ._assignTargets(y)
        ._backpropagateError()
        ._updateGradients();
    }
    this._gradientDescentStep(learningRate);
    return this;
  }

  trainBatches(batches, learningRate) {
    for (let batch of batches) {
      this.trainBatch(batch, learningRate);
    }
    return this;
  }

  predictExt(x, copyOtherProperties = false) {
    const p = this.properties;
    const outP = {};
    this.network.inputNodes.forEach(
      (n, i) => {
        const np = p[n.id];
        const xi = clamp(x[i], np.inputProps.range);
        outP[n.id] = { input: xi, sum: xi, activation: xi };
      }
    );
    for (let n of this.network.topSortNoInputs) {
      const np = p[n.id];
      const sum = n.in.reduce(
        (a, inEdge) => a + outP[inEdge.from.id].activation * p[inEdge.id].weight,
        np.bias
      );
      const activation = np.activationFunc.f(sum);
      outP[n.id] = { sum, activation };
    }
    return copyOtherProperties ? defaultsDeep(outP, p) : outP;
  }

  predict(x) {
    const predictionsExt = this.predictExt(x);
    return this.network.outputNodeIds.map(id => predictionsExt[id].activation ?? 0.0);
  }

  _clamp() {
    const clampProp = (obj, prop) => clamp(obj[prop], obj[`${prop}Props`].range);
    this.network.nodeIds.forEach(nodeId => clampProp(this.properties[nodeId], 'bias'));
    this.network.edgeIds.forEach(edgeId => clampProp(this.properties[edgeId], 'weight'));
  }

  _setPropIfChangedAndNotify(id, propName, value) {
    const oldValue = this.properties[id];
    if (oldValue !== value) {
      this.properties[id][propName] = value;
      this.emit('network-property-changed', id, propName, value, oldValue, this);
    }
  }

  _setInput(mixed, value) {
    const id = typeof mixed === 'string' ? mixed : mixed.id;
    this.properties[id].input = clamp(value, this.properties[id].inputProps.range);
  }

  _assignInputs(x) {
    const p = this.properties;
    this.network.inputNodes.forEach((n, i) => this._setInput(n.id, x[i]));
    return this;
  }

  _feedForward() {
    const p = this.properties;
    this.network.inputNodes.forEach(n => p[n.id].activation = p[n.id].input);
    for (let node of this.network.topSortNoInputs) {
      const np = p[node.id];
      np.sum = node.in.reduce(
        (a, inEdge) => a + p[inEdge.from.id].activation * p[inEdge.id].weight,
        np.bias
      );
      np.activation = np.activationFunc.f(np.sum);
    }
    return this;
  }

  _backpropagateError() {
    const p = this.properties;

    // Take care of output nodes first
    for (let u of this.network.outputNodes) {
      const up = p[u.id];
      // Compute the error in the output node u using
      // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP1
      up.error = Model.dC(up.activation, up.target) * up.activationFunc.dF(up.sum);
    }

    // Backpropagate through network
    for (let u of this.network.reverseTopSortNoOutputs) {
      const up = p[u.id];
      // Compute the error in the non-output node u using
      // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP2
      up.error = u.out.reduce((delta_tmp, e) => delta_tmp + p[e.id].weight * p[e.to.id].error, 0)
        * up.activationFunc.dF(up.sum);
    }
    return this;
  }

  _resetGradients() {
    const p = this.properties;
    for (let u of this.network.nodes) {
      p[u.id]['dC/dBias'] = 0;
      for (let e of u.out) {
        p[e.id]['dC/dWeight'] = 0;
      }
    }
    return this;
  }

  _updateGradients() {
    const p = this.properties;
    for (let u of this.network.nodes) {
      // Compute the rate of change of the cost with respect to the bias of u using
      // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP3
      p[u.id]['dC/dBias'] += p[u.id].error;

      // Compute the rate of change of the cost with respect to the weights of (u,v) for all v using
      // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP4
      for (let e of u.out) {
        p[e.id]['dC/dWeight'] += p[u.id].activation * p[e.to.id].error;
      }
    }
    return this;
  }

  _gradientDescentStep(learningRate) {
    const p = this.properties;
    for (let u of this.network.nodes) {
      const up = p[u.id];
      if (up.biasProps.train) {
        this.setBias(u, up.bias - learningRate * up['dC/dBias']);
      }
      for (let e of u.out) {
        const ep = p[e.id];
        if (ep.weightProps.train) {
          this.setWeight(e, ep.weight - learningRate * ep['dC/dWeight']);
        }
      }
    }
    return this;
  }

  _readOutputs() {
    const p = this.properties;
    return this.network.outputNodes.map(n => p[n.id].activation);
  }

  _assignTargets(y) {
    const p = this.properties;
    this.network.outputNodes.forEach((n, i) => p[n.id].target = y[i]);
    return this;
  }
}

Model.DEFAULT_INNER_NODE_PROPERTIES = {
  bias: 0,
  biasProps: { range: new Interval(-1, 1), train: true },
  sum: 0,
  sumProps: {},
  activation: 0,
  activationProps: {},
  activationFunc: ActivationFunctions.relu,
  error: 0,
  'dC/dBias': 0,
};

Model.DEFAULT_INPUT_NODE_PROPERTIES = Object.assign(
  cloneDeep(Model.DEFAULT_INNER_NODE_PROPERTIES),
  {
    input: 0,
    inputProps: { range: new Interval(0, 1) },
    activationFunc: ActivationFunctions.linear,
  });

Model.DEFAULT_OUTPUT_NODE_PROPERTIES =
  Object.assign(
    cloneDeep(Model.DEFAULT_INNER_NODE_PROPERTIES),
    {
      activationFunc: ActivationFunctions.linear,
      target: 0,
      targetProps: {},
    });

Model.DEFAULT_EDGE_PROPERTIES = {
  weight: 1,
  weightProps: { range: new Interval(-1, 1), train: true },
  'dC/dWeight': 0,
};

function defaultsForInputNode(p) {
  if (typeof p.inputProps?.range !== 'undefined') {
    // inputProps.range might be an array, but defaultsDeep will overwrite it with an object
    // such that we need to save it beforehand and restore it afterwards
    const range = p.inputProps.range;
    delete p.inputProps.range;
    defaultsDeep(p, Model.DEFAULT_INPUT_NODE_PROPERTIES);
    p.inputProps.range = range;
  } else {
    defaultsDeep(p, Model.DEFAULT_INPUT_NODE_PROPERTIES);
  }
  return p;
}

function defaultsForInnerNode(p) {
  defaultsDeep(p, Model.DEFAULT_INNER_NODE_PROPERTIES);
  return p;
}

function defaultsForOutputNode(p) {
  defaultsDeep(p, Model.DEFAULT_OUTPUT_NODE_PROPERTIES);
  return p;
}

function defaultsForEdge(p) {
  defaultsDeep(p, Model.DEFAULT_EDGE_PROPERTIES);
  return p;
}

export { Model };
