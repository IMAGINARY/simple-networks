import { deepFreeze } from '../util/deep-freeze.js';

export default class FeedForwardNetwork {
  /***
   *
   * @param nodes [{id, properties}]
   * @param edges [{from, to, properties}]
   */
  constructor(nodes = [], edges = []) {
    const eId = e => Edge.edgeIdFromNodeIds(e.from, e.to);
    const uniqueNodes = Object.fromEntries(nodes.map(n => [n.id, n]));
    const uniqueEdges = Object.fromEntries(edges.map(e => [eId(e), e]));

    this.nodeMap = Object.fromEntries(
      Object.entries(uniqueNodes).map(([id, n]) => [id, new Node(n.id, n.properties)])
    );
    this.edgeMap = Object.fromEntries(
      Object.entries(uniqueEdges).map(([id, e]) => [id, new Edge(
        this.nodeMap[e.from],
        this.nodeMap[e.to],
        e.properties
      )])
    );

    this.nodes = Object.values(this.nodeMap);
    this.edges = Object.values(this.edgeMap);

    this.inputNodes = this.nodes.filter(n => n.in.length === 0);
    this.outputNodes = this.nodes.filter(n => n.out.length === 0);

    this.topSort = topSort(this);
    this.topSortNoInputs = this.topSort.filter(n => n.in.length > 0);
    this.reverseTopSort = reverseTopSort(this);
    this.reverseTopSortNoOutputs = this.reverseTopSort.filter(n => n.out.length > 0);


    // Freeze the network to prevent external changes of nodes and edges that would render
    // the network representation inconsistent.
    deepFreeze(this, 2);
    this.nodes.forEach(n => n._freeze());
    this.edges.forEach(e => e._freeze());
  }

  hasNode(id) {
    return typeof this.getNode(id) === 'undefined';
  }

  getNode(id) {
    return this.nodes.find(n => n.id === id);
  }

  hasEdge(fromId, toId) {
    return typeof this.getEdge(fromId, toId) !== 'undefined';
  }

  getEdge(fromId, toId) {
    return this.edgeMap[Edge.edgeIdFromNodeIds(fromId, toId)];
  }
}

class Node {
  constructor(id, properties) {
    this.in = [];
    this.out = [];
    this.id = id;
    this.p = Object.assign({}, properties);
  }

  isInput() {
    return this.in.length === 0;
  }

  isOutput() {
    return this.out.length === 0;
  }

  isInner() {
    return !this.isInput() && !this.isOutput();
  }

  _freeze() {
    Object.freeze(this);
    Object.freeze(this.in);
    Object.freeze(this.out);
  }
}

class Edge {
  constructor(from, to, properties) {
    this.id = Edge.edgeIdFromNodeIds(from.id, to.id);
    this.from = from;
    this.to = to;
    this.from.out.push(this);
    this.to.in.push(this);
    this.p = Object.assign({}, properties);
  }

  _freeze() {
    Object.freeze(this);
  }

  static edgeIdFromNodeIds(fromId, toId) {
    return `(${fromId})->(${toId})`;
  }
}

function _topSort(network, reverse) {
  const edgesIn = reverse ? node => node.out : node => node.in;
  const edgesOut = reverse ? node => node.in : node => node.out;
  const edgeTo = reverse ? edge => edge.from : edge => edge.to;
  const inDegrees = network.nodes.map(n => ({ id: n.id, degree: edgesIn(n).length }));
  const inDegreeMap = Object.fromEntries(inDegrees.map(i => [i.id, i]));
  const topSort = [];
  while (inDegrees.length > 0) {
    inDegrees.sort((n1, n2) => n1.degree - n2.degree);
    const head = inDegrees.shift();
    if (head.degree > 0) {
      throw new Error(`Network has a circle through node ${head.id}`);
    } else {
      const headNode = network.getNode(head.id);
      edgesOut(headNode).forEach(edge => --(inDegreeMap[edgeTo(edge).id]).degree);
      topSort.push(headNode);
    }
  }
  return topSort;
}

function topSort(network) {
  return _topSort(network, false);
}

function reverseTopSort(network) {
  return _topSort(network, true);
}
