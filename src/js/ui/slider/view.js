import { EventEmitter } from 'events';

export default class View extends EventEmitter {
  constructor(model) {
    super();
    this._model = model;
    this._previousSlideButton = document.querySelector("#backbutton");
    this._nextSlideButton = document.querySelector("#nextbutton");
    this._items = this._addItems();
    this._addEventListeners();
    this.update();
  }

  update() {
    this._updateHashFromModel();
    this._updateFooter();
  }

  _addEventListeners() {
    window.addEventListener('hashchange', this._handleHashChange.bind(this));

    this._previousSlideButton.addEventListener('click', () => this.emit('go-to-previous-slide'));
    this._nextSlideButton.addEventListener('click', () => this.emit('go-to-next-slide'));

    window.addEventListener('keydown', event => {
      switch (event.key) {
        case "ArrowLeft":
          this.emit('previous');
          break;
        case "ArrowRight":
          this.emit('next');
          break;
      }
    });
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

  _handleHashChange(hashChangeEvent) {
    const hash = new URL(hashChangeEvent.newURL).hash;
    const decodedHash = decodeURIComponent(hash.substring(1));
    this.emit('go-to-slide-with-name', decodedHash);
  }

  _updateHashFromModel() {
    window.location.hash = `#${encodeURIComponent(this._model.getCurrentSlideName())}`;
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
}

export { View };
