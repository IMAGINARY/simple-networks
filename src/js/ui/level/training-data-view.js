import { EventEmitter } from 'events';
import { defaultsDeep } from 'lodash';
import $ from 'jquery';

import { trainingData as trainingDataDefaults } from '../defaults';

export default class TrainingDataView extends EventEmitter {
  constructor({ model, i18n, options = trainingDataDefaults }) {
    super();
    this._model = model;
    this._i18n = i18n;
    this._localizables = [];
    this._formatNumber = this._i18n.getNumberFormatter();

    this._options = defaultsDeep({ ...options }, trainingDataDefaults);

    this._setupDOM();
    this.localize();
  }

  _setupDOM() {
    // title
    const $trainingDataTitle = $(this._options.trainingDataTitle)
      .attr('data-i18n', 'main:training-data.title');
    this._localizables.push(...$trainingDataTitle.toArray());

    // table with training data
    const $trainingDataTableContainer = $(this._options.trainingDataTableContainer).empty();
    const $table = $('<table>').appendTo($trainingDataTableContainer);
    $table.attr('border', 1);

    // Create header
    const $tr = $('<tr>').appendTo($table);
    const inputIds = this._model.getInputIds();
    inputIds.forEach(id => $('<th>').text(id).appendTo($tr));
    const outputIds = this._model.getOutputIds();
    outputIds.forEach(id => $('<th>').text(id).attr('colspan', 3).appendTo($tr));

    // Create rows with training data, predictions and errors
    const [inputss, targetss, predictionss, errorss] = [
      this._model.getInputss(),
      this._model.getTargetss(),
      this._model.getPredictionss(),
      this._model.getErrorss(),
    ];
    for (let i = 0; i < this._model.getCorpusSize(); ++i) {
      const $tr = $('<tr>').appendTo($table);
      const [inputs, targets, predictions, errors]
        = [inputss[i], targetss[i], predictionss[i], errorss[i]];
      inputs.forEach(() => $('<td>').addClass('input').appendTo($tr));
      for (let j = 0; j < targets.length; ++j) {
        $('<td>').addClass('target').appendTo($tr);
        $('<td>').addClass('prediction').appendTo($tr);
        $('<td>').addClass('error').appendTo($tr);
      }
    }

    // Add row for per-output loss
    const $lossTr = $('<tr>').appendTo($table);
    $('<td>').attr('colspan', inputIds.length).appendTo($lossTr); // skip input <td>s
    for (let j = 0; j < outputIds.length; ++j) {
      $('<td>').attr('colspan', 2).css('textAlign', 'right').text('Σ').appendTo($lossTr); // symbol
      $('<td>').addClass('loss').appendTo($lossTr); // value
    }

    // Add row for total loss
    const $totalLossTr = $('<tr>').appendTo($table);
    $('<td>').attr('colspan', inputIds.length + 2).appendTo($totalLossTr); // spacer
    $('<td>') // total loss value
      .addClass('totalLoss')
      .attr('colspan', 3 * outputIds.length - 2)
      .css(outputIds.length > 1 ? {} : { 'display': 'none' }) // hide total if only one partial
      .appendTo($totalLossTr);

    this._$table = $table;
  }

  update() {
    const [predictionss, errorss, errorSums, totalError] = [
      this._model.getPredictionss(),
      this._model.getErrorss(),
      this._model.getErrorSums(),
      this._model.getTotalError(),
    ];

    const $table = this._$table;
    const $rows = $table.children().slice(1); // skip table header
    for (let i = 0; i < this._model.getCorpusSize(); ++i) {
      const $row = $rows.eq(i);
      const [predictions, errors] = [predictionss[i], errorss[i]];
      $row.find('.prediction').each((j, td) => $(td).text(this._formatNumber(predictions[j])));
      $row.find('.error').each((j, td) => $(td).text(this._formatNumber(2 * errors[j])));
    }

    $table.find('.loss').each((i, td) => $(td).text(this._formatNumber(2 * errorSums[i])));
    $table.find('.totalLoss').text(this._formatNumber(2 * totalError));
  }

  dispose() {
  }

  localize() {
    this._i18n.localize(...this._localizables);

    this._formatNumber = this._i18n.getNumberFormatter();

    const [inputss, targetss] = [
      this._model.getInputss(),
      this._model.getTargetss(),
    ];

    const $table = this._$table;
    const $rows = $table.children().slice(1); // skip table header
    for (let i = 0; i < this._model.getCorpusSize(); ++i) {
      const $row = $rows.eq(i);
      const [inputs, targets] = [inputss[i], targetss[i]];
      $row.find('.input').each((j, td) => $(td).text(this._formatNumber(inputs[j])));
      $row.find('.target').each((j, td) => $(td).text(this._formatNumber(targets[j])));
    }

    this.update();
  }
}
