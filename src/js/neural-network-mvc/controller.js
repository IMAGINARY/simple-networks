export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.view.on('input-changed', this.handleInputChange.bind(this));
    this.view.on('bias-changed', this.handleBiasChange.bind(this));
    this.view.on('weight-changed', this.handleWeightChange.bind(this));
  }

  handleInputChange(node, input) {
    node.p.activation = input;
    this.model.clampInput(node);
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
}
