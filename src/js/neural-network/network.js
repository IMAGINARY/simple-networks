import { uniq } from 'lodash';

import { deepFreeze } from '../util/deep-freeze.js';

export default class FeedForwardNetwork {
  /***
   *
   * @param edges [{from, to}]
   */
  constructor(edges = []) {
    const eFromId = e => Node.canonicalizeId(e.from);
    const eToId = e => Node.canonicalizeId(e.to);
    const eId = e => Edge.edgeIdFromNodeIds(e.from, e.to);
    const uniqueNodeIds = uniq(edges.map(e => [eFromId(e), eToId(e)]).flat());
    const uniqueEdgeIds = uniq(edges.map(e => eId(e)));

    this.nodeMap = Object.fromEntries(uniqueNodeIds.map(id => [id, new Node(id)]));
    this.edgeMap = Object.fromEntries(uniqueEdgeIds.map(id => {
      const { from: fromId, to: toId } = Edge.nodeIdsFromEdgeId(id);
      return [id, new Edge(this.nodeMap[fromId], this.nodeMap[toId])];
    }));

    // Precompute often needed arrays
    this.nodes = Object.values(this.nodeMap);
    this.edges = Object.values(this.edgeMap);

    this.inputNodes = this.nodes.filter(n => n.isInput());
    this.innerNodes = this.nodes.filter(n => n.isInner());
    this.outputNodes = this.nodes.filter(n => n.isOutput());

    this.topSort = topSort(this);
    this.topSortNoInputs = this.topSort.filter(n => n.in.length > 0);
    this.reverseTopSort = reverseTopSort(this);
    this.reverseTopSortNoOutputs = this.reverseTopSort.filter(n => n.out.length > 0);

    // Precompute the id version of the the arrays above
    const toIds = FeedForwardNetwork.toIdArray;
    this.nodeIds = toIds(this.nodes);
    this.edgeIds = toIds(this.edges);
    this.ids = [...this.nodeIds, ...this.edgeIds];
    this.ids.forEach((id, i) => {
      if (this.ids.lastIndexOf(id) !== i) {
        throw new Error(`Id ${id} is used for node and edge simultaneously.`);
      }
    });

    this.inputNodeIds = toIds(this.inputNodes);
    this.innerNodeIds = toIds(this.innerNodes);
    this.outputNodeIds = toIds(this.outputNodes);

    this.topSortIds = toIds(this.topSort);
    this.topSortNoInputsIds = toIds(this.topSortNoInputs);
    this.reverseTopSortIds = toIds(this.reverseTopSort);
    this.reverseTopSortNoOutputsIds = toIds(this.reverseTopSortNoOutputs);
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

  static toIdArray(mixed) {
    if (typeof mixed === 'undefined') {
      return [];
    } else {
      const array = Array.isArray(mixed) ? mixed.flat(Number.MAX_SAFE_INTEGER) : [mixed];
      return array.map(nodeOrEdgeOrId => {
        if (typeof nodeOrEdgeOrId === 'string') {
          return nodeOrEdgeOrId;
        } else if (nodeOrEdgeOrId instanceof Node || nodeOrEdgeOrId instanceof Edge) {
          return nodeOrEdgeOrId.id;
        } else {
          throw new Error(`Neither an id nor a node or edge: ${nodeOrEdgeOrId}`);
        }
      });
    }
  }

  static matchArray(arrayWithNodesAndOrEdges, objWithIdKeys) {
    return arrayWithNodesAndOrEdges.map(nodeOrEdge => objWithIdKeys[nodeOrEdge.id]);
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

  getEdge(fromIdOrEdgeId, toId) {
    const edgeId = typeof toId === 'undefined' ?
      fromIdOrEdgeId :
      Edge.edgeIdFromNodeIds(fromIdOrEdgeId, toId);
    return this.edgeMap[edgeId];
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

  static canonicalizeId(id) {
    return id.trim();
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
}

class Edge {
  constructor(from, to, properties) {
    this.id = Edge.edgeIdFromNodeIds(from.id, to.id);
    this.from = from;
    this.to = to;
    this.from.out.push(this);
    this.to.in.push(this);
    this.p = properties;
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

export { FeedForwardNetwork };
