import { EventEmitter } from 'events';

import EventManager from '../../util/event-manager';

export default class Model extends EventEmitter {
  constructor(slideNames, currentSlideIndexOrName) {
    super();
    this._slideNames = [...slideNames];
    this._currentSlideIndex = -1;
    this._domEventManager = new EventManager();
    this.setSlide((currentSlideIndexOrName ?? this._getSlideNameFromURL()) ?? 0);
    this._domEventManager.ael(window, 'hashchange', this._updateFromHash.bind(this));
  }

  getSlideNames() {
    return [...this._slideNames];
  }

  getSlideName(index) {
    return this._slideNames[index];
  }

  getCurrentSlideName() {
    return this._slideNames[this._currentSlideIndex];
  }

  getCurrentSlideIndex() {
    return this._currentSlideIndex;
  }

  setSlide(nameOrIndex) {
    if (typeof nameOrIndex === 'string') {
      const name = nameOrIndex;
      const index = this._slideNames.indexOf(name);
      if (index >= 0 && index < this.numSlides()) {
        return this.setSlide(index);
      } else {
        const encodedSlideNames = this._slideNames.map(encodeURIComponent);
        console.warn(`Unknown slide name: ${name}. Use one of ${JSON.stringify(encodedSlideNames)}`);
        return false;
      }
    } else if (typeof nameOrIndex === 'number') {
      const index = nameOrIndex;
      if (index !== this._currentSlideIndex && index >= 0 && index < this.numSlides()) {
        const prevSlideIndex = this.getCurrentSlideIndex();
        const prevSlideName = this.getCurrentSlideName();
        this._currentSlideIndex = index;
        window.location.hash = `#${encodeURIComponent(this.getCurrentSlideName())}`;
        this.emit(
          'current-slide-changed',
          this.getCurrentSlideName(),
          this.getCurrentSlideIndex(),
          prevSlideIndex,
          prevSlideName,
          this
        );
        return true;
      } else {
        return false;
      }
    } else {
      // Ignore invalid slide name or index
      return false;
    }
  }

  next() {
    return this.setSlide(this.getCurrentSlideIndex() + 1);
  }

  previous() {
    return this.setSlide(this.getCurrentSlideIndex() - 1);
  }

  numSlides() {
    return this._slideNames.length;
  }

  dispose() {
    this._domEventManager.dispose();
  }

  _getSlideNameFromURL() {
    const hash = window.location.hash;
    return hash.length === 0 ? null : decodeURIComponent(hash.substring(1));
  }

  _updateFromHash() {
    this.setSlide(this._getSlideNameFromURL());
  }
}

export { Model };
