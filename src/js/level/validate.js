import Ajv from 'ajv';

import { schema as levelSchema } from './schema';

const ajv = new Ajv({ allErrors: true });
const ajvValidate = ajv.compile(levelSchema);

function validate(levelObj) {
  const valid = ajvValidate(levelObj);
  return { valid, errors: ajvValidate.errors };
}

export { validate };
