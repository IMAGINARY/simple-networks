import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

export default class Validator {
  constructor(schema) {
    this._ajvValidate = ajv.compile(schema);
  }

  validate(obj) {
    const valid = this._ajvValidate(obj);
    return { valid, errors: this._ajvValidate.errors };
  }

  static createValidateFunction(schema) {
    const v = new Validator(schema);
    return obj => v.validate(obj);
  }
}

export { Validator };
