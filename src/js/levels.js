//jshint: "esversion": 8
import * as d3 from 'd3';

import {
  Node,
} from './Node.js';

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
  Level
} from './Level.js';

import {
  unit,
  noderadius
} from './constants.js';


const addnodeinfo = (node, text, offset = noderadius + 30) => {
  d3.select("#levelinfo").append("text")
    .text(text)
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .attr("font-size", 20)
    .attr("x", node.x)
    .attr("y", node.y + offset);
};


export class TutorialLevelA extends Level {
  constructor() {
    const omega1 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.1 * (Date.now() - this.t0) / 1000)),
      new OutputNode()
    ];
    nodes[0].x = 200;
    nodes[0].y = 500;
    nodes[0].allownegative = true;
    nodes[1].x = 800;
    nodes[1].y = 550;
    nodes[0].addChild(nodes[1], 1);

    const f = c => ((c * 2));
    const trainXs = [1, 2, 3];
    const trainYs = trainXs.map(f);

    super("Verdopple den Input!",
      new Network(
        nodes,
        [nodes[0]], //input nodes
        [nodes[1]] //output nodes
      ),
      ["input"], trainXs.map(x => [x]), //temperatures are internally divided by 10.
      ["desired output"], trainYs.map(x => [x]),
      "Stelle in diesem einfachen Netz das Gewicht so ein, dass sich der Input verdoppelt, d.h. der Output soll den doppelten Inputwert ergeben (siehe Zielwert). Wenn du es geschafft hast, schalte mit dem Pfeil unten rechts weiter zum nächsten Level! "
    );

    this.animatestep = function() {
      nodes[1].target = f(nodes[0].getActivation());
    };

    this.onenter = function() {
      addnodeinfo(nodes[0], "Verändere hier den Inputwert!");
      addnodeinfo(nodes[1], "Der Output");

      d3.select("#levelinfo").append("text")
        .text("Der Multiplikationsfaktor (das “Gewicht”)")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .attr("font-size", 20)
        .attr("x", (nodes[0].x + nodes[1].x) / 2)
        .attr("y", (nodes[0].y + nodes[1].y) / 2 - 100);

      document.querySelector(".trainingdata").classList.remove("visible");
    };

    this.onleave = function() {
      document.querySelector(".trainingdata").classList.add("visible");
    };
  }
}

export class TutorialLevelB extends Level {
  constructor() {
    const omega1 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 0.5 + 2 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.1 * (Date.now() - this.t0) / 1000)),
      new Node(),
      new OutputNode()
    ];
    nodes[0].allownegative = true;
    nodes[0].x = 200;
    nodes[0].y = 500;
    nodes[1].x = 500;
    nodes[1].y = 550;
    nodes[1].adjustable = false;

    nodes[2].x = 800;
    nodes[2].y = 500;
    nodes[0].addChild(nodes[1], -2);
    nodes[1].addChild(nodes[2], 1);
    nodes[1].outedges[0].adjustable = false;

    const f = c => Math.max(0, (c * 1));
    const trainXs = [-2, -1, 0, 1, 2, 3];
    const trainYs = trainXs.map(f);

    super("Lass nur positive Werte durch das Netz!",
      new Network(
        nodes,
        [nodes[0]], //input nodes
        [nodes[2]] //output nodes
      ),
      ["Input"], trainXs.map(x => [x]), //temperatures are internally divided by 10.
      ["Output"], trainYs.map(x => [x]),
      "Kannst du das Netz so einstellen, dass es positive Inputs oder 0 ausgibt, wenn sein Input negativ ist? Es soll die Daten der Trainingstabelle unten voraussagen."
    );


    this.animatestep = function() {
      nodes[2].target = f(nodes[0].getActivation());
    };

    this.onenter = function() {
      addnodeinfo(nodes[1], `Die mittleren Neuronen ignoriert negative Inputs.`);
    };

  }
}

export class TutorialLevelC extends Level {
  constructor() {
    const omega1 = 1 + Math.random();

    const nodes = [
      new InputNode(() => -0.2 + 1 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.1 * (Date.now() - this.t0) / 1000)),
      new Node(),
      new OutputNode()
    ];
    nodes[0].allownegative = true;
    nodes[0].x = 200;
    nodes[0].y = 500;
    nodes[1].x = 500;
    nodes[1].y = 550;
    nodes[1].adjustable = true;
    nodes[2].x = 800;
    nodes[2].y = 500;
    nodes[0].addChild(nodes[1], 1);
    nodes[1].addChild(nodes[2], 1);

    nodes[0].outedges[0].adjustable = false;
    nodes[1].outedges[0].adjustable = false;

    nodes[1].bias = 1;

    const f = c => Math.max(0, (c - 1));
    const trainXs = [-2, -1, 0, 1, 2, 3];
    const trainYs = trainXs.map(f);

    super("Ein Neuron mit Bias!",
      new Network(
        nodes,
        [nodes[0]], //input nodes
        [nodes[2]] //output nodes
      ),
      ["Input"], trainXs.map(x => [x]), //temperatures are internally divided by 10.
      ["Output"], trainYs.map(x => [x]),
      "Kannst du die Parameter des Netzes so einstellen, dass der Output um 1.0 größer ist als der Input? Sollte der Input allerdings kleiner als 1 sein, soll der Output 0 ergeben."
    );


    this.animatestep = function() {
      nodes[2].target = f(nodes[0].getActivation());
    };

    this.onenter = function() {
      addnodeinfo(nodes[1], `Am Input des mittleren Neurons befindet sich nun ein einstellbarer Bias.`);
    };


  }
}

export class WeatherLevel extends Level {
  constructor() {
    const omega1 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new InputNode(() => 1),

      new Node(),
      new Node(),

      new OutputNode()
    ];

    for (let i in [2, 3]) {
      nodes[[2, 3][i]].bias = 2 * (Math.random() - 0.5);
    }

    //output from console
    nodes[0].x = 200;
    nodes[0].y = 400;
    nodes[1].x = 200;
    nodes[1].y = 600;
    nodes[2].x = 509;
    nodes[2].y = 300;
    nodes[3].x = 500;
    nodes[3].y = 700;
    nodes[4].x = 800;
    nodes[4].y = 500;

    nodes[0].addChild(nodes[2], 1);
    nodes[0].addChild(nodes[3], 1);
    nodes[1].addChild(nodes[2], 1);
    nodes[1].addChild(nodes[3], 1);
    nodes[2].addChild(nodes[4], 1);
    nodes[3].addChild(nodes[4], 1);

    const nw = new Network(
      nodes,
      [nodes[0], nodes[1]], //input nodes
      [nodes[4]] //output nodes
    );

    const trainingdata = [{
        cloudiness: 0,
        inside: 0,
      },
      {
        cloudiness: 0.5,
        inside: 0,
      },
      {
        cloudiness: 1,
        inside: 0,
      },
      {
        cloudiness: 1,
        inside: 1,
      },
      {
        cloudiness: 0.5,
        inside: 1,
      },
      {
        cloudiness: 0,
        inside: 1,
      }
    ];
    const formula = (c, i) => (i == 1) ? (2.1 - 0.1 * c) : (2.5 - 1.2 * c);

    //nodes[0].format = cls => `cloudiness: ${cls.toFixed(1)}`;
    //nodes[1].format = v => Math.round(v) == 1 ? '1 (inside)' : '0 (outside)';
    nodes[1].format = v => v.toFixed(0);
    nodes[4].format = temp => `${(temp*10).toFixed(0)}°C`;
    super("Einfache Wettervorhersage im Innenraum und draußen!", nw,
      ["Bewölkung", "Innenraum"], trainingdata.map(td => [td.cloudiness, td.inside]),
      ["Temperatur"], trainingdata.map(td => [formula(td.cloudiness, td.inside)]),
      "Draußen (d.h. Innenraum-Wert = 0) hängt die Temperatur davon ab, wie bewölkt es ist: Je bewölkter der Himmel ist, desto niedriger die Temperatur. In Innenräumen (d.h. Innenraum-Wert = 1) ist die Temperatur fast immer 20°C."
    );

    this.animatestep = function() {
      //TODO add some nicer visualization for inside, cloudiness, and temperature.

      nodes[0].setUserParameter(Math.min(1, Math.max(0, (nodes[0].getActivation()))));
      //round input
      nodes[1].setUserParameter(Math.min(1, Math.max(0, Math.round(nodes[1].getActivation()))));

      nodes[4].target = formula(nodes[0].getActivation(), nodes[1].getActivation());
    };

    this.onenter = function() {
      addnodeinfo(nodes[0], `Bewölkung`, -noderadius - 20);
      addnodeinfo(nodes[1], `drinnen/draußen`);
      addnodeinfo(nodes[4], `vorhergesagte Temperatur`);
    };
  }

}


export class FahrenheitLevel extends Level {
  constructor() {
    const omega1 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new Node(), //TODO: No ReLu Nodes here!
      new OutputNode()
    ];

    for (let i in [1]) {
      nodes[[1][i]].bias = 1 + 2 * (Math.random());
    }

    nodes[0].x = 200;
    nodes[0].y = 500;
    nodes[0].allownegative = false;
    nodes[1].x = 500;
    nodes[1].y = 550;
    nodes[2].x = 800;
    nodes[2].y = 500;

    nodes[0].addChild(nodes[1], 1);
    nodes[1].addChild(nodes[2], 1);
    nodes[1].outedges[0].adjustable = false;

    const c2f = c => ((c * 1.8) + 32);
    const trainXs = [0, 10, 20, 30];
    const trainYs = trainXs.map(c2f);

    nodes[0].format = temp => `${(temp*10).toFixed(0)}°C`;
    nodes[1].format = temp => `${(temp*10).toFixed(0)}`;
    nodes[2].format = temp => `${(temp*10).toFixed(0)}°F`;
    super("Wandle Celsius in Fahrenheit um!",
      new Network(
        nodes,
        [nodes[0]], //input nodes
        [nodes[2]] //output nodes
      ),
      ["Celsius"], trainXs.map(v => [v / 10]), //temperatures are internally divided by 10.
      ["Fahrenheit"], trainYs.map(v => [v / 10]),
      "Ein positiver Temperatur-Wert in Grad Celsius (links, gelber Regler) soll in einen Wert in Grad Fahrenheit umgewandelt werden. Stell die Parameter (blaue und weiße Regler) des Netzes so ein, dass der Output dem Zielwert jeden Inputs entspricht. In der Tabelle unten kannst du die korrekten Werte ablesen."
    );
    this.animatestep = function() {
      nodes[2].target = c2f(nodes[0].getActivation() * 10) / 10;
    };

  }
}


export class SumLevel extends Level {
  constructor() {
    const omega1 = 1 + Math.random();
    const omega2 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega2 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new OutputNode()
    ];

    nodes[2].bias = 0;

    nodes[0].x = 200;
    nodes[0].y = 300;
    nodes[0].allownegative = true;
    nodes[1].x = 200;
    nodes[1].y = 700;
    nodes[1].allownegative = true;

    nodes[2].x = 800;
    nodes[2].y = 500;

    nodes[0].addChild(nodes[2], 1);
    nodes[1].addChild(nodes[2], -1);


    const c2f = c => ((c * 1.8) + 32);
    const trainXs = [
      [0, 0],
      [0, 1],
      [2, 1],
      [3, 1],
      [4, 2],
      [0, 2]
    ];
    const trainYs = trainXs.map(p => [p[0] + p[1]]);

    super("Die beiden Input-Werte summieren!",
      new Network(
        nodes,
        [nodes[0], nodes[1]], //input nodes
        [nodes[2]] //output nodes
      ),
      ["Summand 1", "Summand 2"], trainXs, //temperatures are internally divided by 10.
      ["Summe"], trainYs,
      "Stell die Parameter des Netzes so ein, dass der Output (rechts) die Summe beider Inputs ergibt. Die Voraussagen des Netzes müssen möglichst den Werten der Trainingsdaten entsprechen, die du in der Tabelle unten siehst."
    );
    this.animatestep = function() {
      nodes[2].target = (nodes[0].getActivation()) + (nodes[1].getActivation());
    };

  }
}


export class AndLevel extends Level {
  constructor() {
    const omega1 = 1 + Math.random();
    const omega2 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 1),
      new InputNode(() => 1),

      new Node(),

      new OutputNode()
    ];

    for (let i in [2]) {
      nodes[[2][i]].bias = 2 * (Math.random());
    }


    nodes[0].x = 200;
    nodes[0].y = 350;
    nodes[1].x = 200;
    nodes[1].y = 650;
    nodes[2].x = 500;
    nodes[2].y = 500;

    nodes[3].x = 800;
    nodes[3].y = 500;

    nodes[0].addChild(nodes[2], 1);
    //nodes[0].addChild(nodes[3], 1);
    nodes[1].addChild(nodes[2], -0.2);


    nodes[2].addChild(nodes[3], 1);
    //nodes[1].addChild(nodes[3], 1);

    const nw = new Network(
      nodes,
      [nodes[0], nodes[1]], //input nodes
      [nodes[3]] //output nodes
    );
    const trainXs = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1]
    ];
    const trainYs = trainXs.map(p => [(p[0] * p[1])]);

    super("Sind beide Inputs auf 1 gestellt?",
      nw,
      ["Bit 1", "Bit 2"], trainXs, //temperatures are internally divided by 10.
      ["AND"], trainYs,
      "Die Input-Werte des Netzes sind entweder 0 oder 1. Der Output-Wert rechts darf nur 1 sein, wenn beide Input-Werte 1 sind. Anderfalls muss er 0 sein."
    );
    this.animatestep = function() {
      nodes[0].format = v => Math.round(v);
      nodes[1].format = v => Math.round(v);
      nodes[0].setUserParameter(Math.min(1, Math.max(0, Math.round(nodes[0].getActivation()))));
      nodes[1].setUserParameter(Math.min(1, Math.max(0, Math.round(nodes[1].getActivation()))));

      nodes[3].target = (nodes[0].getActivation() * nodes[1].getActivation());
    };

  }
}

export class MaxLevel extends Level {
  constructor() {
    const omega1 = 1 + Math.random();
    const omega2 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 1.5 + 1 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new InputNode(() => 1 + 1 * Math.sin(omega2 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),

      new Node(),

      new OutputNode()
    ];

    for (let i in [2]) {
      nodes[[2][i]].bias = 2 * (Math.random() - 0.5);
    }


    nodes[0].x = 200;
    nodes[0].y = 350;
    nodes[1].x = 200;
    nodes[1].y = 650;
    nodes[2].x = 500;
    nodes[2].y = 400;

    nodes[3].x = 800;
    nodes[3].y = 500;

    nodes[0].addChild(nodes[2], 1);
    //nodes[0].addChild(nodes[3], 1);
    nodes[1].addChild(nodes[2], -0.2);


    nodes[2].addChild(nodes[3], 1);
    nodes[1].addChild(nodes[3], 1);

    const nw = new Network(
      nodes,
      [nodes[0], nodes[1]], //input nodes
      [nodes[3]] //output nodes
    );
    const trainXs = [0, 0, 0, 0, 0, 0, 0].map(v => [Math.random(), Math.random()]);
    const trainYs = trainXs.map(p => [Math.max(p[0], p[1])]);

    super("Das Maximum der Input-Werte!",
      nw,
      ["Input 1", "Input 2"], trainXs, //temperatures are internally divided by 10.
      ["Maximum"], trainYs,
      "Der Output rechts soll dem Maximalwert des Inputs entsprechen. Tipp: max(a, b) = max(0, a-b)+b. Denk daran, dass das mittlere Neuron negative Werte ignoriert."
    );
    this.animatestep = function() {
      nodes[3].target = Math.max(nodes[0].getActivation(), nodes[1].getActivation());
    };

  }
}



export class XorLevel extends Level {
  constructor() {
    const omega1 = 1 + Math.random();
    const omega2 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega2 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),

      new Node(),
      new Node(),
      new Node(),

      new OutputNode()
    ];

    for (let i in [2, 3, 4]) {
      nodes[[2, 3, 4][i]].bias = 2 * (Math.random() - 0.5);
    }


    nodes[0].x = 200;
    nodes[0].y = 400;
    nodes[1].x = 200;
    nodes[1].y = 600;
    nodes[2].x = 500;
    nodes[2].y = 300;
    nodes[3].x = 500;
    nodes[3].y = 500;
    nodes[4].x = 500;
    nodes[4].y = 700;
    nodes[5].x = 800;
    nodes[5].y = 500;

    nodes[0].addChild(nodes[2], 1);
    nodes[0].addChild(nodes[3], 1);
    nodes[0].addChild(nodes[4], 1);
    nodes[1].addChild(nodes[2], 1);
    nodes[1].addChild(nodes[3], 1);
    nodes[1].addChild(nodes[4], 1);

    nodes[2].addChild(nodes[5], 1);
    nodes[3].addChild(nodes[5], 1);
    nodes[4].addChild(nodes[5], 1);

    const nw = new Network(
      nodes,
      [nodes[0], nodes[1]], //input nodes
      [nodes[5]] //output nodes
    );
    const trainXs = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1]
    ];
    const trainYs = [
      [0],
      [1],
      [1],
      [0]
    ];

    super("Berechne das XOR der Input-Werte!",
      nw,
      ["Bit 1", "Bit 2"], trainXs, //temperatures are internally divided by 10.
      ["XOR"], trainYs,
      "Nehmen wir an, dass das Netz nur 0 oder 1 als Input-Werte akzeptiert. Der Output-Wert des Netzes soll 1 sein, wenn nur ein einzelnes Input auf 1 gestellt ist. Andernfalls (wenn also beide Inputs 1 sind) muss der Output 0 sein."
    );
    this.animatestep = function() {
      //round input
      nodes[0].format = v => Math.round(v);
      nodes[1].format = v => Math.round(v);
      nodes[0].setUserParameter(Math.min(1, Math.max(0, Math.round(nodes[0].getActivation()))));
      nodes[1].setUserParameter(Math.min(1, Math.max(0, Math.round(nodes[1].getActivation()))));
      nodes[5].target = ((nodes[0].getActivation() + nodes[1].getActivation()) | 0) % 2;
    };

  }
}


export class AvgLevel extends Level {
  constructor() {
    const omega1 = 1 + Math.random();
    const omega2 = 1 + Math.random();
    const omega3 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega2 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega2 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),

      //new Node(),

      new OutputNode()
    ];


    //output from console
    nodes[0].x = 200;
    nodes[0].y = 300;
    nodes[0].allownegative = true;
    nodes[1].x = 200;
    nodes[1].y = 500;
    nodes[1].allownegative = true;
    nodes[2].x = 200;
    nodes[2].y = 700;
    nodes[2].allownegative = true;

    nodes[3].x = 800;
    nodes[3].y = 500;
    //nodes[4].x = 800;
    //nodes[4].y = 500;

    nodes[0].addChild(nodes[3], 1);
    nodes[1].addChild(nodes[3], 1);
    nodes[2].addChild(nodes[3], 1);
    //nodes[3].addChild(nodes[4], 1);

    const nw = new Network(
      nodes,
      [nodes[0], nodes[1], nodes[2]], //input nodes
      [nodes[3]] //output nodes
    );
    const trainXs = [0, 0, 0, 0, 0, 0, 0].map(v => [Math.random(), Math.random(), Math.random()]);
    const trainYs = trainXs.map(p => [(p[0] + p[1] + p[2]) / 3]);

    super("Berechne den Durchschnitt der Input-Werte!",
      nw,
      ["Nummer 1", "Nummer 2", "Nummer 3"], trainXs, //temperatures are internally divided by 10.
      ["Durchschnitt"], trainYs,
      "Es gibt drei Inputs. Kannst du die Gewichte so einstellen, dass der Output der Durchschnitt der Input-Werte ist? Insbesondere für die Werte in der Tabelle unten soll das Netz korrekte Outputs produzieren."
    );
    this.animatestep = function() {
      nodes[3].target = (nodes[0].getActivation() + nodes[1].getActivation() + nodes[2].getActivation()) / 3;
    };

  }
}
