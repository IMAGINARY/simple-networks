const configSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Simple Networks Config File",
  "description": "A configuration file of the Simple-Network exhibit",
  "type": "object",
  "definitions": {},
  "properties": {
    "levels": {
      "type": "array",
      "items": {
        "type": "string",
      },
      "minItems": 1,
      "uniqueItems": true,
    },
    "defaultLanguage": {
      "type": "string",
    }
  },
  "required": ["levels"],
  "additionalProperties": false,
};

export default configSchema;
export { configSchema };
