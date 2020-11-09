import EventEmitter from 'events';
import {zip} from 'lodash';

import { FeedForwardNetwork } from '../../neural-network/network';
import clamp from '../../util/clamp';

export default class PredictionModel extends EventEmitter {
  constructor(networkModel, inputs, targetActivationFunctions) {
    super();
    this._networkModel = networkModel;
    this._network = networkModel.network;
    this._targetActivationFuncs = zip(
      this._network.outputNodes.map(n => n.id),
      targetActivationFunctions
    );
    this._inputs = Object.fromEntries(this._network.inputNodeIds.map(id => [id, inputs[id] ?? 0]));
  }

  getNetwork() {
    return this._network;
  }

  setInput(nodeOrNodeId, value) {
    const id = typeof nodeOrNodeId === 'string' ? nodeOrNodeId : nodeOrNodeId.id;
    const oldValue = this._inputs[id];
    value = clamp(value, this._networkModel.properties[id].inputProps.range);
    if (oldValue !== value) {
      this._inputs[id] = value;
      this.emit('input-changed', id, value, oldValue, this);
    }
  }

  computePredictions() {
    const result = this._networkModel.predictExt(FeedForwardNetwork.matchArray(
      this._network.inputNodes,
      this._inputs
    ), true);
    this._targetActivationFuncs.forEach(([id, taf]) => result[id].target = taf(this._inputs));
    return result;
  }
}
