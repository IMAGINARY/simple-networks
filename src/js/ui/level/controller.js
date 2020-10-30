import { forEach, mapValues, pick, zip } from 'lodash';

import TrainingModel from './training-model';
import TrainingDataView from './training-data-view';
import { EventEmitter } from 'events';
import MissionControlsView from './mission-controls-view';

export default class Controller extends EventEmitter {
  constructor(networkModel, trainingInputs, trainingTargets) {
    super();

    this._networkModel = networkModel;

    // Keep the initial network parameters to allow for resetting the training
    const [network, properties] = [this._networkModel.network, this._networkModel.properties];
    this._initialWeights = mapValues(pick(properties, network.edgeIds), ep => ep.weight);
    this._initialBiases = mapValues(pick(properties, network.nodeIds), np => np.bias);

    this._batch = zip(trainingInputs, trainingTargets);
    this._trainingTimerId = 0;

    this._trainingModel = new TrainingModel(
      trainingInputs,
      trainingTargets,
      networkModel,
    );
    this._trainingDataView = new TrainingDataView(this._trainingModel);

    this._missionControlsView = new MissionControlsView();
    this._missionControlsView.showHelpTab();
    this._missionControlsView.on('reset-training', this._handleResetTraining.bind(this));
    this._missionControlsView.on('pause-training', this._handlePauseTraining.bind(this));
    this._missionControlsView.on('resume-training', this._handleResumeTraining.bind(this));
    this._missionControlsView.on('step-training', this._handleStepTraining.bind(this));

    this._animationFrameRequestId = 0;
    this._trainingModel.on('predictions-changed', this._scheduleUpdateTrainingView.bind(this));
  }

  _scheduleUpdateTrainingView() {
    cancelAnimationFrame(this._animationFrameRequestId);
    requestAnimationFrame(() => this._trainingDataView.update());
  }

  _handlePauseTraining() {
    cancelAnimationFrame(this._trainingTimerId);
    this._trainingTimerId = 0;
  }

  _handleResumeTraining() {
    this._handlePauseTraining();
    this._trainingTimerId = requestAnimationFrame(() => {
      this._handleStepTraining();
      this._handleResumeTraining();
    });
  }

  _handleStepTraining() {
    const learningRate = 0.02 / Math.min(Math.max(1, this._trainingModel.getTotalRelError()), 10);
    this._networkModel.trainBatch(this._batch, learningRate);
  }

  _handleResetTraining() {
    forEach(this._initialWeights, (weight, id) => this._networkModel.setWeight(id, weight));
    forEach(this._initialBiases, (bias, id) => this._networkModel.setBias(id, bias));
  }
}

export { Controller };
