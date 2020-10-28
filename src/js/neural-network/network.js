import { deepFreeze } from '../util/deep-freeze.js';

export default class FeedForwardNetwork {
  /***
   *
   * @param nodes [{linear, properties}]
   * @param edges [{from, to, properties}]
   */
  constructor(nodes = [], edges = []) {
    const nId = n => Node.canonicalizeId(n.id);
    const eId = e => Edge.edgeIdFromNodeIds(e.from, e.to);
    const uniqueNodes = Object.fromEntries(nodes.map(n => [nId(n), n]));
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

    this.inputNodes = this.nodes.filter(n => n.isInput());
    this.innerNodes = this.nodes.filter(n => n.isInner());
    this.outputNodes = this.nodes.filter(n => n.isOutput());

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
    return typeof this.getNode(id) !== 'undefined';
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

  static canonicalizeNodeId(id) {
    return Node.canonicalizeId(id);
  }

  static canonicalizeEdgeId(edgeId) {
    return Edge.canonicalizeId(edgeId);
  }

  static edgeIdFromNodeIds(fromId, toId) {
    return Edge.edgeIdFromNodeIds(fromId, toId);
  }

  static nodeIdsFromEdgeId(edgeId) {
    return Edge.nodeIdsFromEdgeId(edgeId);
  }

  toNodeArray(mixed) {
    if (typeof mixed === 'undefined') {
      return [];
    } else {
      const array = Array.isArray(mixed) ? mixed.flat(Number.MAX_SAFE_INTEGER) : [mixed];
      return array.map(nodeOrId => {
        if (typeof nodeOrId === 'string') {
          return this.getNode(nodeOrId);
        } else if (nodeOrId instanceof Node) {
          return nodeOrId;
        } else {
          throw new Error(`Not a node or node id: ${nodeOrId}`);
        }
      });
    }
  }

  toEdgeArray(mixed) {
    if (typeof mixed === 'undefined') {
      return [];
    } else {
      const array = Array.isArray(mixed) ? mixed.flat(Number.MAX_SAFE_INTEGER) : [mixed];
      return array.map(edgeOrId => {
        if (typeof edgeOrId === 'string') {
          return this.getEdge(edgeOrId);
        } else if (edgeOrId instanceof Edge) {
          return edgeOrId;
        } else {
          throw new Error(`Not an edge or edge id: ${edgeOrId}`);
        }
      });
    }
  }
}

class Node {
  constructor(id, properties) {
    this.in = [];
    this.out = [];
    this.id = Node.canonicalizeId(id);
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

  static canonicalizeId(id) {
    return id.trim();
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
    fromId = Node.canonicalizeId(fromId);
    toId = Node.canonicalizeId(toId);
    let separator = ' -> ';
    while (fromId.includes(separator) || toId.includes(separator)) {
      separator = ` ${separator} `;
    }
    return `${fromId}${separator}${toId}`;
  }

  static nodeIdsFromEdgeId(edgeId) {
    let separator = ' -> ';
    let parts;
    while ((parts = edgeId.split(separator)).length > 2) {
      separator = ` ${separator} `;
    }
    if (parts.length === 2) {
      return {
        from: Node.canonicalizeId(parts[0]),
        to: Node.canonicalizeId(parts[1]),
      };
    } else {
      // https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form
      const edgeEBNF = 'edgeId = nodeId arrow nodeId ; arrow  = " " arrow " " | " -> " ;';
      throw new Error(`Invalid edge id format: ${edgeId} does not match the EBNF: ${edgeEBNF}`);
    }
  }

  static canonicalizeId(edgeId) {
    const { from, to } = Edge.nodeIdsFromEdgeId(edgeId);
    return Edge.edgeIdFromNodeIds(from, to);
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
