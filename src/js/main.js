import Model from './neural-network/model';
import View from './neural-network-mvc/view';
import Controller from './neural-network-mvc/controller';

import { linear, relu } from './neural-network/activation-functions';
import MathExpression from './util/math-expression';

function main() {
  //new LevelController();


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

function rand(min, max) {
  return Math.random() * (max - min) - min;
}

function mainMaxModel() {
  window.Model = Model;
  const createModel = () => {
    const nodes = [
      { id: 'a', properties: { activation: 1 } },
      { id: 'b', properties: { activation: 1 } },
      {
        id: 'h',
        properties: { bias: 1, activationFunc: relu }
      },
      {
        id: 'max(a,b)',
        properties: { bias: 1, activationFunc: linear }
      },
    ];
    const edges = [
      { from: 'a', to: 'h', properties: { weight: 1 } },
      { from: 'b', to: 'h', properties: { weight: 1 } },
      { from: 'h', to: 'max(a,b)', properties: { weight: 1 } },
      { from: 'b', to: 'max(a,b)', properties: { weight: 1 } },
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


  const max = new MathExpression(model, "max(get('a'),b)");

  for (let i = 0; i < 10; ++i) {
    const a = 2 * Math.random() - 1;
    const b = 2 * Math.random() - 1;
    const inputs = [a, b];
    const targets = [max({ a, b })];
    model.train(inputs, targets, 0.1);
    const pred = nodeMaxAB.p.activation;
    console.log(`a=${a}, b=${b}, max(a,b)=${max}, pred(a,b)=${pred}, error=${nodeMaxAB.p.error}, C=${Model.C(
      pred,
      max)}`);
  }

  model.clamp();
  model.feedForward();

  const layout = [
    ['a', 'b'],
    ['h', ''],
    ['max(a,b)']
  ];

  const parent = document.createElement('div');
  parent.style.position = 'absolute';
  parent.style.top = '150px';
  parent.style.left = '100px';
  const oldSvg = document.querySelector('svg');
  oldSvg.parentElement.insertBefore(parent, oldSvg); // TODO: move to pug/CSS
  const view = new View(model, layout, parent);
  const controller = new Controller(model, [max], view);
}

mainMaxModel();
//main();
