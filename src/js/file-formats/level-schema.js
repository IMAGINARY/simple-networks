const levelSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Simple Network Level",
  "description": "A level of the Simple-Network exhibit",
  "type": "object",
  "definitions": {
    "nodeId": {
      "type": "string",
      "pattern": "^((?! -> ).)+$"
    },
    "edgeId": {
      "type": "string",
      "pattern": "^(.+) -> (.+)$"
    },
    "enumRange": {
      "type": "array",
      "items": { "type": "number" },
    },
    "minMaxRange": {
      "type": "object",
      "properties": {
        "min": { "type": "number" },
        "max": { "type": "number" },
        "additionalProperties": false,
      }
    },
    "inputValueOrRange": {
      "oneOf": [
        { "type": "number" },
        {
          "type": "object",
          "properties": {
            "value": { "type": "number" },
            "range": {
              "oneOf": [
                { "$ref": "#/definitions/enumRange" },
                { "$ref": "#/definitions/minMaxRange" },
              ]
            },
            "additionalProperties": false,
          }
        }
      ],
    },
    "trainableValueOrRange": {
      "oneOf": [
        { "type": "number" },
        {
          "type": "object",
          "properties": {
            "value": { "type": "number" },
            "range": { "$ref": "#/definitions/minMaxRange" },
            "train": { "type": "boolean" },
          },
          "additionalProperties": false,
        }
      ],
    },
    "activationFunc": {
      "enum": ["binary", "linear", "relu", "sigmoid"]
    },
    "stringOrI18N": {
      "oneOf": [
        { "type": "string" },
        {
          "type": "object",
          "addtionalProperites": { "type": "string" },
        },
      ]
    },
    "label": {
      "oneOf": [
        {
          "allOf": [
            { "$ref": "#/definitions/stringOrI18N" },
            {
              "not": {
                "type": "object",
                "properties": {
                  "text": {}
                },
                "required": ["text"]
              }
            }
          ]
        },
        {
          "type": "object",
          "properties": {
            "text": { "$ref": "#/definitions/stringOrI18N" },
            "permanent": { "type": "boolean" },
            "highlight": { "type": "boolean" },
          },
        }
      ]
    }
  },
  "properties": {
    "edges": {
      "type": "array",
      "items": { "$ref": "#/definitions/edgeId" },
    },
    "defaultProperties": {
      "type": "object",
      "properties": {
        "input": { "$ref": "#/definitions/inputValueOrRange" },
        "bias": { "$ref": "#/definitions/trainableValueOrRange" },
        "activationFunc": { "$ref": "#/definitions/activationFunc" },
        "weight": { "$ref": "#/definitions/trainableValueOrRange" },
      },
      "additionalProperties": false,
    },
    "properties": {
      "type": "object",
      "patternProperties": {
        "^((?! -> ).)+$": { // nodes
          "anyOf": [
            {
              "type": "object",
              "properties": {
                "input": { "$ref": "#/definitions/inputValueOrRange" },
              },
              "additionalProperties": false,
            },
            {
              "type": "object",
              "properties": {
                "bias": { "$ref": "#/definitions/trainableValueOrRange" },
                "activationFunc": { "$ref": "#/definitions/activationFunc" },
              },
              "additionalProperties": false,
            },
          ],
        },
        "^(.+) -> (.+)$": { // edges
          "type": "object",
          "properties": {
            "weight": { "$ref": "#/definitions/trainableValueOrRange" }
          },
          "additionalProperties": false,
        }
      },
    },
    "layout": {
      "type": "array",
      "items": {
        "type": "array",
        "items": {
          "anyOf": [
            { "const": "" },
            { "$ref": "#/definitions/nodeId" },
          ]
        }
      }
    },
    "training": {
      "type": "object",
      "properties": {
        "inputs": {
          "type": "object",
          "propertyNames": { "$ref": "#/definitions/nodeId" },
          "additionalProperties": {
            "type": "array",
            "items": { "type": "number" }
          }
        },
        "outputs": {
          "type": "object",
          "propertyNames": { "$ref": "#/definitions/nodeId" },
          "additionalProperties": { "type": "string" },
        },
      },
      "required": ["outputs"],
    },
    "title": { "$ref": "#/definitions/stringOrI18N" },
    "description": { "$ref": "#/definitions/stringOrI18N" },
    "labels": {
      "type": "object",
      "patternProperties": {
        "^((?! -> ).)+$": { // nodes
          "anyOf": [
            {
              "type": "object",
              "properties": {
                "node": { "$ref": "#/definitions/label" },
                "input": { "$ref": "#/definitions/label" },
              },
              "additionalProperties": false,
            },
            {
              "type": "object",
              "properties": {
                "node": { "$ref": "#/definitions/label" },
                "bias": { "$ref": "#/definitions/label" },
                "activationFunc": { "$ref": "#/definitions/label" },
              },
              "additionalProperties": false,
            },
          ],
        },
        "^(.+) -> (.+)$": { // edges
          "type": "object",
          "properties": {
            "weight": { "$ref": "#/definitions/label" },
          },
          "additionalProperties": false,
        }
      },
    },
  },
  "required": ["edges", "training"],
  "additionalProperties": false,
};

export default levelSchema;
export { levelSchema };
