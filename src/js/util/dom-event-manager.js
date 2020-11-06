export default class DOMEventManager {
  constructor() {
    this._emHandlers = [];
    this.rel = this.registerEventListener.bind(this);
    this.ael = this.addEventListener.bind(this);
  }

  registerEventListener(domElement, ...addEventListenerParams) {
    const emHandler = {
      attach: function () {
        domElement.addEventListener(...addEventListenerParams);
        return this;
      },
      detach: function () {
        domElement.removeEventListener(...addEventListenerParams);
        return this;
      },
    };
    this._emHandlers.push(emHandler);
    return emHandler;
  }

  addEventListener(domElement, ...addEventListenerParams) {
    return this.registerEventListener(domElement, ...addEventListenerParams)
      .attach();
  }

  attach() {
    this._emHandlers.forEach(aDetacher => aDetacher.attach());
    return this;
  }

  detach() {
    this._emHandlers.forEach(aDetacher => aDetacher.detach());
    return this;
  }

  dispose() {
    this.detach();
    this._emHandlers = [];
    return this;
  }
}

export { DOMEventManager };
