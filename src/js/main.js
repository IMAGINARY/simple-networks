import { LevelController } from './LevelController';
import Model from './neural-network/Model';
import { id, relu } from './neural-network/ActivationFunctions';

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
    /* FIXME: There is no #creditsbutton id, so why is this code here if it breaks anyway?
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
    { id: 'b', properties: { bias: 0.5, activationFunc: id } },
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
        id: 'l1_1',
        properties: { bias: rand(-1, 1), activationFunc: relu }
      },
      {
        id: 'max(a,b)',
        properties: { bias: rand(-1, 1), activationFunc: id }
      },
    ];
    const edges = [
      { from: 'a', to: 'l1_1', properties: { weight: rand(-1, 1) } },
      { from: 'b', to: 'l1_1', properties: { weight: rand(-1, 1) } },
      { from: 'l1_1', to: 'max(a,b)', properties: { weight: rand(-1, 1) } },
      { from: 'b', to: 'max(a,b)', properties: { weight: rand(-1, 1) } },
    ];
    return new Model(nodes, edges);
  }
  const model = window.model = createModel();
  const network = model.network;
  console.log(model);

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

  const d3Network = d3.select('svg')
    .append('g');


  const ticked = () => {
    d3SVGNodes
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  };

  const d3Nodes = network.nodes.map(n => ({ networkNode: n }));
  const forceX = d3.forceX()
    .x(d => d.networkNode.isInput() ? 0 : (d.networkNode.isOutput() ? 1 : 0.5))
    .strength(d => d.networkNode.isInput() || d.networkNode.isOutput() ? 0.1 : 0);
  const d3Simulation = d3.forceSimulation(d3Nodes)
    .force('charge', d3.forceManyBody().strength(5))
    .force('collision', d3.forceCollide().radius(function (d) {
      return 0.5;
    }))
    .force('x', forceX)
    .on('tick', ticked);

  let d3SVGNodes = d3Network.selectAll('circle');

  console.log(d3Nodes);
  d3SVGNodes = d3SVGNodes.data(d3Nodes);
  d3SVGNodes.exit()
    .remove();
  d3SVGNodes.enter()
    .append('circle')
    .append('circle')
    .attr('r', 10)
    .style('fill', 'red')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y);
}


mainMaxModel();
//main();
