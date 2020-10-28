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
    this.dactivation = new DynamicVariable(0);
    this.sum = new DynamicVariable(0);
    this.bias = 0;
    this.dloss = 0;
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

  computeSum() {
    return this.sum.update(() => {
      let activation = this.bias;
      for (let eid in this.inedges) {
        const edge = this.inedges[eid];
        activation += edge.weight * edge.from.getActivation();
      }
      return activation;
    });
  }

  getActivation() {
    return Math.max(0, this.computeSum()); //ReLu
  }


  active() {
    return this.computeSum() >= 0;
  }

  getdActivation() {
    return this.dactivation.update(() => {
      let dactivation = 0;
      for (let eid in this.outedges) {
        const edge = this.outedges[eid];
        if (edge.to.active()) {
          dactivation += edge.weight * edge.to.getdActivation();
        }
      }
      return dactivation;
    });
  }

  getdBias() {
    return (this.active() ? this.getdActivation() : 0);
  }

  format(v) {
    return v.toFixed(1);
  }

  backup() {
    this.backupBias = this.bias;
  }

  restore() {
    this.bias = this.backupBias;
  }
}
