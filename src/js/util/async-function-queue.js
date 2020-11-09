export default class AsyncFunctionQueue {
  constructor() {
    this._queuePromise = Promise.resolve(true);
  }

  async enqueue(func) {
    // this serves as a barrier such the provided function is only executed once the previous
    // have finished execution (successfully or with exception)
    this._queuePromise = this._queuePromise.finally(func);
    return await this._queuePromise;
  }
}

export { AsyncFunctionQueue };
