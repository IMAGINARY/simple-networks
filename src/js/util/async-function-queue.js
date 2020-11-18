export default class AsyncFunctionQueue {
  constructor() {
    this._queuePromise = Promise.resolve(true);
  }

  async enqueue(func) {
    // this serves as a barrier such that the provided function is only executed once the previous
    // have finished execution (successfully or with exception)
    const queueFunc = () => func();
    this._queuePromise = this._queuePromise.then(queueFunc, queueFunc);
    return await this._queuePromise;
  }
}

export { AsyncFunctionQueue };
