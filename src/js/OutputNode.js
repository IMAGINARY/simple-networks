import * as d3 from 'd3';

import {
  Node
} from './Node.js';

import {
  DynamicVariable,
  updateDynamicVariables
} from './DynamicVariable.js';

// a node that just sums up inputs (no ReLu to enable negative outputs)

export class OutputNode extends Node {
  constructor() {
    super();
    this.bias = 0;
    this.adjustable = false;
  }

  getActivation() {
    return this.computeSum(); // no bias, no ReLu
  }

  //this function might be overwriten, such that it is dependent on loss function
  getdActivation() {
    return 1; //likely will be overwritten
  }

  active() {
    return true;
  }

  temporarilyReplaceGetdActivation(tempdActivation) {
    this.getdActivationBackup = this.getdActivation;
    this.getdActivation = tempdActivation;
    updateDynamicVariables();
  }

  restoreGetdActivation() {
    this.getdActivation = this.getdActivationBackup;
    updateDynamicVariables();
  }

  errorcolor() {
    const n = this;
    return d3.scaleSequential().domain([1, 0]).interpolator(d3.interpolateRdYlGn)(Math.abs(n.target - n.getActivation()));
  }
}
