import { EventEmitter } from 'events';
import { isEqual, sum, zip } from 'lodash';

import { Model as NetworkModel } from '../../neural-network/model';
import transpose from '../../util/transpose';

export default class TrainingModel extends EventEmitter {
  constructor(inputss, targetss, networkModel) {
    super();

    this._inputss = inputss;
    this._targetss = targetss;
    this._networkModel = networkModel;

    this.updatePredictionsAndErrors();

    this._networkModel.on(
      'network-property-changed',
      this._networkPropertyChangedHandler.bind(this)
    );
  }

  getInputIds() {
    return this._networkModel.network.inputNodeIds;
  }

  getOutputIds() {
    return this._networkModel.network.outputNodeIds;
  }

  getInputss() {
    return this._inputss;
  }

  getTargetss() {
    return this._targetss;
  }

  getPredictionss() {
    return this._predictionss;
  }

  getErrorss() {
    return this._errorss;
  }

  getErrorSums() {
    return this._errorSums;
  }

  getTotalError() {
    return this._totalError;
  }

  getRelErrorss() {
    return this._relErrorss;
  }

  getRelErrorSums() {
    return this._relErrorSums;
  }

  getTotalRelError() {
    return this._totalRelError;
  }

  getCorpusSize() {
    return this._inputss.length;
  }

  updatePredictionsAndErrors() {
    const oldPredictionss = this._predictionss;
    const newPredictionss = this._inputss.map(inputs => this._networkModel.predict(inputs));
    if (!isEqual(oldPredictionss, newPredictionss)) {
      this._predictionss = newPredictionss;
      this._errorss = zip(this._predictionss, this._targetss)
        .map(([ps, ts]) => zip(ps, ts).map(([p, t]) => NetworkModel.C(p, t)));
      this._relErrorss = zip(this._predictionss, this._targetss)
        .map(([ps, ts]) => zip(ps, ts).map(([p, t]) => NetworkModel.relC(p, t)));
      this.emit('predictions-changed', this.getPredictionss(), oldPredictionss);
    }
    this._errorSums = this.getCorpusSize() === 0 ?
      this.getOutputIds().map(_ => 0) :
      transpose(this._errorss).map(sum);
    this._totalError = sum(this._errorSums);
    this._relErrorSums = transpose(this._errorss).map(sum);
    this._totalRelError = sum(this._relErrorSums);
  }

  _networkPropertyChangedHandler(nodeOrEdge, p) {
    if (p === 'bias' || p === 'weight') {
      this.updatePredictionsAndErrors();
    }
  }
}

export { TrainingModel };
