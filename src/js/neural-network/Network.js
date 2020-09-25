export default class Network {
  constructor() {
    this._nodes = new Map();
  }

  hasNode(u) {
    return this._nodes.has(u);
  }

  hasEdge(u, v) {
    const node = this._nodes.get(u);
    return node !== null && node.edges.has(v);
  }

  _getNode(u) {
    let node = this._nodes.get(u);
    if (typeof node === 'undefined') {
      node = {
        props: {},
        edges: new Map(),
      };
      this._nodes.set(u, node);
    }
    return node;
  }

  _getEdge(u, v) {
    const nodeU = this._getNode(u);
    const nodeV = this._getNode(v);
    let edge = nodeU.edges.get(v);
    if (typeof edge === 'undefined') {
      edge = {};
      nodeU.edges.set(v, edge);
    }
    return edge;
  }

  setNodeProperties(u, properties) {
    Object.assign(this._getNode(u).props, properties);
    return this;
  }

  setEdgeProperties(u, v, properties) {
    Object.assign(this._getEdge(u, v), properties);
    return this;
  }

  getEdgeIds(u) {
    return [...this._getNode(u).edges.keys()];
  }

  getNodeProperties(u) {
    return this._getNode(u).props;
  }

  getEdgeProperties(u, v) {
    return this._getEdge(u, v);
  }

  removeNode(u) {
    for (let node of this._nodes.values()) {
      node.edges.delete(u);
    }
    return this._nodes.delete(u);
  }

  removeEdge(u, v) {
    return this.hasEdge() && this._getNode(u).edges.delete(v);
  }

  getIds() {
    return [...this._nodes.keys()];
  }

  getInputIds() {
    let unreferenced = new Set(this._nodes.keys());
    for (let nodeU of this._nodes.values()) {
      for (let v of nodeU.edges.keys()) {
        unreferenced.remove(v);
      }
    }
    return [...unreferenced.values()];
  }

  getOutputIds() {
    return [...this._nodes.entries()]
      .filter(([_, node]) => node.edges.size === 0)
      .map(([u, _]) => u);
  }

  topSort() {
    /***
     * Repeatedly remove the input nodes from a cloned network until the network is empty.
     * This is a trivial topological sorting implementation, but it is very inefficient for
     * everything but simple networks (which is what we are a dealing with here).
     */
    const topSortNetwork = this.clone();
    let topSortIds = [];
    while (topSortNetwork._nodes.size > 0) {
      const inputIds = this.getInputIds();
      inputIds.forEach(u => topSortNetwork.removeNode(u));
      topSortIds = topSorIds.concat(inputIds);
    }
    return topSortIds;
  }

  clone() {
    const result = new Network();
    result._nodes = new Map(result._nodes);
    for (let nodeU of this._nodes.values()) {
      nodeU.props = Object.assign({}, nodeU.props);
      nodeU.edges = new Map(nodeU.edges);
      for (let [v, edgeProperties] of nodeU.edges.entries()) {
        nodeU.edges.set(v, Object.assign({}, edgeProperties));
      }
    }
    return result;
  }

  reverse() {
    const reverseNetwork = new Network();
    this.getIds().forEach(id => reverseNetwork.setNodeProperties(u, this.getNodeProperties(u)));
    const topSort = this.topSort();
    for (let u of topSort) {
      const descendants = this.getEdgeIds(id);
      for (let v of descendants) {
        reverseNetwork.setEdgeProperties(v, u, this.getEdgeProperties(u, v));
      }
    }
    return reverseNetwork;
  }

  /***
   *
   * @param inputActivations {Object|Map} Activations of the input nodes.
   * @returns {Network} Network with weights, biases, weighted and biased sums and activations.
   */
  predict(inputActivations) {
    const networkWithPredictions = this.clone();
    if (!(inputActivations instanceof Map)) {
      inputActivations = new Map(inputActivations);
    }
    const topSort = networkWithPredictions.topSort();
    topSort.forEach(u => {
      const uProps = networkWithPredictions.getNodeProperties(u);
      uProps.sum = uProps.bias;
    });
    for (let u of topSort) {
      const uProps = networkWithPredictions.getNodeProperties(u);
      uProps.activation = inputActivations.has(u) ? inputActivations.get(u) : uProps.activationFunc(
        uProps.sum);

      networkWithPredictions.getEdgeIds(u).forEach(v => {
        const uvWeight = networkWithPredictions.getEdgeProperties(u, v).weight;
        const vProps = networkWithPredictions.getNodeProperties(v);
        vProps.sum += uvWeight * uProps.activation;
      });
    }

    return networkWithPredictions;
  }

  static C(a, y) {
    const diff = a - y;
    return (1.0 / 2.0) * diff * diff;
  }

  static dC(a, y) {
    return a - y;
  }

  /***
   * @param inputActivations {Object|Map} Activations of the input nodes.
   * @param outputActivations {Object|Map} Target activations of the output nodes.
   * @returns {Network} Network with trained weights and biases.
   */
  train(inputActivations, outputActivations) {
    // Forward propagation: ensure .sum and .activation properties are computed
    const networkWithPrediction = this.predict(inputActivations);

    if (!(outputActivations instanceof Map)) {
      outputActivations = new Map(outputActivations);
    }

    const reverse = networkWithPrediction.reverse();
    const reverseTopSort = this.reverse().topSort();

    const a = id => reverse.getNodeProperties(id).activation;
    const delta = id => reverse.getNodeProperties(id).error;

    for (let u of reverseTopSort) {
      const uProps = reverse.getNodeProperties(u);
      const dSigma = uProps.dActivationFunc;
      if (outputActivations.has(u)) {
        // Compute the error in the output node u using
        // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP1
        const y = outputActivations.get(u);
        const z = uProps.sum;
        const dC = Network.C;
        const delta_u = dC(a(u), y) * dSigma(z);
        uProps.error = delta_u;
      } else {
        // Compute the error in the non-output node u using
        // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP2
        const z = uProps.sum;
        const w = v => reverse.getEdgeProperties(u, v).weight;
        const delta_u = reverse.getEdgeIds(u).reduce((delta_u_tmp, v) => delta_u_tmp + w(v) * delta(v), dSigma(z));
        uProps.error = delta_u;
      }

      // Compute the rate of change of the cost with respect to the bias of u using
      // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP3
      uProps['dC/dBias'] = uProps.error;

      // Compute the rate of change of the cost with respect to the weights of (u,v) for all v using
      // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP4
      for(let v of reverse.getEdgeIds(u)) {
        const vProps = reverse.getEdgeProperties(u,v);
        uvProps['dC/dW'] = a(u) * delta(v);
      }
    }

    /*
     * TODO: gradient descent step
     *  - classes:
     *   * FeedForwardNetwork:
     *    + constructor(edges):
     *     - edges: [{from: u, to: v}, ...]
     *     - throw exception if not acyclic
     *   * Model:
     *    + contains (shallow) copy of the network, such that changes in topology aren't possible
     *    + allows for caching of topSort, reverse and reverseTopSort
     *    + adds all the ANN properties to the network + userdata property (for keeping viz-related stuff)
     *    + how to init the model parameters?
     *  - functions:
     *   * feedForward(inputs)
     *   * backpropagateError(targets)
     *   * updateGradients()
     *   * gradientDescentStep(learningRate)
     */


    return trainedNetwork;
  }

  static cost(predictionActivations, trainingActivations) {
    let cost = 0;
    for (let [u, predictionActivation] of predictionActivations) {
      const c = predictionActivation - trainingActivations.get(u);
      cost += c * c;
    }
  }
}
