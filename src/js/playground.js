//jshint: "esversion": 8


import {
  Node,
} from './Node.js';

import {
  updateDynamicVariables
} from './DynamicVariable.js';

import {
  InputNode
} from './InputNode.js';

import {
  OutputNode
} from './OutputNode.js';

import {
  Network
} from './Network.js';

import {
  NetworkVisualization
} from './NetworkVisualization.js';



// some toy example

const omega1 = 1 + Math.random();
const omega2 = 1 + Math.random();

const nodes = [
  new InputNode(() => 1 + 0.5 * Math.sin(omega1 * Date.now() / 1000)),
  new InputNode(() => 1 + 0.5 * Math.sin(omega2 * Date.now() / 1000)),

  new Node(),
  new Node(),
  new Node(),

  new OutputNode()
];

//TODO
for (let i in [2, 3, 4]) {
  nodes[[2, 3, 4][i]].bias = -5 + 7 * Math.random();
}
//output from console
nodes[0].x = 112;
nodes[0].y = 190;
nodes[1].x = 129;
nodes[1].y = 405.6588393923159;
nodes[2].x = 359;
nodes[2].y = 105.3718970730273;
nodes[3].x = 476;
nodes[3].y = 288.64480032239464;
nodes[4].x = 382;
nodes[4].y = 516.7279001876828;
nodes[5].x = 663;
nodes[5].y = 297.64302901347446;

nodes[0].addChild(nodes[2], 1);
nodes[0].addChild(nodes[3], 1);
nodes[0].addChild(nodes[4], 1);
nodes[1].addChild(nodes[2], 1);
nodes[1].addChild(nodes[3], 1);
nodes[1].addChild(nodes[4], 1);
nodes[2].addChild(nodes[5], 1);
nodes[3].addChild(nodes[5], 1);
nodes[4].addChild(nodes[5], 1);


const nv = new NetworkVisualization(new Network(
  nodes,
  [nodes[0], nodes[1]],
  [nodes[5]]
));

nv.animate();
nv.addInteraction();
