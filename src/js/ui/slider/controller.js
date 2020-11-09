import Model from './model';
import View from './view';
import { EventEmitter } from 'events';

export default class Controller extends EventEmitter {
  constructor(slideNames) {
    super();

    this._model = new Model(slideNames);
    this._view = new View(this._model);

    this._model.on('current-slide-changed', this._handleSlideChanged.bind(this));

    this._view.on('go-to-previous-slide', () => this._model.previous());
    this._view.on('go-to-next-slide', () => this._model.next());
  }

  getModel() {
    return this._model;
  }

  _handleSlideChanged(slideName, slideIndex, prevSlideName, prevSlideIndex) {
    this._view.update();
    this.emit('current-slide-changed', slideName, slideIndex, prevSlideName, prevSlideIndex, this);
  }

  dispose() {
    this._model.dispose();
    this._view.dispose();
  }
}

export { Controller };
