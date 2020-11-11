export default class EventManager {
  constructor() {
    this._emHandlers = [];
    this.rel = this.registerEventListener.bind(this);
    this.ael = this.addEventListener.bind(this);
  }

  registerEventListener(emitter, ...addEventListenerParams) {
    let emHandler;
    if (hasFunctions(emitter, 'addEventListener', 'removeEventListener')) {
      emHandler = createEMHandlerForDOMElement(emitter, ...addEventListenerParams);
    } else if (hasFunctions(emitter, 'on', 'off')) {
      emHandler = createEMHandlerForEventEmitter(emitter, ...addEventListenerParams);
    } else {
      throw new Error("Unsupported event emitter type.");
    }
    this._emHandlers.push(emHandler);
    return emHandler;
  }

  addEventListener(emitter, ...addEventListenerParams) {
    return this.registerEventListener(emitter, ...addEventListenerParams)
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

function hasFunction(obj, functionName) {
  return typeof obj[functionName] === 'function';
}

function hasFunctions(obj, ...functionNames) {
  return functionNames.reduce((acc, cur) => acc && hasFunction(obj, cur), true);
}

function createEMHandlerForDOMElement(domElement, ...addEventListenerParams) {
  return {
    attach: function () {
      domElement.addEventListener(...addEventListenerParams);
      return this;
    },
    detach: function () {
      domElement.removeEventListener(...addEventListenerParams);
      return this;
    },
  };
}

function createEMHandlerForEventEmitter(emitter, ...addEventListenerParams) {
  return {
    attach: function () {
      emitter.on(...addEventListenerParams);
      return this;
    },
    detach: function () {
      emitter.off(...addEventListenerParams);
      return this;
    },
  };
}

export { EventManager };
