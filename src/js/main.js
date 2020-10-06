import { LevelController } from './LevelController';
import Model from './neural-network/Model';
import { linear, relu } from './neural-network/ActivationFunctions';

import * as d3 from 'd3';

function main() {
  new LevelController();


  window.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector("#helpmebutton").onclick = () => {
      document.querySelector(".helper").classList.add("visible");
      document.querySelector(".mission").classList.remove("visible");
      document.querySelector("#helpmebutton").classList.add("selected");
      document.querySelector("#missionbutton").classList.remove("selected");
    };

    document.querySelector("#missionbutton").onclick = () => {
      document.querySelector(".helper").classList.remove("visible");
      document.querySelector(".mission").classList.add("visible");
      document.querySelector("#helpmebutton").classList.remove("selected");
      document.querySelector("#missionbutton").classList.add("selected");
    };
    /* FIXME: There is no #creditsbutton linear, so why is this code here if it breaks anyway?
      document.querySelector("#creditsbutton").onclick = () => {
        document.querySelector(".credits").classList.toggle("visible");
        document.querySelector("#screenoverlay").classList.toggle("visible");
        document.querySelector("#creditsbutton").classList.toggle("selected");
      };
    */
    document.querySelector("#screenoverlay").onclick = () => {
      document.querySelector(".credits").classList.remove("visible");
      document.querySelector("#screenoverlay").classList.remove("visible");
      document.querySelector("#creditsbutton").classList.remove("selected");
    };
  });
}

function mainNegModel() {
  window.Model = Model;
  const nodes = [
    { id: 'a' },
    { id: 'b', properties: { bias: 0.5, activationFunc: linear } },
  ];
  const edges = [
    { from: 'a', to: 'b', properties: { weight: 0.75 } },
  ];
  const model = window.model = new Model(nodes, edges);
  const network = model.network;
  console.log(model);

  for (let i = 0; i < 1000; ++i) {
    const inputs = [Math.random()];
    const targets = inputs.map(i => -i);
    const outputs = model.train(inputs, targets, 0.1).readOutputs();
    console.log(inputs, targets, model.readOutputs(), Model.C(outputs[0], targets[0]));
  }

  console.log(network.getNode('b'));
}

function rand(min, max) {
  return Math.random() * (max - min) - min;
}

function mainMaxModel() {
  window.Model = Model;
  const createModel = () => {
    const nodes = [
      { id: 'a' },
      { id: 'b' },
      {
        id: 'h',
        properties: { bias: rand(-1, 1), activationFunc: relu }
      },
      {
        id: 'max(a,b)',
        properties: { bias: rand(-1, 1), activationFunc: linear }
      },
    ];
    const edges = [
      { from: 'a', to: 'h', properties: { weight: rand(-1, 1) } },
      { from: 'b', to: 'h', properties: { weight: rand(-1, 1) } },
      { from: 'h', to: 'max(a,b)', properties: { weight: rand(-1, 1) } },
      { from: 'b', to: 'max(a,b)', properties: { weight: rand(-1, 1) } },
    ];
    return new Model(nodes, edges);
  };
  const model = window.model = createModel();
  const network = model.network;
  console.log(model);

  const invalidNodeIds = network.nodes
    .filter(node => node.isInput() && node.isOutput())
    .map(node => node.id);
  if (invalidNodeIds.length > 0) {
    throw new Error(`Network must not contain isolated nodes: ${JSON.stringify(invalidNodeIds)}`);
  }

  const nodeMaxAB = network.getNode('max(a,b)');

  for (let i = 0; i < 10; ++i) {
    const a = 2 * Math.random() - 1;
    const b = 2 * Math.random() - 1;
    const max = Math.max(a, b);
    const inputs = [a, b];
    const targets = [max];
    model.train(inputs, targets, 0.1);
    const pred = nodeMaxAB.p.activation;
    console.log(`a=${a}, b=${b}, max(a,b)=${max}, pred(a,b)=${pred}, error=${nodeMaxAB.p.error}, C=${Model.C(
      pred,
      max)}`);
  }

  console.log(network.getNode('max(a,b)'));

  const layout = [
    ['a', 'b'],
    ['h', null],
    ['max(a,b)']
  ];

  const coords = new NodeCoordinates(layout);

  const d3Network = d3.select('svg')
    .append('g');


  const ticked = () => {
    d3SVGNodes
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  };

  const d3Nodes = network.nodes.map(n => ({ networkNode: n }));
  const d3Edges = network.edges.map(e => ({ networkEdge: e }));
  let d3SVGEdges = d3Network.append('g').selectAll('line');
  let d3SVGNodes = d3Network.append('g').selectAll('circle');

  const offset = { x: 100, y: 200 };
  const scale = { x: 200, y: 200 };

  const fillColor = d => {
    const node = d.networkNode;
    if (node.isInput()) {
      return 'red';
    } else if (node.isOutput()) {
      return 'green';
    } else {
      return 'yellow';
    }
  };

  const setNodeAttributes = circles => {
    circles
      .attr('r', 20)
      .attr('cx', d => offset.x + coords.absX(d.networkNode.id) * scale.x)
      .attr('cy', d => offset.y + coords.absY(d.networkNode.id) * scale.y)
      .style('fill', fillColor)
      .style('stroke', 'black');
  };

  const setEdgeAttributes = lines => {
    lines
      .attr('x1', d => offset.x + coords.absX(d.networkEdge.from.id) * scale.x)
      .attr('y1', d => offset.y + coords.absY(d.networkEdge.from.id) * scale.y)
      .attr('x2', d => offset.x + coords.absX(d.networkEdge.to.id) * scale.x)
      .attr('y2', d => offset.y + coords.absY(d.networkEdge.to.id) * scale.y)
      .style('stroke', 'black');
  };

  console.log(d3Nodes, d3Edges);
  d3SVGNodes = d3SVGNodes.data(d3Nodes);
  d3SVGNodes.exit().remove();
  setNodeAttributes(d3SVGNodes.enter().append('circle'));
  setNodeAttributes(d3SVGNodes);

  d3SVGEdges = d3SVGEdges.data(d3Edges);
  d3SVGEdges.exit().remove();
  setEdgeAttributes(d3SVGEdges.enter().append('line'));
  setEdgeAttributes(d3SVGEdges);
}

class NodeCoordinates {
  constructor(layout, options = { alignV: NodeCoordinates.alignVMiddle }) {
    this._width = layout.length - 1;
    this._height = layout.map(layer => layer.length - 1)
      .reduce((cur, acc) => Math.max(cur, acc), -1);
    this._absCoords = {};
    for (let l = 0; l < layout.length; ++l) {
      const layer = layout[l];
      for (let n = 0; n < layer.length; ++n) {
        const nodeId = layer[n];
        this._absCoords[nodeId] = {
          x: l,
          y: options.alignV(n, layer.length - 1, this._height),
        };
      }
    }
    this._coordForUnknownId = { x: 0, y: 0 };
  }

  abs(nodeId) {
    if (this._absCoords.hasOwnProperty(nodeId)) {
      return this._absCoords[nodeId];
    } else {
      return this._coordForUnknownId;
    }
  }

  absX(nodeId) {
    return this.abs(nodeId).x;
  }

  absY(nodeId) {
    return this.abs(nodeId).y;
  }

  rel(nodeId) {
    const { x, y } = this.abs(nodeId);
    return { x: x / (this.width() - 1), y: y / (this.height() - 1) };
  }

  relX(nodeId) {
    return this.rel(nodeId).x;
  }

  relY(nodeId) {
    return this.rel(nodeId).y;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  static alignVTop(layerIndex, layerHeight, maxHeight) {
    return layerIndex;
  }

  static alignVMiddle(layerIndex, layerHeight, maxHeight) {
    return (maxHeight - layerHeight) / 2 + layerIndex;
  }

  static alignVBottom(layerIndex, layerHeight, maxHeight) {
    return (maxHeight - layerHeight) + layerIndex;
  }
}

mainMaxModel();
//main();
