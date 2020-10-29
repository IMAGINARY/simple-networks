import { EventEmitter } from 'events';

export default class Model extends EventEmitter {
  constructor(slideNames, currentSlideIndexOrName = 0) {
    super();
    this._slideNames = [...slideNames];
    this._currentSlideIndex = 0;
    this.setSlide(currentSlideIndexOrName);
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
      const slideIndex = this._slideNames.indexOf(nameOrIndex);
      return this.setSlide(slideIndex);
    } else if (typeof nameOrIndex === 'number') {
      const index = nameOrIndex;
      if (index !== this._currentSlideIndex && index >= 0 && index < this.numSlides()) {
        const prevSlideIndex = this.getCurrentSlideIndex();
        const prevSlideName = this.getCurrentSlideName();
        this._currentSlideIndex = index;
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
}

export { Model };
