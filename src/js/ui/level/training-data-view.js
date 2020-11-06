import { EventEmitter } from 'events';
import { zip } from 'lodash';

export default class TrainingDataView extends EventEmitter {
  constructor(model) {
    super();
    this._model = model;
    this._table = document.querySelector('#trainingtable');
    this._table.setAttribute('border', 1);

    this._setupDOM();
  }

  _setupDOM() {
    // Clear table
    while (this._table.lastChild) {
      this._table.lastChild.remove();
    }

    // Create header
    const tr = document.createElement('tr');
    const inputIds = this._model.getInputIds();
    for (let id of inputIds) {
      const th = document.createElement('th');
      th.innerText = id;
      tr.appendChild(th);
    }
    const outputIds = this._model.getOutputIds();
    for (let id of outputIds) {
      const th = document.createElement('th');
      th.innerText = id;
      th.setAttribute('colspan', 3);
      tr.appendChild(th);
    }
    this._table.appendChild(tr);

    // Create rows with training data, predictions and errors
    const [inputss, targetss, predictionss, errorss] = [
      this._model.getInputss(),
      this._model.getTargetss(),
      this._model.getPredictionss(),
      this._model.getErrorss(),
    ];
    for (let i = 0; i < this._model.getCorpusSize(); ++i) {
      const tr = document.createElement('tr');
      const [inputs, targets, predictions, errors]
        = [inputss[i], targetss[i], predictionss[i], errorss[i]];
      for (let input of inputs) {
        const td = document.createElement('td');
        td.classList.add('input');
        td.innerText = formatNumber(input);
        tr.appendChild(td);
      }
      for (let j = 0; j < targets.length; ++j) {
        const targetTd = document.createElement('td');
        targetTd.classList.add('target');
        targetTd.innerText = formatNumber(targets[j]);
        tr.appendChild(targetTd);
        const predictionTd = document.createElement('td');
        predictionTd.classList.add('prediction');
        predictionTd.innerText = formatNumber(predictions[j]);
        tr.appendChild(predictionTd);
        const errorTd = document.createElement('td');
        errorTd.classList.add('error');
        errorTd.innerText = formatNumber(errors[j]);
        tr.appendChild(errorTd);
      }
      this._table.appendChild(tr);
    }

    // Add row for per-output loss
    const lossTr = document.createElement('tr');
    const inputsTd = document.createElement('td');
    inputsTd.setAttribute('colspan', inputIds.length);
    lossTr.appendChild(inputsTd);
    for (let j = 0; j < outputIds.length; ++j) {
      const lossSymbolTd = document.createElement('td');
      lossSymbolTd.setAttribute('colspan', 2);
      lossSymbolTd.style.textAlign = 'right';
      lossSymbolTd.innerText = 'Σ';
      lossTr.appendChild(lossSymbolTd);
      const lossTd = document.createElement('td');
      lossTd.classList.add('loss');
      lossTr.appendChild(lossTd);
    }
    this._table.appendChild(lossTr);

    // Add row for total loss
    const totalLossTr = document.createElement('tr');
    const spaceTd = document.createElement('td');
    spaceTd.setAttribute('colspan', inputIds.length + 2);
    totalLossTr.appendChild(spaceTd);
    const totalLossTd = document.createElement('td');
    totalLossTd.classList.add('totalLoss');
    totalLossTd.setAttribute('colspan', 3 * outputIds.length - 2);
    totalLossTr.appendChild(totalLossTd);
    if (false && outputIds.length <= 1) {
      totalLossTr.style.display = 'none';
    }
    this._table.appendChild(totalLossTr);

    this.update();
  }

  showHelpTab() {
    this._missionButton.classList.remove('selected');
    this._missionContent.classList.remove('visible');
    this._helpButton.classList.add('selected');
    this._helpContent.classList.add('visible');
  }

  showMissionTab() {
    this._helpButton.classList.remove('selected');
    this._helpContent.classList.remove('visible');
    this._missionButton.classList.add('selected');
    this._missionContent.classList.add('visible');
  }

  update() {
    const [predictionss, errorss, errorSums, totalError] = [
      this._model.getPredictionss(),
      this._model.getErrorss(),
      this._model.getErrorSums(),
      this._model.getTotalError(),
    ];

    const rows = this._table.children;
    for (let i = 0; i < this._model.getCorpusSize(); ++i) {
      const row = rows[i + 1]; // +1 because of the <th>
      const [predictions, errors] = [predictionss[i], errorss[i]];
      const predictionTds = row.querySelectorAll('.prediction');
      const errorTds = row.querySelectorAll('.error');
      zip(predictionTds, predictions).forEach(([td, p]) => td.innerText = formatNumber(p));
      zip(errorTds, errors).forEach(([td, e]) => td.innerText = formatNumber(2 * e));
    }

    const lossTds = this._table.querySelectorAll('.loss');
    for (let j = 0; j < this._model.getOutputIds().length; ++j) {
      lossTds[j].innerText = formatNumber(errorSums[j]);
    }

    this._table.querySelector('.totalLoss').innerText = formatNumber(totalError);
  }

  dispose() {
    // Nothing to do yet since not event listeners are connected to the DOM
  }
}

const formatNumber = n => (n >= 0 ? " " : "") + Number(n).toFixed(2);
