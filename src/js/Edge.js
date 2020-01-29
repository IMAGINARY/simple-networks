import {
  unit,
  parameterths
} from './constants.js';

//jshint: "esversion": 8

import {
  DynamicVariable
} from './DynamicVariable.js';

//one-dimensional De Casteljau to clip Bezier curves
const casteljau1d = (p, alpha) => {
  const q = [(1 - alpha) * p[0] + alpha * p[1], (1 - alpha) * p[1] + alpha * p[2], (1 - alpha) * p[2] + alpha * p[3]];
  const r = [(1 - alpha) * q[0] + alpha * q[1], (1 - alpha) * q[1] + alpha * q[2]];
  const s = [(1 - alpha) * r[0] + alpha * r[1]];
  return [
    [p[0], q[0], r[0], s[0]],
    [s[0], r[1], q[2], p[3]]
  ];
};


const casteljau2d = (p, alpha) => {
  const x = casteljau1d(p.map(c => c[0]), alpha);
  const y = casteljau1d(p.map(c => c[1]), alpha);

  return [
    [
      [x[0][0], y[0][0]],
      [x[0][1], y[0][1]],
      [x[0][2], y[0][2]],
      [x[0][3], y[0][3]]
    ],
    [
      [x[1][0], y[1][0]],
      [x[1][1], y[1][1]],
      [x[1][2], y[1][2]],
      [x[1][3], y[1][3]]
    ]
  ];
};


export class Edge {
  constructor(from, to, weight) {
    this.from = from;
    this.to = to;
    this.weight = weight;
    this.dloss = 0;
    this.dweight = new DynamicVariable();

    this.multvis0 = 1 / 3;
    this.multvis1 = 2 / 3;
  }

  bezier() {
    const edge = this;
    return [
      [
        edge.from.x,
        edge.from.y
      ],
      [
        (edge.from.x + edge.to.x) / 2,
        edge.from.y
      ],
      [
        (edge.from.x + edge.to.x) / 2,
        edge.to.y - unit * (edge.offset)
      ],
      [
        edge.to.x,
        edge.to.y - unit * (edge.offset)
      ]
    ];
  }


  generateActivatedCubicBezierSplines(sactivation) {
    const b = this.bezier();
    const c0 = casteljau2d(b, this.multvis0);
    const c1 = casteljau2d(c0[1], (this.multvis1 - this.multvis0) / (1 - this.multvis0));
    return [c0[0], c1[0], c1[1]];
  }

  generateActivatedPath(sactivation, a1, a2) {
    const eactivation = sactivation * this.weight;
    let p1, p2, p3;
    [p1, p2, p3] = this.generateActivatedCubicBezierSplines(sactivation);
    //p.lineTo(edge.to.x, edge.to.y);
    const p = d3.path();
    p.moveTo(p1[0][0], p1[0][1] - unit * sactivation);
    p.bezierCurveTo(p1[1][0], p1[1][1] - unit * sactivation, p1[2][0], p1[2][1] - unit * sactivation, p1[3][0], p1[3][1] - unit * sactivation);
    p.bezierCurveTo(p2[1][0], p2[1][1] - unit * sactivation, p2[2][0], p2[2][1] - unit * eactivation, p2[3][0], p2[3][1] - unit * eactivation);
    p.bezierCurveTo(p3[1][0], p3[1][1] - unit * eactivation, p3[2][0], p3[2][1] - unit * eactivation, p3[3][0], p3[3][1] - unit * eactivation);

    return p;
  }

  generateActivatedPathMiddle(sactivation) {
    const eactivation = sactivation * this.weight;
    const p2 = this.generateActivatedCubicBezierSplines(sactivation)[1];
    //p.lineTo(edge.to.x, edge.to.y);
    const p = d3.path();
    p.moveTo(p2[0][0], p2[0][1] - unit * sactivation);
    p.bezierCurveTo(p2[1][0], p2[1][1] - unit * sactivation, p2[2][0], p2[2][1] - unit * eactivation, p2[3][0], p2[3][1] - unit * eactivation);
    return p;
  }


  normalizedParameterPosition() {
    const edge = this;
    return [(edge.from.x + edge.to.x) / 2, edge.firstHalfBezier()[3][1] - unit * edge.weight];
  }

  parameterPosition() {
    let sactivation = this.from.getActivation();
    if (Math.abs(sactivation) < parameterths) sactivation = (this.from.getActivation() < 0 ? -1 : 1) * parameterths;
    const p2 = this.generateActivatedCubicBezierSplines(sactivation)[1];
    const eactivation = sactivation * this.weight;
    return [p2[3][0], p2[3][1] - unit * eactivation];
  }

  getdWeight() {
    return this.dweight.update(() => {
      let dactivation = 0;
      if (this.to.getActivation() > 0 || this.to.constructor.name == "OutputNode") {
        dactivation += this.from.getActivation() * this.to.getdActivation();
      }
      return dactivation;
    });
  }

  backup() {
    this.backupWeight = this.weight;
  }

  restore() {
    this.weight = this.backupWeight;
  }
}
