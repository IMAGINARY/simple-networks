//jshint: "esversion": 8

import {
  Edge
} from './Edge.js';

import {
  DynamicVariable,
  updateDynamicVariables
} from './DynamicVariable.js';

export class Node {
  constructor() {
    this.activation = new DynamicVariable(0);
    this.dactivation = new DynamicVariable(0);
    this.bias = 0;
    this.dloss = 0;
    this.dbias = new DynamicVariable(0);
    this.outedges = [];
    this.inedges = [];
    this.adjustable = true;
  }

  addChild(other, weight, reverse = true) {
    const edge = new Edge(this, other, weight);
    this.outedges.push(edge);
    if (reverse) {
      other.inedges.push(edge);
    }
  }

  getActivation() {
    return this.activation.update(() => {
      let activation = this.bias;
      for (let eid in this.inedges) {
        const edge = this.inedges[eid];
        activation += edge.weight * edge.from.getActivation();
      }
      return Math.max(0, activation); //ReLu
    });
  }

  getdActivation() {
    return this.dactivation.update(() => {
      let dactivation = 0;
      for (let eid in this.outedges) {
        const edge = this.outedges[eid];
        if (edge.to.getActivation() > 0 || edge.to.constructor.name == "OutputNode") {
          dactivation += edge.weight * edge.to.getdActivation();
        }
      }
      return dactivation;
    });
  }

  getdBias() {
    return this.dbias.update(() => {
      let dbias = 0;
      if (this.getActivation() > 0) {
        dbias = this.getdActivation();
      }
      return dbias;
    });
  }

  format(v) {
    return v.toFixed(1);
  }
}
