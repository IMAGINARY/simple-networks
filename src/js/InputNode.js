import {
  Node
} from './Node.js';

import {
  DynamicVariable,
  updateDynamicVariables
} from './DynamicVariable.js';

export class InputNode extends Node {
  constructor(activationcb = (() => 0)) {
    super();
    this.getActivation = activationcb;
    this.adjustable = false;
    this.allownegative = true;
  }

  setUserParameter(val) {
    if (!this.hasOwnProperty("userparamter")) {
      this.getActivation = (() => this.userparamter);
    }
    if (!this.allownegative) {
      val = Math.max(0, val);
    }
    this.userparamter = val;

    updateDynamicVariables();
  }

  temporarilyReplaceGetActivation(tempActivation) {
    this.getActivationBackup = this.getActivation;
    this.getActivation = tempActivation;
    updateDynamicVariables();
  }

  restoreGetActivation() {
    this.getActivation = this.getActivationBackup;
    updateDynamicVariables();
  }

  pauseInput() {
    this.setUserParameter(this.getActivation());
  }
}
