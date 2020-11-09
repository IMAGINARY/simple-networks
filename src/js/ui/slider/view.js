import { EventEmitter } from 'events';

import DOMEventManager from '../../util/dom-event-manager';

export default class View extends EventEmitter {
  constructor(model) {
    super();
    this._model = model;
    this._previousSlideButton = document.querySelector("#backbutton");
    this._nextSlideButton = document.querySelector("#nextbutton");
    this._items = this._addItems();
    this._domEventManager = this._addEventListeners();
    this.update();
  }

  update() {
    this._updateFooter();
  }

  _addEventListeners() {
    const domEventManager = new DOMEventManager();
    const ael = domEventManager.ael;

    ael(this._previousSlideButton, 'click', () => this.emit('go-to-previous-slide'));
    ael(this._nextSlideButton, 'click', () => this.emit('go-to-next-slide'));

    ael(window, 'keydown', event => {
      switch (event.key) {
        case "ArrowLeft":
          this.emit('previous');
          break;
        case "ArrowRight":
          this.emit('next');
          break;
      }
    });

    return domEventManager;
  }

  _addItems() {
    const parent = document.querySelector('#navcircles');
    parent.querySelectorAll('a').forEach(n => n.remove());
    const items = this._model.getSlideNames().map(name => this._createItem(name));
    items.forEach(item => parent.appendChild(item));
    return items;
  }

  _createItem(name) {
    const item = document.createElement('a');
    item.href = `#${encodeURIComponent(name)}`;
    item.classList.add('circ');
    return item;
  }

  _updateFooter() {
    this._items.forEach((item, i) => {
      if (i === this._model.getCurrentSlideIndex()) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });

    const isFirstSlide = this._model.getCurrentSlideIndex() === 0;
    const isLastSlide = this._model.getCurrentSlideIndex() === this._model.numSlides() - 1;
    this._previousSlideButton.style.visibility = isFirstSlide ? "hidden" : "visible";
    this._nextSlideButton.style.visibility = isLastSlide ? "hidden" : "visible";
  }

  dispose() {
    this._domEventManager.dispose();
  }
}

export { View };
