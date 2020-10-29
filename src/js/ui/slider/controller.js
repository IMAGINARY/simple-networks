import Model from './model';
import View from './view';
import { EventEmitter } from 'events';

export default class Controller extends EventEmitter {
  constructor(slideNames) {
    super();

    this._model = new Model(slideNames);
    this._view = new View(this._model);

    this._model.on('current-slide-changed', this.handleSlideChanged.bind(this));

    this._view.on('go-to-previous-slide', () => this._model.previous());
    this._view.on('go-to-next-slide', () => this._model.next());
    this._view.on('go-to-slide-with-name', name => this._model.setSlide(name));
  }

  handleSlideChanged(slideName, slideIndex, prevSlideName, prevSlideIndex) {
    this._view.update();
    this.emit('current-slide-changed', slideName, slideIndex, prevSlideName, prevSlideIndex, this);
  }
}

export { Controller };
