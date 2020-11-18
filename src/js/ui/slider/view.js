import { EventEmitter } from 'events';
import { defaultsDeep } from 'lodash';
import $ from 'jquery';

import { slider as sliderDefaults } from '../defaults';
import EventManager from '../../util/event-manager';

export default class View extends EventEmitter {
  constructor({ model, i18n, options = sliderDefaults }) {
    super();
    this._options = defaultsDeep({ ...options }, sliderDefaults);
    this._model = model;
    this._i18n = i18n;
    this._$navParent = $(this._options.navParent);
    this._$previousSlideButton = $(this._options.prevButton);
    this._$nextSlideButton = $(this._options.nextButton);
    this._$previousSlideButton.attr('data-i18n', 'main:slider.previous');
    this._$nextSlideButton.attr('data-i18n', 'main:slider.next');
    this._$items = this._addItems();
    this._domEventManager = this._addEventListeners();
    this.update();
    this.localize();
  }

  update() {
    this._updateNav();
  }

  _addEventListeners() {
    const domEventManager = new EventManager();
    const ael = domEventManager.ael;

    ael(this._$previousSlideButton, 'click', () => this.emit('go-to-previous-slide'));
    ael(this._$nextSlideButton, 'click', () => this.emit('go-to-next-slide'));

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
    const items = $(this._model.getSlideNames().map(name => this._createPlainItem(name)));
    this._$navParent.empty().append(items);
    return items;
  }

  _createPlainItem(name) {
    return $('<a/>', {
      href: `#${encodeURIComponent(name)}`,
      class: this._options.navClasses,
    }).get(0);
  }

  _updateNav() {
    this._$items.removeClass(this._options.navClassesSelected);
    const currentSlideIndex = this._model.getCurrentSlideIndex();
    this._$items.filter((i) => i !== currentSlideIndex).addClass(this._options.navClasses);
    this._$items.eq(currentSlideIndex).addClass(this._options.navClassesSelected);

    const isFirstSlide = this._model.getCurrentSlideIndex() === 0;
    const isLastSlide = this._model.getCurrentSlideIndex() === this._model.numSlides() - 1;
    this._$previousSlideButton.css('visibility', isFirstSlide ? "hidden" : "visible");
    this._$nextSlideButton.css('visibility', isLastSlide ? "hidden" : "visible");
  }

  localize() {
    this._i18n.localize(...this._$previousSlideButton.toArray());
    this._i18n.localize(...this._$nextSlideButton.toArray());
  }

  dispose() {
    this._domEventManager.dispose();
  }
}

export { View };
