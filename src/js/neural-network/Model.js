import FeedForwardNetwork from './Network';
import * as ActivationFunctions from './ActivationFunctions';

export default class Model {
  constructor(nodes, edges) {
    this.network = new FeedForwardNetwork(nodes, edges);

    const defaultNodeProps = {
      bias: 0,
      sum: 0,
      activation: 0,
      activationFunc: ActivationFunctions.relu,
      error: 0,
      'dC/dBias': 0,
    };
    this.network.nodes.forEach(n => assignUndefined(n.p, defaultNodeProps));

    const defaultEdgeProps = {
      weight: 1,
      'dC/dWeight': 0,
    };
    this.network.edges.forEach(e => assignUndefined(e.p, defaultEdgeProps));
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
      u.p.bias -= learningRate * u.p['dC/dBias'];
      for (let e of u.out) {
        e.p.weight -= learningRate * e.p['dC/dWeight'];
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
