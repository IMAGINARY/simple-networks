import View from './3d-view';
import PredictionModel from './prediction-model';

export default class Controller {
  constructor({ levelName, networkModel, inputs, targetActivationFuncs, layout, strings, i18n }) {
    this.networkModel = networkModel;
    this.predictionModel = new PredictionModel(networkModel, inputs, targetActivationFuncs);
    this.view = new View({
      levelName, layout, strings, i18n,
      predictionModel: this.predictionModel,
    });

    this.view.on('input-changed', this.handleInputChange.bind(this));
    this.view.on('bias-changed', this.handleBiasChange.bind(this));
    this.view.on('weight-changed', this.handleWeightChange.bind(this));

    this.networkModel.on('network-property-changed', this._scheduleUpdateView.bind(this));
    this.predictionModel.on('input-changed', this._scheduleUpdateView.bind(this));

    this._animationFrameRequestId = 0;
    this._updateView();
  }

  handleInputChange(node, input) {
    this.predictionModel.setInput(node, input);
  }

  handleBiasChange(node, bias) {
    this.networkModel.setBias(node, bias);
  }

  handleWeightChange(edge, weight) {
    this.networkModel.setWeight(edge, weight);
  }

  _scheduleUpdateView() {
    cancelAnimationFrame(this._animationFrameRequestId);
    requestAnimationFrame(() => this._updateView());
  }

  _updateView() {
    this.view.update(this.predictionModel.computePredictions());
  }

  localize() {
    this.view.localize();
  }

  dispose() {
    this.view.dispose();
  }
}

export { Controller };
