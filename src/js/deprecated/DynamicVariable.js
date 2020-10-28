var currentcomputetime = 0;

export function updateDynamicVariables() {
  currentcomputetime++;
}

export function getCurrentComputeTime() {
  return currentcomputetime;
}


//enables dynamic programming: values of variables are only recomputed if required.
export class DynamicVariable{
  constructor(value = 0) {
    this.value = value;
    this.time = -1;
  }

  update(fun) {
    if(this.time == currentcomputetime)
      return this.value;
    else {
      this.value = fun();
      this.time = currentcomputetime;
      return this.value;
    }
  }
}
