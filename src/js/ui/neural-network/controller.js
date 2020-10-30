export default class Controller {
  constructor(model, targetActivationFuncs, view) {
    this.model = model;
    this.view = view;
    this.targetActivationFuncs = targetActivationFuncs;

    this.view.on('input-changed', this.handleInputChange.bind(this));
    this.view.on('bias-changed', this.handleBiasChange.bind(this));
    this.view.on('weight-changed', this.handleWeightChange.bind(this));

    this.model.clamp();
    this.model.assignTargets(this._computeTargetActivations());
    this._feedForwardAndUpdateView();
  }

  handleInputChange(node, input) {
    node.p.input = input;
    this.model.clampInput(node);
    this.model.assignTargets(this._computeTargetActivations());
    this._feedForwardAndUpdateView();
  }

  handleBiasChange(node, bias) {
    node.p.bias = bias;
    this.model.clampBias(node);
    this._feedForwardAndUpdateView();
  }

  handleWeightChange(edge, weight) {
    edge.p.weight = weight;
    this.model.clampWeight(edge);
    this._feedForwardAndUpdateView();
  }

  _feedForwardAndUpdateView() {
    this.model.feedForward();
    this.view.update();
  }

  _computeTargetActivations() {
    const inputs = Object.fromEntries(
      this.model.network.inputNodes.map(n => [n.id, n.p.input])
    );
    return this.targetActivationFuncs.map(taf => taf(inputs));
  }
}

export { Controller };
