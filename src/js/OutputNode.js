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
    this.adjustable = false;
  }

  getActivation() {
    this.activation = 0; //no bias
    for (let eid in this.inedges) {
      const edge = this.inedges[eid];
      this.activation += edge.weight * edge.from.getActivation();
    }
    this.activation = this.activation; // no ReLu
    return this.activation;
  }

  //this function might be overwriten
  getdActivation() {
    return 1; //TODO: make dependent on loss function
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
}
