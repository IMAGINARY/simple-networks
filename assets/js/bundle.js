(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configSchema = exports["default"] = void 0;
var configSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Simple Networks Config File",
  "description": "A configuration file of the Simple-Network exhibit",
  "type": "object",
  "definitions": {},
  "properties": {
    "levels": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "minItems": 1,
      "uniqueItems": true
    },
    "languages": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "minItems": 1,
      "uniqueItems": true
    }
  },
  "required": ["levels", "languages"],
  "additionalProperties": false
};
exports.configSchema = configSchema;
var _default = configSchema;
exports["default"] = _default;

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.levelSchema = exports["default"] = void 0;
var levelSchema = {
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
      "items": {
        "type": "number"
      }
    },
    "minMaxRange": {
      "type": "object",
      "properties": {
        "min": {
          "type": "number"
        },
        "max": {
          "type": "number"
        },
        "additionalProperties": false
      }
    },
    "inputValueOrRange": {
      "oneOf": [{
        "type": "number"
      }, {
        "type": "object",
        "properties": {
          "value": {
            "type": "number"
          },
          "range": {
            "oneOf": [{
              "$ref": "#/definitions/enumRange"
            }, {
              "$ref": "#/definitions/minMaxRange"
            }]
          },
          "additionalProperties": false
        }
      }]
    },
    "trainableValueOrRange": {
      "oneOf": [{
        "type": "number"
      }, {
        "type": "object",
        "properties": {
          "value": {
            "type": "number"
          },
          "range": {
            "$ref": "#/definitions/minMaxRange"
          },
          "train": {
            "type": "boolean"
          }
        },
        "additionalProperties": false
      }]
    },
    "activationFunc": {
      "enum": ["binary", "linear", "relu", "sigmoid"]
    },
    "stringOrI18N": {
      "oneOf": [{
        "type": "string"
      }, {
        "type": "object",
        "addtionalProperites": {
          "type": "string"
        }
      }]
    },
    "label": {
      "oneOf": [{
        "allOf": [{
          "$ref": "#/definitions/stringOrI18N"
        }, {
          "not": {
            "type": "object",
            "properties": {
              "text": {}
            },
            "required": ["text"]
          }
        }]
      }, {
        "type": "object",
        "properties": {
          "text": {
            "$ref": "#/definitions/stringOrI18N"
          },
          "alwaysOn": {
            "type": "boolean"
          },
          "highlight": {
            "type": "boolean"
          }
        }
      }]
    }
  },
  "properties": {
    "edges": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/edgeId"
      }
    },
    "defaultProperties": {
      "type": "object",
      "properties": {
        "input": {
          "$ref": "#/definitions/inputValueOrRange"
        },
        "bias": {
          "$ref": "#/definitions/trainableValueOrRange"
        },
        "activationFunc": {
          "$ref": "#/definitions/activationFunc"
        },
        "weight": {
          "$ref": "#/definitions/trainableValueOrRange"
        }
      },
      "additionalProperties": false
    },
    "properties": {
      "type": "object",
      "patternProperties": {
        "^((?! -> ).)+$": {
          // nodes
          "anyOf": [{
            "type": "object",
            "properties": {
              "input": {
                "$ref": "#/definitions/inputValueOrRange"
              }
            },
            "additionalProperties": false
          }, {
            "type": "object",
            "properties": {
              "bias": {
                "$ref": "#/definitions/trainableValueOrRange"
              },
              "activationFunc": {
                "$ref": "#/definitions/activationFunc"
              }
            },
            "additionalProperties": false
          }]
        },
        "^(.+) -> (.+)$": {
          // edges
          "type": "object",
          "properties": {
            "weight": {
              "$ref": "#/definitions/trainableValueOrRange"
            }
          },
          "additionalProperties": false
        }
      }
    },
    "layout": {
      "type": "array",
      "items": {
        "type": "array",
        "items": {
          "anyOf": [{
            "const": ""
          }, {
            "$ref": "#/definitions/nodeId"
          }]
        }
      }
    },
    "training": {
      "type": "object",
      "properties": {
        "inputs": {
          "type": "object",
          "propertyNames": {
            "$ref": "#/definitions/nodeId"
          },
          "additionalProperties": {
            "type": "array",
            "items": {
              "type": "number"
            }
          }
        },
        "outputs": {
          "type": "object",
          "propertyNames": {
            "$ref": "#/definitions/nodeId"
          },
          "additionalProperties": {
            "type": "string"
          }
        }
      },
      "required": ["outputs"]
    },
    "title": {
      "$ref": "#/definitions/stringOrI18N"
    },
    "description": {
      "$ref": "#/definitions/stringOrI18N"
    },
    "labels": {
      "type": "object",
      "patternProperties": {
        "^((?! -> ).)+$": {
          // nodes
          "anyOf": [{
            "type": "object",
            "properties": {
              "name": {
                "$ref": "#/definitions/label"
              },
              "description": {
                "$ref": "#/definitions/label"
              },
              "input": {
                "$ref": "#/definitions/label"
              }
            },
            "additionalProperties": false
          }, {
            "type": "object",
            "properties": {
              "name": {
                "$ref": "#/definitions/label"
              },
              "description": {
                "$ref": "#/definitions/label"
              },
              "bias": {
                "$ref": "#/definitions/label"
              },
              "activationFunc": {
                "$ref": "#/definitions/label"
              }
            },
            "additionalProperties": false
          }]
        },
        "^(.+) -> (.+)$": {
          // edges
          "type": "object",
          "properties": {
            "weight": {
              "$ref": "#/definitions/label"
            }
          },
          "additionalProperties": false
        }
      }
    }
  },
  "required": ["edges", "training"],
  "additionalProperties": false
};
exports.levelSchema = levelSchema;
var _default = levelSchema;
exports["default"] = _default;

},{}],3:[function(require,module,exports){
"use strict";

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

require("core-js/modules/web.url");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.load = exports["default"] = load;

var _lodash = require("lodash");

var _validator = require("./validator");

var _languageUtils = require("../util/language-utils");

var _configSchema = require("./config-schema");

var validate = _validator.Validator.createValidateFunction(_configSchema.configSchema);

function load(configObj, configUrl) {
  var _validate = validate(configObj),
      valid = _validate.valid,
      errors = _validate.errors;

  if (!valid) {
    console.error(errors);
    throw new Error("Unable to validate config file ".concat(configUrl.href, ". Please check the developer console for details."));
  }

  var result = {
    levels: processLevels(configObj.levels),
    languages: processLanguageTags(configObj.languages)
  };
  return result;
}

function processLevels(levelNames) {
  return levelNames.map(function (levelName) {
    return {
      name: levelName,
      url: convertLevelNameToUrl(levelName)
    };
  });
}

var levelBase = new URL('./assets/levels/', window.location.href).href;
var extension = 'yaml';

function convertLevelNameToUrl(name) {
  return new URL("".concat(name, ".").concat(extension), levelBase);
}

function processLanguageTags(tags) {
  return (0, _lodash.uniq)(tags.map(_languageUtils.normalizeAndStripBCP47Tag));
}

},{"../util/language-utils":28,"./config-schema":1,"./validator":5,"core-js/modules/es.array.concat":160,"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.map":174,"core-js/modules/es.object.to-string":200,"core-js/modules/es.string.iterator":209,"core-js/modules/web.dom-collections.iterator":218,"core-js/modules/web.url":220,"lodash":"lodash"}],4:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.find-index");

require("core-js/modules/es.array.flat");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.is-array");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.array.unscopables.flat");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.name");

require("core-js/modules/es.number.constructor");

require("core-js/modules/es.object.assign");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.entries");

require("core-js/modules/es.object.from-entries");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.object.values");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.load = exports["default"] = load;

var _lodash = require("lodash");

var _intervalArithmetic = _interopRequireWildcard(require("interval-arithmetic"));

var _validator = require("./validator");

var _model = _interopRequireDefault(require("../neural-network/model"));

var activationFunctions = _interopRequireWildcard(require("../neural-network/activation-functions"));

var _network = _interopRequireDefault(require("../neural-network/network"));

var _mathExpression = _interopRequireDefault(require("../util/math-expression"));

var _generateLayout = _interopRequireDefault(require("../util/generate-layout"));

var _transpose = _interopRequireDefault(require("../util/transpose"));

var _levelSchema = require("./level-schema");

var _languageUtils = require("../util/language-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var validate = _validator.Validator.createValidateFunction(_levelSchema.levelSchema);

function load(_ref) {
  var _levelObj$properties, _levelObj$properties2, _levelObj$layout;

  var levelObj = _ref.object,
      url = _ref.url,
      name = _ref.name;

  var _validate = validate(levelObj),
      valid = _validate.valid,
      errors = _validate.errors;

  if (!valid) {
    console.error(errors);
    throw new Error("Unable to validate level ".concat(name, " from file ").concat(url.href, ". Please check the developer console for details."));
  }

  var _processDefaultProper = processDefaultProperties(levelObj.defaultProperties),
      nodeDefaults = _processDefaultProper.nodeDefaults,
      edgeDefaults = _processDefaultProper.edgeDefaults;

  levelObj.nodes = (0, _lodash.uniq)(levelObj.edges.map(function (e) {
    return Object.values(_network["default"].nodeIdsFromEdgeId(e));
  }).flat());
  var nodeProperties = processNodes(levelObj.nodes, (_levelObj$properties = levelObj.properties) !== null && _levelObj$properties !== void 0 ? _levelObj$properties : {}, nodeDefaults);
  var edgeProperties = processEdges(levelObj.edges, (_levelObj$properties2 = levelObj.properties) !== null && _levelObj$properties2 !== void 0 ? _levelObj$properties2 : {}, edgeDefaults);
  var allProperties = Object.assign({}, nodeProperties, edgeProperties);
  var edgeObjs = levelObj.edges.map(function (eId) {
    return _network["default"].nodeIdsFromEdgeId(eId);
  });
  var network = new _network["default"](edgeObjs);
  var inputNodeIds = network.inputNodeIds;
  var inputs = Object.fromEntries(inputNodeIds.map(function (id) {
    var _nodeProperties$id$in, _nodeProperties$id;

    return [id, (_nodeProperties$id$in = nodeProperties === null || nodeProperties === void 0 ? void 0 : (_nodeProperties$id = nodeProperties[id]) === null || _nodeProperties$id === void 0 ? void 0 : _nodeProperties$id.input) !== null && _nodeProperties$id$in !== void 0 ? _nodeProperties$id$in : 0];
  }));
  var training = processTraining(levelObj.training, network);
  widenInputRange(network, allProperties, levelObj.training.inputs);
  var model = new _model["default"](network, allProperties);
  var layout = (_levelObj$layout = levelObj.layout) !== null && _levelObj$layout !== void 0 ? _levelObj$layout : (0, _generateLayout["default"])(network);
  var strings = processStrings(levelObj.title, levelObj.description, levelObj.labels, "en", model.network);
  return {
    model: model,
    inputs: inputs,
    layout: layout,
    training: training,
    strings: strings
  };
}

function processDefaultProperties(defaultProperties) {
  if (typeof defaultProperties === 'undefined') {
    defaultProperties = {};
  }

  var nodeDefaults = {};

  if ('input' in defaultProperties) {
    var _processValueOrRange = processValueOrRange(defaultProperties.input),
        value = _processValueOrRange.value,
        props = _processValueOrRange.props;

    assignIfDefined(nodeDefaults, 'input', value);
    assignIfDefined(nodeDefaults, 'inputProps', props);
  }

  if ('bias' in defaultProperties) {
    var _processValueOrRange2 = processValueOrRange(defaultProperties.bias),
        _value = _processValueOrRange2.value,
        _props = _processValueOrRange2.props;

    assignIfDefined(nodeDefaults, 'bias', _value);
    assignIfDefined(nodeDefaults, 'biasProps', _props);
  }

  if ('activationFunc' in defaultProperties) {
    nodeDefaults.activationFunc = processActivationFunc(propsIn.activationFunc);
  }

  var edgeDefaults = {};

  if ('weight' in defaultProperties) {
    var _processValueOrRange3 = processValueOrRange(defaultProperties.weight),
        _value2 = _processValueOrRange3.value,
        _props2 = _processValueOrRange3.props;

    assignIfDefined(edgeDefaults, 'weight', _value2);
    assignIfDefined(edgeDefaults, 'weightProps', _props2);
  }

  return {
    nodeDefaults: nodeDefaults,
    edgeDefaults: edgeDefaults
  };
}

function processNodes(nodeIds, allProperties, defaultProperties) {
  return Object.assign.apply(Object, [{}].concat(_toConsumableArray(nodeIds.map(function (nodeId) {
    return _network["default"].canonicalizeNodeId(nodeId);
  }).map(function (nodeId) {
    var nodeProperties = allProperties[nodeId];
    var processedProperties = processNodeProperties(nodeProperties, defaultProperties);
    return (0, _lodash.isEmpty)(processedProperties) ? {} : _defineProperty({}, nodeId, processedProperties);
  }))));
}

function processNodeProperties(propsIn, defaults) {
  var propsOut = (0, _lodash.cloneDeep)(defaults);

  if (typeof propsIn !== 'undefined') {
    if (typeof propsIn.input !== 'undefined') {
      var _processValueOrRange4 = processValueOrRange(propsIn.input),
          value = _processValueOrRange4.value,
          props = _processValueOrRange4.props;

      assignIfDefined(propsOut, 'input', value);
      assignIfDefined(propsOut, 'inputProps', props);
    }

    if (typeof propsIn.bias !== 'undefined') {
      var _processValueOrRange5 = processValueOrRange(propsIn.bias),
          _value3 = _processValueOrRange5.value,
          _props3 = _processValueOrRange5.props;

      assignIfDefined(propsOut, 'bias', _value3);
      assignIfDefined(propsOut, 'biasProps', _props3);
    }

    if (typeof propsIn.activationFunc !== 'undefined') {
      propsOut.activationFunc = processActivationFunc(propsIn.activationFunc);
    }
  }

  return propsOut;
}

function processEdges(edgeIds, allProperties, defaults) {
  return Object.assign.apply(Object, [{}].concat(_toConsumableArray(edgeIds.map(function (edgeId) {
    return _network["default"].canonicalizeEdgeId(edgeId);
  }).map(function (edgeId) {
    var edgeProperties = allProperties[edgeId];
    var processedProperties = processEdgeProperties(edgeProperties, defaults);
    return (0, _lodash.isEmpty)(processedProperties) ? {} : _defineProperty({}, edgeId, processedProperties);
  }))));
}

function processEdgeProperties(propsIn, defaults) {
  var propsOut = (0, _lodash.cloneDeep)(defaults);

  if (typeof propsIn !== 'undefined') {
    if (typeof propsIn.weight !== 'undefined') {
      var _processValueOrRange6 = processValueOrRange(propsIn.weight),
          value = _processValueOrRange6.value,
          props = _processValueOrRange6.props;

      assignIfDefined(propsOut, 'weight', value);
      assignIfDefined(propsOut, 'weightProps', props);
    }
  }

  return propsOut;
}

function assignIfDefined(obj, propName, value) {
  if (typeof value !== 'undefined') {
    obj[propName] = value;
  }
}

function processValueOrRange(valueOrRange) {
  if (typeof valueOrRange === 'number') {
    return {
      value: valueOrRange
    };
  } else {
    var result = {};

    if (typeof valueOrRange.value !== 'undefined') {
      result.value = valueOrRange.value;
    }

    if (typeof valueOrRange.train !== 'undefined') {
      var _result$props;

      result.props = (_result$props = result.props) !== null && _result$props !== void 0 ? _result$props : {};
      result.props.train = valueOrRange.train;
    }

    if (typeof valueOrRange.range !== 'undefined') {
      var _result$props2;

      result.props = (_result$props2 = result.props) !== null && _result$props2 !== void 0 ? _result$props2 : {};
      result.props.range = processRange(valueOrRange.range);
    }

    return result;
  }
}

function processRange(range) {
  if (Array.isArray(range)) {
    return range;
  } else {
    return new _intervalArithmetic.Interval(range.min, range.max);
  }
}

function processActivationFunc(activationFuncName) {
  return activationFunctions[activationFuncName];
}

function processTraining(_ref4, network) {
  var inputs = _ref4.inputs,
      outputs = _ref4.outputs;
  var result = {};

  if (typeof inputs === 'undefined') {
    result.inputs = [];
  } else {
    // check if all input nodes are listed and have equal number of values
    inputs = canonicalizedNodeIdProperties(inputs);
    var inputsInOrder = network.inputNodes.map(function (_ref5) {
      var id = _ref5.id;
      return inputs[id];
    });
    var firstMissingInput = inputsInOrder.findIndex(function (entry) {
      return typeof entry === 'undefined';
    });

    if (firstMissingInput >= 0) {
      throw new Error("Missing training inputs for node ".concat(network.inputNodes[firstMissingInput].id));
    }

    var lengths = inputsInOrder.map(function (values) {
      return values.length;
    });
    var minLength = Math.min.apply(Math, _toConsumableArray(lengths));
    var maxLength = Math.max.apply(Math, _toConsumableArray(lengths));

    if (minLength === maxLength) {
      result.inputs = (0, _transpose["default"])(inputsInOrder);
    } else {
      throw new Error("All input nodes must have equal number of training samples (min: ".concat(minLength, ", max: ").concat(maxLength, ")"));
    }
  } // check if all output nodes are listed


  outputs = canonicalizedNodeIdProperties(outputs);
  var targetActivationFuncsInOrder = network.outputNodes.map(function (_ref6) {
    var id = _ref6.id;
    return id;
  }).map(function (id) {
    return typeof outputs[id] === 'undefined' ? undefined : processExpression(outputs[id], network);
  });
  var firstMissingOutput = targetActivationFuncsInOrder.findIndex(function (entry) {
    return typeof entry === 'undefined';
  });

  if (firstMissingOutput >= 0) {
    throw new Error("Missing training outputs for node ".concat(network.outputNodes[firstMissingOutput].id));
  }

  result.targetActivationFuncs = targetActivationFuncsInOrder;
  return result;
}

function canonicalizedNodeIdProperties(obj) {
  return Object.fromEntries(Object.entries(obj).map(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2),
        id = _ref8[0],
        value = _ref8[1];

    return [_network["default"].canonicalizeNodeId(id), value];
  }));
}

function processExpression(expression, network) {
  var mathExpr = new _mathExpression["default"](expression); // Test if the expressions only references input nodes and throw exception if not.

  var varTestProxy = new Proxy({}, {
    has: function has(target, property) {
      if (!network.hasNode(property)) {
        throw new ReferenceError("Unknown input node ".concat(property, " in expression ").concat(expression));
      } else {
        return true;
      }
    },
    get: function get(target, property) {
      return this.has(target, property) ? Number.NaN : Number.NaN;
    }
  });
  mathExpr(varTestProxy);
  return mathExpr;
}

function widenInputRange(network, properties, trainingInputs) {
  var p = properties;

  var ensureInputProps = function ensureInputProps(id) {
    var _p$id, _p$id$inputProps;

    p[id] = (_p$id = p[id]) !== null && _p$id !== void 0 ? _p$id : {};
    p[id].inputProps = (_p$id$inputProps = p[id].inputProps) !== null && _p$id$inputProps !== void 0 ? _p$id$inputProps : {};
    return p[id].inputProps;
  };

  network.inputNodeIds.forEach(function (id) {
    var _p$id2;

    if (typeof (trainingInputs === null || trainingInputs === void 0 ? void 0 : trainingInputs[id]) !== 'undefined') {
      var inputProps = ensureInputProps(id);
      var inputsForId = trainingInputs[id];

      if (Array.isArray(inputProps.range)) {
        // Add training inputs to list of possible inputs
        inputProps.range = (0, _lodash.uniq)(inputProps.range.concat(inputsForId));
      } else {
        var _inputProps$range;

        // Use the hull of the current range and the training inputs range
        var minRange = new _intervalArithmetic.Interval(Math.min.apply(Math, _toConsumableArray(inputsForId)), Math.max.apply(Math, _toConsumableArray(inputsForId)));
        inputProps.range = _intervalArithmetic["default"].hull((_inputProps$range = inputProps.range) !== null && _inputProps$range !== void 0 ? _inputProps$range : minRange, minRange);
      }
    }

    if (typeof (p === null || p === void 0 ? void 0 : (_p$id2 = p[id]) === null || _p$id2 === void 0 ? void 0 : _p$id2.input) !== 'undefined') {
      var _inputProps = ensureInputProps(id);

      if (Array.isArray(_inputProps.range)) {
        // Add initial inputs to list of possible inputs
        _inputProps.range = (0, _lodash.uniq)([].concat(_toConsumableArray(_inputProps.range), [p[id].input]));
      } else {
        // Use the hull of the current range and the initial inputs
        _inputProps.range = _intervalArithmetic["default"].hull(_inputProps.range, new _intervalArithmetic.Interval(p[id].input));
      }
    }
  });
}

function processStrings(title, description, allLabels, defaultLanguage, network) {
  var result = {};

  if (typeof title !== 'undefined') {
    result.title = processStringOrI18N(title, defaultLanguage);
  }

  if (typeof description !== 'undefined') {
    result.description = processStringOrI18N(description, defaultLanguage);
  }

  if (typeof allLabels !== 'undefined') {
    result.labels = Object.fromEntries(Object.entries(allLabels).map(function (_ref9) {
      var _ref10 = _slicedToArray(_ref9, 2),
          id = _ref10[0],
          labelsForId = _ref10[1];

      return processLabelsForId(id, labelsForId, defaultLanguage, network);
    }));
  }

  return result;
}

function processLabelsForId(id, labels, defaultLanguage, network) {
  var hasNode = network.hasNode(id);

  var hasEdge = function () {
    try {
      var _FeedForwardNetwork$n = _network["default"].nodeIdsFromEdgeId(id),
          from = _FeedForwardNetwork$n.from,
          to = _FeedForwardNetwork$n.to;

      return network.hasEdge(from, to);
    } catch (e) {
      return false;
    }
  }(); // Check for errors


  if (!hasNode && !hasEdge) {
    throw new Error("Network has no node or edge named '".concat(id, "'"));
  } else if (hasNode && hasEdge) {
    throw new Error("Id '".concat(id, "' is ambiguous: both, node and edge, exist with this name"));
  } // Process either as node or edge label


  var canonicalId = hasNode ? _network["default"].canonicalizeNodeId(id) : _network["default"].canonicalizeEdgeId(id);
  return [canonicalId, Object.fromEntries(Object.entries(labels).map(function (_ref11) {
    var _ref12 = _slicedToArray(_ref11, 2),
        prop = _ref12[0],
        label = _ref12[1];

    return [prop, processLabel(label, defaultLanguage)];
  }))];
}

function processLabel(label, defaultLanguage) {
  if (typeof label === 'string') {
    return {
      text: processStringOrI18N(label, defaultLanguage)
    };
  } else {
    var result = {};
    assignIfDefined(result, 'text', processStringOrI18N(label.text, defaultLanguage));
    assignIfDefined(result, 'permanent', label.permanent);
    assignIfDefined(result, 'highlight', label.highlight);
    return result;
  }
}

function processStringOrI18N(text, defaultLanguage) {
  if (typeof text === 'undefined') {
    return {};
  } else if (typeof text === 'string') {
    var result = {};
    result[defaultLanguage] = text;
    return result;
  } else {
    var i18nObj = text;
    return Object.fromEntries(Object.entries(i18nObj).map(function (_ref13) {
      var _ref14 = _slicedToArray(_ref13, 2),
          tag = _ref14[0],
          text = _ref14[1];

      return [(0, _languageUtils.normalizeAndStripBCP47Tag)(tag), text];
    }));
  }
}

},{"../neural-network/activation-functions":7,"../neural-network/model":8,"../neural-network/network":9,"../util/generate-layout":26,"../util/language-utils":28,"../util/math-expression":29,"../util/transpose":31,"./level-schema":2,"./validator":5,"core-js/modules/es.array.concat":160,"core-js/modules/es.array.find-index":163,"core-js/modules/es.array.flat":165,"core-js/modules/es.array.for-each":166,"core-js/modules/es.array.from":167,"core-js/modules/es.array.is-array":170,"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.map":174,"core-js/modules/es.array.slice":177,"core-js/modules/es.array.unscopables.flat":179,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.name":182,"core-js/modules/es.number.constructor":184,"core-js/modules/es.object.assign":186,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.entries":190,"core-js/modules/es.object.from-entries":192,"core-js/modules/es.object.to-string":200,"core-js/modules/es.object.values":201,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.iterator":209,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.for-each":217,"core-js/modules/web.dom-collections.iterator":218,"interval-arithmetic":"interval-arithmetic","lodash":"lodash"}],5:[function(require,module,exports){
"use strict";

require("core-js/modules/es.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Validator = exports["default"] = void 0;

var _ajv = _interopRequireDefault(require("ajv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ajv = new _ajv["default"]({
  allErrors: true
});

var Validator = /*#__PURE__*/function () {
  function Validator(schema) {
    _classCallCheck(this, Validator);

    this._ajvValidate = ajv.compile(schema);
  }

  _createClass(Validator, [{
    key: "validate",
    value: function validate(obj) {
      var valid = this._ajvValidate(obj);

      return {
        valid: valid,
        errors: this._ajvValidate.errors
      };
    }
  }], [{
    key: "createValidateFunction",
    value: function createValidateFunction(schema) {
      var v = new Validator(schema);
      return function (obj) {
        return v.validate(obj);
      };
    }
  }]);

  return Validator;
}();

exports.Validator = exports["default"] = Validator;

},{"ajv":"ajv","core-js/modules/es.object.define-property":189}],6:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.is-array");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.name");

require("core-js/modules/es.object.define-properties");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.from-entries");

require("core-js/modules/es.object.get-own-property-descriptor");

require("core-js/modules/es.object.get-own-property-descriptors");

require("core-js/modules/es.object.keys");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/es.string.search");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

require("core-js/modules/web.url");

require("regenerator-runtime/runtime");

var _documentReady = _interopRequireDefault(require("document-ready"));

var langmap = _interopRequireWildcard(require("langmap"));

var _controller = require("./ui/neural-network/controller");

var _controller2 = require("./ui/slider/controller");

var _controller3 = require("./ui/level/controller");

var _yamlLoader = require("./util/yaml-loader");

var _i18n = _interopRequireDefault(require("./util/i18n"));

var _loadLevel = require("./file-formats/load-level");

var _loadConfig2 = require("./file-formats/load-config");

var _asyncFunctionQueue = require("./util/async-function-queue");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SequentialLevelLoader = /*#__PURE__*/function () {
  function SequentialLevelLoader(i18n) {
    _classCallCheck(this, SequentialLevelLoader);

    this._i18n = i18n;

    this._dummyDisposeLevel = function () {
      return true;
    };

    this._disposeLevel = this._dummyDisposeLevel;
    this._asyncFunctionQueue = new _asyncFunctionQueue.AsyncFunctionQueue();
  }

  _createClass(SequentialLevelLoader, [{
    key: "load",
    value: function () {
      var _load2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(level) {
        var _this = this;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._asyncFunctionQueue.enqueue( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                  return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          _context.next = 2;
                          return _this._load(level);

                        case 2:
                          return _context.abrupt("return", _context.sent);

                        case 3:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee);
                })));

              case 2:
                return _context2.abrupt("return", _context2.sent);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function load(_x) {
        return _load2.apply(this, arguments);
      }

      return load;
    }()
  }, {
    key: "_loadUI",
    value: function _loadUI(_ref2) {
      var name = _ref2.name,
          model = _ref2.model,
          inputs = _ref2.inputs,
          training = _ref2.training,
          layout = _ref2.layout,
          strings = _ref2.strings;

      this._i18n.addLevelStrings(name, strings);

      var networkParentElem = document.querySelector('#network-container');
      var networkController = new _controller.Controller({
        levelName: name,
        networkModel: model,
        inputs: inputs,
        targetActivationFuncs: training.targetActivationFuncs,
        layout: layout,
        parentElem: networkParentElem,
        strings: strings,
        i18n: this._i18n
      });
      var inputNodeIds = model.network.inputNodeIds;

      var mapInputs = function mapInputs(inputs) {
        return Object.fromEntries(inputNodeIds.map(function (id, i) {
          return [id, inputs[i]];
        }));
      };

      var computeTargets = function computeTargets(inputs) {
        var inputsMap = mapInputs(inputs);
        var targets = training.targetActivationFuncs.map(function (f) {
          return f(inputsMap);
        });
        return targets;
      };

      var trainingTargets = training.inputs.map(computeTargets);
      var levelController = new _controller3.Controller({
        networkModel: model,
        trainingInputs: training.inputs,
        trainingTargets: trainingTargets,
        i18n: this._i18n
      });
      return {
        networkController: networkController,
        levelController: levelController
      };
    }
  }, {
    key: "_load",
    value: function () {
      var _load3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref3) {
        var name, url, _this$_loadUI, networkController, levelController;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                name = _ref3.name, url = _ref3.url;

                // dispose the old level
                this._disposeLevel();

                this._disposeLevel = function () {
                  return true;
                };

                _context3.t0 = this;
                _context3.next = 6;
                return SequentialLevelLoader._loadNonUI({
                  name: name,
                  url: url
                });

              case 6:
                _context3.t1 = _context3.sent;
                _this$_loadUI = _context3.t0._loadUI.call(_context3.t0, _context3.t1);
                networkController = _this$_loadUI.networkController;
                levelController = _this$_loadUI.levelController;

                // set new level disposer for when the next level is loaded
                this._disposeLevel = function () {
                  networkController.dispose();
                  levelController.dispose();
                };

                return _context3.abrupt("return", true);

              case 12:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _load(_x2) {
        return _load3.apply(this, arguments);
      }

      return _load;
    }()
  }], [{
    key: "preload",
    value: function () {
      var _preload = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var _len,
            levels,
            _key,
            preloadSingle,
            promises,
            _args5 = arguments;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                for (_len = _args5.length, levels = new Array(_len), _key = 0; _key < _len; _key++) {
                  levels[_key] = _args5[_key];
                }

                preloadSingle = /*#__PURE__*/function () {
                  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(level) {
                    return regeneratorRuntime.wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            _context4.next = 2;
                            return SequentialLevelLoader._loadNonUI(level);

                          case 2:
                            return _context4.abrupt("return", _context4.sent);

                          case 3:
                          case "end":
                            return _context4.stop();
                        }
                      }
                    }, _callee4);
                  }));

                  return function preloadSingle(_x3) {
                    return _ref4.apply(this, arguments);
                  };
                }();

                promises = levels.map(preloadSingle);
                _context5.next = 5;
                return Promise.allSettled(promises);

              case 5:
                return _context5.abrupt("return", _context5.sent.map(function (o, i) {
                  return {
                    level: levels[i],
                    outcome: o
                  };
                }));

              case 6:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function preload() {
        return _preload.apply(this, arguments);
      }

      return preload;
    }()
  }, {
    key: "_loadNonUI",
    value: function () {
      var _loadNonUI2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(_ref5) {
        var name, url, levelObj;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                name = _ref5.name, url = _ref5.url;
                _context6.next = 3;
                return _yamlLoader.YAMLLoader.fromUrl(url);

              case 3:
                levelObj = _context6.sent;
                return _context6.abrupt("return", _objectSpread({
                  name: name,
                  url: url
                }, (0, _loadLevel.load)({
                  object: levelObj,
                  name: name,
                  url: url
                })));

              case 5:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function _loadNonUI(_x4) {
        return _loadNonUI2.apply(this, arguments);
      }

      return _loadNonUI;
    }()
  }]);

  return SequentialLevelLoader;
}();

function processPreloadResults(levelPreloadResults) {
  var warn = function warn(_ref6) {
    var name = _ref6.level.name,
        reason = _ref6.outcome.reason;
    console.warn("Unable to preload level '".concat(name, "'."), reason);
  };

  levelPreloadResults.filter(function (r) {
    return r.outcome.status === 'rejected';
  }).forEach(warn);
}

function setupLanguageSelector(i18n, supportedLanguages) {
  var i18next = i18n.getI18NextInstance();
  var currentLng = i18next.language;
  var languageSelector = document.querySelector('#language-selector');
  supportedLanguages.forEach(function (lng) {
    var name = langmap[lng].nativeName;
    var option = document.createElement('option');
    option.value = lng;
    option.innerText = name;
    languageSelector.appendChild(option);
  });
  languageSelector.value = currentLng;

  var localizeMain = function localizeMain() {
    return i18n.localize('.footer, .train .trainingdata, .train .helper');
  };

  var handleLanguageChange = /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(lng) {
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return i18next.changeLanguage(lng);

            case 2:
              localizeMain();

            case 3:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));

    return function handleLanguageChange(_x5) {
      return _ref7.apply(this, arguments);
    };
  }();

  languageSelector.addEventListener('change', /*#__PURE__*/function () {
    var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(event) {
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return handleLanguageChange(event.target.value);

            case 2:
              return _context8.abrupt("return", _context8.sent);

            case 3:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    }));

    return function (_x6) {
      return _ref8.apply(this, arguments);
    };
  }());
  i18next.on('languageChanged', function (lng) {
    if (lng !== currentLng) {
      var url = new URL(window.location.href);
      var urlSearchParams = new URLSearchParams(url.search);

      if (urlSearchParams.has('lang')) {
        urlSearchParams.set('lang', lng);
        url.search = urlSearchParams.toString();
        window.history.pushState({
          path: url.href
        }, '', url.href);
      }
    }
  });
  localizeMain();
}

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
    var parent, oldSvg, configUrl, configObj, _loadConfig, levels, languages, i18n, levelLoader, sliderController;

    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            parent = document.createElement('div');
            parent.id = 'network-container';
            parent.style.position = 'absolute';
            parent.style.top = '150px';
            parent.style.left = '100px';
            oldSvg = document.querySelector('svg');
            oldSvg.parentElement.insertBefore(parent, oldSvg); // TODO: move to pug/CSS

            configUrl = new URL('./assets/config/default.yaml', window.location.href);
            _context9.next = 10;
            return _yamlLoader.YAMLLoader.fromUrl(configUrl);

          case 10:
            configObj = _context9.sent;
            _loadConfig = (0, _loadConfig2.load)(configObj, configUrl), levels = _loadConfig.levels, languages = _loadConfig.languages;
            _context9.next = 14;
            return (0, _i18n["default"])(languages, true);

          case 14:
            i18n = _context9.sent;
            setupLanguageSelector(i18n, languages);
            SequentialLevelLoader.preload.apply(SequentialLevelLoader, _toConsumableArray(levels)).then(processPreloadResults);
            levelLoader = new SequentialLevelLoader(i18n);
            sliderController = new _controller2.Controller(levels.map(function (_ref9) {
              var name = _ref9.name,
                  url = _ref9.url;
              return name;
            }));
            sliderController.on('current-slide-changed', function (_, i) {
              return levelLoader.load(levels[i]);
            });
            _context9.next = 22;
            return levelLoader.load(levels[sliderController.getModel().getCurrentSlideIndex()]);

          case 22:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return _main.apply(this, arguments);
}

(0, _documentReady["default"])(main);

},{"./file-formats/load-config":3,"./file-formats/load-level":4,"./ui/level/controller":10,"./ui/neural-network/controller":14,"./ui/slider/controller":18,"./util/async-function-queue":21,"./util/i18n":27,"./util/yaml-loader":32,"core-js/modules/es.array.filter":162,"core-js/modules/es.array.for-each":166,"core-js/modules/es.array.from":167,"core-js/modules/es.array.is-array":170,"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.map":174,"core-js/modules/es.array.slice":177,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.name":182,"core-js/modules/es.object.define-properties":188,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.from-entries":192,"core-js/modules/es.object.get-own-property-descriptor":193,"core-js/modules/es.object.get-own-property-descriptors":194,"core-js/modules/es.object.keys":198,"core-js/modules/es.object.to-string":200,"core-js/modules/es.promise":203,"core-js/modules/es.regexp.exec":205,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.iterator":209,"core-js/modules/es.string.search":211,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.for-each":217,"core-js/modules/web.dom-collections.iterator":218,"core-js/modules/web.url":220,"document-ready":"document-ready","langmap":"langmap","regenerator-runtime/runtime":221}],7:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.object.create");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.set-prototype-of");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.reflect.construct");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sigmoid = exports.relu = exports.linear = exports.binary = void 0;

var _intervalArithmetic = _interopRequireWildcard(require("interval-arithmetic"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ActivationFunction = /*#__PURE__*/function () {
  function ActivationFunction() {
    _classCallCheck(this, ActivationFunction);
  }

  _createClass(ActivationFunction, [{
    key: "f",
    value: function f(z) {
      throw new Error('unimplemented');
    }
  }, {
    key: "dF",
    value: function dF(z) {
      throw new Error('unimplemented');
    }
  }, {
    key: "range",
    value: function range(i) {
      return new _intervalArithmetic.Interval(this.f(i.lo), this.f(i.hi));
    }
  }]);

  return ActivationFunction;
}();

var BinaryActivationFunction = /*#__PURE__*/function (_ActivationFunction) {
  _inherits(BinaryActivationFunction, _ActivationFunction);

  var _super = _createSuper(BinaryActivationFunction);

  function BinaryActivationFunction() {
    _classCallCheck(this, BinaryActivationFunction);

    return _super.call(this);
  }

  _createClass(BinaryActivationFunction, [{
    key: "f",
    value: function f(z) {
      return z < 0 ? 0 : 1;
    }
  }, {
    key: "dF",
    value: function dF(z) {
      return function (z) {
        return 0;
      };
    }
  }]);

  return BinaryActivationFunction;
}(ActivationFunction);

var LinearActivationFunction = /*#__PURE__*/function (_ActivationFunction2) {
  _inherits(LinearActivationFunction, _ActivationFunction2);

  var _super2 = _createSuper(LinearActivationFunction);

  function LinearActivationFunction() {
    _classCallCheck(this, LinearActivationFunction);

    return _super2.call(this);
  }

  _createClass(LinearActivationFunction, [{
    key: "f",
    value: function f(z) {
      return z;
    }
  }, {
    key: "dF",
    value: function dF(z) {
      return 1;
    }
  }]);

  return LinearActivationFunction;
}(ActivationFunction);

var ReLUActivationFunction = /*#__PURE__*/function (_ActivationFunction3) {
  _inherits(ReLUActivationFunction, _ActivationFunction3);

  var _super3 = _createSuper(ReLUActivationFunction);

  function ReLUActivationFunction() {
    _classCallCheck(this, ReLUActivationFunction);

    return _super3.call(this);
  }

  _createClass(ReLUActivationFunction, [{
    key: "f",
    value: function f(z) {
      return Math.max(0, z);
    }
  }, {
    key: "dF",
    value: function dF(z) {
      return z < 0 ? 0 : 1;
    }
  }]);

  return ReLUActivationFunction;
}(ActivationFunction);

var SigmoidActivationFunction = /*#__PURE__*/function (_ActivationFunction4) {
  _inherits(SigmoidActivationFunction, _ActivationFunction4);

  var _super4 = _createSuper(SigmoidActivationFunction);

  function SigmoidActivationFunction() {
    _classCallCheck(this, SigmoidActivationFunction);

    return _super4.call(this);
  }

  _createClass(SigmoidActivationFunction, [{
    key: "f",
    value: function f(z) {
      return 1 / (1 + Math.exp(-z));
    }
  }, {
    key: "dF",
    value: function dF(z) {
      var e = Math.exp(-z);
      return e / ((1 + e) * (1 + e));
    }
  }, {
    key: "range",
    value: function range(i) {
      return _intervalArithmetic["default"].div(_intervalArithmetic.Interval.ONE, _intervalArithmetic["default"].add(_intervalArithmetic.Interval.ONE, _intervalArithmetic["default"].exp(_intervalArithmetic["default"].negative(i))));
    }
  }]);

  return SigmoidActivationFunction;
}(ActivationFunction);

var binary = new BinaryActivationFunction();
exports.binary = binary;
var linear = new LinearActivationFunction();
exports.linear = linear;
var relu = new ReLUActivationFunction();
exports.relu = relu;
var sigmoid = new SigmoidActivationFunction();
exports.sigmoid = sigmoid;

},{"core-js/modules/es.array.iterator":171,"core-js/modules/es.date.to-string":180,"core-js/modules/es.object.create":187,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.set-prototype-of":199,"core-js/modules/es.object.to-string":200,"core-js/modules/es.reflect.construct":204,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.iterator":209,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.iterator":218,"interval-arithmetic":"interval-arithmetic"}],8:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.is-array");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.reduce");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.name");

require("core-js/modules/es.object.assign");

require("core-js/modules/es.object.create");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.get-prototype-of");

require("core-js/modules/es.object.set-prototype-of");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.reflect.construct");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Model = exports["default"] = void 0;

var _events = require("events");

var _lodash = require("lodash");

var _intervalArithmetic = require("interval-arithmetic");

var ActivationFunctions = _interopRequireWildcard(require("./activation-functions"));

var _clamp2 = _interopRequireDefault(require("../util/clamp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Model = /*#__PURE__*/function (_EventEmitter) {
  _inherits(Model, _EventEmitter);

  var _super = _createSuper(Model);

  function Model(network, properties) {
    var _this;

    _classCallCheck(this, Model);

    _this = _super.call(this);
    var p = Object.assign.apply(Object, [{}].concat(_toConsumableArray(network.nodeIds.map(function (id) {
      var _properties$id;

      return _defineProperty({}, id, (_properties$id = properties[id]) !== null && _properties$id !== void 0 ? _properties$id : {});
    })), _toConsumableArray(network.edgeIds.map(function (id) {
      var _properties$id2;

      return _defineProperty({}, id, (_properties$id2 = properties[id]) !== null && _properties$id2 !== void 0 ? _properties$id2 : {});
    }))));
    _this.network = network;
    _this.properties = p;
    network.inputNodeIds.forEach(function (id) {
      return p[id] = defaultsForInputNode(p[id]);
    });
    network.innerNodeIds.forEach(function (id) {
      return p[id] = defaultsForInnerNode(p[id]);
    });
    network.outputNodeIds.forEach(function (id) {
      return p[id] = defaultsForOutputNode(p[id]);
    });
    network.edgeIds.forEach(function (id) {
      return p[id] = defaultsForEdge(p[id]);
    }); // Ensure all properties are within their ranges

    _this._clamp();

    return _this;
  }

  _createClass(Model, [{
    key: "setBias",
    value: function setBias(mixed, value) {
      var id = typeof mixed === 'string' ? mixed : mixed.id;
      var clampedValue = (0, _clamp2["default"])(value, this.properties[id].biasProps.range);

      this._setPropIfChangedAndNotify(id, 'bias', clampedValue);
    }
  }, {
    key: "setWeight",
    value: function setWeight(mixed, value) {
      var id = typeof mixed === 'string' ? mixed : mixed.id;
      var clampedValue = (0, _clamp2["default"])(value, this.properties[id].weightProps.range);

      this._setPropIfChangedAndNotify(id, 'weight', clampedValue);
    }
  }, {
    key: "train",
    value: function train(x, y, learningRate) {
      this._resetGradients()._assignInputs(x)._assignTargets(y)._feedForward()._backpropagateError()._updateGradients()._gradientDescentStep(learningRate);

      return this;
    }
  }, {
    key: "trainBatch",
    value: function trainBatch(batch, learningRate) {
      this._resetGradients();

      var _iterator = _createForOfIteratorHelper(batch),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
              x = _step$value[0],
              y = _step$value[1];

          this._assignInputs(x)._feedForward()._assignTargets(y)._backpropagateError()._updateGradients();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this._gradientDescentStep(learningRate);

      return this;
    }
  }, {
    key: "trainBatches",
    value: function trainBatches(batches, learningRate) {
      var _iterator2 = _createForOfIteratorHelper(batches),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var batch = _step2.value;
          this.trainBatch(batch, learningRate);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return this;
    }
  }, {
    key: "predictExt",
    value: function predictExt(x) {
      var copyOtherProperties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var p = this.properties;
      var outP = {};
      this.network.inputNodes.forEach(function (n, i) {
        var np = p[n.id];
        var xi = (0, _clamp2["default"])(x[i], np.inputProps.range);
        outP[n.id] = {
          input: xi,
          sum: xi,
          activation: xi
        };
      });

      var _iterator3 = _createForOfIteratorHelper(this.network.topSortNoInputs),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var n = _step3.value;
          var np = p[n.id];
          var sum = n["in"].reduce(function (a, inEdge) {
            return a + outP[inEdge.from.id].activation * p[inEdge.id].weight;
          }, np.bias);
          var activation = np.activationFunc.f(sum);
          outP[n.id] = {
            sum: sum,
            activation: activation
          };
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      return copyOtherProperties ? (0, _lodash.defaultsDeep)(outP, p) : outP;
    }
  }, {
    key: "predict",
    value: function predict(x) {
      var predictionsExt = this.predictExt(x);
      return this.network.outputNodeIds.map(function (id) {
        var _predictionsExt$id$ac;

        return (_predictionsExt$id$ac = predictionsExt[id].activation) !== null && _predictionsExt$id$ac !== void 0 ? _predictionsExt$id$ac : 0.0;
      });
    }
  }, {
    key: "_clamp",
    value: function _clamp() {
      var _this2 = this;

      var clampProp = function clampProp(obj, prop) {
        return (0, _clamp2["default"])(obj[prop], obj["".concat(prop, "Props")].range);
      };

      this.network.nodeIds.forEach(function (nodeId) {
        return clampProp(_this2.properties[nodeId], 'bias');
      });
      this.network.edgeIds.forEach(function (edgeId) {
        return clampProp(_this2.properties[edgeId], 'weight');
      });
    }
  }, {
    key: "_setPropIfChangedAndNotify",
    value: function _setPropIfChangedAndNotify(id, propName, value) {
      var oldValue = this.properties[id];

      if (oldValue !== value) {
        this.properties[id][propName] = value;
        this.emit('network-property-changed', id, propName, value, oldValue, this);
      }
    }
  }, {
    key: "_setInput",
    value: function _setInput(mixed, value) {
      var id = typeof mixed === 'string' ? mixed : mixed.id;
      this.properties[id].input = (0, _clamp2["default"])(value, this.properties[id].inputProps.range);
    }
  }, {
    key: "_assignInputs",
    value: function _assignInputs(x) {
      var _this3 = this;

      var p = this.properties;
      this.network.inputNodes.forEach(function (n, i) {
        return _this3._setInput(n.id, x[i]);
      });
      return this;
    }
  }, {
    key: "_feedForward",
    value: function _feedForward() {
      var p = this.properties;
      this.network.inputNodes.forEach(function (n) {
        return p[n.id].activation = p[n.id].input;
      });

      var _iterator4 = _createForOfIteratorHelper(this.network.topSortNoInputs),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var node = _step4.value;
          var np = p[node.id];
          np.sum = node["in"].reduce(function (a, inEdge) {
            return a + p[inEdge.from.id].activation * p[inEdge.id].weight;
          }, np.bias);
          np.activation = np.activationFunc.f(np.sum);
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      return this;
    }
  }, {
    key: "_backpropagateError",
    value: function _backpropagateError() {
      var p = this.properties; // Take care of output nodes first

      var _iterator5 = _createForOfIteratorHelper(this.network.outputNodes),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var u = _step5.value;
          var up = p[u.id]; // Compute the error in the output node u using
          // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP1

          up.error = Model.dC(up.activation, up.target) * up.activationFunc.dF(up.sum);
        } // Backpropagate through network

      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      var _iterator6 = _createForOfIteratorHelper(this.network.reverseTopSortNoOutputs),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var _u = _step6.value;
          var _up = p[_u.id]; // Compute the error in the non-output node u using
          // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP2

          _up.error = _u.out.reduce(function (delta_tmp, e) {
            return delta_tmp + p[e.id].weight * p[e.to.id].error;
          }, 0) * _up.activationFunc.dF(_up.sum);
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      return this;
    }
  }, {
    key: "_resetGradients",
    value: function _resetGradients() {
      var p = this.properties;

      var _iterator7 = _createForOfIteratorHelper(this.network.nodes),
          _step7;

      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var u = _step7.value;
          p[u.id]['dC/dBias'] = 0;

          var _iterator8 = _createForOfIteratorHelper(u.out),
              _step8;

          try {
            for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
              var e = _step8.value;
              p[e.id]['dC/dWeight'] = 0;
            }
          } catch (err) {
            _iterator8.e(err);
          } finally {
            _iterator8.f();
          }
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }

      return this;
    }
  }, {
    key: "_updateGradients",
    value: function _updateGradients() {
      var p = this.properties;

      var _iterator9 = _createForOfIteratorHelper(this.network.nodes),
          _step9;

      try {
        for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
          var u = _step9.value;
          // Compute the rate of change of the cost with respect to the bias of u using
          // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP3
          p[u.id]['dC/dBias'] += p[u.id].error; // Compute the rate of change of the cost with respect to the weights of (u,v) for all v using
          // http://neuralnetworksanddeeplearning.com/chap2.html#eqtnBP4

          var _iterator10 = _createForOfIteratorHelper(u.out),
              _step10;

          try {
            for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
              var e = _step10.value;
              p[e.id]['dC/dWeight'] += p[u.id].activation * p[e.to.id].error;
            }
          } catch (err) {
            _iterator10.e(err);
          } finally {
            _iterator10.f();
          }
        }
      } catch (err) {
        _iterator9.e(err);
      } finally {
        _iterator9.f();
      }

      return this;
    }
  }, {
    key: "_gradientDescentStep",
    value: function _gradientDescentStep(learningRate) {
      var p = this.properties;

      var _iterator11 = _createForOfIteratorHelper(this.network.nodes),
          _step11;

      try {
        for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
          var u = _step11.value;
          var up = p[u.id];

          if (up.biasProps.train) {
            this.setBias(u, up.bias - learningRate * up['dC/dBias']);
          }

          var _iterator12 = _createForOfIteratorHelper(u.out),
              _step12;

          try {
            for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
              var e = _step12.value;
              var ep = p[e.id];

              if (ep.weightProps.train) {
                this.setWeight(e, ep.weight - learningRate * ep['dC/dWeight']);
              }
            }
          } catch (err) {
            _iterator12.e(err);
          } finally {
            _iterator12.f();
          }
        }
      } catch (err) {
        _iterator11.e(err);
      } finally {
        _iterator11.f();
      }

      return this;
    }
  }, {
    key: "_readOutputs",
    value: function _readOutputs() {
      var p = this.properties;
      return this.network.outputNodes.map(function (n) {
        return p[n.id].activation;
      });
    }
  }, {
    key: "_assignTargets",
    value: function _assignTargets(y) {
      var p = this.properties;
      this.network.outputNodes.forEach(function (n, i) {
        return p[n.id].target = y[i];
      });
      return this;
    }
  }], [{
    key: "C",
    value: function C(a, y) {
      var diff = a - y;
      return 1.0 / 2.0 * diff * diff;
    }
  }, {
    key: "relC",
    value: function relC(a, y) {
      var diff = (a - y) / y;
      return 1.0 / 2.0 * diff * diff;
    }
  }, {
    key: "dC",
    value: function dC(a, y) {
      return a - y;
    }
  }]);

  return Model;
}(_events.EventEmitter);

exports.Model = exports["default"] = Model;
Model.DEFAULT_INNER_NODE_PROPERTIES = {
  bias: 0,
  biasProps: {
    range: new _intervalArithmetic.Interval(-1, 1),
    train: true
  },
  sum: 0,
  sumProps: {},
  activation: 0,
  activationProps: {},
  activationFunc: ActivationFunctions.relu,
  error: 0,
  'dC/dBias': 0
};
Model.DEFAULT_INPUT_NODE_PROPERTIES = Object.assign((0, _lodash.cloneDeep)(Model.DEFAULT_INNER_NODE_PROPERTIES), {
  input: 0,
  inputProps: {
    range: new _intervalArithmetic.Interval(0, 1)
  },
  activationFunc: ActivationFunctions.linear
});
Model.DEFAULT_OUTPUT_NODE_PROPERTIES = Object.assign((0, _lodash.cloneDeep)(Model.DEFAULT_INNER_NODE_PROPERTIES), {
  activationFunc: ActivationFunctions.linear,
  target: 0,
  targetProps: {}
});
Model.DEFAULT_EDGE_PROPERTIES = {
  weight: 1,
  weightProps: {
    range: new _intervalArithmetic.Interval(-1, 1),
    train: true
  },
  'dC/dWeight': 0
};

function defaultsForInputNode(p) {
  var _p$inputProps;

  if (typeof ((_p$inputProps = p.inputProps) === null || _p$inputProps === void 0 ? void 0 : _p$inputProps.range) !== 'undefined') {
    // inputProps.range might be an array, but defaultsDeep will overwrite it with an object
    // such that we need to save it beforehand and restore it afterwards
    var range = p.inputProps.range;
    delete p.inputProps.range;
    (0, _lodash.defaultsDeep)(p, Model.DEFAULT_INPUT_NODE_PROPERTIES);
    p.inputProps.range = range;
  } else {
    (0, _lodash.defaultsDeep)(p, Model.DEFAULT_INPUT_NODE_PROPERTIES);
  }

  return p;
}

function defaultsForInnerNode(p) {
  (0, _lodash.defaultsDeep)(p, Model.DEFAULT_INNER_NODE_PROPERTIES);
  return p;
}

function defaultsForOutputNode(p) {
  (0, _lodash.defaultsDeep)(p, Model.DEFAULT_OUTPUT_NODE_PROPERTIES);
  return p;
}

function defaultsForEdge(p) {
  (0, _lodash.defaultsDeep)(p, Model.DEFAULT_EDGE_PROPERTIES);
  return p;
}

},{"../util/clamp":22,"./activation-functions":7,"core-js/modules/es.array.concat":160,"core-js/modules/es.array.for-each":166,"core-js/modules/es.array.from":167,"core-js/modules/es.array.is-array":170,"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.map":174,"core-js/modules/es.array.reduce":175,"core-js/modules/es.array.slice":177,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.name":182,"core-js/modules/es.object.assign":186,"core-js/modules/es.object.create":187,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.get-prototype-of":196,"core-js/modules/es.object.set-prototype-of":199,"core-js/modules/es.object.to-string":200,"core-js/modules/es.reflect.construct":204,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.iterator":209,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.for-each":217,"core-js/modules/web.dom-collections.iterator":218,"events":"events","interval-arithmetic":"interval-arithmetic","lodash":"lodash"}],9:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.find");

require("core-js/modules/es.array.flat");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.includes");

require("core-js/modules/es.array.is-array");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.last-index-of");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.array.sort");

require("core-js/modules/es.array.unscopables.flat");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.name");

require("core-js/modules/es.number.constructor");

require("core-js/modules/es.number.max-safe-integer");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.from-entries");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.object.values");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.includes");

require("core-js/modules/es.string.iterator");

require("core-js/modules/es.string.split");

require("core-js/modules/es.string.trim");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FeedForwardNetwork = exports["default"] = void 0;

var _lodash = require("lodash");

var _deepFreeze = require("../util/deep-freeze.js");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var FeedForwardNetwork = /*#__PURE__*/function () {
  /***
   *
   * @param edges [{from, to}]
   */
  function FeedForwardNetwork() {
    var _this = this;

    var edges = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, FeedForwardNetwork);

    var eFromId = function eFromId(e) {
      return Node.canonicalizeId(e.from);
    };

    var eToId = function eToId(e) {
      return Node.canonicalizeId(e.to);
    };

    var eId = function eId(e) {
      return Edge.edgeIdFromNodeIds(e.from, e.to);
    };

    var uniqueNodeIds = (0, _lodash.uniq)(edges.map(function (e) {
      return [eFromId(e), eToId(e)];
    }).flat());
    var uniqueEdgeIds = (0, _lodash.uniq)(edges.map(function (e) {
      return eId(e);
    }));
    this.nodeMap = Object.fromEntries(uniqueNodeIds.map(function (id) {
      return [id, new Node(id)];
    }));
    this.edgeMap = Object.fromEntries(uniqueEdgeIds.map(function (id) {
      var _Edge$nodeIdsFromEdge = Edge.nodeIdsFromEdgeId(id),
          fromId = _Edge$nodeIdsFromEdge.from,
          toId = _Edge$nodeIdsFromEdge.to;

      return [id, new Edge(_this.nodeMap[fromId], _this.nodeMap[toId])];
    })); // Precompute often needed arrays

    this.nodes = Object.values(this.nodeMap);
    this.edges = Object.values(this.edgeMap);
    this.inputNodes = this.nodes.filter(function (n) {
      return n.isInput();
    });
    this.innerNodes = this.nodes.filter(function (n) {
      return n.isInner();
    });
    this.outputNodes = this.nodes.filter(function (n) {
      return n.isOutput();
    });
    this.topSort = topSort(this);
    this.topSortNoInputs = this.topSort.filter(function (n) {
      return n["in"].length > 0;
    });
    this.reverseTopSort = reverseTopSort(this);
    this.reverseTopSortNoOutputs = this.reverseTopSort.filter(function (n) {
      return n.out.length > 0;
    }); // Precompute the id version of the the arrays above

    var toIds = FeedForwardNetwork.toIdArray;
    this.nodeIds = toIds(this.nodes);
    this.edgeIds = toIds(this.edges);
    this.ids = [].concat(_toConsumableArray(this.nodeIds), _toConsumableArray(this.edgeIds));
    this.ids.forEach(function (id, i) {
      if (_this.ids.lastIndexOf(id) !== i) {
        throw new Error("Id ".concat(id, " is used for node and edge simultaneously."));
      }
    });
    this.inputNodeIds = toIds(this.inputNodes);
    this.innerNodeIds = toIds(this.innerNodes);
    this.outputNodeIds = toIds(this.outputNodes);
    this.topSortIds = toIds(this.topSort);
    this.topSortNoInputsIds = toIds(this.topSortNoInputs);
    this.reverseTopSortIds = toIds(this.reverseTopSort);
    this.reverseTopSortNoOutputsIds = toIds(this.reverseTopSortNoOutputs);
  }

  _createClass(FeedForwardNetwork, [{
    key: "hasNode",
    value: function hasNode(id) {
      return typeof this.getNode(id) !== 'undefined';
    }
  }, {
    key: "getNode",
    value: function getNode(id) {
      return this.nodes.find(function (n) {
        return n.id === id;
      });
    }
  }, {
    key: "hasEdge",
    value: function hasEdge(fromId, toId) {
      return typeof this.getEdge(fromId, toId) !== 'undefined';
    }
  }, {
    key: "getEdge",
    value: function getEdge(fromIdOrEdgeId, toId) {
      var edgeId = typeof toId === 'undefined' ? fromIdOrEdgeId : Edge.edgeIdFromNodeIds(fromIdOrEdgeId, toId);
      return this.edgeMap[edgeId];
    }
  }, {
    key: "toNodeArray",
    value: function toNodeArray(mixed) {
      var _this2 = this;

      if (typeof mixed === 'undefined') {
        return [];
      } else {
        var array = Array.isArray(mixed) ? mixed.flat(Number.MAX_SAFE_INTEGER) : [mixed];
        return array.map(function (nodeOrId) {
          if (typeof nodeOrId === 'string') {
            return _this2.getNode(nodeOrId);
          } else if (nodeOrId instanceof Node) {
            return nodeOrId;
          } else {
            throw new Error("Not a node or node id: ".concat(nodeOrId));
          }
        });
      }
    }
  }, {
    key: "toEdgeArray",
    value: function toEdgeArray(mixed) {
      var _this3 = this;

      if (typeof mixed === 'undefined') {
        return [];
      } else {
        var array = Array.isArray(mixed) ? mixed.flat(Number.MAX_SAFE_INTEGER) : [mixed];
        return array.map(function (edgeOrId) {
          if (typeof edgeOrId === 'string') {
            return _this3.getEdge(edgeOrId);
          } else if (edgeOrId instanceof Edge) {
            return edgeOrId;
          } else {
            throw new Error("Not an edge or edge id: ".concat(edgeOrId));
          }
        });
      }
    }
  }], [{
    key: "canonicalizeNodeId",
    value: function canonicalizeNodeId(id) {
      return Node.canonicalizeId(id);
    }
  }, {
    key: "canonicalizeEdgeId",
    value: function canonicalizeEdgeId(edgeId) {
      return Edge.canonicalizeId(edgeId);
    }
  }, {
    key: "edgeIdFromNodeIds",
    value: function edgeIdFromNodeIds(fromId, toId) {
      return Edge.edgeIdFromNodeIds(fromId, toId);
    }
  }, {
    key: "nodeIdsFromEdgeId",
    value: function nodeIdsFromEdgeId(edgeId) {
      return Edge.nodeIdsFromEdgeId(edgeId);
    }
  }, {
    key: "toIdArray",
    value: function toIdArray(mixed) {
      if (typeof mixed === 'undefined') {
        return [];
      } else {
        var array = Array.isArray(mixed) ? mixed.flat(Number.MAX_SAFE_INTEGER) : [mixed];
        return array.map(function (nodeOrEdgeOrId) {
          if (typeof nodeOrEdgeOrId === 'string') {
            return nodeOrEdgeOrId;
          } else if (nodeOrEdgeOrId instanceof Node || nodeOrEdgeOrId instanceof Edge) {
            return nodeOrEdgeOrId.id;
          } else {
            throw new Error("Neither an id nor a node or edge: ".concat(nodeOrEdgeOrId));
          }
        });
      }
    }
  }, {
    key: "matchArray",
    value: function matchArray(arrayWithNodesAndOrEdges, objWithIdKeys) {
      return arrayWithNodesAndOrEdges.map(function (nodeOrEdge) {
        return objWithIdKeys[nodeOrEdge.id];
      });
    }
  }]);

  return FeedForwardNetwork;
}();

exports.FeedForwardNetwork = exports["default"] = FeedForwardNetwork;

var Node = /*#__PURE__*/function () {
  function Node(id) {
    _classCallCheck(this, Node);

    this["in"] = [];
    this.out = [];
    this.id = Node.canonicalizeId(id);
  }

  _createClass(Node, [{
    key: "isInput",
    value: function isInput() {
      return this["in"].length === 0;
    }
  }, {
    key: "isOutput",
    value: function isOutput() {
      return this.out.length === 0;
    }
  }, {
    key: "isInner",
    value: function isInner() {
      return !this.isInput() && !this.isOutput();
    }
  }], [{
    key: "canonicalizeId",
    value: function canonicalizeId(id) {
      return id.trim();
    }
  }]);

  return Node;
}();

var Edge = /*#__PURE__*/function () {
  function Edge(from, to) {
    _classCallCheck(this, Edge);

    this.id = Edge.edgeIdFromNodeIds(from.id, to.id);
    this.from = from;
    this.to = to;
    this.from.out.push(this);
    this.to["in"].push(this);
  }

  _createClass(Edge, null, [{
    key: "edgeIdFromNodeIds",
    value: function edgeIdFromNodeIds(fromId, toId) {
      fromId = Node.canonicalizeId(fromId);
      toId = Node.canonicalizeId(toId);
      var separator = ' -> ';

      while (fromId.includes(separator) || toId.includes(separator)) {
        separator = " ".concat(separator, " ");
      }

      return "".concat(fromId).concat(separator).concat(toId);
    }
  }, {
    key: "nodeIdsFromEdgeId",
    value: function nodeIdsFromEdgeId(edgeId) {
      var separator = ' -> ';
      var parts;

      while ((parts = edgeId.split(separator)).length > 2) {
        separator = " ".concat(separator, " ");
      }

      if (parts.length === 2) {
        return {
          from: Node.canonicalizeId(parts[0]),
          to: Node.canonicalizeId(parts[1])
        };
      } else {
        // https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form
        var edgeEBNF = 'edgeId = nodeId arrow nodeId ; arrow  = " " arrow " " | " -> " ;';
        throw new Error("Invalid edge id format: ".concat(edgeId, " does not match the EBNF: ").concat(edgeEBNF));
      }
    }
  }, {
    key: "canonicalizeId",
    value: function canonicalizeId(edgeId) {
      var _Edge$nodeIdsFromEdge2 = Edge.nodeIdsFromEdgeId(edgeId),
          from = _Edge$nodeIdsFromEdge2.from,
          to = _Edge$nodeIdsFromEdge2.to;

      return Edge.edgeIdFromNodeIds(from, to);
    }
  }]);

  return Edge;
}();

function _topSort(network, reverse) {
  var edgesIn = reverse ? function (node) {
    return node.out;
  } : function (node) {
    return node["in"];
  };
  var edgesOut = reverse ? function (node) {
    return node["in"];
  } : function (node) {
    return node.out;
  };
  var edgeTo = reverse ? function (edge) {
    return edge.from;
  } : function (edge) {
    return edge.to;
  };
  var inDegrees = network.nodes.map(function (n) {
    return {
      id: n.id,
      degree: edgesIn(n).length
    };
  });
  var inDegreeMap = Object.fromEntries(inDegrees.map(function (i) {
    return [i.id, i];
  }));
  var topSort = [];

  while (inDegrees.length > 0) {
    inDegrees.sort(function (n1, n2) {
      return n1.degree - n2.degree;
    });
    var head = inDegrees.shift();

    if (head.degree > 0) {
      throw new Error("Network has a circle through node ".concat(head.id));
    } else {
      var headNode = network.getNode(head.id);
      edgesOut(headNode).forEach(function (edge) {
        return --inDegreeMap[edgeTo(edge).id].degree;
      });
      topSort.push(headNode);
    }
  }

  return topSort;
}

function topSort(network) {
  return _topSort(network, false);
}

function reverseTopSort(network) {
  return _topSort(network, true);
}

},{"../util/deep-freeze.js":23,"core-js/modules/es.array.concat":160,"core-js/modules/es.array.filter":162,"core-js/modules/es.array.find":164,"core-js/modules/es.array.flat":165,"core-js/modules/es.array.for-each":166,"core-js/modules/es.array.from":167,"core-js/modules/es.array.includes":168,"core-js/modules/es.array.is-array":170,"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.last-index-of":173,"core-js/modules/es.array.map":174,"core-js/modules/es.array.slice":177,"core-js/modules/es.array.sort":178,"core-js/modules/es.array.unscopables.flat":179,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.name":182,"core-js/modules/es.number.constructor":184,"core-js/modules/es.number.max-safe-integer":185,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.from-entries":192,"core-js/modules/es.object.to-string":200,"core-js/modules/es.object.values":201,"core-js/modules/es.regexp.exec":205,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.includes":208,"core-js/modules/es.string.iterator":209,"core-js/modules/es.string.split":212,"core-js/modules/es.string.trim":213,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.for-each":217,"core-js/modules/web.dom-collections.iterator":218,"lodash":"lodash"}],10:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.bind");

require("core-js/modules/es.object.create");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.get-prototype-of");

require("core-js/modules/es.object.set-prototype-of");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.reflect.construct");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = exports["default"] = void 0;

var _lodash = require("lodash");

var _trainingModel = _interopRequireDefault(require("./training-model"));

var _trainingDataView = _interopRequireDefault(require("./training-data-view"));

var _events = require("events");

var _missionControlsView = _interopRequireDefault(require("./mission-controls-view"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Controller = /*#__PURE__*/function (_EventEmitter) {
  _inherits(Controller, _EventEmitter);

  var _super = _createSuper(Controller);

  function Controller(_ref) {
    var _this;

    var networkModel = _ref.networkModel,
        trainingInputs = _ref.trainingInputs,
        trainingTargets = _ref.trainingTargets,
        i18n = _ref.i18n;

    _classCallCheck(this, Controller);

    _this = _super.call(this);
    _this._networkModel = networkModel; // Keep the initial network parameters to allow for resetting the training

    var _ref2 = [_this._networkModel.network, _this._networkModel.properties],
        network = _ref2[0],
        properties = _ref2[1];
    _this._initialWeights = (0, _lodash.mapValues)((0, _lodash.pick)(properties, network.edgeIds), function (ep) {
      return ep.weight;
    });
    _this._initialBiases = (0, _lodash.mapValues)((0, _lodash.pick)(properties, network.nodeIds), function (np) {
      return np.bias;
    });
    _this._batch = (0, _lodash.zip)(trainingInputs, trainingTargets);
    _this._trainingTimerId = 0;
    _this._trainingModel = new _trainingModel["default"](trainingInputs, trainingTargets, networkModel);
    _this._trainingDataView = new _trainingDataView["default"]({
      model: _this._trainingModel,
      i18n: i18n
    });
    _this._missionControlsView = new _missionControlsView["default"]();

    _this._missionControlsView.showHelpTab();

    _this._missionControlsView.on('reset-training', _this._handleResetTraining.bind(_assertThisInitialized(_this)));

    _this._missionControlsView.on('pause-training', _this._handlePauseTraining.bind(_assertThisInitialized(_this)));

    _this._missionControlsView.on('resume-training', _this._handleResumeTraining.bind(_assertThisInitialized(_this)));

    _this._missionControlsView.on('step-training', _this._handleStepTraining.bind(_assertThisInitialized(_this)));

    _this._animationFrameRequestId = 0;

    _this._trainingModel.on('predictions-changed', _this._scheduleUpdateTrainingView.bind(_assertThisInitialized(_this)));

    return _this;
  }

  _createClass(Controller, [{
    key: "_scheduleUpdateTrainingView",
    value: function _scheduleUpdateTrainingView() {
      var _this2 = this;

      cancelAnimationFrame(this._animationFrameRequestId);
      requestAnimationFrame(function () {
        return _this2._trainingDataView.update();
      });
    }
  }, {
    key: "_handlePauseTraining",
    value: function _handlePauseTraining() {
      cancelAnimationFrame(this._trainingTimerId);
      this._trainingTimerId = 0;
    }
  }, {
    key: "_handleResumeTraining",
    value: function _handleResumeTraining() {
      var _this3 = this;

      this._handlePauseTraining();

      this._trainingTimerId = requestAnimationFrame(function () {
        _this3._handleStepTraining();

        _this3._handleResumeTraining();
      });
    }
  }, {
    key: "_handleStepTraining",
    value: function _handleStepTraining() {
      var learningRate = 0.02 / Math.min(Math.max(1, this._trainingModel.getTotalRelError()), 10);

      this._networkModel.trainBatch(this._batch, learningRate);
    }
  }, {
    key: "_handleResetTraining",
    value: function _handleResetTraining() {
      var _this4 = this;

      (0, _lodash.forEach)(this._initialWeights, function (weight, id) {
        return _this4._networkModel.setWeight(id, weight);
      });
      (0, _lodash.forEach)(this._initialBiases, function (bias, id) {
        return _this4._networkModel.setBias(id, bias);
      });
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this._handlePauseTraining();

      this._missionControlsView.dispose();

      this._trainingDataView.dispose();
    }
  }]);

  return Controller;
}(_events.EventEmitter);

exports.Controller = exports["default"] = Controller;

},{"./mission-controls-view":11,"./training-data-view":12,"./training-model":13,"core-js/modules/es.array.iterator":171,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.bind":181,"core-js/modules/es.object.create":187,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.get-prototype-of":196,"core-js/modules/es.object.set-prototype-of":199,"core-js/modules/es.object.to-string":200,"core-js/modules/es.reflect.construct":204,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.iterator":209,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.iterator":218,"events":"events","lodash":"lodash"}],11:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.bind");

require("core-js/modules/es.object.create");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.get-prototype-of");

require("core-js/modules/es.object.set-prototype-of");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.reflect.construct");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _events = require("events");

var _eventManager = _interopRequireDefault(require("../../util/event-manager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var MissionControlsView = /*#__PURE__*/function (_EventEmitter) {
  _inherits(MissionControlsView, _EventEmitter);

  var _super = _createSuper(MissionControlsView);

  function MissionControlsView() {
    var _this;

    _classCallCheck(this, MissionControlsView);

    _this = _super.call(this);
    _this._dem = new _eventManager["default"]();

    _this._setupDOM();

    return _this;
  }

  _createClass(MissionControlsView, [{
    key: "_setupDOM",
    value: function _setupDOM() {
      this._setupMissionAndTrainingTabs();
    }
  }, {
    key: "_setupMissionAndTrainingTabs",
    value: function _setupMissionAndTrainingTabs() {
      var ael = this._dem.ael;
      this._missionContent = document.querySelector('.content .mission');
      this._missionButton = document.querySelector('#missionbutton');
      ael(this._missionButton, 'click', this.showMissionTab.bind(this));
      this._helpContent = document.querySelector('.content .helper');
      this._helpButton = document.querySelector('#helpmebutton');
      ael(this._helpButton, 'click', this.showHelpTab.bind(this));

      this._setupTrainingTab();
    }
  }, {
    key: "_setupTrainingTab",
    value: function _setupTrainingTab() {
      var _this2 = this;

      var ael = this._dem.ael;
      var resetButton = document.querySelector('.controls .reset');
      ael(resetButton, 'click', function () {
        return _this2.emit('reset-training');
      });
      var pauseResumeButton = document.querySelector('.controls .pause-resume');

      var isPlaying = function isPlaying() {
        return pauseResumeButton.classList.contains('pause');
      };

      var resume = function resume() {
        pauseResumeButton.classList.add('pause');
        pauseResumeButton.classList.remove('resume');

        _this2.emit('resume-training');
      };

      var pause = function pause() {
        pauseResumeButton.classList.add('resume');
        pauseResumeButton.classList.remove('pause');

        _this2.emit('pause-training');
      };

      pause();
      ael(pauseResumeButton, 'click', function () {
        return isPlaying() ? pause() : resume();
      });
      var stepButton = document.querySelector('.controls .single-step');
      ael(stepButton, 'click', function () {
        return _this2.emit('step-training');
      });
    }
  }, {
    key: "showHelpTab",
    value: function showHelpTab() {
      this._missionButton.classList.remove('selected');

      this._missionContent.classList.remove('visible');

      this._helpButton.classList.add('selected');

      this._helpContent.classList.add('visible');
    }
  }, {
    key: "showMissionTab",
    value: function showMissionTab() {
      this._helpButton.classList.remove('selected');

      this._helpContent.classList.remove('visible');

      this._missionButton.classList.add('selected');

      this._missionContent.classList.add('visible');
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this._dem.dispose();

      return this;
    }
  }]);

  return MissionControlsView;
}(_events.EventEmitter);

exports["default"] = MissionControlsView;

},{"../../util/event-manager":24,"core-js/modules/es.array.iterator":171,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.bind":181,"core-js/modules/es.object.create":187,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.get-prototype-of":196,"core-js/modules/es.object.set-prototype-of":199,"core-js/modules/es.object.to-string":200,"core-js/modules/es.reflect.construct":204,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.iterator":209,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.iterator":218,"events":"events"}],12:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.is-array");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.bind");

require("core-js/modules/es.function.name");

require("core-js/modules/es.object.create");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.get-prototype-of");

require("core-js/modules/es.object.set-prototype-of");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.reflect.construct");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _events = require("events");

var _lodash = require("lodash");

var _eventManager = _interopRequireDefault(require("../../util/event-manager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var TrainingDataView = /*#__PURE__*/function (_EventEmitter) {
  _inherits(TrainingDataView, _EventEmitter);

  var _super = _createSuper(TrainingDataView);

  function TrainingDataView(_ref) {
    var _this;

    var model = _ref.model,
        i18n = _ref.i18n;

    _classCallCheck(this, TrainingDataView);

    _this = _super.call(this);
    _this._model = model;
    _this._i18n = i18n;
    _this._formatNumber = _this._i18n.getNumberFormatter();
    _this._table = document.querySelector('#trainingtable');

    _this._table.setAttribute('border', 1);

    _this._setupDOM();

    _this.localize();

    _this.eventManager = new _eventManager["default"]();

    _this.eventManager.addEventListener(_this._i18n.getI18NextInstance(), 'languageChanged', _this.localize.bind(_assertThisInitialized(_this)));

    return _this;
  }

  _createClass(TrainingDataView, [{
    key: "_setupDOM",
    value: function _setupDOM() {
      // Clear table
      while (this._table.lastChild) {
        this._table.lastChild.remove();
      } // Create header


      var tr = document.createElement('tr');

      var inputIds = this._model.getInputIds();

      var _iterator = _createForOfIteratorHelper(inputIds),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var id = _step.value;
          var th = document.createElement('th');
          th.innerText = id;
          tr.appendChild(th);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var outputIds = this._model.getOutputIds();

      var _iterator2 = _createForOfIteratorHelper(outputIds),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _id = _step2.value;

          var _th = document.createElement('th');

          _th.innerText = _id;

          _th.setAttribute('colspan', 3);

          tr.appendChild(_th);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      this._table.appendChild(tr); // Create rows with training data, predictions and errors


      var _ref2 = [this._model.getInputss(), this._model.getTargetss(), this._model.getPredictionss(), this._model.getErrorss()],
          inputss = _ref2[0],
          targetss = _ref2[1],
          predictionss = _ref2[2],
          errorss = _ref2[3];

      for (var i = 0; i < this._model.getCorpusSize(); ++i) {
        var _tr = document.createElement('tr');

        var _ref3 = [inputss[i], targetss[i], predictionss[i], errorss[i]],
            inputs = _ref3[0],
            targets = _ref3[1],
            predictions = _ref3[2],
            errors = _ref3[3];

        var _iterator3 = _createForOfIteratorHelper(inputs),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var input = _step3.value;
            var td = document.createElement('td');
            td.classList.add('input');
            td.innerText = this._formatNumber(input);

            _tr.appendChild(td);
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }

        for (var j = 0; j < targets.length; ++j) {
          var targetTd = document.createElement('td');
          targetTd.classList.add('target');
          targetTd.innerText = this._formatNumber(targets[j]);

          _tr.appendChild(targetTd);

          var predictionTd = document.createElement('td');
          predictionTd.classList.add('prediction');
          predictionTd.innerText = this._formatNumber(predictions[j]);

          _tr.appendChild(predictionTd);

          var errorTd = document.createElement('td');
          errorTd.classList.add('error');
          errorTd.innerText = this._formatNumber(errors[j]);

          _tr.appendChild(errorTd);
        }

        this._table.appendChild(_tr);
      } // Add row for per-output loss


      var lossTr = document.createElement('tr');
      var inputsTd = document.createElement('td');
      inputsTd.setAttribute('colspan', inputIds.length);
      lossTr.appendChild(inputsTd);

      for (var _j = 0; _j < outputIds.length; ++_j) {
        var lossSymbolTd = document.createElement('td');
        lossSymbolTd.setAttribute('colspan', 2);
        lossSymbolTd.style.textAlign = 'right';
        lossSymbolTd.innerText = 'Σ';
        lossTr.appendChild(lossSymbolTd);
        var lossTd = document.createElement('td');
        lossTd.classList.add('loss');
        lossTr.appendChild(lossTd);
      }

      this._table.appendChild(lossTr); // Add row for total loss


      var totalLossTr = document.createElement('tr');
      var spaceTd = document.createElement('td');
      spaceTd.setAttribute('colspan', inputIds.length + 2);
      totalLossTr.appendChild(spaceTd);
      var totalLossTd = document.createElement('td');
      totalLossTd.classList.add('totalLoss');
      totalLossTd.setAttribute('colspan', 3 * outputIds.length - 2);
      totalLossTr.appendChild(totalLossTd);

      if (false && outputIds.length <= 1) {
        totalLossTr.style.display = 'none';
      }

      this._table.appendChild(totalLossTr);

      this.update();
    }
  }, {
    key: "showHelpTab",
    value: function showHelpTab() {
      this._missionButton.classList.remove('selected');

      this._missionContent.classList.remove('visible');

      this._helpButton.classList.add('selected');

      this._helpContent.classList.add('visible');
    }
  }, {
    key: "showMissionTab",
    value: function showMissionTab() {
      this._helpButton.classList.remove('selected');

      this._helpContent.classList.remove('visible');

      this._missionButton.classList.add('selected');

      this._missionContent.classList.add('visible');
    }
  }, {
    key: "update",
    value: function update() {
      var _this2 = this;

      var _ref4 = [this._model.getPredictionss(), this._model.getErrorss(), this._model.getErrorSums(), this._model.getTotalError()],
          predictionss = _ref4[0],
          errorss = _ref4[1],
          errorSums = _ref4[2],
          totalError = _ref4[3];
      var rows = this._table.children;

      for (var i = 0; i < this._model.getCorpusSize(); ++i) {
        var row = rows[i + 1]; // +1 because of the <th>

        var _ref5 = [predictionss[i], errorss[i]],
            predictions = _ref5[0],
            errors = _ref5[1];
        var predictionTds = row.querySelectorAll('.prediction');
        var errorTds = row.querySelectorAll('.error');
        (0, _lodash.zip)(predictionTds, predictions).forEach(function (_ref6) {
          var _ref7 = _slicedToArray(_ref6, 2),
              td = _ref7[0],
              p = _ref7[1];

          return td.innerText = _this2._formatNumber(p);
        });
        (0, _lodash.zip)(errorTds, errors).forEach(function (_ref8) {
          var _ref9 = _slicedToArray(_ref8, 2),
              td = _ref9[0],
              e = _ref9[1];

          return td.innerText = _this2._formatNumber(2 * e);
        });
      }

      var lossTds = this._table.querySelectorAll('.loss');

      for (var j = 0; j < this._model.getOutputIds().length; ++j) {
        lossTds[j].innerText = this._formatNumber(errorSums[j]);
      }

      this._table.querySelector('.totalLoss').innerText = this._formatNumber(totalError);
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.eventManager.dispose();
    }
  }, {
    key: "localize",
    value: function localize() {
      var _this3 = this;

      this._formatNumber = this._i18n.getNumberFormatter();
      var _ref10 = [this._model.getInputss(), this._model.getTargetss()],
          inputss = _ref10[0],
          targetss = _ref10[1];
      var rows = this._table.children;

      for (var i = 0; i < this._model.getCorpusSize(); ++i) {
        var row = rows[i + 1]; // +1 because of the <th>

        var _ref11 = [inputss[i], targetss[i]],
            inputs = _ref11[0],
            targets = _ref11[1];
        var inputTds = row.querySelectorAll('.input');
        var targetTds = row.querySelectorAll('.target');
        (0, _lodash.zip)(inputTds, inputs).forEach(function (_ref12) {
          var _ref13 = _slicedToArray(_ref12, 2),
              td = _ref13[0],
              i = _ref13[1];

          return td.innerText = _this3._formatNumber(i);
        });
        (0, _lodash.zip)(targetTds, targets).forEach(function (_ref14) {
          var _ref15 = _slicedToArray(_ref14, 2),
              td = _ref15[0],
              t = _ref15[1];

          return td.innerText = _this3._formatNumber(t);
        });
      }

      this.update();
    }
  }]);

  return TrainingDataView;
}(_events.EventEmitter);

exports["default"] = TrainingDataView;

},{"../../util/event-manager":24,"core-js/modules/es.array.for-each":166,"core-js/modules/es.array.from":167,"core-js/modules/es.array.is-array":170,"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.slice":177,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.bind":181,"core-js/modules/es.function.name":182,"core-js/modules/es.object.create":187,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.get-prototype-of":196,"core-js/modules/es.object.set-prototype-of":199,"core-js/modules/es.object.to-string":200,"core-js/modules/es.reflect.construct":204,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.iterator":209,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.for-each":217,"core-js/modules/web.dom-collections.iterator":218,"events":"events","lodash":"lodash"}],13:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.is-array");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.bind");

require("core-js/modules/es.function.name");

require("core-js/modules/es.object.create");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.get-prototype-of");

require("core-js/modules/es.object.set-prototype-of");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.reflect.construct");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TrainingModel = exports["default"] = void 0;

var _events = require("events");

var _lodash = require("lodash");

var _model = require("../../neural-network/model");

var _transpose = _interopRequireDefault(require("../../util/transpose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var TrainingModel = /*#__PURE__*/function (_EventEmitter) {
  _inherits(TrainingModel, _EventEmitter);

  var _super = _createSuper(TrainingModel);

  function TrainingModel(inputss, targetss, networkModel) {
    var _this;

    _classCallCheck(this, TrainingModel);

    _this = _super.call(this);
    _this._inputss = inputss;
    _this._targetss = targetss;
    _this._networkModel = networkModel;

    _this.updatePredictionsAndErrors();

    _this._networkModel.on('network-property-changed', _this._networkPropertyChangedHandler.bind(_assertThisInitialized(_this)));

    return _this;
  }

  _createClass(TrainingModel, [{
    key: "getInputIds",
    value: function getInputIds() {
      return this._networkModel.network.inputNodeIds;
    }
  }, {
    key: "getOutputIds",
    value: function getOutputIds() {
      return this._networkModel.network.outputNodeIds;
    }
  }, {
    key: "getInputss",
    value: function getInputss() {
      return this._inputss;
    }
  }, {
    key: "getTargetss",
    value: function getTargetss() {
      return this._targetss;
    }
  }, {
    key: "getPredictionss",
    value: function getPredictionss() {
      return this._predictionss;
    }
  }, {
    key: "getErrorss",
    value: function getErrorss() {
      return this._errorss;
    }
  }, {
    key: "getErrorSums",
    value: function getErrorSums() {
      return this._errorSums;
    }
  }, {
    key: "getTotalError",
    value: function getTotalError() {
      return this._totalError;
    }
  }, {
    key: "getRelErrorss",
    value: function getRelErrorss() {
      return this._relErrorss;
    }
  }, {
    key: "getRelErrorSums",
    value: function getRelErrorSums() {
      return this._relErrorSums;
    }
  }, {
    key: "getTotalRelError",
    value: function getTotalRelError() {
      return this._totalRelError;
    }
  }, {
    key: "getCorpusSize",
    value: function getCorpusSize() {
      return this._inputss.length;
    }
  }, {
    key: "updatePredictionsAndErrors",
    value: function updatePredictionsAndErrors() {
      var _this2 = this;

      var oldPredictionss = this._predictionss;

      var newPredictionss = this._inputss.map(function (inputs) {
        return _this2._networkModel.predict(inputs);
      });

      if (!(0, _lodash.isEqual)(oldPredictionss, newPredictionss)) {
        this._predictionss = newPredictionss;
        this._errorss = (0, _lodash.zip)(this._predictionss, this._targetss).map(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              ps = _ref2[0],
              ts = _ref2[1];

          return (0, _lodash.zip)(ps, ts).map(function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
                p = _ref4[0],
                t = _ref4[1];

            return _model.Model.C(p, t);
          });
        });
        this._relErrorss = (0, _lodash.zip)(this._predictionss, this._targetss).map(function (_ref5) {
          var _ref6 = _slicedToArray(_ref5, 2),
              ps = _ref6[0],
              ts = _ref6[1];

          return (0, _lodash.zip)(ps, ts).map(function (_ref7) {
            var _ref8 = _slicedToArray(_ref7, 2),
                p = _ref8[0],
                t = _ref8[1];

            return _model.Model.relC(p, t);
          });
        });
        this.emit('predictions-changed', this.getPredictionss(), oldPredictionss);
      }

      this._errorSums = this.getCorpusSize() === 0 ? this.getOutputIds().map(function (_) {
        return 0;
      }) : (0, _transpose["default"])(this._errorss).map(_lodash.sum);
      this._totalError = (0, _lodash.sum)(this._errorSums);
      this._relErrorSums = (0, _transpose["default"])(this._errorss).map(_lodash.sum);
      this._totalRelError = (0, _lodash.sum)(this._relErrorSums);
    }
  }, {
    key: "_networkPropertyChangedHandler",
    value: function _networkPropertyChangedHandler(nodeOrEdge, p) {
      if (p === 'bias' || p === 'weight') {
        this.updatePredictionsAndErrors();
      }
    }
  }]);

  return TrainingModel;
}(_events.EventEmitter);

exports.TrainingModel = exports["default"] = TrainingModel;

},{"../../neural-network/model":8,"../../util/transpose":31,"core-js/modules/es.array.from":167,"core-js/modules/es.array.is-array":170,"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.map":174,"core-js/modules/es.array.slice":177,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.bind":181,"core-js/modules/es.function.name":182,"core-js/modules/es.object.create":187,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.get-prototype-of":196,"core-js/modules/es.object.set-prototype-of":199,"core-js/modules/es.object.to-string":200,"core-js/modules/es.reflect.construct":204,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.iterator":209,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.iterator":218,"events":"events","lodash":"lodash"}],14:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.function.bind");

require("core-js/modules/es.object.define-properties");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.get-own-property-descriptor");

require("core-js/modules/es.object.get-own-property-descriptors");

require("core-js/modules/es.object.keys");

require("core-js/modules/web.dom-collections.for-each");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = exports["default"] = void 0;

var _view = _interopRequireDefault(require("./view"));

var _predictionModel = _interopRequireDefault(require("./prediction-model"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Controller = /*#__PURE__*/function () {
  function Controller(_ref) {
    var levelName = _ref.levelName,
        networkModel = _ref.networkModel,
        inputs = _ref.inputs,
        targetActivationFuncs = _ref.targetActivationFuncs,
        layout = _ref.layout,
        parentElem = _ref.parentElem,
        strings = _ref.strings,
        i18n = _ref.i18n;

    _classCallCheck(this, Controller);

    this.networkModel = networkModel;
    this.predictionModel = new _predictionModel["default"](networkModel, inputs, targetActivationFuncs);
    this.view = new _view["default"](_objectSpread({
      levelName: levelName,
      layout: layout,
      strings: strings,
      i18n: i18n
    }, {
      parentElement: parentElem,
      predictionModel: this.predictionModel
    }));
    this.view.on('input-changed', this.handleInputChange.bind(this));
    this.view.on('bias-changed', this.handleBiasChange.bind(this));
    this.view.on('weight-changed', this.handleWeightChange.bind(this));
    this.networkModel.on('network-property-changed', this._scheduleUpdateView.bind(this));
    this.predictionModel.on('input-changed', this._scheduleUpdateView.bind(this));
    this._animationFrameRequestId = 0;

    this._updateView();
  }

  _createClass(Controller, [{
    key: "handleInputChange",
    value: function handleInputChange(node, input) {
      this.predictionModel.setInput(node, input);
    }
  }, {
    key: "handleBiasChange",
    value: function handleBiasChange(node, bias) {
      this.networkModel.setBias(node, bias);
    }
  }, {
    key: "handleWeightChange",
    value: function handleWeightChange(edge, weight) {
      this.networkModel.setWeight(edge, weight);
    }
  }, {
    key: "_scheduleUpdateView",
    value: function _scheduleUpdateView() {
      var _this = this;

      cancelAnimationFrame(this._animationFrameRequestId);
      requestAnimationFrame(function () {
        return _this._updateView();
      });
    }
  }, {
    key: "_updateView",
    value: function _updateView() {
      this.view.update(this.predictionModel.computePredictions());
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.view.dispose();
    }
  }]);

  return Controller;
}();

exports.Controller = exports["default"] = Controller;

},{"./prediction-model":16,"./view":17,"core-js/modules/es.array.filter":162,"core-js/modules/es.array.for-each":166,"core-js/modules/es.function.bind":181,"core-js/modules/es.object.define-properties":188,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.get-own-property-descriptor":193,"core-js/modules/es.object.get-own-property-descriptors":194,"core-js/modules/es.object.keys":198,"core-js/modules/es.symbol":216,"core-js/modules/web.dom-collections.for-each":217}],15:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.flat");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.includes");

require("core-js/modules/es.array.is-array");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.reduce");

require("core-js/modules/es.array.reverse");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.array.sort");

require("core-js/modules/es.array.unscopables.flat");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.name");

require("core-js/modules/es.object.assign");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.includes");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodeCoordinates = exports["default"] = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/***
 * layout: [[nodeIds]] Column major layout (first subarray contains first layer etc.)
 */
var NodeCoordinates = /*#__PURE__*/function () {
  function NodeCoordinates(layout) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, NodeCoordinates);

    this._options = Object.assign({}, {
      alignV: NodeCoordinates.alignVMiddle
    });
    this._layout = layout.map(function (layer) {
      return layer.map(function (nodeId) {
        return {
          id: nodeId
        };
      });
    });
    this._width = this._layout.length - 1;
    this._height = this._layout.map(function (layer) {
      return layer.length - 1;
    }).reduce(function (cur, acc) {
      return Math.max(cur, acc);
    }, -1);
    this._absCoords = {};

    for (var l = 0; l < this._layout.length; ++l) {
      var layer = this._layout[l];

      for (var n = 0; n < layer.length; ++n) {
        var cell = layer[n];
        var absCoords = {
          x: l,
          y: this._options.alignV(n, layer.length - 1, this._height)
        };
        cell.pos = absCoords;
        this._absCoords[cell.id] = absCoords;
      }
    }

    this._coordForUnknownId = {
      x: -1,
      y: -1
    };
  }

  _createClass(NodeCoordinates, [{
    key: "has",
    value: function has(nodeId) {
      return this._absCoords.hasOwnProperty(nodeId);
    }
  }, {
    key: "abs",
    value: function abs(nodeId) {
      return this.has(nodeId) ? this._absCoords[nodeId] : this._coordForUnknownId;
    }
  }, {
    key: "absX",
    value: function absX(nodeId) {
      return this.abs(nodeId).x;
    }
  }, {
    key: "absY",
    value: function absY(nodeId) {
      return this.abs(nodeId).y;
    }
  }, {
    key: "rel",
    value: function rel(nodeId) {
      var _this$abs = this.abs(nodeId),
          x = _this$abs.x,
          y = _this$abs.y;

      return {
        x: x / (this.width() - 1),
        y: y / (this.height() - 1)
      };
    }
  }, {
    key: "relX",
    value: function relX(nodeId) {
      return this.rel(nodeId).x;
    }
  }, {
    key: "relY",
    value: function relY(nodeId) {
      return this.rel(nodeId).y;
    }
  }, {
    key: "layout",
    value: function layout() {
      return this._layout.map(function (l) {
        return l.map(function (cell) {
          return cell.id;
        });
      });
    }
  }, {
    key: "layerOf",
    value: function layerOf(nodeId) {
      var layout = this.layout();

      var _iterator = _createForOfIteratorHelper(layout),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var layer = _step.value;

          if (layer.includes(nodeId)) {
            return layer;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "list",
    value: function list() {
      return this.layout().flat();
    }
  }, {
    key: "sortXY",
    value: function sortXY() {
      return this.layout().flat();
    }
  }, {
    key: "sortYX",
    value: function sortYX() {
      var compareYX = function compareYX(cell1, cell2) {
        return cell1.y === cell2.y ? cell1.x - cell2.x : cell1.y - cell2.y;
      };

      return this._layout.flat().sort(compareYX).map(function (cell) {
        return cell.id;
      });
    }
  }, {
    key: "mirrorH",
    value: function mirrorH() {
      return new NodeCoordinates(_toConsumableArray(this.layout()).reverse(), this._options);
    }
  }, {
    key: "mirrorV",
    value: function mirrorV() {
      var alignV;

      switch (this._options.alignV) {
        case NodeCoordinates.alignVTop:
          alignV = NodeCoordinates.alignVBottom;
          break;

        case NodeCoordinates.alignVBottom:
          alignV = NodeCoordinates.alignVTop;
          break;

        case NodeCoordinates.alignVMiddle:
        default:
          alignV = NodeCoordinates.alignVMiddle;
          break;
      }

      var options = Object.assign({}, this._options, {
        alignV: alignV
      });
      return new NodeCoordinates(this.layout().map(function (l) {
        return _toConsumableArray(l).reverse();
      }), options);
    }
  }, {
    key: "width",
    get: function get() {
      return this._width;
    }
  }, {
    key: "height",
    get: function get() {
      return this._height;
    }
  }], [{
    key: "alignVTop",
    value: function alignVTop(layerIndex, layerHeight, maxHeight) {
      return layerIndex;
    }
  }, {
    key: "alignVMiddle",
    value: function alignVMiddle(layerIndex, layerHeight, maxHeight) {
      return (maxHeight - layerHeight) / 2 + layerIndex;
    }
  }, {
    key: "alignVBottom",
    value: function alignVBottom(layerIndex, layerHeight, maxHeight) {
      return maxHeight - layerHeight + layerIndex;
    }
  }]);

  return NodeCoordinates;
}();

exports.NodeCoordinates = exports["default"] = NodeCoordinates;

},{"core-js/modules/es.array.flat":165,"core-js/modules/es.array.from":167,"core-js/modules/es.array.includes":168,"core-js/modules/es.array.is-array":170,"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.map":174,"core-js/modules/es.array.reduce":175,"core-js/modules/es.array.reverse":176,"core-js/modules/es.array.slice":177,"core-js/modules/es.array.sort":178,"core-js/modules/es.array.unscopables.flat":179,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.name":182,"core-js/modules/es.object.assign":186,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.to-string":200,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.includes":208,"core-js/modules/es.string.iterator":209,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.iterator":218}],16:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.is-array");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.name");

require("core-js/modules/es.object.create");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.from-entries");

require("core-js/modules/es.object.get-prototype-of");

require("core-js/modules/es.object.set-prototype-of");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.reflect.construct");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _events = _interopRequireDefault(require("events"));

var _lodash = require("lodash");

var _network = require("../../neural-network/network");

var _clamp = _interopRequireDefault(require("../../util/clamp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var PredictionModel = /*#__PURE__*/function (_EventEmitter) {
  _inherits(PredictionModel, _EventEmitter);

  var _super = _createSuper(PredictionModel);

  function PredictionModel(networkModel, inputs, targetActivationFunctions) {
    var _this;

    _classCallCheck(this, PredictionModel);

    _this = _super.call(this);
    _this._networkModel = networkModel;
    _this._network = networkModel.network;
    _this._targetActivationFuncs = (0, _lodash.zip)(_this._network.outputNodes.map(function (n) {
      return n.id;
    }), targetActivationFunctions);
    _this._inputs = Object.fromEntries(_this._network.inputNodeIds.map(function (id) {
      var _inputs$id;

      return [id, (_inputs$id = inputs[id]) !== null && _inputs$id !== void 0 ? _inputs$id : 0];
    }));
    return _this;
  }

  _createClass(PredictionModel, [{
    key: "getNetwork",
    value: function getNetwork() {
      return this._network;
    }
  }, {
    key: "setInput",
    value: function setInput(nodeOrNodeId, value) {
      var id = typeof nodeOrNodeId === 'string' ? nodeOrNodeId : nodeOrNodeId.id;
      var oldValue = this._inputs[id];
      value = (0, _clamp["default"])(value, this._networkModel.properties[id].inputProps.range);

      if (oldValue !== value) {
        this._inputs[id] = value;
        this.emit('input-changed', id, value, oldValue, this);
      }
    }
  }, {
    key: "computePredictions",
    value: function computePredictions() {
      var _this2 = this;

      var result = this._networkModel.predictExt(_network.FeedForwardNetwork.matchArray(this._network.inputNodes, this._inputs), true);

      this._targetActivationFuncs.forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            id = _ref2[0],
            taf = _ref2[1];

        return result[id].target = taf(_this2._inputs);
      });

      return result;
    }
  }]);

  return PredictionModel;
}(_events["default"]);

exports["default"] = PredictionModel;

},{"../../neural-network/network":9,"../../util/clamp":22,"core-js/modules/es.array.for-each":166,"core-js/modules/es.array.from":167,"core-js/modules/es.array.is-array":170,"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.map":174,"core-js/modules/es.array.slice":177,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.name":182,"core-js/modules/es.object.create":187,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.from-entries":192,"core-js/modules/es.object.get-prototype-of":196,"core-js/modules/es.object.set-prototype-of":199,"core-js/modules/es.object.to-string":200,"core-js/modules/es.reflect.construct":204,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.iterator":209,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.for-each":217,"core-js/modules/web.dom-collections.iterator":218,"events":"events","lodash":"lodash"}],17:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.fill");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.is-array");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.reduce");

require("core-js/modules/es.array.reverse");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.array.sort");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.bind");

require("core-js/modules/es.function.name");

require("core-js/modules/es.object.assign");

require("core-js/modules/es.object.create");

require("core-js/modules/es.object.define-properties");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.get-own-property-descriptor");

require("core-js/modules/es.object.get-own-property-descriptors");

require("core-js/modules/es.object.get-prototype-of");

require("core-js/modules/es.object.keys");

require("core-js/modules/es.object.set-prototype-of");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.reflect.construct");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/es.string.search");

require("core-js/modules/es.string.split");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

require("core-js/modules/web.url");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.View = exports["default"] = void 0;

var _events = require("events");

var _svg = require("@svgdotjs/svg.js");

var _bezierJs = _interopRequireDefault(require("bezier-js"));

var _intervalArithmetic = _interopRequireWildcard(require("interval-arithmetic"));

var _tippy = _interopRequireDefault(require("tippy.js"));

var _eventManager = _interopRequireDefault(require("../../util/event-manager"));

var _svgPathBuilder = _interopRequireDefault(require("../../util/svg-path-builder"));

var _nodeCoordinates = _interopRequireDefault(require("./node-coordinates"));

var I18N = _interopRequireWildcard(require("../../util/i18n"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var View = /*#__PURE__*/function (_EventEmitter) {
  _inherits(View, _EventEmitter);

  var _super = _createSuper(View);

  function View(_ref) {
    var _this;

    var levelName = _ref.levelName,
        predictionModel = _ref.predictionModel,
        layout = _ref.layout,
        parentElement = _ref.parentElement,
        strings = _ref.strings,
        i18n = _ref.i18n;

    _classCallCheck(this, View);

    _this = _super.call(this);
    _this._levelName = levelName;
    _this._predictionModel = predictionModel;
    _this._network = predictionModel.getNetwork();
    _this._parent = parentElement;
    _this._strings = strings;
    _this._i18n = i18n;
    _this._formatNumber = i18n.getNumberFormatter();
    _this._eventManager = new _eventManager["default"]();
    _this._coords = new _nodeCoordinates["default"](layout);
    var predictionExt = predictionModel.computePredictions();
    _this._flowScale = _this._computeFlowScale(predictionExt);
    var ids = _this._network.ids;

    var immutableProps = _this._computeImmutableProps();

    _this._props = Object.assign.apply(Object, [{}].concat(_toConsumableArray(ids.map(function (id) {
      var _immutableProps$id;

      return _defineProperty({}, id, (_immutableProps$id = immutableProps[id]) !== null && _immutableProps$id !== void 0 ? _immutableProps$id : {});
    }))));

    _this._updateProps(predictionExt);

    _this._localizables = [];
    _this._tippies = [];
    _this._viewUpdaters = _this._createSubViews();

    _this.localize();

    _this._eventManager.addEventListener(_this._i18n.getI18NextInstance(), 'languageChanged', _this.localize.bind(_assertThisInitialized(_this)));

    if (!new URLSearchParams(location.search).has('tooltip')) {
      _this._tippies.forEach(function (t) {
        return t.hide();
      });
    }

    return _this;
  }

  _createClass(View, [{
    key: "_computeFlowScale",
    value: function _computeFlowScale(p) {
      var hull = function hull(arr) {
        return arr.reduce(function (acc, cur) {
          return _intervalArithmetic["default"].hull(acc, cur);
        }, _intervalArithmetic.Interval.EMPTY);
      };

      var arr2i = function arr2i(arr) {
        return hull(arr.map(function (x) {
          return new _intervalArithmetic.Interval(x);
        }));
      };

      var ensureInterval = function ensureInterval(arrOrI) {
        return _intervalArithmetic["default"].isInterval(arrOrI) ? arrOrI : arr2i(arrOrI);
      };

      var network = this._network;
      var activationRanges = {};
      /***
       * The relative flow is higher if there are fewer nodes in a layer. This is to account for the
       * fact that nodes that have free vertical space in a layer can grow larger than nodes with
       * less vertical space.
       */

      var maxLength = this._coords.height + 1;
      var maxRelFlow = {
        value: 0,
        update: function update(range, layer) {
          var weight = layer.length / maxLength;
          var relFlow = _intervalArithmetic["default"].width(range) * weight;
          this.value = Math.max(this.value, relFlow);
        }
      }; // This checks all partial sum and activation hulls and returns the largest one.
      // Traversing the tree takes 2^(summands.length) time.
      // I ran out of time thinking of a better way to compute this. :-(

      var traverseNodeHullTree = function traverseNodeHullTree(summands, partialSum, partialSumHull, activationRangeFunc) {
        if (summands.length === 0) {
          return _intervalArithmetic["default"].hull(partialSumHull, activationRangeFunc(partialSum));
        } else {
          var summand = summands[0];
          var otherSummands = summands.slice(1);

          var partialSumLo = _intervalArithmetic["default"].add(partialSum, new _intervalArithmetic.Interval(summand.lo));

          var hullLo = traverseNodeHullTree(otherSummands, partialSumLo, _intervalArithmetic["default"].hull(partialSumHull, partialSumLo), activationRangeFunc);

          var partialSumHi = _intervalArithmetic["default"].add(partialSum, new _intervalArithmetic.Interval(summand.hi));

          var hullHi = traverseNodeHullTree(otherSummands, partialSumHi, _intervalArithmetic["default"].hull(partialSumHull, partialSumHi), activationRangeFunc);
          return _intervalArithmetic["default"].width(hullLo) > _intervalArithmetic["default"].width(hullHi) ? hullLo : hullHi;
        }
      };

      var _iterator = _createForOfIteratorHelper(network.inputNodeIds),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var nodeId = _step.value;

          var layer = this._coords.layerOf(nodeId);

          var activationRange = ensureInterval(p[nodeId].inputProps.range);
          activationRanges[nodeId] = activationRange;
          maxRelFlow.update(new _intervalArithmetic.Interval(0, Math.max(0, activationRange.hi)), layer);
          maxRelFlow.update(new _intervalArithmetic.Interval(Math.min(activationRange.lo, 0), 0), layer);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var edgeToActivation = function edgeToActivation(e) {
        return _intervalArithmetic["default"].mul(activationRanges[e.from.id], p[e.id].weightProps.range);
      };

      var _iterator2 = _createForOfIteratorHelper(network.topSortNoInputs),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var node = _step2.value;
          var np = p[node.id];

          var _layer = this._coords.layerOf(node.id);

          var getActivationRange = np.activationFunc.range.bind(np.activationFunc);
          var orderedInEdges = getOrderedInEdges(node, this._coords);
          var summands = [np.biasProps.range].concat(_toConsumableArray(orderedInEdges.map(edgeToActivation)));
          var sumRange = summands.reduce(function (acc, cur) {
            return _intervalArithmetic["default"].add(acc, cur);
          }, _intervalArithmetic.Interval.ZERO);

          var _activationRange = getActivationRange(sumRange);

          activationRanges[node.id] = _activationRange;
          /***
           * FIXME: This is quite expensive since it needs 2^(#inEdges+1) steps to compute the maximum
           *        hull of the node. For simple networks, it shouldn't be an issue, but for everything
           *        with more than couple of nodes, this can become a bottleneck quite easily.
           */

          var nodeHull = traverseNodeHullTree(summands, _intervalArithmetic.Interval.ZERO, _intervalArithmetic.Interval.ZERO, getActivationRange);
          maxRelFlow.update(nodeHull, _layer);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return View.NODE_MAX_INNER_HEIGHT / maxRelFlow.value;
    }
  }, {
    key: "_computeImmutableProps",
    value: function _computeImmutableProps() {
      var _this2 = this;

      var computeNodeProp = function computeNodeProp(node) {
        return _defineProperty({}, node.id, {
          orderedInEdges: getOrderedInEdges(node, _this2._coords),
          gridPos: grid(_this2._coords.abs(node.id))
        });
      };

      return Object.assign.apply(Object, [{}].concat(_toConsumableArray(this._network.nodes.map(computeNodeProp))));
    }
  }, {
    key: "_updateProps",
    value: function _updateProps(predictionExt) {
      var _this3 = this;

      var p = this._props; // First copy current node and edge properties to view's mutable properties

      this._network.ids.forEach(function (id) {
        return Object.assign(p[id], predictionExt[id]);
      }); // Compute relevant properties for visualization


      this._network.nodes.forEach(function (node) {
        // Compute props of node
        var np = p[node.id];
        var partialSumRange = node.isInput() ? _intervalArithmetic.Interval.ZERO : getPartialSumRange(np.orderedInEdges, p, np.bias);

        var range = _intervalArithmetic["default"].hull(_intervalArithmetic["default"].hull(partialSumRange, _intervalArithmetic.Interval.ZERO), new _intervalArithmetic.Interval(np.activation));

        np.lowerHeight = range.lo * _this3._flowScale;
        np.upperHeight = range.hi * _this3._flowScale;
        np.innerHeight = _intervalArithmetic["default"].width(range) * _this3._flowScale;
        np.zeroGridOffsetY = np.innerHeight / 2 - np.upperHeight; // Compute to-part of in-edges

        var lastTo = {
          pos: {
            x: np.gridPos.x - 0.5 * View.NODE_SIZE.x,
            y: np.gridPos.y - np.zeroGridOffsetY
          },
          activation: np.bias * _this3._flowScale
        };
        np.orderedInEdges.forEach(function (edge, i) {
          var ep = p[edge.id];
          ep.toPos = {
            x: lastTo.pos.x,
            y: lastTo.pos.y - lastTo.activation
          };
          ep.toActivation = p[edge.from.id].activation * p[edge.id].weight * _this3._flowScale;
          lastTo = {
            pos: ep.toPos,
            activation: ep.toActivation
          };
          ep.fromActivationColor = activationColor(p[edge.from.id].activation);
          ep.toActivationColor = activationColor(p[edge.from.id].activation * p[edge.id].weight);
        }); // Compute from-part of out-edges

        node.out.forEach(function (edge, i) {
          var ep = p[edge.id];
          ep.fromPos = {
            x: gridX(_this3._coords.absX(edge.from.id)) + 0.5 * View.NODE_SIZE.x,
            y: gridY(_this3._coords.absY(edge.from.id)) - np.zeroGridOffsetY
          };
          ep.fromActivation = p[edge.from.id].activation * _this3._flowScale;
        });
      }); // Compute edge geometries


      this._network.edges.forEach(function (edge) {
        var ep = p[edge.id];
        Object.assign(ep, View._buildEdgePaths(ep));
      });
    }
  }, {
    key: "_createSubViews",
    value: function _createSubViews() {
      var _this4 = this;

      while (this._parent.lastChild) {
        this._parent.lastChild.remove();
      }

      var levelTitleEl = document.querySelector('#leveltitle');

      var titleKey = this._levelI18NKey('title');

      var titleFallbackKey = I18N.key('main', 'levelDefaults', 'title');
      levelTitleEl.setAttribute('data-i18n', "".concat(titleFallbackKey, ";").concat(titleKey));

      this._localizables.push(levelTitleEl);

      var levelDescription = document.querySelector('.mission #description');

      var descKey = this._levelI18NKey('description');

      var descFallbackKey = I18N.key('main', 'levelDefaults', 'description');
      levelDescription.setAttribute('data-i18n', "".concat(descFallbackKey, ";").concat(descKey));

      this._localizables.push(levelDescription);

      var container = document.createElement('div');
      container.style.position = 'relative';
      var offset = {
        x: 0.5 * View.NODE_SIZE.x,
        y: 0.5 * (View.NODE_SIZE.y + View.NODE_MAX_INNER_HEIGHT)
      };
      this._overlay = document.createElement('div');
      this._overlay.style.position = 'absolute';
      this._overlay.style.top = "".concat(offset.x, "px");
      this._overlay.style.left = "".concat(offset.y, "px");

      this._parent.appendChild(this._overlay);

      this._svg = (0, _svg.SVG)().size(1000, 1000).addTo(this._parent);

      this._svg.css({
        'overflow': 'visible',
        'stroke-width': 2,
        'stroke-color': 'black'
      });

      this._svgOffsetContainer = this._svg.group().translate(offset.x, offset.y);
      this._coordAnchor = this._svgOffsetContainer.group();
      this._nodeLayer = this._svgOffsetContainer.group();
      this._edgeLayer = this._svgOffsetContainer.group();
      this._labelLayer = this._svgOffsetContainer.group().css({
        'font-size': "".concat(View.LABEL_FONT_SIZE, "px")
      });
      this._handleLayer = this._svgOffsetContainer.group().attr({
        stroke: 'black',
        fill: 'transparent'
      }).css({
        cursor: 'hand'
      });
      return [].concat(this._network.nodes.map(function (n) {
        return _this4._createNodeView(n);
      }), this._network.edges.map(function (e) {
        return _this4._createEdgeView(e);
      }));
    }
  }, {
    key: "_createNodeView",
    value: function _createNodeView(node) {
      var _this5 = this,
          _this$_tippies;

      var np = this._props[node.id];
      var tippies = []; // set up DOM elements and certain static/default properties

      var svgNodeGroup = this._nodeLayer.group();

      var svgNodeRect = svgNodeGroup.rect(View.NODE_SIZE.x, View.NODE_SIZE.y).move(np.gridPos.x - 0.5 * View.NODE_SIZE.x, np.gridPos.y - 0.5 * View.NODE_SIZE.y).attr({
        rx: View.NODE_RADIUS,
        ry: View.NODE_RADIUS,
        fill: fillColor(node),
        stroke: 'black'
      });

      var svgBiasHandle = this._handleLayer.circle(View.HANDLE_RADIUS).cx(np.gridPos.x - 0.5 * View.NODE_SIZE.x).css({
        'visibility': node.isInput() ? 'hidden' : 'visible'
      });

      var biasDraggable = new VerticalDraggable(svgBiasHandle, this._coordAnchor, function (_ref4) {
        var y = _ref4.y;
        return _this5._biasChanged(node, _this5._biasFromY(y, np));
      }, this._eventManager);

      var svgSumHandle = this._handleLayer.circle(View.HANDLE_RADIUS).cx(np.gridPos.x).css({
        'visibility': 'hidden'
      });

      var svgActivationHandle = this._handleLayer.circle(View.HANDLE_RADIUS).cx(np.gridPos.x + 0.5 * View.NODE_SIZE.x).css({
        'visibility': node.isInput() ? 'visible' : 'hidden'
      });

      if (node.isInput()) {
        var inputDraggable = new VerticalDraggable(svgActivationHandle, this._coordAnchor, function (_ref5) {
          var y = _ref5.y;
          return _this5._inputChanged(node, _this5._inputFromY(y, np));
        }, this._eventManager);
        var inputDescriptionElem = document.createElement('div');

        var inputDescriptionKey = this._levelI18NKey('labels', node.id, 'input');

        var inputDescriptionFallbackKey = I18N.key('main', 'levelDefaults', 'labels', 'node', 'input');
        inputDescriptionElem.setAttribute('data-i18n', "".concat(inputDescriptionFallbackKey, ";").concat(inputDescriptionKey));
        var inputDescriptionTippy = (0, _tippy["default"])(svgActivationHandle.node, {
          content: inputDescriptionElem,
          showOnCreate: true,
          trigger: 'manual',
          hideOnClick: false,
          placement: 'right'
        });

        this._localizables.push(inputDescriptionElem);

        tippies.push(inputDescriptionTippy);
      } else {
        var biasDescriptionElem = document.createElement('div');

        var biasDescriptionKey = this._levelI18NKey('labels', node.id, 'bias');

        var biasDescriptionFallbackKey = I18N.key('main', 'levelDefaults', 'labels', 'node', 'bias');
        biasDescriptionElem.setAttribute('data-i18n', "".concat(biasDescriptionFallbackKey, ";").concat(biasDescriptionKey));
        var biasDescriptionTippy = (0, _tippy["default"])(svgBiasHandle.node, {
          content: biasDescriptionElem,
          showOnCreate: true,
          trigger: 'manual',
          hideOnClick: false,
          placement: 'left'
        });

        this._localizables.push(biasDescriptionElem);

        tippies.push(biasDescriptionTippy);
        var sumDescriptionElem = document.createElement('div');

        var sumDescriptionKey = this._levelI18NKey('labels', node.id, 'sum');

        var sumDescriptionFallbackKey = I18N.key('main', 'levelDefaults', 'labels', 'node', 'sum');
        sumDescriptionElem.setAttribute('data-i18n', "".concat(sumDescriptionFallbackKey, ";").concat(sumDescriptionKey));
        var sumDescriptionTippy = (0, _tippy["default"])(svgSumHandle.node, {
          content: sumDescriptionElem,
          showOnCreate: true,
          trigger: 'manual',
          hideOnClick: false,
          placement: 'bottom'
        });

        this._localizables.push(sumDescriptionElem);

        tippies.push(sumDescriptionTippy);
        var activationDescriptionElem = document.createElement('div');

        var activationDescriptionKey = this._levelI18NKey('labels', node.id, 'activation');

        var activationDescriptionFallbackKey = I18N.key('main', 'levelDefaults', 'labels', 'node', 'activation');
        activationDescriptionElem.setAttribute('data-i18n', "".concat(activationDescriptionFallbackKey, ";").concat(activationDescriptionKey));
        var activationDescriptionTippy = (0, _tippy["default"])(svgActivationHandle.node, {
          content: activationDescriptionElem,
          showOnCreate: true,
          trigger: 'manual',
          hideOnClick: false,
          placement: 'right'
        });

        this._localizables.push(activationDescriptionElem);

        tippies.push(activationDescriptionTippy);
      }

      var debug = false; // can be enabled for UI debugging purposes

      var middleLinePathBuilder = function middleLinePathBuilder() {
        return new _svgPathBuilder["default"]().M(np.gridPos).m({
          x: -0.5 * View.NODE_SIZE.x,
          y: 0
        }).l({
          x: View.NODE_SIZE.x,
          y: 0
        }).build();
      };

      var svgNodeMiddleLine = !debug ? svgNodeGroup.group() : svgNodeGroup.path(middleLinePathBuilder()).attr({
        stroke: 'gray',
        'stroke-width': 1
      });

      var zeroLinePathBuilder = function zeroLinePathBuilder() {
        return new _svgPathBuilder["default"]().M(np.gridPos).m({
          x: -0.5 * View.NODE_SIZE.x,
          y: -np.zeroGridOffsetY
        }).l({
          x: View.NODE_SIZE.x,
          y: 0
        }).build();
      };

      var svgNodeZeroLine = !debug ? svgNodeGroup.group() : svgNodeGroup.path(zeroLinePathBuilder()).attr({
        stroke: 'orange'
      });

      var svgIdLabel = this._labelLayer.plain(node.isInput() || node.isOutput() ? node.id : '').attr(np.gridPos).attr({
        'text-anchor': 'middle',
        'data-i18n': this._levelI18NKey('labels', node.id, 'name')
      });

      var svgBiasLabel = this._labelLayer.plain().attr(np.gridPos).dmove(-View.NODE_SIZE.x / 2, np.lowerHeight).dy(View.LABEL_FONT_SIZE).dmove(-3, -3) // TODO: don't hardcode
      .attr({
        'text-anchor': 'end'
      }).css({
        visibility: node.isInput() ? 'hidden' : 'visible'
      });

      var svgActivationLabel = this._labelLayer.plain().x(np.gridPos.x + View.NODE_SIZE.x / 2).dx(3) // TODO: don't hardcode
      .attr({
        'text-anchor': 'start'
      });

      var svgTargetLabel = this._labelLayer.plain().x(np.gridPos.x + View.NODE_SIZE.x).dx(3) // TODO: don't hardcode
      .attr({
        'text-anchor': 'start'
      }).css({
        visibility: node.isOutput() ? 'visible' : 'hidden'
      });

      var biasLinePathBuilder = function biasLinePathBuilder() {
        return new _svgPathBuilder["default"]().M(np.gridPos).m({
          x: -View.NODE_SIZE.x / 2,
          y: -np.zeroGridOffsetY
        }).l({
          x: 0,
          y: -np.bias * _this5._flowScale
        }).build();
      };

      var svgBiasLine = node.isInput() ? this._edgeLayer.group() : this._edgeLayer.path(biasLinePathBuilder()).fill('none').stroke('black');

      var sumAreaPathBuilder = function sumAreaPathBuilder() {
        return new _svgPathBuilder["default"]().M(np.gridPos).m({
          x: 0,
          y: -np.zeroGridOffsetY
        }).h(-View.NODE_SIZE.x / 2).v(-np.sum * _this5._flowScale).h(View.NODE_SIZE.x / 2).z().build();
      };

      var svgSumArea = node.isInput() ? this._edgeLayer.group() : this._edgeLayer.path(sumAreaPathBuilder()).stroke({
        color: 'none'
      });

      var activationAreaPathBuilder = function activationAreaPathBuilder() {
        return new _svgPathBuilder["default"]().M(np.gridPos).m({
          x: 0,
          y: -np.zeroGridOffsetY
        }).h(View.NODE_SIZE.x / 2).v(-np.activation * _this5._flowScale).h(-View.NODE_SIZE.x / 2).z().build();
      };

      var svgActivationArea = node.isInput() ? this._edgeLayer.group() : this._edgeLayer.path(sumAreaPathBuilder()).stroke({
        color: 'none'
      });

      var inOutConnectorPolyLinePathBuilder = function inOutConnectorPolyLinePathBuilder() {
        return new _svgPathBuilder["default"]().M(np.gridPos).m({
          x: -View.NODE_SIZE.x / 2,
          y: -np.zeroGridOffsetY - Math.min(0, np.sum) * _this5._flowScale
        }).h(View.NODE_SIZE.x / 2).V(np.gridPos.y - np.zeroGridOffsetY).h(View.NODE_SIZE.x / 2).build();
      };

      var svgInOutConnectorPolyLine = node.isInput() ? this._edgeLayer.group() : this._edgeLayer.path(inOutConnectorPolyLinePathBuilder()).stroke({
        color: 'black'
      }).fill('none');

      var targetLineBuilder = function targetLineBuilder() {
        return new _svgPathBuilder["default"]().M(np.gridPos).m({
          x: View.NODE_SIZE.x / 2,
          y: -np.zeroGridOffsetY - np.target * _this5._flowScale
        }).h(View.NODE_SIZE.x / 2).build();
      };

      var svgTargetLine = !node.isOutput() ? this._edgeLayer.group() : this._edgeLayer.path(targetLineBuilder()).stroke({
        color: 'cyan'
      }).fill('none'); // set up update function

      var update = function update() {
        svgNodeRect.attr({
          width: View.NODE_SIZE.x,
          height: View.NODE_SIZE.y + np.innerHeight
        }).transform({
          translateY: -0.5 * np.innerHeight
        });
        svgIdLabel.attr(np.gridPos).dy(-np.innerHeight / 2 - View.NODE_SIZE.y / 8).attr({
          'text-anchor': 'middle'
        });
        svgBiasHandle.cy(np.gridPos.y - np.zeroGridOffsetY - np.bias * _this5._flowScale);
        svgBiasLabel.plain(_this5._formatNumber(np.bias));
        svgSumHandle.cy(np.gridPos.y - np.zeroGridOffsetY - np.sum * _this5._flowScale);
        svgActivationHandle.cy(np.gridPos.y - np.zeroGridOffsetY - np.activation * _this5._flowScale);
        svgActivationLabel.plain(_this5._formatNumber(np.activation)).y(np.gridPos.y - np.zeroGridOffsetY).dy(-np.activation * _this5._flowScale).dy(-3); // TODO: don't hardcode

        if (debug) {
          svgNodeMiddleLine.plot(middleLinePathBuilder());
          svgNodeZeroLine.plot(zeroLinePathBuilder());
        }

        if (!node.isInput()) {
          svgBiasLine.plot(biasLinePathBuilder());
          svgSumArea.plot(sumAreaPathBuilder()).fill({
            color: activationColor(np.sum),
            opacity: 0.5
          });
          svgActivationArea.plot(activationAreaPathBuilder()).fill({
            color: activationColor(np.activation),
            opacity: 0.5
          });
          svgInOutConnectorPolyLine.plot(inOutConnectorPolyLinePathBuilder());
        }

        if (node.isOutput()) {
          svgTargetLine.plot(targetLineBuilder());
          svgTargetLabel.plain(_this5._formatNumber(np.target)).y(np.gridPos.y - np.zeroGridOffsetY).dy(-np.target * _this5._flowScale).dy(-3); // TODO: don't hardcode
        }

        tippies.forEach(function (t) {
          return t.popperInstance !== null ? t.popperInstance.update() : true;
        });
      };

      update();

      (_this$_tippies = this._tippies).push.apply(_this$_tippies, tippies);

      return update;
    }
  }, {
    key: "_createEdgeView",
    value: function _createEdgeView(edge) {
      var _this6 = this,
          _this$_strings,
          _this$_strings$labels,
          _this$_strings$labels2,
          _this$_tippies2;

      var ep = this._props[edge.id];
      var tippies = [];

      var svgEdgeGroup = this._edgeLayer.group().attr({
        'fill-opacity': 0.5,
        stroke: 'none'
      });

      var svgEdge = svgEdgeGroup.path(ep.edgePath).attr({
        stroke: 'black',
        fill: 'none'
      });
      /*
      const svgEdgeActivated = svgEdgeGroup.path(mep.edgeActivatedPath).attr({
        stroke: 'black',
        fill: 'none'
      });
       */

      var svgFromActivation = svgEdgeGroup.path(ep.fromActivationEdgePath);
      var svgToActivation = svgEdgeGroup.path(ep.toActivationEdgePath);

      var svgWeightLabel = this._labelLayer.plain('').translate(0, -3).attr({
        'text-anchor': 'middle'
      });

      var svgWeightHandle = this._handleLayer.circle(View.HANDLE_RADIUS);

      var weightDraggable = new VerticalDraggable(svgWeightHandle, this._coordAnchor, function (_ref6) {
        var y = _ref6.y;
        return _this6._weightChanged(edge, _this6._weightFromY(y, ep));
      }, this._eventManager);
      var weightDescriptionElem = document.createElement('div');

      var weightDescriptionKey = this._levelI18NKey('labels', edge.id, 'weight');

      var weightDescriptionFallbackKey = I18N.key('main', 'levelDefaults', 'labels', 'edge', 'weight');
      weightDescriptionElem.setAttribute('data-i18n', "".concat(weightDescriptionFallbackKey, ";").concat(weightDescriptionKey));

      this._localizables.push(weightDescriptionElem);

      var weightDescriptionTippy = (0, _tippy["default"])(svgWeightHandle.node, _objectSpread({
        content: weightDescriptionElem,
        placement: 'top'
      }, this._tippyOptionsForLabel((_this$_strings = this._strings) === null || _this$_strings === void 0 ? void 0 : (_this$_strings$labels = _this$_strings.labels) === null || _this$_strings$labels === void 0 ? void 0 : (_this$_strings$labels2 = _this$_strings$labels[edge.id]) === null || _this$_strings$labels2 === void 0 ? void 0 : _this$_strings$labels2.weight)));
      tippies.push(weightDescriptionTippy);

      var update = function update() {
        svgEdge.plot(ep.edgePath); //svgEdgeActivated.plot(mep.edgeActivatedPath);

        svgFromActivation.plot(ep.fromActivationEdgePath).attr({
          fill: ep.fromActivationColor
        });
        svgToActivation.plot(ep.toActivationEdgePath).attr({
          fill: ep.toActivationColor
        });
        svgWeightLabel.plain(_this6._formatNumber(ep.weight)).attr(ep.labelPos);
        svgWeightHandle.center(ep.handlePos.x, ep.handlePos.y);
        tippies.forEach(function (t) {
          return t.popperInstance !== null ? t.popperInstance.update() : true;
        });
      };

      update();

      (_this$_tippies2 = this._tippies).push.apply(_this$_tippies2, tippies);

      return update;
    }
  }, {
    key: "_inputFromY",
    value: function _inputFromY(y, np) {
      return -(y - np.gridPos.y + np.zeroGridOffsetY) / this._flowScale;
    }
  }, {
    key: "_inputChanged",
    value: function _inputChanged(node, newInput) {
      this.emit('input-changed', node, newInput);
    }
  }, {
    key: "_weightFromY",
    value: function _weightFromY(y, ep) {
      return -(y - ep.intersectionPos.y) / ep.fromActivation;
    }
  }, {
    key: "_weightChanged",
    value: function _weightChanged(edge, newWeight) {
      this.emit('weight-changed', edge, newWeight);
    }
  }, {
    key: "_biasFromY",
    value: function _biasFromY(y, np) {
      return -(y - np.gridPos.y + np.zeroGridOffsetY) / this._flowScale;
    }
  }, {
    key: "_biasChanged",
    value: function _biasChanged(node, newBias) {
      this.emit('bias-changed', node, newBias);
    }
    /***
     * Update DOM based on model
     */

  }, {
    key: "update",
    value: function update(predictionExt) {
      if (typeof predictionExt !== 'undefined') {
        this._updateProps(predictionExt);
      }

      var _iterator3 = _createForOfIteratorHelper(this._viewUpdaters),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var updater = _step3.value;
          updater();
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      return this;
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this._eventManager.dispose();

      this._tippies.forEach(function (t) {
        return t.destroy();
      });

      this.removeAllListeners();
      return this;
    }
  }, {
    key: "_levelI18NKey",
    value: function _levelI18NKey() {
      for (var _len = arguments.length, keyParts = new Array(_len), _key = 0; _key < _len; _key++) {
        keyParts[_key] = arguments[_key];
      }

      return I18N.levelKey.apply(I18N, [this._levelName].concat(keyParts));
    }
  }, {
    key: "_tippyOptionsForLabel",
    value: function _tippyOptionsForLabel() {
      var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref7$alwaysOn = _ref7.alwaysOn,
          alwaysOn = _ref7$alwaysOn === void 0 ? false : _ref7$alwaysOn;

      return {
        showOnCreate: alwaysOn,
        trigger: alwaysOn ? 'manual' : 'mouseenter touchstart',
        hideOnClick: false
      };
    }
  }, {
    key: "localize",
    value: function localize() {
      this._formatNumber = this._i18n.getNumberFormatter();
      this.update();

      this._i18n.localize(this._localizables);

      this._tippies.forEach(function (t) {
        var _t$popperInstance$upd, _t$popperInstance;

        return ((_t$popperInstance$upd = t === null || t === void 0 ? void 0 : (_t$popperInstance = t.popperInstance) === null || _t$popperInstance === void 0 ? void 0 : _t$popperInstance.update) !== null && _t$popperInstance$upd !== void 0 ? _t$popperInstance$upd : function () {
          return true;
        })();
      });
    }
  }], [{
    key: "_buildEdgePaths",
    value: function _buildEdgePaths(_ref8) {
      var _SVGPathBuilder, _SVGPathBuilder2, _SVGPathBuilder$MC, _SVGPathBuilder3, _SVGPathBuilder$MC2, _SVGPathBuilder4;

      var fromPos = _ref8.fromPos,
          fromActivation = _ref8.fromActivation,
          toPos = _ref8.toPos,
          toActivation = _ref8.toActivation;

      var flip = function flip(b) {
        return new _bezierJs["default"](_toConsumableArray(b.points).reverse());
      };

      var bezier = new _bezierJs["default"](fromPos, {
        x: fromPos.x * 0.5 + toPos.x * 0.5,
        y: fromPos.y
      }, {
        x: fromPos.x * 0.5 + toPos.x * 0.5,
        y: toPos.y
      }, toPos);
      var bezierActivated = new _bezierJs["default"]({
        x: fromPos.x,
        y: fromPos.y - fromActivation
      }, {
        x: fromPos.x * 0.5 + toPos.x * 0.5,
        y: fromPos.y - fromActivation
      }, {
        x: fromPos.x * 0.5 + toPos.x * 0.5,
        y: toPos.y - toActivation
      }, {
        x: toPos.x,
        y: toPos.y - toActivation
      });

      var _ref9 = function () {
        var bbox = bezier.bbox();
        var intersection = bezier.intersects({
          p1: {
            x: bbox.x.min + bbox.x.size * (1 - 0.33),
            y: bbox.y.min - 1
          },
          p2: {
            x: bbox.x.min + bbox.x.size * (1 - 0.33),
            y: bbox.y.max + 1
          }
        })[0];
        var intersectionPos = bezier.get(intersection);
        var handlePos = {
          x: intersectionPos.x,
          y: intersectionPos.y - toActivation
        };
        var labelPos = handlePos;
        return {
          intersectionPos: intersectionPos,
          handlePos: handlePos,
          labelPos: labelPos
        };
      }(),
          intersectionPos = _ref9.intersectionPos,
          handlePos = _ref9.handlePos,
          labelPos = _ref9.labelPos;

      var _ref10 = function () {
        var _bezierSub$intersects;

        var bezierSub = new _bezierJs["default"]({
          x: 0,
          y: -fromActivation
        }, {
          x: 0.5,
          y: -fromActivation
        }, {
          x: 0.5,
          y: -toActivation
        }, {
          x: 1,
          y: -toActivation
        });
        var line = {
          p1: {
            x: -1,
            y: 0
          },
          p2: {
            x: 2,
            y: 0
          }
        }; // bezierSub and line intersect at the same t as bezier and bezierActivated,
        // but the intersection is much easier to compute (intersecting two cubic bezier curves was
        // too slow for realtime processing, but intersecting a cubic bezier curve and a line works
        // just fine).

        var t = (_bezierSub$intersects = bezierSub.intersects(line)[0]) !== null && _bezierSub$intersects !== void 0 ? _bezierSub$intersects : 1;

        var _bezier$split = bezier.split(t),
            bezierFrom = _bezier$split.left,
            bezierTo = _bezier$split.right;

        var _bezierActivated$spli = bezierActivated.split(t),
            bezierFromActivated = _bezierActivated$spli.left,
            bezierToActivated = _bezierActivated$spli.right;

        return {
          bezierFrom: bezierFrom,
          bezierFromActivated: bezierFromActivated,
          bezierTo: bezierTo,
          bezierToActivated: bezierToActivated
        };
      }(),
          bezierFrom = _ref10.bezierFrom,
          bezierFromActivated = _ref10.bezierFromActivated,
          bezierTo = _ref10.bezierTo,
          bezierToActivated = _ref10.bezierToActivated;

      var edgePath = (_SVGPathBuilder = new _svgPathBuilder["default"]()).MC.apply(_SVGPathBuilder, _toConsumableArray(bezier.points)).build();

      var edgeActivatedPath = (_SVGPathBuilder2 = new _svgPathBuilder["default"]()).MC.apply(_SVGPathBuilder2, _toConsumableArray(bezierActivated.points)).build();

      var fromActivationEdgePath = (_SVGPathBuilder$MC = (_SVGPathBuilder3 = new _svgPathBuilder["default"]()).MC.apply(_SVGPathBuilder3, _toConsumableArray(bezierFrom.points))).LC.apply(_SVGPathBuilder$MC, _toConsumableArray(flip(bezierFromActivated).points)).Z().build();

      var toActivationEdgePath = (_SVGPathBuilder$MC2 = (_SVGPathBuilder4 = new _svgPathBuilder["default"]()).MC.apply(_SVGPathBuilder4, _toConsumableArray(bezierTo.points))).LC.apply(_SVGPathBuilder$MC2, _toConsumableArray(flip(bezierToActivated).points)).Z().build();

      return {
        edgePath: edgePath,
        edgeActivatedPath: edgeActivatedPath,
        fromActivationEdgePath: fromActivationEdgePath,
        toActivationEdgePath: toActivationEdgePath,
        intersectionPos: intersectionPos,
        labelPos: labelPos,
        handlePos: handlePos
      };
    }
  }]);

  return View;
}(_events.EventEmitter);

exports.View = exports["default"] = View;
View.GRID_SCALE = {
  x: 300,
  y: 300
};
View.NODE_SIZE = {
  x: Math.min(View.GRID_SCALE.x, View.GRID_SCALE.y) / 4,
  y: Math.min(View.GRID_SCALE.x, View.GRID_SCALE.y) / 4
};
View.NODE_MAX_INNER_HEIGHT = (View.GRID_SCALE.y - View.NODE_SIZE.y) * 0.9;
View.NODE_RADIUS = View.NODE_SIZE.y * 0.5;
View.LABEL_FONT_SIZE = 16; // TODO: Move to CSS if possible // px

View.HANDLE_RADIUS = 10;

function getOrderedInEdges(node, coords) {
  // sort incoming edges by connected node (node.from) in descending y order
  var compare = function compare(edgeA, edgeB) {
    return -(coords.absY(edgeA.from.id) - coords.absY(edgeB.from.id));
  };

  return _toConsumableArray(node["in"]).sort(compare);
}

function getPartialSumRange(edges, properties, bias) {
  var p = properties;
  var partials = edges.reduce(function (acc, cur) {
    acc.push(acc[acc.length - 1] + p[cur.from.id].activation * p[cur.id].weight);
    return acc;
  }, [bias]);
  return new _intervalArithmetic.Interval(partials.reduce(function (acc, cur) {
    return Math.min(acc, cur);
  }, bias), partials.reduce(function (acc, cur) {
    return Math.max(acc, cur);
  }, bias));
}

var fillColor = function fillColor(node) {
  if (node.isInput()) {
    return 'red';
  } else if (node.isOutput()) {
    return 'green';
  } else {
    return 'yellow';
  }
};

var activationColor = function activationColor(activation) {
  return activation >= 0 ? 'blue' : 'red';
};

var gridX = function gridX(x) {
  return View.GRID_SCALE.x * x;
};

var gridY = function gridY(y) {
  return View.GRID_SCALE.y * y;
};

var grid = function grid(_ref11) {
  var x = _ref11.x,
      y = _ref11.y;
  return {
    x: gridX(x),
    y: gridY(y)
  };
};

var VerticalDraggable = /*#__PURE__*/function () {
  function VerticalDraggable(svgElem, anchorElem, dragHandler, domEventManager) {
    var _this7 = this;

    _classCallCheck(this, VerticalDraggable);

    this._svgElem = svgElem;
    this._anchorElem = anchorElem;
    this._dragHandler = dragHandler;
    this._eventManager = domEventManager;

    this._moveHandler = function (ev) {
      return _this7._move(ev);
    };

    this._upHandler = function (ev) {
      return _this7._up(ev);
    };

    var ael = this._eventManager.ael;
    var rel = this._eventManager.rel;
    ael(svgElem.node, 'pointerdown', function (ev) {
      return _this7._down(ev);
    });
    this._emMoveHandler = rel(window, 'pointermove', this._moveHandler.bind(this));
    this._emUpHandler = rel(window, 'pointerup', this._upHandler.bind(this));
  }

  _createClass(VerticalDraggable, [{
    key: "_down",
    value: function _down(event) {
      // TODO: register animation frame callback to trigger dragHandler in every frame when pressed to account for external changes to svgElem
      this._emMoveHandler.attach();

      this._emUpHandler.attach();
    }
  }, {
    key: "_move",
    value: function _move(event) {
      var anchorTop = this._anchorElem.node.getBoundingClientRect().y;

      this._dragHandler({
        y: event.clientY - anchorTop
      });
    }
  }, {
    key: "_up",
    value: function _up(event) {
      this._emMoveHandler.detach();

      this._emUpHandler.detach();
    }
  }]);

  return VerticalDraggable;
}();
/***
 const showGradientCheckbox = document.querySelector('#showgradient');
 showGradientCheckbox.addEventListener('change',
 () => this.emit('show-gradient', showGradientCheckbox.checked)
 );
 */

},{"../../util/event-manager":24,"../../util/i18n":27,"../../util/svg-path-builder":30,"./node-coordinates":15,"@svgdotjs/svg.js":"@svgdotjs/svg.js","bezier-js":"bezier-js","core-js/modules/es.array.concat":160,"core-js/modules/es.array.fill":161,"core-js/modules/es.array.filter":162,"core-js/modules/es.array.for-each":166,"core-js/modules/es.array.from":167,"core-js/modules/es.array.is-array":170,"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.map":174,"core-js/modules/es.array.reduce":175,"core-js/modules/es.array.reverse":176,"core-js/modules/es.array.slice":177,"core-js/modules/es.array.sort":178,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.bind":181,"core-js/modules/es.function.name":182,"core-js/modules/es.object.assign":186,"core-js/modules/es.object.create":187,"core-js/modules/es.object.define-properties":188,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.get-own-property-descriptor":193,"core-js/modules/es.object.get-own-property-descriptors":194,"core-js/modules/es.object.get-prototype-of":196,"core-js/modules/es.object.keys":198,"core-js/modules/es.object.set-prototype-of":199,"core-js/modules/es.object.to-string":200,"core-js/modules/es.reflect.construct":204,"core-js/modules/es.regexp.exec":205,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.iterator":209,"core-js/modules/es.string.search":211,"core-js/modules/es.string.split":212,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.for-each":217,"core-js/modules/web.dom-collections.iterator":218,"core-js/modules/web.url":220,"events":"events","interval-arithmetic":"interval-arithmetic","tippy.js":"tippy.js"}],18:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.bind");

require("core-js/modules/es.object.create");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.get-prototype-of");

require("core-js/modules/es.object.set-prototype-of");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.reflect.construct");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = exports["default"] = void 0;

var _model = _interopRequireDefault(require("./model"));

var _view = _interopRequireDefault(require("./view"));

var _events = require("events");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Controller = /*#__PURE__*/function (_EventEmitter) {
  _inherits(Controller, _EventEmitter);

  var _super = _createSuper(Controller);

  function Controller(slideNames) {
    var _this;

    _classCallCheck(this, Controller);

    _this = _super.call(this);
    _this._model = new _model["default"](slideNames);
    _this._view = new _view["default"](_this._model);

    _this._model.on('current-slide-changed', _this._handleSlideChanged.bind(_assertThisInitialized(_this)));

    _this._view.on('go-to-previous-slide', function () {
      return _this._model.previous();
    });

    _this._view.on('go-to-next-slide', function () {
      return _this._model.next();
    });

    return _this;
  }

  _createClass(Controller, [{
    key: "getModel",
    value: function getModel() {
      return this._model;
    }
  }, {
    key: "_handleSlideChanged",
    value: function _handleSlideChanged(slideName, slideIndex, prevSlideName, prevSlideIndex) {
      this._view.update();

      this.emit('current-slide-changed', slideName, slideIndex, prevSlideName, prevSlideIndex, this);
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this._model.dispose();

      this._view.dispose();
    }
  }]);

  return Controller;
}(_events.EventEmitter);

exports.Controller = exports["default"] = Controller;

},{"./model":19,"./view":20,"core-js/modules/es.array.iterator":171,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.bind":181,"core-js/modules/es.object.create":187,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.get-prototype-of":196,"core-js/modules/es.object.set-prototype-of":199,"core-js/modules/es.object.to-string":200,"core-js/modules/es.reflect.construct":204,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.iterator":209,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.iterator":218,"events":"events"}],19:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.is-array");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.bind");

require("core-js/modules/es.function.name");

require("core-js/modules/es.object.create");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.get-prototype-of");

require("core-js/modules/es.object.set-prototype-of");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.reflect.construct");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Model = exports["default"] = void 0;

var _events = require("events");

var _eventManager = _interopRequireDefault(require("../../util/event-manager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Model = /*#__PURE__*/function (_EventEmitter) {
  _inherits(Model, _EventEmitter);

  var _super = _createSuper(Model);

  function Model(slideNames, currentSlideIndexOrName) {
    var _this;

    _classCallCheck(this, Model);

    _this = _super.call(this);
    _this._slideNames = _toConsumableArray(slideNames);
    _this._currentSlideIndex = 0;
    _this._domEventManager = new _eventManager["default"]();

    _this.setSlide(currentSlideIndexOrName !== null && currentSlideIndexOrName !== void 0 ? currentSlideIndexOrName : _this._getSlideNameFromURL());

    _this._domEventManager.ael(window, 'hashchange', _this._updateFromHash.bind(_assertThisInitialized(_this)));

    return _this;
  }

  _createClass(Model, [{
    key: "getSlideNames",
    value: function getSlideNames() {
      return _toConsumableArray(this._slideNames);
    }
  }, {
    key: "getSlideName",
    value: function getSlideName(index) {
      return this._slideNames[index];
    }
  }, {
    key: "getCurrentSlideName",
    value: function getCurrentSlideName() {
      return this._slideNames[this._currentSlideIndex];
    }
  }, {
    key: "getCurrentSlideIndex",
    value: function getCurrentSlideIndex() {
      return this._currentSlideIndex;
    }
  }, {
    key: "setSlide",
    value: function setSlide(nameOrIndex) {
      if (typeof nameOrIndex === 'string') {
        var name = nameOrIndex;

        var index = this._slideNames.indexOf(name);

        if (index >= 0 && index < this.numSlides()) {
          return this.setSlide(index);
        } else {
          var encodedSlideNames = this._slideNames.map(encodeURIComponent);

          console.warn("Unknown slide name: ".concat(name, ". Use one of ").concat(JSON.stringify(encodedSlideNames)));
          return false;
        }
      } else if (typeof nameOrIndex === 'number') {
        var _index = nameOrIndex;

        if (_index !== this._currentSlideIndex && _index >= 0 && _index < this.numSlides()) {
          var prevSlideIndex = this.getCurrentSlideIndex();
          var prevSlideName = this.getCurrentSlideName();
          this._currentSlideIndex = _index;
          window.location.hash = "#".concat(encodeURIComponent(this.getCurrentSlideName()));
          this.emit('current-slide-changed', this.getCurrentSlideName(), this.getCurrentSlideIndex(), prevSlideIndex, prevSlideName, this);
          return true;
        } else {
          return false;
        }
      } else {
        // Ignore invalid slide name or index
        return false;
      }
    }
  }, {
    key: "next",
    value: function next() {
      return this.setSlide(this.getCurrentSlideIndex() + 1);
    }
  }, {
    key: "previous",
    value: function previous() {
      return this.setSlide(this.getCurrentSlideIndex() - 1);
    }
  }, {
    key: "numSlides",
    value: function numSlides() {
      return this._slideNames.length;
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this._domEventManager.dispose();
    }
  }, {
    key: "_getSlideNameFromURL",
    value: function _getSlideNameFromURL() {
      var hash = window.location.hash;
      return decodeURIComponent(hash.substring(1));
    }
  }, {
    key: "_updateFromHash",
    value: function _updateFromHash() {
      this.setSlide(this._getSlideNameFromURL());
    }
  }]);

  return Model;
}(_events.EventEmitter);

exports.Model = exports["default"] = Model;

},{"../../util/event-manager":24,"core-js/modules/es.array.concat":160,"core-js/modules/es.array.from":167,"core-js/modules/es.array.index-of":169,"core-js/modules/es.array.is-array":170,"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.map":174,"core-js/modules/es.array.slice":177,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.bind":181,"core-js/modules/es.function.name":182,"core-js/modules/es.object.create":187,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.get-prototype-of":196,"core-js/modules/es.object.set-prototype-of":199,"core-js/modules/es.object.to-string":200,"core-js/modules/es.reflect.construct":204,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.iterator":209,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.iterator":218,"events":"events"}],20:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.object.create");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.get-prototype-of");

require("core-js/modules/es.object.set-prototype-of");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.reflect.construct");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.View = exports["default"] = void 0;

var _events = require("events");

var _eventManager = _interopRequireDefault(require("../../util/event-manager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var View = /*#__PURE__*/function (_EventEmitter) {
  _inherits(View, _EventEmitter);

  var _super = _createSuper(View);

  function View(model) {
    var _this;

    _classCallCheck(this, View);

    _this = _super.call(this);
    _this._model = model;
    _this._previousSlideButton = document.querySelector("#backbutton");
    _this._nextSlideButton = document.querySelector("#nextbutton");
    _this._items = _this._addItems();
    _this._domEventManager = _this._addEventListeners();

    _this.update();

    return _this;
  }

  _createClass(View, [{
    key: "update",
    value: function update() {
      this._updateFooter();
    }
  }, {
    key: "_addEventListeners",
    value: function _addEventListeners() {
      var _this2 = this;

      var domEventManager = new _eventManager["default"]();
      var ael = domEventManager.ael;
      ael(this._previousSlideButton, 'click', function () {
        return _this2.emit('go-to-previous-slide');
      });
      ael(this._nextSlideButton, 'click', function () {
        return _this2.emit('go-to-next-slide');
      });
      ael(window, 'keydown', function (event) {
        switch (event.key) {
          case "ArrowLeft":
            _this2.emit('previous');

            break;

          case "ArrowRight":
            _this2.emit('next');

            break;
        }
      });
      return domEventManager;
    }
  }, {
    key: "_addItems",
    value: function _addItems() {
      var _this3 = this;

      var parent = document.querySelector('#navcircles');
      parent.querySelectorAll('a').forEach(function (n) {
        return n.remove();
      });

      var items = this._model.getSlideNames().map(function (name) {
        return _this3._createItem(name);
      });

      items.forEach(function (item) {
        return parent.appendChild(item);
      });
      return items;
    }
  }, {
    key: "_createItem",
    value: function _createItem(name) {
      var item = document.createElement('a');
      item.href = "#".concat(encodeURIComponent(name));
      item.classList.add('circ');
      return item;
    }
  }, {
    key: "_updateFooter",
    value: function _updateFooter() {
      var _this4 = this;

      this._items.forEach(function (item, i) {
        if (i === _this4._model.getCurrentSlideIndex()) {
          item.classList.add('selected');
        } else {
          item.classList.remove('selected');
        }
      });

      var isFirstSlide = this._model.getCurrentSlideIndex() === 0;
      var isLastSlide = this._model.getCurrentSlideIndex() === this._model.numSlides() - 1;
      this._previousSlideButton.style.visibility = isFirstSlide ? "hidden" : "visible";
      this._nextSlideButton.style.visibility = isLastSlide ? "hidden" : "visible";
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this._domEventManager.dispose();
    }
  }]);

  return View;
}(_events.EventEmitter);

exports.View = exports["default"] = View;

},{"../../util/event-manager":24,"core-js/modules/es.array.for-each":166,"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.map":174,"core-js/modules/es.date.to-string":180,"core-js/modules/es.object.create":187,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.get-prototype-of":196,"core-js/modules/es.object.set-prototype-of":199,"core-js/modules/es.object.to-string":200,"core-js/modules/es.reflect.construct":204,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.iterator":209,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.for-each":217,"core-js/modules/web.dom-collections.iterator":218,"events":"events"}],21:[function(require,module,exports){
"use strict";

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/es.promise.finally");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AsyncFunctionQueue = exports["default"] = void 0;

require("regenerator-runtime/runtime");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var AsyncFunctionQueue = /*#__PURE__*/function () {
  function AsyncFunctionQueue() {
    _classCallCheck(this, AsyncFunctionQueue);

    this._queuePromise = Promise.resolve(true);
  }

  _createClass(AsyncFunctionQueue, [{
    key: "enqueue",
    value: function () {
      var _enqueue = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(func) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // this serves as a barrier such the provided function is only executed once the previous
                // have finished execution (successfully or with exception)
                this._queuePromise = this._queuePromise["finally"](func);
                _context.next = 3;
                return this._queuePromise;

              case 3:
                return _context.abrupt("return", _context.sent);

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function enqueue(_x) {
        return _enqueue.apply(this, arguments);
      }

      return enqueue;
    }()
  }]);

  return AsyncFunctionQueue;
}();

exports.AsyncFunctionQueue = exports["default"] = AsyncFunctionQueue;

},{"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.to-string":200,"core-js/modules/es.promise":203,"core-js/modules/es.promise.finally":202,"regenerator-runtime/runtime":221}],22:[function(require,module,exports){
"use strict";

require("core-js/modules/es.array.is-array");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clamp = exports["default"] = clamp;

var _intervalArithmetic = _interopRequireDefault(require("interval-arithmetic"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/***
 *
 * @param value {number}
 * @param range {Interval|Number[]}
 * @returns {number}
 */
function clamp(value, range) {
  if (_intervalArithmetic["default"].isInterval(range)) {
    return Math.min(Math.max(range.lo, value), range.hi);
  } else if (Array.isArray(range) && range.length > 0) {
    var closest = range[0];
    var closestDist = Math.abs(value - range[0]);

    for (var i = 1; i < range.length; ++i) {
      var dist = Math.abs(value - range[i]);

      if (dist < closestDist) {
        closest = range[i];
        closestDist = dist;
      }
    }

    return closest;
  } else {
    throw Error("Range must be an interval or non-empty array. Got ".concat(range, " instead."));
  }
}

},{"core-js/modules/es.array.is-array":170,"interval-arithmetic":"interval-arithmetic"}],23:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.number.constructor");

require("core-js/modules/es.object.freeze");

require("core-js/modules/es.object.get-own-property-names");

require("core-js/modules/es.object.is-frozen");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deepFreeze = exports["default"] = deepFreeze;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function deepFreeze(o) {
  var levels = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Number.POSITIVE_INFINITY;
  if (levels === 0) return;
  Object.freeze(o);
  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (o.hasOwnProperty(prop) && o[prop] !== null && (_typeof(o[prop]) === "object" || typeof o[prop] === "function") && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop], levels - 1);
    }
  });
  return o;
}

},{"core-js/modules/es.array.for-each":166,"core-js/modules/es.array.iterator":171,"core-js/modules/es.number.constructor":184,"core-js/modules/es.object.freeze":191,"core-js/modules/es.object.get-own-property-names":195,"core-js/modules/es.object.is-frozen":197,"core-js/modules/es.object.to-string":200,"core-js/modules/es.string.iterator":209,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.for-each":217,"core-js/modules/web.dom-collections.iterator":218}],24:[function(require,module,exports){
"use strict";

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.reduce");

require("core-js/modules/es.function.bind");

require("core-js/modules/es.object.define-property");

require("core-js/modules/web.dom-collections.for-each");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventManager = exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var EventManager = /*#__PURE__*/function () {
  function EventManager() {
    _classCallCheck(this, EventManager);

    this._emHandlers = [];
    this.rel = this.registerEventListener.bind(this);
    this.ael = this.addEventListener.bind(this);
  }

  _createClass(EventManager, [{
    key: "registerEventListener",
    value: function registerEventListener(emitter) {
      var emHandler;

      for (var _len = arguments.length, addEventListenerParams = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        addEventListenerParams[_key - 1] = arguments[_key];
      }

      if (hasFunctions(emitter, 'addEventListener', 'removeEventListener')) {
        emHandler = createEMHandlerForDOMElement.apply(void 0, [emitter].concat(addEventListenerParams));
      } else if (hasFunctions(emitter, 'on', 'off')) {
        emHandler = createEMHandlerForEventEmitter.apply(void 0, [emitter].concat(addEventListenerParams));
      } else {
        throw new Error("Unsupported event emitter type.");
      }

      this._emHandlers.push(emHandler);

      return emHandler;
    }
  }, {
    key: "addEventListener",
    value: function addEventListener(emitter) {
      for (var _len2 = arguments.length, addEventListenerParams = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        addEventListenerParams[_key2 - 1] = arguments[_key2];
      }

      return this.registerEventListener.apply(this, [emitter].concat(addEventListenerParams)).attach();
    }
  }, {
    key: "attach",
    value: function attach() {
      this._emHandlers.forEach(function (aDetacher) {
        return aDetacher.attach();
      });

      return this;
    }
  }, {
    key: "detach",
    value: function detach() {
      this._emHandlers.forEach(function (aDetacher) {
        return aDetacher.detach();
      });

      return this;
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.detach();
      this._emHandlers = [];
      return this;
    }
  }]);

  return EventManager;
}();

exports.EventManager = exports["default"] = EventManager;

function hasFunction(obj, functionName) {
  return typeof obj[functionName] === 'function';
}

function hasFunctions(obj) {
  for (var _len3 = arguments.length, functionNames = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    functionNames[_key3 - 1] = arguments[_key3];
  }

  return functionNames.reduce(function (acc, cur) {
    return acc && hasFunction(obj, cur);
  }, true);
}

function createEMHandlerForDOMElement(domElement) {
  for (var _len4 = arguments.length, addEventListenerParams = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    addEventListenerParams[_key4 - 1] = arguments[_key4];
  }

  return {
    attach: function attach() {
      domElement.addEventListener.apply(domElement, addEventListenerParams);
      return this;
    },
    detach: function detach() {
      domElement.removeEventListener.apply(domElement, addEventListenerParams);
      return this;
    }
  };
}

function createEMHandlerForEventEmitter(emitter) {
  for (var _len5 = arguments.length, addEventListenerParams = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    addEventListenerParams[_key5 - 1] = arguments[_key5];
  }

  return {
    attach: function attach() {
      emitter.on.apply(emitter, addEventListenerParams);
      return this;
    },
    detach: function detach() {
      emitter.off.apply(emitter, addEventListenerParams);
      return this;
    }
  };
}

},{"core-js/modules/es.array.concat":160,"core-js/modules/es.array.for-each":166,"core-js/modules/es.array.reduce":175,"core-js/modules/es.function.bind":181,"core-js/modules/es.object.define-property":189,"core-js/modules/web.dom-collections.for-each":217}],25:[function(require,module,exports){
"use strict";

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.map");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchWithCache = exports["default"] = fetchWithCache;

require("regenerator-runtime/runtime");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var cache = new Map();

function fetchWithCache(_x) {
  return _fetchWithCache.apply(this, arguments);
}

function _fetchWithCache() {
  _fetchWithCache = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(href) {
    var response, fetcher;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!cache.has(href)) {
              _context.next = 8;
              break;
            }

            _context.next = 3;
            return cache.get(href);

          case 3:
            response = _context.sent;

            if (!response.ok) {
              cache["delete"](href);
            }

            return _context.abrupt("return", response.clone());

          case 8:
            fetcher = fetch(href);
            cache.set(href, fetcher);
            _context.next = 12;
            return fetchWithCache(href);

          case 12:
            return _context.abrupt("return", _context.sent);

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _fetchWithCache.apply(this, arguments);
}

},{"core-js/modules/es.array.iterator":171,"core-js/modules/es.map":183,"core-js/modules/es.object.to-string":200,"core-js/modules/es.promise":203,"core-js/modules/es.string.iterator":209,"core-js/modules/web.dom-collections.iterator":218,"regenerator-runtime/runtime":221}],26:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.is-array");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.name");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateLayout = exports["default"] = generateLayout;

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function generateLayout(network) {
  var topSort = network.topSort;
  var layerIndices = {};
  var layers = [];
  var currentLayer = [];

  var _iterator = _createForOfIteratorHelper(topSort),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var node = _step.value;

      var _iterator2 = _createForOfIteratorHelper(node["in"]),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var edge = _step2.value;

          if (layerIndices[edge.from.id] === layers.length) {
            layers.push(currentLayer);
            currentLayer = [];
            break;
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      currentLayer.push(node.id);
      layerIndices[node.id] = layers.length;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  layers.push(currentLayer);
  return layers;
}

},{"core-js/modules/es.array.from":167,"core-js/modules/es.array.is-array":170,"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.slice":177,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.name":182,"core-js/modules/es.object.to-string":200,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.iterator":209,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.iterator":218}],27:[function(require,module,exports){
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.flat");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.is-array");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.join");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.array.unscopables.flat");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.bind");

require("core-js/modules/es.function.name");

require("core-js/modules/es.object.define-properties");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.entries");

require("core-js/modules/es.object.from-entries");

require("core-js/modules/es.object.get-own-property-descriptor");

require("core-js/modules/es.object.get-own-property-descriptors");

require("core-js/modules/es.object.keys");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.object.values");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.code-point-at");

require("core-js/modules/es.string.iterator");

require("core-js/modules/es.string.replace");

require("core-js/modules/es.string.split");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createI18N = exports["default"] = createI18N;
exports.escape = escape;
exports.levelNamespace = levelNamespace;
exports.key = key;
exports.levelKey = levelKey;

require("regenerator-runtime/runtime");

var _i18next = _interopRequireDefault(require("i18next"));

var _i18nextBrowserLanguagedetector = _interopRequireDefault(require("i18next-browser-languagedetector"));

var _i18nextHttpBackend = _interopRequireDefault(require("i18next-http-backend"));

var _lodash = require("lodash");

var _yamlLoader = _interopRequireDefault(require("../util/yaml-loader"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var escapeChars = '#.:_';
var mapping = Object.fromEntries(_toConsumableArray(escapeChars).map(function (cp) {
  return [cp, "#".concat(cp.codePointAt(0))];
}));
var defaultNumberFormatOptions = {
  notation: 'standard',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
};

var I18N = /*#__PURE__*/function () {
  function I18N(i18NextInstance) {
    _classCallCheck(this, I18N);

    this._instance = i18NextInstance;
    this._localize = locI18next.init(i18NextInstance);
  }

  _createClass(I18N, [{
    key: "getI18NextInstance",
    value: function getI18NextInstance() {
      return this._instance;
    }
  }, {
    key: "addLevelStrings",
    value: function addLevelStrings(levelName, levelStrings) {
      var bundles = transformToI18NResourceBundles(levelStrings);

      for (var _i = 0, _Object$entries = Object.entries(bundles); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            lng = _Object$entries$_i[0],
            bundle = _Object$entries$_i[1];

        var ns = levelNamespace(levelName);

        this._instance.addResourceBundle(lng, ns, bundle, true, true);
      }
    }
  }, {
    key: "getFixedLevelT",
    value: function getFixedLevelT(levelName) {
      return this._instance.getFixedT(null, levelNamespace(levelName));
    }
  }, {
    key: "getFixedLevelLabelT",
    value: function getFixedLevelLabelT(levelName) {
      var tLevel = this.getFixedLevelT(levelName);
      return function (id, labelFor) {
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key2 = 2; _key2 < _len; _key2++) {
          args[_key2 - 2] = arguments[_key2];
        }

        return tLevel.apply(void 0, ["labels.".concat(escape(id), ".").concat(labelFor)].concat(args));
      };
    }
  }, {
    key: "localize",
    value: function localize() {
      var _this = this;

      for (var _len2 = arguments.length, selectorsAndElems = new Array(_len2), _key3 = 0; _key3 < _len2; _key3++) {
        selectorsAndElems[_key3] = arguments[_key3];
      }

      selectorsAndElems.forEach(function (e) {
        return _this._localize(e);
      });
    }
  }, {
    key: "getNumberFormatter",
    value: function getNumberFormatter() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultNumberFormatOptions;
      var formatter = new Intl.NumberFormat(this._instance.language, options);
      return formatter.format.bind(formatter);
    }
  }]);

  return I18N;
}();

function createI18N(_x) {
  return _createI18N.apply(this, arguments);
}

function _createI18N() {
  _createI18N = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(languages) {
    var preloadLanguages,
        detectorOptions,
        httpBackendOptions,
        i18nextOptions,
        newInstance,
        _args = arguments;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            preloadLanguages = _args.length > 1 && _args[1] !== undefined ? _args[1] : false;
            detectorOptions = {
              lookupQuerystring: 'lang'
            };
            httpBackendOptions = {
              loadPath: 'assets/locales/{{ns}}/{{lng}}.yaml',
              parse: _yamlLoader["default"].fromString
            };
            i18nextOptions = {
              preload: preloadLanguages ? languages : false,
              fallbackLng: (0, _lodash.uniq)([].concat(_toConsumableArray(languages), ['en'])),
              cleanCode: true,
              ns: ['main'],
              defaultNS: 'main',
              detection: detectorOptions,
              backend: httpBackendOptions
            };
            newInstance = _i18next["default"].createInstance();
            _context.next = 7;
            return newInstance.use(_i18nextBrowserLanguagedetector["default"]).use(_i18nextHttpBackend["default"]).init(i18nextOptions);

          case 7:
            languages.forEach(function (lng) {
              return newInstance.addResource(lng, 'internal', 'empty', '');
            });
            return _context.abrupt("return", new I18N(newInstance));

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _createI18N.apply(this, arguments);
}

function transformToI18NResourceBundles(strings) {
  var languages = occuringLanguages(strings);
  var bundles = Object.fromEntries(languages.map(function (l) {
    return [l, filterLanguage(strings, l)];
  }));
  return bundles;
}

function occuringLanguages(strings) {
  var _strings$labels, _strings$title, _strings$description;

  var nodeOrEdgeLabelObjs = Object.values((_strings$labels = strings === null || strings === void 0 ? void 0 : strings.labels) !== null && _strings$labels !== void 0 ? _strings$labels : {});
  var propertyObjs = nodeOrEdgeLabelObjs.map(function (o) {
    return Object.values(o);
  }).flat();
  var textObjs = propertyObjs.map(function (o) {
    var _o$text;

    return (_o$text = o.text) !== null && _o$text !== void 0 ? _o$text : {};
  });
  textObjs.push((_strings$title = strings === null || strings === void 0 ? void 0 : strings.title) !== null && _strings$title !== void 0 ? _strings$title : {});
  textObjs.push((_strings$description = strings === null || strings === void 0 ? void 0 : strings.description) !== null && _strings$description !== void 0 ? _strings$description : {});
  var languages = (0, _lodash.uniq)(textObjs.map(function (o) {
    return Object.keys(o);
  }).flat());
  return languages;
}

function filterLanguage(strings, lang) {
  var _strings$title2, _strings$description2;

  var result = {};

  if (typeof (strings === null || strings === void 0 ? void 0 : (_strings$title2 = strings.title) === null || _strings$title2 === void 0 ? void 0 : _strings$title2[lang]) !== 'undefined') {
    var _strings$title3;

    result.title = strings === null || strings === void 0 ? void 0 : (_strings$title3 = strings.title) === null || _strings$title3 === void 0 ? void 0 : _strings$title3[lang];
  }

  if (typeof (strings === null || strings === void 0 ? void 0 : (_strings$description2 = strings.description) === null || _strings$description2 === void 0 ? void 0 : _strings$description2[lang]) !== 'undefined') {
    var _strings$description3;

    result.description = strings === null || strings === void 0 ? void 0 : (_strings$description3 = strings.description) === null || _strings$description3 === void 0 ? void 0 : _strings$description3[lang];
  }

  if (typeof (strings === null || strings === void 0 ? void 0 : strings.labels) !== 'undefined') {
    result.labels = {};
    Object.entries(strings.labels).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          nodeOrEdgeId = _ref2[0],
          labels = _ref2[1];

      var escapedId = escape(nodeOrEdgeId);
      result.labels[escapedId] = {};
      Object.entries(labels).forEach(function (_ref3) {
        var _propertyObj$text;

        var _ref4 = _slicedToArray(_ref3, 2),
            propertyName = _ref4[0],
            propertyObj = _ref4[1];

        if (typeof (propertyObj === null || propertyObj === void 0 ? void 0 : (_propertyObj$text = propertyObj.text) === null || _propertyObj$text === void 0 ? void 0 : _propertyObj$text[lang]) !== 'undefined') {
          var _propertyObj$text2;

          var escapedPropertyName = escape(propertyName);
          result.labels[escapedId][escapedPropertyName] = propertyObj === null || propertyObj === void 0 ? void 0 : (_propertyObj$text2 = propertyObj.text) === null || _propertyObj$text2 === void 0 ? void 0 : _propertyObj$text2[lang];
        }
      });
    });
  }

  return result;
}

function levelNamespace(levelName) {
  return "level_".concat(escape(levelName));
}

function escape(keyComponent) {
  return _toConsumableArray(keyComponent).map(function (codepoint) {
    var _mapping$codepoint;

    return (_mapping$codepoint = mapping[codepoint]) !== null && _mapping$codepoint !== void 0 ? _mapping$codepoint : codepoint;
  }).join('');
}

function _key(ns) {
  for (var _len3 = arguments.length, keyParts = new Array(_len3 > 1 ? _len3 - 1 : 0), _key4 = 1; _key4 < _len3; _key4++) {
    keyParts[_key4 - 1] = arguments[_key4];
  }

  return "".concat(ns, ":").concat(keyParts.join('.'));
}

function key(ns) {
  for (var _len4 = arguments.length, keyParts = new Array(_len4 > 1 ? _len4 - 1 : 0), _key5 = 1; _key5 < _len4; _key5++) {
    keyParts[_key5 - 1] = arguments[_key5];
  }

  return _key.apply(void 0, [ns].concat(_toConsumableArray(keyParts.map(escape))));
}

function levelKey(levelName) {
  for (var _len5 = arguments.length, keyParts = new Array(_len5 > 1 ? _len5 - 1 : 0), _key6 = 1; _key6 < _len5; _key6++) {
    keyParts[_key6 - 1] = arguments[_key6];
  }

  return _key.apply(void 0, [levelNamespace(levelName)].concat(keyParts));
}

// copy of locI18next package until passing elements to localize() is implemented upstream
var locI18nextDefaults = {
  selectorAttr: 'data-i18n',
  targetAttr: 'i18n-target',
  optionsAttr: 'i18n-options',
  useOptionsAttr: false,
  parseDefaultValueFromContent: true,
  document: document
};

function locI18nextInit(i18next) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  options = _objectSpread(_objectSpread({}, locI18nextDefaults), options);

  var extendDefault = function extendDefault(o, val) {
    return options.parseDefaultValueFromContent ? _objectSpread(_objectSpread({}, o), {
      defaultValue: val
    }) : o;
  };

  function parse(elem, key, opts) {
    var attr = 'text';

    if (key.indexOf('[') == 0) {
      var parts = key.split(']');
      key = parts[1];
      attr = parts[0].substr(1, parts[0].length - 1);
    }

    key = key.indexOf(';') == key.length - 1 ? key.substr(0, key.length - 2) : key;

    if (attr === 'html') {
      elem.innerHTML = i18next.t(key, extendDefault(opts, elem.innerHTML));
    } else if (attr === 'text') {
      elem.textContent = i18next.t(key, extendDefault(opts, elem.textContent));
    } else if (attr === 'prepend') {
      var startIdx = elem.innerHTML.indexOf('<loc-i18n>');
      var endIdx = elem.innerHTML.indexOf('</loc-i18n>') + 11;

      if (startIdx > -1 && endIdx > 6) {
        elem.innerHTML = [elem.innerHTML.substring(0, startIdx), elem.innerHTML.slice(endIdx)].join('');
      }

      elem.innerHTML = ['<loc-i18n>', i18next.t(key, extendDefault(opts, elem.innerHTML)), '</loc-i18n>', elem.innerHTML].join('');
    } else if (attr === 'append') {
      var _startIdx = elem.innerHTML.indexOf('<loc-i18n>');

      var _endIdx = elem.innerHTML.indexOf('</loc-i18n>') + 11;

      if (_startIdx > -1 && _endIdx > 6) {
        elem.innerHTML = [elem.innerHTML.substring(0, _startIdx), elem.innerHTML.slice(_endIdx)].join('');
      }

      elem.innerHTML = [elem.innerHTML, '<loc-i18n>', i18next.t(key, extendDefault(opts, elem.innerHTML), '</loc-i18n>')].join('');
    } else if (attr.indexOf('data-') === 0) {
      var dataAttr = attr.substr('data-'.length);
      var translated = i18next.t(key, extendDefault(opts, elem.getAttribute(dataAttr))); // we change into the data cache

      elem.setAttribute(dataAttr, translated); // we change into the dom

      elem.setAttribute(attr, translated);
    } else {
      elem.setAttribute(attr, i18next.t(key, extendDefault(opts, elem.getAttribute(attr))));
    }
  }

  ;

  function relaxedJsonParse(badJSON) {
    return JSON.parse(badJSON.replace(/:\s*"([^"]*)"/g, function (match, p1) {
      return ': "' + p1.replace(/:/g, '@colon@') + '"';
    }).replace(/:\s*'([^']*)'/g, function (match, p1) {
      return ': "' + p1.replace(/:/g, '@colon@') + '"';
    }).replace(/(['"])?([a-z0-9A-Z_]+)(['"])?\s*:/g, '"$2": ').replace(/@colon@/g, ':'));
  }

  function _loc(elem, opts) {
    var key = elem.getAttribute(options.selectorAttr); //        if (!key && typeof key !== 'undefined' && key !== false)
    //            key = elem.textContent || elem.innerHTML;

    if (!key) return;
    var target = elem,
        targetSelector = elem.getAttribute(options.targetAttr);
    if (targetSelector != null) target = elem.querySelector(targetSelector) || elem;
    if (!opts && options.useOptionsAttr === true) opts = relaxedJsonParse(elem.getAttribute(options.optionsAttr) || '{}');
    opts = opts || {};

    if (key.indexOf(';') >= 0) {
      var keys = key.split(';');

      for (var ix = 0, l_ix = keys.length; ix < l_ix; ix++) {
        if (keys[ix] != '') parse(target, keys[ix], opts);
      }
    } else {
      parse(target, key, opts);
    }

    if (options.useOptionsAttr === true) {
      var clone = {};
      clone = _objectSpread({
        clone: clone
      }, opts);
      delete clone.lng;
      elem.setAttribute(options.optionsAttr, JSON.stringify(clone));
    }
  }

  function handle(selector, opts) {
    var elems;

    if (typeof selector === 'string') {
      elems = options.document.querySelectorAll(selector);
    } else if (typeof (selector === null || selector === void 0 ? void 0 : selector[Symbol.iterator]) !== 'function') {
      // not iterable -> wrap in iterable
      elems = [selector];
    } else {
      // is iterable
      elems = selector;
    }

    var _iterator = _createForOfIteratorHelper(elems),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var elem = _step.value;
        var childs = elem.querySelectorAll('[' + options.selectorAttr + ']');

        for (var j = childs.length - 1; j > -1; j--) {
          _loc(childs[j], opts);
        }

        _loc(elem, opts);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  ;
  return handle;
}

var locI18next = {
  init: locI18nextInit
};

},{"../util/yaml-loader":32,"core-js/modules/es.array.concat":160,"core-js/modules/es.array.filter":162,"core-js/modules/es.array.flat":165,"core-js/modules/es.array.for-each":166,"core-js/modules/es.array.from":167,"core-js/modules/es.array.index-of":169,"core-js/modules/es.array.is-array":170,"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.join":172,"core-js/modules/es.array.map":174,"core-js/modules/es.array.slice":177,"core-js/modules/es.array.unscopables.flat":179,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.bind":181,"core-js/modules/es.function.name":182,"core-js/modules/es.object.define-properties":188,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.entries":190,"core-js/modules/es.object.from-entries":192,"core-js/modules/es.object.get-own-property-descriptor":193,"core-js/modules/es.object.get-own-property-descriptors":194,"core-js/modules/es.object.keys":198,"core-js/modules/es.object.to-string":200,"core-js/modules/es.object.values":201,"core-js/modules/es.regexp.exec":205,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.code-point-at":207,"core-js/modules/es.string.iterator":209,"core-js/modules/es.string.replace":210,"core-js/modules/es.string.split":212,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.for-each":217,"core-js/modules/web.dom-collections.iterator":218,"i18next":"i18next","i18next-browser-languagedetector":"i18next-browser-languagedetector","i18next-http-backend":"i18next-http-backend","lodash":"lodash","regenerator-runtime/runtime":221}],28:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.includes");

require("core-js/modules/es.array.is-array");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.name");

require("core-js/modules/es.object.entries");

require("core-js/modules/es.object.from-entries");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.includes");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeAndStripBCP47Tag = normalizeAndStripBCP47Tag;

var bcp47 = _interopRequireWildcard(require("bcp-47"));

var langmap = _interopRequireWildcard(require("langmap"));

var _lodash = require("lodash");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function normalizeAndStripBCP47Tag(tag) {
  var error = null;
  var bcp47Options = {
    normalize: true,
    forgiving: true,
    warning: function warning(reason, code, offset) {
      return error = {
        reason: reason,
        code: code,
        offset: offset
      };
    }
  };
  var bcp47Schema = bcp47.parse(tag, bcp47Options);

  if (bcp47Schema.language === null) {
    throw new Error("Invalid BCP 47 language tag: ".concat(tag));
  } else {
    var bcp47Tag = bcp47.stringify(bcp47Schema);

    if (error !== null) {
      console.warn("Invalid BCP 47 language tag: ".concat(tag, ". Using partial tag ").concat(bcp47Tag, " instead."));
    }

    var supportedSchemaProperties = ['language', 'region'];

    var _splitBCP47Schema = splitBCP47Schema(bcp47Schema, supportedSchemaProperties),
        supported = _splitBCP47Schema.supported,
        unsupported = _splitBCP47Schema.unsupported;

    if (!(0, _lodash.isEqual)(unsupported, {})) {
      console.warn("Unsupported BCP 47 schema properties found in ".concat(bcp47Tag, ". Ignoring ").concat(JSON.stringify(unsupported), ". Keeping only ").concat(JSON.stringify(supported), "."));
    }

    var strippedBCP47Tag = bcp47.stringify(supported);

    if (typeof langmap[strippedBCP47Tag] === 'undefined') {
      throw new Error("Unsupported BCP 47 language tag ".concat(strippedBCP47Tag));
    }

    return strippedBCP47Tag;
  }
}

var emptySchema = bcp47.parse('');

function splitBCP47Schema(schema, supportedProperties) {
  var entries = Object.entries(schema);

  var isValueEmpty = function isValueEmpty(key, value) {
    return (0, _lodash.isEqual)(emptySchema[key], value);
  };

  var isKeySupported = function isKeySupported(key) {
    return supportedProperties.includes(key);
  };

  var filterSupported = function filterSupported(_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    return isKeySupported(key) && !isValueEmpty(key, value);
  };

  var filterUnsupported = function filterUnsupported(_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        key = _ref4[0],
        value = _ref4[1];

    return !isKeySupported(key) && !isValueEmpty(key, value);
  };

  var supportedEntries = entries.filter(filterSupported);
  var unsupportedEntries = entries.filter(filterUnsupported);
  return {
    supported: Object.fromEntries(supportedEntries),
    unsupported: Object.fromEntries(unsupportedEntries)
  };
}

},{"bcp-47":"bcp-47","core-js/modules/es.array.concat":160,"core-js/modules/es.array.filter":162,"core-js/modules/es.array.from":167,"core-js/modules/es.array.includes":168,"core-js/modules/es.array.is-array":170,"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.slice":177,"core-js/modules/es.date.to-string":180,"core-js/modules/es.function.name":182,"core-js/modules/es.object.entries":190,"core-js/modules/es.object.from-entries":192,"core-js/modules/es.object.to-string":200,"core-js/modules/es.regexp.to-string":206,"core-js/modules/es.string.includes":208,"core-js/modules/es.string.iterator":209,"core-js/modules/es.symbol":216,"core-js/modules/es.symbol.description":214,"core-js/modules/es.symbol.iterator":215,"core-js/modules/web.dom-collections.iterator":218,"langmap":"langmap","lodash":"lodash"}],29:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.function.bind");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.from-entries");

require("core-js/modules/es.object.get-own-property-names");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MathExpression = exports["default"] = MathExpression;

var ExpressionEval = _interopRequireWildcard(require("expression-eval"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _MathExpression = /*#__PURE__*/function () {
  function _MathExpression(expr) {
    _classCallCheck(this, _MathExpression);

    this.ast = ExpressionEval.parse(expr);
  }

  _createClass(_MathExpression, [{
    key: "eval",
    value: function _eval(variables) {
      // A proxy for querying variables from several scopes in order.
      var proxy = new Proxy(variables, {
        has: function has(obj, prop) {
          return prop in _MathExpression.DEFAULT_SCOPE || prop in obj;
        },
        get: function get(obj, prop) {
          if (prop === 'get') {
            // For querying variables that are shadowed by stuff in the DEFAULT_SCOPE
            return function (v) {
              return obj[v];
            };
          } else if (prop in _MathExpression.DEFAULT_SCOPE) {
            return _MathExpression.DEFAULT_SCOPE[prop];
          } else {
            return obj[prop];
          }
        }
      });
      return ExpressionEval.eval(this.ast, proxy);
    }
  }]);

  return _MathExpression;
}();

_MathExpression.DEFAULT_SCOPE = Object.fromEntries(Object.getOwnPropertyNames(Math).map(function (n) {
  return [n, Math[n]];
}));

function MathExpression(expr) {
  var mathExpr = new _MathExpression(expr);
  return mathExpr.eval.bind(mathExpr);
}

},{"core-js/modules/es.array.iterator":171,"core-js/modules/es.array.map":174,"core-js/modules/es.function.bind":181,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.from-entries":192,"core-js/modules/es.object.get-own-property-names":195,"expression-eval":"expression-eval"}],30:[function(require,module,exports){
"use strict";

require("core-js/modules/es.array.concat");

require("core-js/modules/es.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SVGPathBuilder = exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SVGPathBuilder = /*#__PURE__*/function () {
  function SVGPathBuilder() {
    _classCallCheck(this, SVGPathBuilder);

    this.path = "";
  }

  _createClass(SVGPathBuilder, [{
    key: "M",
    value: function M(p) {
      this.path += "M ".concat(p.x, " ").concat(p.y, "\n");
      return this;
    }
  }, {
    key: "m",
    value: function m(v) {
      this.path += "m ".concat(v.x, " ").concat(v.y, "\n");
      return this;
    }
  }, {
    key: "L",
    value: function L(p) {
      this.path += "L ".concat(p.x, " ").concat(p.y, "\n");
      return this;
    }
  }, {
    key: "l",
    value: function l(v) {
      this.path += "l ".concat(v.x, " ").concat(v.y, "\n");
      return this;
    }
  }, {
    key: "H",
    value: function H(px) {
      this.path += "H ".concat(px, "\n");
      return this;
    }
  }, {
    key: "h",
    value: function h(vx) {
      this.path += "h ".concat(vx, "\n");
      return this;
    }
  }, {
    key: "V",
    value: function V(py) {
      this.path += "V ".concat(py, "\n");
      return this;
    }
  }, {
    key: "v",
    value: function v(vy) {
      this.path += "v ".concat(vy, "\n");
      return this;
    }
  }, {
    key: "C",
    value: function C(cp1, cp2, p) {
      this.path += "C ".concat(cp1.x, " ").concat(cp1.y, " ").concat(cp2.x, " ").concat(cp2.y, " ").concat(p.x, " ").concat(p.y, "\n");
      return this;
    }
  }, {
    key: "c",
    value: function c(cv1, cv2, v) {
      this.path += "c ".concat(cv1.x, " ").concat(cv1.y, " ").concat(cv2.x, " ").concat(cv2.y, " ").concat(v.x, " ").concat(v.y, "\n");
      return this;
    }
  }, {
    key: "S",
    value: function S(cp2, p) {
      this.path += "S ".concat(cp2.x, " ").concat(cp2.y, " ").concat(p.x, " ").concat(p.y, "\n");
      return this;
    }
  }, {
    key: "s",
    value: function s(cv2, v) {
      this.path += "s ".concat(cv2.x, " ").concat(cv2.y, " ").concat(v.x, " ").concat(v.y, "\n");
      return this;
    }
  }, {
    key: "Q",
    value: function Q(cp1, p) {
      this.path += "Q ".concat(cp1.x, " ").concat(cp1.y, " ").concat(p.x, " ").concat(p.y, "\n");
      return this;
    }
  }, {
    key: "q",
    value: function q(cv1, v) {
      this.path += "q ".concat(cv1.x, " ").concat(cv1.y, " ").concat(v.x, " ").concat(v.y, "\n");
      return this;
    }
  }, {
    key: "T",
    value: function T(p) {
      this.path += "T ".concat(p.x, " ").concat(p.y, "\n");
      return this;
    }
  }, {
    key: "t",
    value: function t(v) {
      this.path += "t ".concat(v.x, " ").concat(v.y, "\n");
      return this;
    }
  }, {
    key: "A",
    value: function A(r, angle, largeArcFlag, sweepFlag, p) {
      this.path += "A ".concat(r.x, " ").concat(r.y, " ").concat(angle, " ").concat(largeArcFlag, " ").concat(sweepFlag, " ").concat(p.x, " ").concat(p.y, "\n");
      return this;
    }
  }, {
    key: "a",
    value: function a(r, angle, largeArcFlag, sweepFlag, v) {
      this.path += "a ".concat(r.x, " ").concat(r.y, " ").concat(angle, " ").concat(largeArcFlag, " ").concat(sweepFlag, " ").concat(v.x, " ").concat(v.y, "\n");
      return this;
    }
  }, {
    key: "Z",
    value: function Z() {
      this.path += 'Z\n';
      return this;
    }
  }, {
    key: "z",
    value: function z() {
      this.path += 'z\n';
      return this;
    }
  }, {
    key: "MC",
    value: function MC(p1, cp1, cp2, p2) {
      return this.M(p1).C(cp1, cp2, p2);
    }
  }, {
    key: "LC",
    value: function LC(p1, cp1, cp2, p2) {
      return this.L(p1).C(cp1, cp2, p2);
    }
  }, {
    key: "MQ",
    value: function MQ(p1, cp1, p2) {
      return this.M(p1).Q(cp1, p2);
    }
  }, {
    key: "LQ",
    value: function LQ(p1, cp1, p2) {
      return this.L(p1).Q(cp1, p2);
    }
  }, {
    key: "build",
    value: function build() {
      return this.path;
    }
  }]);

  return SVGPathBuilder;
}();

exports.SVGPathBuilder = exports["default"] = SVGPathBuilder;

},{"core-js/modules/es.array.concat":160,"core-js/modules/es.object.define-property":189}],31:[function(require,module,exports){
"use strict";

require("core-js/modules/es.array.fill");

require("core-js/modules/es.array.map");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transpose = exports["default"] = transpose;

function transpose(arr2d) {
  if (arr2d.length === 0) {
    return [];
  } else {
    var result = new Array(arr2d[0].length).fill(null).map(function (_) {
      return [];
    });

    for (var i = 0; i < arr2d.length; ++i) {
      for (var j = 0; j < arr2d[i].length; ++j) {
        result[j][i] = arr2d[i][j];
      }
    }

    return result;
  }
}

},{"core-js/modules/es.array.fill":161,"core-js/modules/es.array.map":174}],32:[function(require,module,exports){
"use strict";

require("core-js/modules/es.array.concat");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.YAMLLoader = exports["default"] = void 0;

require("regenerator-runtime/runtime");

var _fetchWithCache = _interopRequireDefault(require("./fetch-with-cache"));

var _jsYaml = _interopRequireDefault(require("js-yaml"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var YAMLLoader = /*#__PURE__*/function () {
  function YAMLLoader() {
    _classCallCheck(this, YAMLLoader);
  }

  _createClass(YAMLLoader, null, [{
    key: "fromUrl",
    value: function () {
      var _fromUrl = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
        var cache,
            response,
            levelSrc,
            msg,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                cache = _args.length > 1 && _args[1] !== undefined ? _args[1] : true;
                _context.next = 3;
                return cache ? (0, _fetchWithCache["default"])(url.href) : fetch(url.href);

              case 3:
                response = _context.sent;
                _context.next = 6;
                return response.text();

              case 6:
                levelSrc = _context.sent;

                if (response.ok) {
                  _context.next = 12;
                  break;
                }

                msg = "Unable to fetch ".concat(url.href, ". Error ").concat(response.status, ": ").concat(response.statusText);
                throw new Error(msg);

              case 12:
                return _context.abrupt("return", YAMLLoader.fromString(levelSrc));

              case 13:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function fromUrl(_x) {
        return _fromUrl.apply(this, arguments);
      }

      return fromUrl;
    }()
  }, {
    key: "fromString",
    value: function fromString(s) {
      return _jsYaml["default"].safeLoad(s);
    }
  }]);

  return YAMLLoader;
}();

exports.YAMLLoader = exports["default"] = YAMLLoader;

},{"./fetch-with-cache":25,"core-js/modules/es.array.concat":160,"core-js/modules/es.object.define-property":189,"core-js/modules/es.object.to-string":200,"core-js/modules/es.promise":203,"js-yaml":"js-yaml","regenerator-runtime/runtime":221}],33:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') {
    throw TypeError(String(it) + ' is not a function');
  } return it;
};

},{}],34:[function(require,module,exports){
var isObject = require('../internals/is-object');

module.exports = function (it) {
  if (!isObject(it) && it !== null) {
    throw TypeError("Can't set " + String(it) + ' as a prototype');
  } return it;
};

},{"../internals/is-object":96}],35:[function(require,module,exports){
var wellKnownSymbol = require('../internals/well-known-symbol');
var create = require('../internals/object-create');
var definePropertyModule = require('../internals/object-define-property');

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] == undefined) {
  definePropertyModule.f(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: create(null)
  });
}

// add a key to Array.prototype[@@unscopables]
module.exports = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};

},{"../internals/object-create":110,"../internals/object-define-property":112,"../internals/well-known-symbol":158}],36:[function(require,module,exports){
'use strict';
var charAt = require('../internals/string-multibyte').charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
module.exports = function (S, index, unicode) {
  return index + (unicode ? charAt(S, index).length : 1);
};

},{"../internals/string-multibyte":143}],37:[function(require,module,exports){
module.exports = function (it, Constructor, name) {
  if (!(it instanceof Constructor)) {
    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
  } return it;
};

},{}],38:[function(require,module,exports){
var isObject = require('../internals/is-object');

module.exports = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};

},{"../internals/is-object":96}],39:[function(require,module,exports){
'use strict';
var toObject = require('../internals/to-object');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var toLength = require('../internals/to-length');

// `Array.prototype.fill` method implementation
// https://tc39.github.io/ecma262/#sec-array.prototype.fill
module.exports = function fill(value /* , start = 0, end = @length */) {
  var O = toObject(this);
  var length = toLength(O.length);
  var argumentsLength = arguments.length;
  var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined, length);
  var end = argumentsLength > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};

},{"../internals/to-absolute-index":148,"../internals/to-length":151,"../internals/to-object":152}],40:[function(require,module,exports){
'use strict';
var $forEach = require('../internals/array-iteration').forEach;
var arrayMethodIsStrict = require('../internals/array-method-is-strict');
var arrayMethodUsesToLength = require('../internals/array-method-uses-to-length');

var STRICT_METHOD = arrayMethodIsStrict('forEach');
var USES_TO_LENGTH = arrayMethodUsesToLength('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
module.exports = (!STRICT_METHOD || !USES_TO_LENGTH) ? function forEach(callbackfn /* , thisArg */) {
  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
} : [].forEach;

},{"../internals/array-iteration":43,"../internals/array-method-is-strict":46,"../internals/array-method-uses-to-length":47}],41:[function(require,module,exports){
'use strict';
var bind = require('../internals/function-bind-context');
var toObject = require('../internals/to-object');
var callWithSafeIterationClosing = require('../internals/call-with-safe-iteration-closing');
var isArrayIteratorMethod = require('../internals/is-array-iterator-method');
var toLength = require('../internals/to-length');
var createProperty = require('../internals/create-property');
var getIteratorMethod = require('../internals/get-iterator-method');

// `Array.from` method implementation
// https://tc39.github.io/ecma262/#sec-array.from
module.exports = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject(arrayLike);
  var C = typeof this == 'function' ? this : Array;
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iteratorMethod = getIteratorMethod(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  if (mapping) mapfn = bind(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
    iterator = iteratorMethod.call(O);
    next = iterator.next;
    result = new C();
    for (;!(step = next.call(iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty(result, index, value);
    }
  } else {
    length = toLength(O.length);
    result = new C(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty(result, index, value);
    }
  }
  result.length = index;
  return result;
};

},{"../internals/call-with-safe-iteration-closing":50,"../internals/create-property":62,"../internals/function-bind-context":77,"../internals/get-iterator-method":80,"../internals/is-array-iterator-method":93,"../internals/to-length":151,"../internals/to-object":152}],42:[function(require,module,exports){
var toIndexedObject = require('../internals/to-indexed-object');
var toLength = require('../internals/to-length');
var toAbsoluteIndex = require('../internals/to-absolute-index');

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};

},{"../internals/to-absolute-index":148,"../internals/to-indexed-object":149,"../internals/to-length":151}],43:[function(require,module,exports){
var bind = require('../internals/function-bind-context');
var IndexedObject = require('../internals/indexed-object');
var toObject = require('../internals/to-object');
var toLength = require('../internals/to-length');
var arraySpeciesCreate = require('../internals/array-species-create');

var push = [].push;

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
var createMethod = function (TYPE) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject($this);
    var self = IndexedObject(O);
    var boundFunction = bind(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate;
    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push.call(target, value); // filter
        } else if (IS_EVERY) return false;  // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

module.exports = {
  // `Array.prototype.forEach` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
  forEach: createMethod(0),
  // `Array.prototype.map` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.map
  map: createMethod(1),
  // `Array.prototype.filter` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
  filter: createMethod(2),
  // `Array.prototype.some` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.some
  some: createMethod(3),
  // `Array.prototype.every` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.every
  every: createMethod(4),
  // `Array.prototype.find` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.find
  find: createMethod(5),
  // `Array.prototype.findIndex` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod(6)
};

},{"../internals/array-species-create":49,"../internals/function-bind-context":77,"../internals/indexed-object":88,"../internals/to-length":151,"../internals/to-object":152}],44:[function(require,module,exports){
'use strict';
var toIndexedObject = require('../internals/to-indexed-object');
var toInteger = require('../internals/to-integer');
var toLength = require('../internals/to-length');
var arrayMethodIsStrict = require('../internals/array-method-is-strict');
var arrayMethodUsesToLength = require('../internals/array-method-uses-to-length');

var min = Math.min;
var nativeLastIndexOf = [].lastIndexOf;
var NEGATIVE_ZERO = !!nativeLastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
var STRICT_METHOD = arrayMethodIsStrict('lastIndexOf');
// For preventing possible almost infinite loop in non-standard implementations, test the forward version of the method
var USES_TO_LENGTH = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });
var FORCED = NEGATIVE_ZERO || !STRICT_METHOD || !USES_TO_LENGTH;

// `Array.prototype.lastIndexOf` method implementation
// https://tc39.github.io/ecma262/#sec-array.prototype.lastindexof
module.exports = FORCED ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
  // convert -0 to +0
  if (NEGATIVE_ZERO) return nativeLastIndexOf.apply(this, arguments) || 0;
  var O = toIndexedObject(this);
  var length = toLength(O.length);
  var index = length - 1;
  if (arguments.length > 1) index = min(index, toInteger(arguments[1]));
  if (index < 0) index = length + index;
  for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
  return -1;
} : nativeLastIndexOf;

},{"../internals/array-method-is-strict":46,"../internals/array-method-uses-to-length":47,"../internals/to-indexed-object":149,"../internals/to-integer":150,"../internals/to-length":151}],45:[function(require,module,exports){
var fails = require('../internals/fails');
var wellKnownSymbol = require('../internals/well-known-symbol');
var V8_VERSION = require('../internals/engine-v8-version');

var SPECIES = wellKnownSymbol('species');

module.exports = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return V8_VERSION >= 51 || !fails(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

},{"../internals/engine-v8-version":70,"../internals/fails":73,"../internals/well-known-symbol":158}],46:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');

module.exports = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call,no-throw-literal
    method.call(null, argument || function () { throw 1; }, 1);
  });
};

},{"../internals/fails":73}],47:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');
var has = require('../internals/has');

var defineProperty = Object.defineProperty;
var cache = {};

var thrower = function (it) { throw it; };

module.exports = function (METHOD_NAME, options) {
  if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
  if (!options) options = {};
  var method = [][METHOD_NAME];
  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
  var argument0 = has(options, 0) ? options[0] : thrower;
  var argument1 = has(options, 1) ? options[1] : undefined;

  return cache[METHOD_NAME] = !!method && !fails(function () {
    if (ACCESSORS && !DESCRIPTORS) return true;
    var O = { length: -1 };

    if (ACCESSORS) defineProperty(O, 1, { enumerable: true, get: thrower });
    else O[1] = 1;

    method.call(O, argument0, argument1);
  });
};

},{"../internals/descriptors":65,"../internals/fails":73,"../internals/has":83}],48:[function(require,module,exports){
var aFunction = require('../internals/a-function');
var toObject = require('../internals/to-object');
var IndexedObject = require('../internals/indexed-object');
var toLength = require('../internals/to-length');

// `Array.prototype.{ reduce, reduceRight }` methods implementation
var createMethod = function (IS_RIGHT) {
  return function (that, callbackfn, argumentsLength, memo) {
    aFunction(callbackfn);
    var O = toObject(that);
    var self = IndexedObject(O);
    var length = toLength(O.length);
    var index = IS_RIGHT ? length - 1 : 0;
    var i = IS_RIGHT ? -1 : 1;
    if (argumentsLength < 2) while (true) {
      if (index in self) {
        memo = self[index];
        index += i;
        break;
      }
      index += i;
      if (IS_RIGHT ? index < 0 : length <= index) {
        throw TypeError('Reduce of empty array with no initial value');
      }
    }
    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
      memo = callbackfn(memo, self[index], index, O);
    }
    return memo;
  };
};

module.exports = {
  // `Array.prototype.reduce` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
  left: createMethod(false),
  // `Array.prototype.reduceRight` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
  right: createMethod(true)
};

},{"../internals/a-function":33,"../internals/indexed-object":88,"../internals/to-length":151,"../internals/to-object":152}],49:[function(require,module,exports){
var isObject = require('../internals/is-object');
var isArray = require('../internals/is-array');
var wellKnownSymbol = require('../internals/well-known-symbol');

var SPECIES = wellKnownSymbol('species');

// `ArraySpeciesCreate` abstract operation
// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
module.exports = function (originalArray, length) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    else if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
};

},{"../internals/is-array":94,"../internals/is-object":96,"../internals/well-known-symbol":158}],50:[function(require,module,exports){
var anObject = require('../internals/an-object');

// call something on iterator step with safe closing on error
module.exports = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (error) {
    var returnMethod = iterator['return'];
    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
    throw error;
  }
};

},{"../internals/an-object":38}],51:[function(require,module,exports){
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };
  iteratorWithReturn[ITERATOR] = function () {
    return this;
  };
  // eslint-disable-next-line no-throw-literal
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

module.exports = function (exec, SKIP_CLOSING) {
  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    exec(object);
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};

},{"../internals/well-known-symbol":158}],52:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],53:[function(require,module,exports){
var TO_STRING_TAG_SUPPORT = require('../internals/to-string-tag-support');
var classofRaw = require('../internals/classof-raw');
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
module.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
};

},{"../internals/classof-raw":52,"../internals/to-string-tag-support":154,"../internals/well-known-symbol":158}],54:[function(require,module,exports){
'use strict';
var defineProperty = require('../internals/object-define-property').f;
var create = require('../internals/object-create');
var redefineAll = require('../internals/redefine-all');
var bind = require('../internals/function-bind-context');
var anInstance = require('../internals/an-instance');
var iterate = require('../internals/iterate');
var defineIterator = require('../internals/define-iterator');
var setSpecies = require('../internals/set-species');
var DESCRIPTORS = require('../internals/descriptors');
var fastKey = require('../internals/internal-metadata').fastKey;
var InternalStateModule = require('../internals/internal-state');

var setInternalState = InternalStateModule.set;
var internalStateGetterFor = InternalStateModule.getterFor;

module.exports = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, CONSTRUCTOR_NAME);
      setInternalState(that, {
        type: CONSTRUCTOR_NAME,
        index: create(null),
        first: undefined,
        last: undefined,
        size: 0
      });
      if (!DESCRIPTORS) that.size = 0;
      if (iterable != undefined) iterate(iterable, that[ADDER], that, IS_MAP);
    });

    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

    var define = function (that, key, value) {
      var state = getInternalState(that);
      var entry = getEntry(that, key);
      var previous, index;
      // change existing entry
      if (entry) {
        entry.value = value;
      // create new entry
      } else {
        state.last = entry = {
          index: index = fastKey(key, true),
          key: key,
          value: value,
          previous: previous = state.last,
          next: undefined,
          removed: false
        };
        if (!state.first) state.first = entry;
        if (previous) previous.next = entry;
        if (DESCRIPTORS) state.size++;
        else that.size++;
        // add to index
        if (index !== 'F') state.index[index] = entry;
      } return that;
    };

    var getEntry = function (that, key) {
      var state = getInternalState(that);
      // fast case
      var index = fastKey(key);
      var entry;
      if (index !== 'F') return state.index[index];
      // frozen object case
      for (entry = state.first; entry; entry = entry.next) {
        if (entry.key == key) return entry;
      }
    };

    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        var that = this;
        var state = getInternalState(that);
        var data = state.index;
        var entry = state.first;
        while (entry) {
          entry.removed = true;
          if (entry.previous) entry.previous = entry.previous.next = undefined;
          delete data[entry.index];
          entry = entry.next;
        }
        state.first = state.last = undefined;
        if (DESCRIPTORS) state.size = 0;
        else that.size = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = this;
        var state = getInternalState(that);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.next;
          var prev = entry.previous;
          delete state.index[entry.index];
          entry.removed = true;
          if (prev) prev.next = next;
          if (next) next.previous = prev;
          if (state.first == entry) state.first = next;
          if (state.last == entry) state.last = prev;
          if (DESCRIPTORS) state.size--;
          else that.size--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        var state = getInternalState(this);
        var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.next : state.first) {
          boundFunction(entry.value, entry.key, this);
          // revert to the last existing entry
          while (entry && entry.removed) entry = entry.previous;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(this, key);
      }
    });

    redefineAll(C.prototype, IS_MAP ? {
      // 23.1.3.6 Map.prototype.get(key)
      get: function get(key) {
        var entry = getEntry(this, key);
        return entry && entry.value;
      },
      // 23.1.3.9 Map.prototype.set(key, value)
      set: function set(key, value) {
        return define(this, key === 0 ? 0 : key, value);
      }
    } : {
      // 23.2.3.1 Set.prototype.add(value)
      add: function add(value) {
        return define(this, value = value === 0 ? 0 : value, value);
      }
    });
    if (DESCRIPTORS) defineProperty(C.prototype, 'size', {
      get: function () {
        return getInternalState(this).size;
      }
    });
    return C;
  },
  setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    defineIterator(C, CONSTRUCTOR_NAME, function (iterated, kind) {
      setInternalState(this, {
        type: ITERATOR_NAME,
        target: iterated,
        state: getInternalCollectionState(iterated),
        kind: kind,
        last: undefined
      });
    }, function () {
      var state = getInternalIteratorState(this);
      var kind = state.kind;
      var entry = state.last;
      // revert to the last existing entry
      while (entry && entry.removed) entry = entry.previous;
      // get next entry
      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
        // or finish the iteration
        state.target = undefined;
        return { value: undefined, done: true };
      }
      // return step by kind
      if (kind == 'keys') return { value: entry.key, done: false };
      if (kind == 'values') return { value: entry.value, done: false };
      return { value: [entry.key, entry.value], done: false };
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(CONSTRUCTOR_NAME);
  }
};

},{"../internals/an-instance":37,"../internals/define-iterator":63,"../internals/descriptors":65,"../internals/function-bind-context":77,"../internals/internal-metadata":91,"../internals/internal-state":92,"../internals/iterate":99,"../internals/object-create":110,"../internals/object-define-property":112,"../internals/redefine-all":128,"../internals/set-species":137}],55:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var global = require('../internals/global');
var isForced = require('../internals/is-forced');
var redefine = require('../internals/redefine');
var InternalMetadataModule = require('../internals/internal-metadata');
var iterate = require('../internals/iterate');
var anInstance = require('../internals/an-instance');
var isObject = require('../internals/is-object');
var fails = require('../internals/fails');
var checkCorrectnessOfIteration = require('../internals/check-correctness-of-iteration');
var setToStringTag = require('../internals/set-to-string-tag');
var inheritIfRequired = require('../internals/inherit-if-required');

module.exports = function (CONSTRUCTOR_NAME, wrapper, common) {
  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
  var ADDER = IS_MAP ? 'set' : 'add';
  var NativeConstructor = global[CONSTRUCTOR_NAME];
  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
  var Constructor = NativeConstructor;
  var exported = {};

  var fixMethod = function (KEY) {
    var nativeMethod = NativePrototype[KEY];
    redefine(NativePrototype, KEY,
      KEY == 'add' ? function add(value) {
        nativeMethod.call(this, value === 0 ? 0 : value);
        return this;
      } : KEY == 'delete' ? function (key) {
        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
      } : KEY == 'get' ? function get(key) {
        return IS_WEAK && !isObject(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
      } : KEY == 'has' ? function has(key) {
        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
      } : function set(key, value) {
        nativeMethod.call(this, key === 0 ? 0 : key, value);
        return this;
      }
    );
  };

  // eslint-disable-next-line max-len
  if (isForced(CONSTRUCTOR_NAME, typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
    new NativeConstructor().entries().next();
  })))) {
    // create collection constructor
    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
    InternalMetadataModule.REQUIRED = true;
  } else if (isForced(CONSTRUCTOR_NAME, true)) {
    var instance = new Constructor();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    // eslint-disable-next-line no-new
    var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) { new NativeConstructor(iterable); });
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new NativeConstructor();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });

    if (!ACCEPT_ITERABLES) {
      Constructor = wrapper(function (dummy, iterable) {
        anInstance(dummy, Constructor, CONSTRUCTOR_NAME);
        var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
        if (iterable != undefined) iterate(iterable, that[ADDER], that, IS_MAP);
        return that;
      });
      Constructor.prototype = NativePrototype;
      NativePrototype.constructor = Constructor;
    }

    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }

    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

    // weak collections should not contains .clear method
    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
  }

  exported[CONSTRUCTOR_NAME] = Constructor;
  $({ global: true, forced: Constructor != NativeConstructor }, exported);

  setToStringTag(Constructor, CONSTRUCTOR_NAME);

  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

  return Constructor;
};

},{"../internals/an-instance":37,"../internals/check-correctness-of-iteration":51,"../internals/export":72,"../internals/fails":73,"../internals/global":82,"../internals/inherit-if-required":89,"../internals/internal-metadata":91,"../internals/is-forced":95,"../internals/is-object":96,"../internals/iterate":99,"../internals/redefine":129,"../internals/set-to-string-tag":138}],56:[function(require,module,exports){
var has = require('../internals/has');
var ownKeys = require('../internals/own-keys');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var definePropertyModule = require('../internals/object-define-property');

module.exports = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};

},{"../internals/has":83,"../internals/object-define-property":112,"../internals/object-get-own-property-descriptor":113,"../internals/own-keys":124}],57:[function(require,module,exports){
var wellKnownSymbol = require('../internals/well-known-symbol');

var MATCH = wellKnownSymbol('match');

module.exports = function (METHOD_NAME) {
  var regexp = /./;
  try {
    '/./'[METHOD_NAME](regexp);
  } catch (e) {
    try {
      regexp[MATCH] = false;
      return '/./'[METHOD_NAME](regexp);
    } catch (f) { /* empty */ }
  } return false;
};

},{"../internals/well-known-symbol":158}],58:[function(require,module,exports){
var fails = require('../internals/fails');

module.exports = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

},{"../internals/fails":73}],59:[function(require,module,exports){
'use strict';
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;
var create = require('../internals/object-create');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var setToStringTag = require('../internals/set-to-string-tag');
var Iterators = require('../internals/iterators');

var returnThis = function () { return this; };

module.exports = function (IteratorConstructor, NAME, next) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(1, next) });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
  Iterators[TO_STRING_TAG] = returnThis;
  return IteratorConstructor;
};

},{"../internals/create-property-descriptor":61,"../internals/iterators":101,"../internals/iterators-core":100,"../internals/object-create":110,"../internals/set-to-string-tag":138}],60:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var definePropertyModule = require('../internals/object-define-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"../internals/create-property-descriptor":61,"../internals/descriptors":65,"../internals/object-define-property":112}],61:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],62:[function(require,module,exports){
'use strict';
var toPrimitive = require('../internals/to-primitive');
var definePropertyModule = require('../internals/object-define-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');

module.exports = function (object, key, value) {
  var propertyKey = toPrimitive(key);
  if (propertyKey in object) definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));
  else object[propertyKey] = value;
};

},{"../internals/create-property-descriptor":61,"../internals/object-define-property":112,"../internals/to-primitive":153}],63:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var createIteratorConstructor = require('../internals/create-iterator-constructor');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var setToStringTag = require('../internals/set-to-string-tag');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var redefine = require('../internals/redefine');
var wellKnownSymbol = require('../internals/well-known-symbol');
var IS_PURE = require('../internals/is-pure');
var Iterators = require('../internals/iterators');
var IteratorsCore = require('../internals/iterators-core');

var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

module.exports = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    } return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (setPrototypeOf) {
          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
        } else if (typeof CurrentIteratorPrototype[ITERATOR] != 'function') {
          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
      if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
    }
  }

  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    INCORRECT_VALUES_NAME = true;
    defaultIterator = function values() { return nativeIterator.call(this); };
  }

  // define iterator
  if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
    createNonEnumerableProperty(IterablePrototype, ITERATOR, defaultIterator);
  }
  Iterators[NAME] = defaultIterator;

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        redefine(IterablePrototype, KEY, methods[KEY]);
      }
    } else $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  return methods;
};

},{"../internals/create-iterator-constructor":59,"../internals/create-non-enumerable-property":60,"../internals/export":72,"../internals/is-pure":97,"../internals/iterators":101,"../internals/iterators-core":100,"../internals/object-get-prototype-of":117,"../internals/object-set-prototype-of":121,"../internals/redefine":129,"../internals/set-to-string-tag":138,"../internals/well-known-symbol":158}],64:[function(require,module,exports){
var path = require('../internals/path');
var has = require('../internals/has');
var wrappedWellKnownSymbolModule = require('../internals/well-known-symbol-wrapped');
var defineProperty = require('../internals/object-define-property').f;

module.exports = function (NAME) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (!has(Symbol, NAME)) defineProperty(Symbol, NAME, {
    value: wrappedWellKnownSymbolModule.f(NAME)
  });
};

},{"../internals/has":83,"../internals/object-define-property":112,"../internals/path":125,"../internals/well-known-symbol-wrapped":157}],65:[function(require,module,exports){
var fails = require('../internals/fails');

// Thank's IE8 for his funny defineProperty
module.exports = !fails(function () {
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});

},{"../internals/fails":73}],66:[function(require,module,exports){
var global = require('../internals/global');
var isObject = require('../internals/is-object');

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};

},{"../internals/global":82,"../internals/is-object":96}],67:[function(require,module,exports){
// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
module.exports = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};

},{}],68:[function(require,module,exports){
var userAgent = require('../internals/engine-user-agent');

module.exports = /(iphone|ipod|ipad).*applewebkit/i.test(userAgent);

},{"../internals/engine-user-agent":69}],69:[function(require,module,exports){
var getBuiltIn = require('../internals/get-built-in');

module.exports = getBuiltIn('navigator', 'userAgent') || '';

},{"../internals/get-built-in":79}],70:[function(require,module,exports){
var global = require('../internals/global');
var userAgent = require('../internals/engine-user-agent');

var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  version = match[0] + match[1];
} else if (userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = match[1];
  }
}

module.exports = version && +version;

},{"../internals/engine-user-agent":69,"../internals/global":82}],71:[function(require,module,exports){
// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

},{}],72:[function(require,module,exports){
var global = require('../internals/global');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var redefine = require('../internals/redefine');
var setGlobal = require('../internals/set-global');
var copyConstructorProperties = require('../internals/copy-constructor-properties');
var isForced = require('../internals/is-forced');

/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options);
  }
};

},{"../internals/copy-constructor-properties":56,"../internals/create-non-enumerable-property":60,"../internals/global":82,"../internals/is-forced":95,"../internals/object-get-own-property-descriptor":113,"../internals/redefine":129,"../internals/set-global":136}],73:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

},{}],74:[function(require,module,exports){
'use strict';
// TODO: Remove from `core-js@4` since it's moved to entry points
require('../modules/es.regexp.exec');
var redefine = require('../internals/redefine');
var fails = require('../internals/fails');
var wellKnownSymbol = require('../internals/well-known-symbol');
var regexpExec = require('../internals/regexp-exec');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');

var SPECIES = wellKnownSymbol('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

// IE <= 11 replaces $0 with the whole match, as if it was $&
// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
var REPLACE_KEEPS_$0 = (function () {
  return 'a'.replace(/./, '$0') === '$0';
})();

var REPLACE = wellKnownSymbol('replace');
// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
  if (/./[REPLACE]) {
    return /./[REPLACE]('a', '$0') === '';
  }
  return false;
})();

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

module.exports = function (KEY, length, exec, sham) {
  var SYMBOL = wellKnownSymbol(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    if (KEY === 'split') {
      // We can't use real regex here since it causes deoptimization
      // and serious performance degradation in V8
      // https://github.com/zloirock/core-js/issues/306
      re = {};
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
      re.flags = '';
      re[SYMBOL] = /./[SYMBOL];
    }

    re.exec = function () { execCalled = true; return null; };

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    (KEY === 'replace' && !(
      REPLACE_SUPPORTS_NAMED_GROUPS &&
      REPLACE_KEEPS_$0 &&
      !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
    )) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      if (regexp.exec === regexpExec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
        }
        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
      }
      return { done: false };
    }, {
      REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
      REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
    });
    var stringMethod = methods[0];
    var regexMethod = methods[1];

    redefine(String.prototype, KEY, stringMethod);
    redefine(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return regexMethod.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return regexMethod.call(string, this); }
    );
  }

  if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
};

},{"../internals/create-non-enumerable-property":60,"../internals/fails":73,"../internals/redefine":129,"../internals/regexp-exec":131,"../internals/well-known-symbol":158,"../modules/es.regexp.exec":205}],75:[function(require,module,exports){
'use strict';
var isArray = require('../internals/is-array');
var toLength = require('../internals/to-length');
var bind = require('../internals/function-bind-context');

// `FlattenIntoArray` abstract operation
// https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray
var flattenIntoArray = function (target, original, source, sourceLen, start, depth, mapper, thisArg) {
  var targetIndex = start;
  var sourceIndex = 0;
  var mapFn = mapper ? bind(mapper, thisArg, 3) : false;
  var element;

  while (sourceIndex < sourceLen) {
    if (sourceIndex in source) {
      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];

      if (depth > 0 && isArray(element)) {
        targetIndex = flattenIntoArray(target, original, element, toLength(element.length), targetIndex, depth - 1) - 1;
      } else {
        if (targetIndex >= 0x1FFFFFFFFFFFFF) throw TypeError('Exceed the acceptable array length');
        target[targetIndex] = element;
      }

      targetIndex++;
    }
    sourceIndex++;
  }
  return targetIndex;
};

module.exports = flattenIntoArray;

},{"../internals/function-bind-context":77,"../internals/is-array":94,"../internals/to-length":151}],76:[function(require,module,exports){
var fails = require('../internals/fails');

module.exports = !fails(function () {
  return Object.isExtensible(Object.preventExtensions({}));
});

},{"../internals/fails":73}],77:[function(require,module,exports){
var aFunction = require('../internals/a-function');

// optional / simple context binding
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 0: return function () {
      return fn.call(that);
    };
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"../internals/a-function":33}],78:[function(require,module,exports){
'use strict';
var aFunction = require('../internals/a-function');
var isObject = require('../internals/is-object');

var slice = [].slice;
var factories = {};

var construct = function (C, argsLength, args) {
  if (!(argsLength in factories)) {
    for (var list = [], i = 0; i < argsLength; i++) list[i] = 'a[' + i + ']';
    // eslint-disable-next-line no-new-func
    factories[argsLength] = Function('C,a', 'return new C(' + list.join(',') + ')');
  } return factories[argsLength](C, args);
};

// `Function.prototype.bind` method implementation
// https://tc39.github.io/ecma262/#sec-function.prototype.bind
module.exports = Function.bind || function bind(that /* , ...args */) {
  var fn = aFunction(this);
  var partArgs = slice.call(arguments, 1);
  var boundFunction = function bound(/* args... */) {
    var args = partArgs.concat(slice.call(arguments));
    return this instanceof boundFunction ? construct(fn, args.length, args) : fn.apply(that, args);
  };
  if (isObject(fn.prototype)) boundFunction.prototype = fn.prototype;
  return boundFunction;
};

},{"../internals/a-function":33,"../internals/is-object":96}],79:[function(require,module,exports){
var path = require('../internals/path');
var global = require('../internals/global');

var aFunction = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global[namespace])
    : path[namespace] && path[namespace][method] || global[namespace] && global[namespace][method];
};

},{"../internals/global":82,"../internals/path":125}],80:[function(require,module,exports){
var classof = require('../internals/classof');
var Iterators = require('../internals/iterators');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"../internals/classof":53,"../internals/iterators":101,"../internals/well-known-symbol":158}],81:[function(require,module,exports){
var anObject = require('../internals/an-object');
var getIteratorMethod = require('../internals/get-iterator-method');

module.exports = function (it) {
  var iteratorMethod = getIteratorMethod(it);
  if (typeof iteratorMethod != 'function') {
    throw TypeError(String(it) + ' is not iterable');
  } return anObject(iteratorMethod.call(it));
};

},{"../internals/an-object":38,"../internals/get-iterator-method":80}],82:[function(require,module,exports){
(function (global){
var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line no-undef
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  check(typeof self == 'object' && self) ||
  check(typeof global == 'object' && global) ||
  // eslint-disable-next-line no-new-func
  Function('return this')();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],83:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;

module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],84:[function(require,module,exports){
module.exports = {};

},{}],85:[function(require,module,exports){
var global = require('../internals/global');

module.exports = function (a, b) {
  var console = global.console;
  if (console && console.error) {
    arguments.length === 1 ? console.error(a) : console.error(a, b);
  }
};

},{"../internals/global":82}],86:[function(require,module,exports){
var getBuiltIn = require('../internals/get-built-in');

module.exports = getBuiltIn('document', 'documentElement');

},{"../internals/get-built-in":79}],87:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');
var createElement = require('../internals/document-create-element');

// Thank's IE8 for his funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});

},{"../internals/descriptors":65,"../internals/document-create-element":66,"../internals/fails":73}],88:[function(require,module,exports){
var fails = require('../internals/fails');
var classof = require('../internals/classof-raw');

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;

},{"../internals/classof-raw":52,"../internals/fails":73}],89:[function(require,module,exports){
var isObject = require('../internals/is-object');
var setPrototypeOf = require('../internals/object-set-prototype-of');

// makes subclassing work correct for wrapped built-ins
module.exports = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    setPrototypeOf &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    typeof (NewTarget = dummy.constructor) == 'function' &&
    NewTarget !== Wrapper &&
    isObject(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) setPrototypeOf($this, NewTargetPrototype);
  return $this;
};

},{"../internals/is-object":96,"../internals/object-set-prototype-of":121}],90:[function(require,module,exports){
var store = require('../internals/shared-store');

var functionToString = Function.toString;

// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
if (typeof store.inspectSource != 'function') {
  store.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

module.exports = store.inspectSource;

},{"../internals/shared-store":140}],91:[function(require,module,exports){
var hiddenKeys = require('../internals/hidden-keys');
var isObject = require('../internals/is-object');
var has = require('../internals/has');
var defineProperty = require('../internals/object-define-property').f;
var uid = require('../internals/uid');
var FREEZING = require('../internals/freezing');

var METADATA = uid('meta');
var id = 0;

var isExtensible = Object.isExtensible || function () {
  return true;
};

var setMetadata = function (it) {
  defineProperty(it, METADATA, { value: {
    objectID: 'O' + ++id, // object ID
    weakData: {}          // weak collections IDs
  } });
};

var fastKey = function (it, create) {
  // return a primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, METADATA)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMetadata(it);
  // return object ID
  } return it[METADATA].objectID;
};

var getWeakData = function (it, create) {
  if (!has(it, METADATA)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMetadata(it);
  // return the store of weak collections IDs
  } return it[METADATA].weakData;
};

// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZING && meta.REQUIRED && isExtensible(it) && !has(it, METADATA)) setMetadata(it);
  return it;
};

var meta = module.exports = {
  REQUIRED: false,
  fastKey: fastKey,
  getWeakData: getWeakData,
  onFreeze: onFreeze
};

hiddenKeys[METADATA] = true;

},{"../internals/freezing":76,"../internals/has":83,"../internals/hidden-keys":84,"../internals/is-object":96,"../internals/object-define-property":112,"../internals/uid":155}],92:[function(require,module,exports){
var NATIVE_WEAK_MAP = require('../internals/native-weak-map');
var global = require('../internals/global');
var isObject = require('../internals/is-object');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var objectHas = require('../internals/has');
var sharedKey = require('../internals/shared-key');
var hiddenKeys = require('../internals/hidden-keys');

var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP) {
  var store = new WeakMap();
  var wmget = store.get;
  var wmhas = store.has;
  var wmset = store.set;
  set = function (it, metadata) {
    wmset.call(store, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store, it) || {};
  };
  has = function (it) {
    return wmhas.call(store, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return objectHas(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return objectHas(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};

},{"../internals/create-non-enumerable-property":60,"../internals/global":82,"../internals/has":83,"../internals/hidden-keys":84,"../internals/is-object":96,"../internals/native-weak-map":106,"../internals/shared-key":139}],93:[function(require,module,exports){
var wellKnownSymbol = require('../internals/well-known-symbol');
var Iterators = require('../internals/iterators');

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
};

},{"../internals/iterators":101,"../internals/well-known-symbol":158}],94:[function(require,module,exports){
var classof = require('../internals/classof-raw');

// `IsArray` abstract operation
// https://tc39.github.io/ecma262/#sec-isarray
module.exports = Array.isArray || function isArray(arg) {
  return classof(arg) == 'Array';
};

},{"../internals/classof-raw":52}],95:[function(require,module,exports){
var fails = require('../internals/fails');

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;

},{"../internals/fails":73}],96:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],97:[function(require,module,exports){
module.exports = false;

},{}],98:[function(require,module,exports){
var isObject = require('../internals/is-object');
var classof = require('../internals/classof-raw');
var wellKnownSymbol = require('../internals/well-known-symbol');

var MATCH = wellKnownSymbol('match');

// `IsRegExp` abstract operation
// https://tc39.github.io/ecma262/#sec-isregexp
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classof(it) == 'RegExp');
};

},{"../internals/classof-raw":52,"../internals/is-object":96,"../internals/well-known-symbol":158}],99:[function(require,module,exports){
var anObject = require('../internals/an-object');
var isArrayIteratorMethod = require('../internals/is-array-iterator-method');
var toLength = require('../internals/to-length');
var bind = require('../internals/function-bind-context');
var getIteratorMethod = require('../internals/get-iterator-method');
var callWithSafeIterationClosing = require('../internals/call-with-safe-iteration-closing');

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
  var boundFunction = bind(fn, that, AS_ENTRIES ? 2 : 1);
  var iterator, iterFn, index, length, result, next, step;

  if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod(iterable);
    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod(iterFn)) {
      for (index = 0, length = toLength(iterable.length); length > index; index++) {
        result = AS_ENTRIES
          ? boundFunction(anObject(step = iterable[index])[0], step[1])
          : boundFunction(iterable[index]);
        if (result && result instanceof Result) return result;
      } return new Result(false);
    }
    iterator = iterFn.call(iterable);
  }

  next = iterator.next;
  while (!(step = next.call(iterator)).done) {
    result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
    if (typeof result == 'object' && result && result instanceof Result) return result;
  } return new Result(false);
};

iterate.stop = function (result) {
  return new Result(true, result);
};

},{"../internals/an-object":38,"../internals/call-with-safe-iteration-closing":50,"../internals/function-bind-context":77,"../internals/get-iterator-method":80,"../internals/is-array-iterator-method":93,"../internals/to-length":151}],100:[function(require,module,exports){
'use strict';
var getPrototypeOf = require('../internals/object-get-prototype-of');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var has = require('../internals/has');
var wellKnownSymbol = require('../internals/well-known-symbol');
var IS_PURE = require('../internals/is-pure');

var ITERATOR = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

var returnThis = function () { return this; };

// `%IteratorPrototype%` object
// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

if (IteratorPrototype == undefined) IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
if (!IS_PURE && !has(IteratorPrototype, ITERATOR)) {
  createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
}

module.exports = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};

},{"../internals/create-non-enumerable-property":60,"../internals/has":83,"../internals/is-pure":97,"../internals/object-get-prototype-of":117,"../internals/well-known-symbol":158}],101:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"dup":84}],102:[function(require,module,exports){
var global = require('../internals/global');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var classof = require('../internals/classof-raw');
var macrotask = require('../internals/task').set;
var IS_IOS = require('../internals/engine-is-ios');

var MutationObserver = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var IS_NODE = classof(process) == 'process';
// Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
var queueMicrotaskDescriptor = getOwnPropertyDescriptor(global, 'queueMicrotask');
var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

var flush, head, last, notify, toggle, node, promise, then;

// modern engines have queueMicrotask method
if (!queueMicrotask) {
  flush = function () {
    var parent, fn;
    if (IS_NODE && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (error) {
        if (head) notify();
        else last = undefined;
        throw error;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (IS_NODE) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
  } else if (MutationObserver && !IS_IOS) {
    toggle = true;
    node = document.createTextNode('');
    new MutationObserver(flush).observe(node, { characterData: true });
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    promise = Promise.resolve(undefined);
    then = promise.then;
    notify = function () {
      then.call(promise, flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }
}

module.exports = queueMicrotask || function (fn) {
  var task = { fn: fn, next: undefined };
  if (last) last.next = task;
  if (!head) {
    head = task;
    notify();
  } last = task;
};

},{"../internals/classof-raw":52,"../internals/engine-is-ios":68,"../internals/global":82,"../internals/object-get-own-property-descriptor":113,"../internals/task":147}],103:[function(require,module,exports){
var global = require('../internals/global');

module.exports = global.Promise;

},{"../internals/global":82}],104:[function(require,module,exports){
var fails = require('../internals/fails');

module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  // Chrome 38 Symbol has incorrect toString conversion
  // eslint-disable-next-line no-undef
  return !String(Symbol());
});

},{"../internals/fails":73}],105:[function(require,module,exports){
var fails = require('../internals/fails');
var wellKnownSymbol = require('../internals/well-known-symbol');
var IS_PURE = require('../internals/is-pure');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = !fails(function () {
  var url = new URL('b?a=1&b=2&c=3', 'http://a');
  var searchParams = url.searchParams;
  var result = '';
  url.pathname = 'c%20d';
  searchParams.forEach(function (value, key) {
    searchParams['delete']('b');
    result += key + value;
  });
  return (IS_PURE && !url.toJSON)
    || !searchParams.sort
    || url.href !== 'http://a/c%20d?a=1&c=3'
    || searchParams.get('c') !== '3'
    || String(new URLSearchParams('?a=1')) !== 'a=1'
    || !searchParams[ITERATOR]
    // throws in Edge
    || new URL('https://a@b').username !== 'a'
    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
    // not punycoded in Edge
    || new URL('http://тест').host !== 'xn--e1aybc'
    // not escaped in Chrome 62-
    || new URL('http://a#б').hash !== '#%D0%B1'
    // fails in Chrome 66-
    || result !== 'a1c3'
    // throws in Safari
    || new URL('http://x', undefined).host !== 'x';
});

},{"../internals/fails":73,"../internals/is-pure":97,"../internals/well-known-symbol":158}],106:[function(require,module,exports){
var global = require('../internals/global');
var inspectSource = require('../internals/inspect-source');

var WeakMap = global.WeakMap;

module.exports = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

},{"../internals/global":82,"../internals/inspect-source":90}],107:[function(require,module,exports){
'use strict';
var aFunction = require('../internals/a-function');

var PromiseCapability = function (C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
};

// 25.4.1.5 NewPromiseCapability(C)
module.exports.f = function (C) {
  return new PromiseCapability(C);
};

},{"../internals/a-function":33}],108:[function(require,module,exports){
var isRegExp = require('../internals/is-regexp');

module.exports = function (it) {
  if (isRegExp(it)) {
    throw TypeError("The method doesn't accept regular expressions");
  } return it;
};

},{"../internals/is-regexp":98}],109:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');
var objectKeys = require('../internals/object-keys');
var getOwnPropertySymbolsModule = require('../internals/object-get-own-property-symbols');
var propertyIsEnumerableModule = require('../internals/object-property-is-enumerable');
var toObject = require('../internals/to-object');
var IndexedObject = require('../internals/indexed-object');

var nativeAssign = Object.assign;
var defineProperty = Object.defineProperty;

// `Object.assign` method
// https://tc39.github.io/ecma262/#sec-object.assign
module.exports = !nativeAssign || fails(function () {
  // should have correct order of operations (Edge bug)
  if (DESCRIPTORS && nativeAssign({ b: 1 }, nativeAssign(defineProperty({}, 'a', {
    enumerable: true,
    get: function () {
      defineProperty(this, 'b', {
        value: 3,
        enumerable: false
      });
    }
  }), { b: 2 })).b !== 1) return true;
  // should work with symbols and should have deterministic property order (V8 bug)
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var symbol = Symbol();
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
  return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  var propertyIsEnumerable = propertyIsEnumerableModule.f;
  while (argumentsLength > index) {
    var S = IndexedObject(arguments[index++]);
    var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS || propertyIsEnumerable.call(S, key)) T[key] = S[key];
    }
  } return T;
} : nativeAssign;

},{"../internals/descriptors":65,"../internals/fails":73,"../internals/indexed-object":88,"../internals/object-get-own-property-symbols":116,"../internals/object-keys":119,"../internals/object-property-is-enumerable":120,"../internals/to-object":152}],110:[function(require,module,exports){
var anObject = require('../internals/an-object');
var defineProperties = require('../internals/object-define-properties');
var enumBugKeys = require('../internals/enum-bug-keys');
var hiddenKeys = require('../internals/hidden-keys');
var html = require('../internals/html');
var documentCreateElement = require('../internals/document-create-element');
var sharedKey = require('../internals/shared-key');

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    /* global ActiveXObject */
    activeXDocument = document.domain && new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.github.io/ecma262/#sec-object.create
module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : defineProperties(result, Properties);
};

},{"../internals/an-object":38,"../internals/document-create-element":66,"../internals/enum-bug-keys":71,"../internals/hidden-keys":84,"../internals/html":86,"../internals/object-define-properties":111,"../internals/shared-key":139}],111:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var definePropertyModule = require('../internals/object-define-property');
var anObject = require('../internals/an-object');
var objectKeys = require('../internals/object-keys');

// `Object.defineProperties` method
// https://tc39.github.io/ecma262/#sec-object.defineproperties
module.exports = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], Properties[key]);
  return O;
};

},{"../internals/an-object":38,"../internals/descriptors":65,"../internals/object-define-property":112,"../internals/object-keys":119}],112:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var IE8_DOM_DEFINE = require('../internals/ie8-dom-define');
var anObject = require('../internals/an-object');
var toPrimitive = require('../internals/to-primitive');

var nativeDefineProperty = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"../internals/an-object":38,"../internals/descriptors":65,"../internals/ie8-dom-define":87,"../internals/to-primitive":153}],113:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var propertyIsEnumerableModule = require('../internals/object-property-is-enumerable');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var toIndexedObject = require('../internals/to-indexed-object');
var toPrimitive = require('../internals/to-primitive');
var has = require('../internals/has');
var IE8_DOM_DEFINE = require('../internals/ie8-dom-define');

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (has(O, P)) return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
};

},{"../internals/create-property-descriptor":61,"../internals/descriptors":65,"../internals/has":83,"../internals/ie8-dom-define":87,"../internals/object-property-is-enumerable":120,"../internals/to-indexed-object":149,"../internals/to-primitive":153}],114:[function(require,module,exports){
var toIndexedObject = require('../internals/to-indexed-object');
var nativeGetOwnPropertyNames = require('../internals/object-get-own-property-names').f;

var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return nativeGetOwnPropertyNames(it);
  } catch (error) {
    return windowNames.slice();
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]'
    ? getWindowNames(it)
    : nativeGetOwnPropertyNames(toIndexedObject(it));
};

},{"../internals/object-get-own-property-names":115,"../internals/to-indexed-object":149}],115:[function(require,module,exports){
var internalObjectKeys = require('../internals/object-keys-internal');
var enumBugKeys = require('../internals/enum-bug-keys');

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};

},{"../internals/enum-bug-keys":71,"../internals/object-keys-internal":118}],116:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],117:[function(require,module,exports){
var has = require('../internals/has');
var toObject = require('../internals/to-object');
var sharedKey = require('../internals/shared-key');
var CORRECT_PROTOTYPE_GETTER = require('../internals/correct-prototype-getter');

var IE_PROTO = sharedKey('IE_PROTO');
var ObjectPrototype = Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.getprototypeof
module.exports = CORRECT_PROTOTYPE_GETTER ? Object.getPrototypeOf : function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectPrototype : null;
};

},{"../internals/correct-prototype-getter":58,"../internals/has":83,"../internals/shared-key":139,"../internals/to-object":152}],118:[function(require,module,exports){
var has = require('../internals/has');
var toIndexedObject = require('../internals/to-indexed-object');
var indexOf = require('../internals/array-includes').indexOf;
var hiddenKeys = require('../internals/hidden-keys');

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }
  return result;
};

},{"../internals/array-includes":42,"../internals/has":83,"../internals/hidden-keys":84,"../internals/to-indexed-object":149}],119:[function(require,module,exports){
var internalObjectKeys = require('../internals/object-keys-internal');
var enumBugKeys = require('../internals/enum-bug-keys');

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};

},{"../internals/enum-bug-keys":71,"../internals/object-keys-internal":118}],120:[function(require,module,exports){
'use strict';
var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;

},{}],121:[function(require,module,exports){
var anObject = require('../internals/an-object');
var aPossiblePrototype = require('../internals/a-possible-prototype');

// `Object.setPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter.call(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

},{"../internals/a-possible-prototype":34,"../internals/an-object":38}],122:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var objectKeys = require('../internals/object-keys');
var toIndexedObject = require('../internals/to-indexed-object');
var propertyIsEnumerable = require('../internals/object-property-is-enumerable').f;

// `Object.{ entries, values }` methods implementation
var createMethod = function (TO_ENTRIES) {
  return function (it) {
    var O = toIndexedObject(it);
    var keys = objectKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (!DESCRIPTORS || propertyIsEnumerable.call(O, key)) {
        result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
      }
    }
    return result;
  };
};

module.exports = {
  // `Object.entries` method
  // https://tc39.github.io/ecma262/#sec-object.entries
  entries: createMethod(true),
  // `Object.values` method
  // https://tc39.github.io/ecma262/#sec-object.values
  values: createMethod(false)
};

},{"../internals/descriptors":65,"../internals/object-keys":119,"../internals/object-property-is-enumerable":120,"../internals/to-indexed-object":149}],123:[function(require,module,exports){
'use strict';
var TO_STRING_TAG_SUPPORT = require('../internals/to-string-tag-support');
var classof = require('../internals/classof');

// `Object.prototype.toString` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
module.exports = TO_STRING_TAG_SUPPORT ? {}.toString : function toString() {
  return '[object ' + classof(this) + ']';
};

},{"../internals/classof":53,"../internals/to-string-tag-support":154}],124:[function(require,module,exports){
var getBuiltIn = require('../internals/get-built-in');
var getOwnPropertyNamesModule = require('../internals/object-get-own-property-names');
var getOwnPropertySymbolsModule = require('../internals/object-get-own-property-symbols');
var anObject = require('../internals/an-object');

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};

},{"../internals/an-object":38,"../internals/get-built-in":79,"../internals/object-get-own-property-names":115,"../internals/object-get-own-property-symbols":116}],125:[function(require,module,exports){
var global = require('../internals/global');

module.exports = global;

},{"../internals/global":82}],126:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return { error: false, value: exec() };
  } catch (error) {
    return { error: true, value: error };
  }
};

},{}],127:[function(require,module,exports){
var anObject = require('../internals/an-object');
var isObject = require('../internals/is-object');
var newPromiseCapability = require('../internals/new-promise-capability');

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

},{"../internals/an-object":38,"../internals/is-object":96,"../internals/new-promise-capability":107}],128:[function(require,module,exports){
var redefine = require('../internals/redefine');

module.exports = function (target, src, options) {
  for (var key in src) redefine(target, key, src[key], options);
  return target;
};

},{"../internals/redefine":129}],129:[function(require,module,exports){
var global = require('../internals/global');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var has = require('../internals/has');
var setGlobal = require('../internals/set-global');
var inspectSource = require('../internals/inspect-source');
var InternalStateModule = require('../internals/internal-state');

var getInternalState = InternalStateModule.get;
var enforceInternalState = InternalStateModule.enforce;
var TEMPLATE = String(String).split('String');

(module.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  if (typeof value == 'function') {
    if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
  }
  if (O === global) {
    if (simple) O[key] = value;
    else setGlobal(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else createNonEnumerableProperty(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
});

},{"../internals/create-non-enumerable-property":60,"../internals/global":82,"../internals/has":83,"../internals/inspect-source":90,"../internals/internal-state":92,"../internals/set-global":136}],130:[function(require,module,exports){
var classof = require('./classof-raw');
var regexpExec = require('./regexp-exec');

// `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }

  if (classof(R) !== 'RegExp') {
    throw TypeError('RegExp#exec called on incompatible receiver');
  }

  return regexpExec.call(R, S);
};


},{"./classof-raw":52,"./regexp-exec":131}],131:[function(require,module,exports){
'use strict';
var regexpFlags = require('./regexp-flags');
var stickyHelpers = require('./regexp-sticky-helpers');

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y || stickyHelpers.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;
    var sticky = UNSUPPORTED_Y && re.sticky;
    var flags = regexpFlags.call(re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = flags.replace('y', '');
      if (flags.indexOf('g') === -1) {
        flags += 'g';
      }

      strCopy = String(str).slice(re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
        source = '(?: ' + source + ')';
        strCopy = ' ' + strCopy;
        charsAdded++;
      }
      // ^(? + rx + ) is needed, in combination with some str slicing, to
      // simulate the 'y' flag.
      reCopy = new RegExp('^(?:' + source + ')', flags);
    }

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    match = nativeExec.call(sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = match.input.slice(charsAdded);
        match[0] = match[0].slice(charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

module.exports = patchedExec;

},{"./regexp-flags":132,"./regexp-sticky-helpers":133}],132:[function(require,module,exports){
'use strict';
var anObject = require('../internals/an-object');

// `RegExp.prototype.flags` getter implementation
// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

},{"../internals/an-object":38}],133:[function(require,module,exports){
'use strict';

var fails = require('./fails');

// babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
// so we use an intermediate function.
function RE(s, f) {
  return RegExp(s, f);
}

exports.UNSUPPORTED_Y = fails(function () {
  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
  var re = RE('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') != null;
});

exports.BROKEN_CARET = fails(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = RE('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') != null;
});

},{"./fails":73}],134:[function(require,module,exports){
// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};

},{}],135:[function(require,module,exports){
// `SameValue` abstract operation
// https://tc39.github.io/ecma262/#sec-samevalue
module.exports = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};

},{}],136:[function(require,module,exports){
var global = require('../internals/global');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');

module.exports = function (key, value) {
  try {
    createNonEnumerableProperty(global, key, value);
  } catch (error) {
    global[key] = value;
  } return value;
};

},{"../internals/create-non-enumerable-property":60,"../internals/global":82}],137:[function(require,module,exports){
'use strict';
var getBuiltIn = require('../internals/get-built-in');
var definePropertyModule = require('../internals/object-define-property');
var wellKnownSymbol = require('../internals/well-known-symbol');
var DESCRIPTORS = require('../internals/descriptors');

var SPECIES = wellKnownSymbol('species');

module.exports = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
  var defineProperty = definePropertyModule.f;

  if (DESCRIPTORS && Constructor && !Constructor[SPECIES]) {
    defineProperty(Constructor, SPECIES, {
      configurable: true,
      get: function () { return this; }
    });
  }
};

},{"../internals/descriptors":65,"../internals/get-built-in":79,"../internals/object-define-property":112,"../internals/well-known-symbol":158}],138:[function(require,module,exports){
var defineProperty = require('../internals/object-define-property').f;
var has = require('../internals/has');
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

module.exports = function (it, TAG, STATIC) {
  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
    defineProperty(it, TO_STRING_TAG, { configurable: true, value: TAG });
  }
};

},{"../internals/has":83,"../internals/object-define-property":112,"../internals/well-known-symbol":158}],139:[function(require,module,exports){
var shared = require('../internals/shared');
var uid = require('../internals/uid');

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};

},{"../internals/shared":141,"../internals/uid":155}],140:[function(require,module,exports){
var global = require('../internals/global');
var setGlobal = require('../internals/set-global');

var SHARED = '__core-js_shared__';
var store = global[SHARED] || setGlobal(SHARED, {});

module.exports = store;

},{"../internals/global":82,"../internals/set-global":136}],141:[function(require,module,exports){
var IS_PURE = require('../internals/is-pure');
var store = require('../internals/shared-store');

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.6.5',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
});

},{"../internals/is-pure":97,"../internals/shared-store":140}],142:[function(require,module,exports){
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var wellKnownSymbol = require('../internals/well-known-symbol');

var SPECIES = wellKnownSymbol('species');

// `SpeciesConstructor` abstract operation
// https://tc39.github.io/ecma262/#sec-speciesconstructor
module.exports = function (O, defaultConstructor) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? defaultConstructor : aFunction(S);
};

},{"../internals/a-function":33,"../internals/an-object":38,"../internals/well-known-symbol":158}],143:[function(require,module,exports){
var toInteger = require('../internals/to-integer');
var requireObjectCoercible = require('../internals/require-object-coercible');

// `String.prototype.{ codePointAt, at }` methods implementation
var createMethod = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = String(requireObjectCoercible($this));
    var position = toInteger(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = S.charCodeAt(position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING ? S.charAt(position) : first
        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

module.exports = {
  // `String.prototype.codePointAt` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod(true)
};

},{"../internals/require-object-coercible":134,"../internals/to-integer":150}],144:[function(require,module,exports){
'use strict';
// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js
var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
var base = 36;
var tMin = 1;
var tMax = 26;
var skew = 38;
var damp = 700;
var initialBias = 72;
var initialN = 128; // 0x80
var delimiter = '-'; // '\x2D'
var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars
var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
var baseMinusTMin = base - tMin;
var floor = Math.floor;
var stringFromCharCode = String.fromCharCode;

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 */
var ucs2decode = function (string) {
  var output = [];
  var counter = 0;
  var length = string.length;
  while (counter < length) {
    var value = string.charCodeAt(counter++);
    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
      // It's a high surrogate, and there is a next character.
      var extra = string.charCodeAt(counter++);
      if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        // It's an unmatched surrogate; only append this code unit, in case the
        // next code unit is the high surrogate of a surrogate pair.
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }
  return output;
};

/**
 * Converts a digit/integer into a basic code point.
 */
var digitToBasic = function (digit) {
  //  0..25 map to ASCII a..z or A..Z
  // 26..35 map to ASCII 0..9
  return digit + 22 + 75 * (digit < 26);
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 */
var adapt = function (delta, numPoints, firstTime) {
  var k = 0;
  delta = firstTime ? floor(delta / damp) : delta >> 1;
  delta += floor(delta / numPoints);
  for (; delta > baseMinusTMin * tMax >> 1; k += base) {
    delta = floor(delta / baseMinusTMin);
  }
  return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 */
// eslint-disable-next-line  max-statements
var encode = function (input) {
  var output = [];

  // Convert the input in UCS-2 to an array of Unicode code points.
  input = ucs2decode(input);

  // Cache the length.
  var inputLength = input.length;

  // Initialize the state.
  var n = initialN;
  var delta = 0;
  var bias = initialBias;
  var i, currentValue;

  // Handle the basic code points.
  for (i = 0; i < input.length; i++) {
    currentValue = input[i];
    if (currentValue < 0x80) {
      output.push(stringFromCharCode(currentValue));
    }
  }

  var basicLength = output.length; // number of basic code points.
  var handledCPCount = basicLength; // number of code points that have been handled;

  // Finish the basic string with a delimiter unless it's empty.
  if (basicLength) {
    output.push(delimiter);
  }

  // Main encoding loop:
  while (handledCPCount < inputLength) {
    // All non-basic code points < n have been handled already. Find the next larger one:
    var m = maxInt;
    for (i = 0; i < input.length; i++) {
      currentValue = input[i];
      if (currentValue >= n && currentValue < m) {
        m = currentValue;
      }
    }

    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
    var handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
      throw RangeError(OVERFLOW_ERROR);
    }

    delta += (m - n) * handledCPCountPlusOne;
    n = m;

    for (i = 0; i < input.length; i++) {
      currentValue = input[i];
      if (currentValue < n && ++delta > maxInt) {
        throw RangeError(OVERFLOW_ERROR);
      }
      if (currentValue == n) {
        // Represent delta as a generalized variable-length integer.
        var q = delta;
        for (var k = base; /* no condition */; k += base) {
          var t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
          if (q < t) break;
          var qMinusT = q - t;
          var baseMinusT = base - t;
          output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
          q = floor(qMinusT / baseMinusT);
        }

        output.push(stringFromCharCode(digitToBasic(q)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
        delta = 0;
        ++handledCPCount;
      }
    }

    ++delta;
    ++n;
  }
  return output.join('');
};

module.exports = function (input) {
  var encoded = [];
  var labels = input.toLowerCase().replace(regexSeparators, '\u002E').split('.');
  var i, label;
  for (i = 0; i < labels.length; i++) {
    label = labels[i];
    encoded.push(regexNonASCII.test(label) ? 'xn--' + encode(label) : label);
  }
  return encoded.join('.');
};

},{}],145:[function(require,module,exports){
var fails = require('../internals/fails');
var whitespaces = require('../internals/whitespaces');

var non = '\u200B\u0085\u180E';

// check that a method works with the correct list
// of whitespaces and has a correct name
module.exports = function (METHOD_NAME) {
  return fails(function () {
    return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
  });
};

},{"../internals/fails":73,"../internals/whitespaces":159}],146:[function(require,module,exports){
var requireObjectCoercible = require('../internals/require-object-coercible');
var whitespaces = require('../internals/whitespaces');

var whitespace = '[' + whitespaces + ']';
var ltrim = RegExp('^' + whitespace + whitespace + '*');
var rtrim = RegExp(whitespace + whitespace + '*$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod = function (TYPE) {
  return function ($this) {
    var string = String(requireObjectCoercible($this));
    if (TYPE & 1) string = string.replace(ltrim, '');
    if (TYPE & 2) string = string.replace(rtrim, '');
    return string;
  };
};

module.exports = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
  start: createMethod(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
  end: createMethod(2),
  // `String.prototype.trim` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.trim
  trim: createMethod(3)
};

},{"../internals/require-object-coercible":134,"../internals/whitespaces":159}],147:[function(require,module,exports){
var global = require('../internals/global');
var fails = require('../internals/fails');
var classof = require('../internals/classof-raw');
var bind = require('../internals/function-bind-context');
var html = require('../internals/html');
var createElement = require('../internals/document-create-element');
var IS_IOS = require('../internals/engine-is-ios');

var location = global.location;
var set = global.setImmediate;
var clear = global.clearImmediate;
var process = global.process;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;

var run = function (id) {
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};

var runner = function (id) {
  return function () {
    run(id);
  };
};

var listener = function (event) {
  run(event.data);
};

var post = function (id) {
  // old engines have not location.origin
  global.postMessage(id + '', location.protocol + '//' + location.host);
};

// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!set || !clear) {
  set = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
    };
    defer(counter);
    return counter;
  };
  clear = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (classof(process) == 'process') {
    defer = function (id) {
      process.nextTick(runner(id));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(runner(id));
    };
  // Browsers with MessageChannel, includes WebWorkers
  // except iOS - https://github.com/zloirock/core-js/issues/624
  } else if (MessageChannel && !IS_IOS) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = bind(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (
    global.addEventListener &&
    typeof postMessage == 'function' &&
    !global.importScripts &&
    !fails(post) &&
    location.protocol !== 'file:'
  ) {
    defer = post;
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in createElement('script')) {
    defer = function (id) {
      html.appendChild(createElement('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(runner(id), 0);
    };
  }
}

module.exports = {
  set: set,
  clear: clear
};

},{"../internals/classof-raw":52,"../internals/document-create-element":66,"../internals/engine-is-ios":68,"../internals/fails":73,"../internals/function-bind-context":77,"../internals/global":82,"../internals/html":86}],148:[function(require,module,exports){
var toInteger = require('../internals/to-integer');

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
module.exports = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};

},{"../internals/to-integer":150}],149:[function(require,module,exports){
// toObject with fallback for non-array-like ES3 strings
var IndexedObject = require('../internals/indexed-object');
var requireObjectCoercible = require('../internals/require-object-coercible');

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};

},{"../internals/indexed-object":88,"../internals/require-object-coercible":134}],150:[function(require,module,exports){
var ceil = Math.ceil;
var floor = Math.floor;

// `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger
module.exports = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};

},{}],151:[function(require,module,exports){
var toInteger = require('../internals/to-integer');

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

},{"../internals/to-integer":150}],152:[function(require,module,exports){
var requireObjectCoercible = require('../internals/require-object-coercible');

// `ToObject` abstract operation
// https://tc39.github.io/ecma262/#sec-toobject
module.exports = function (argument) {
  return Object(requireObjectCoercible(argument));
};

},{"../internals/require-object-coercible":134}],153:[function(require,module,exports){
var isObject = require('../internals/is-object');

// `ToPrimitive` abstract operation
// https://tc39.github.io/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (input, PREFERRED_STRING) {
  if (!isObject(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"../internals/is-object":96}],154:[function(require,module,exports){
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

module.exports = String(test) === '[object z]';

},{"../internals/well-known-symbol":158}],155:[function(require,module,exports){
var id = 0;
var postfix = Math.random();

module.exports = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};

},{}],156:[function(require,module,exports){
var NATIVE_SYMBOL = require('../internals/native-symbol');

module.exports = NATIVE_SYMBOL
  // eslint-disable-next-line no-undef
  && !Symbol.sham
  // eslint-disable-next-line no-undef
  && typeof Symbol.iterator == 'symbol';

},{"../internals/native-symbol":104}],157:[function(require,module,exports){
var wellKnownSymbol = require('../internals/well-known-symbol');

exports.f = wellKnownSymbol;

},{"../internals/well-known-symbol":158}],158:[function(require,module,exports){
var global = require('../internals/global');
var shared = require('../internals/shared');
var has = require('../internals/has');
var uid = require('../internals/uid');
var NATIVE_SYMBOL = require('../internals/native-symbol');
var USE_SYMBOL_AS_UID = require('../internals/use-symbol-as-uid');

var WellKnownSymbolsStore = shared('wks');
var Symbol = global.Symbol;
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol : Symbol && Symbol.withoutSetter || uid;

module.exports = function (name) {
  if (!has(WellKnownSymbolsStore, name)) {
    if (NATIVE_SYMBOL && has(Symbol, name)) WellKnownSymbolsStore[name] = Symbol[name];
    else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};

},{"../internals/global":82,"../internals/has":83,"../internals/native-symbol":104,"../internals/shared":141,"../internals/uid":155,"../internals/use-symbol-as-uid":156}],159:[function(require,module,exports){
// a string of all valid unicode whitespaces
// eslint-disable-next-line max-len
module.exports = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

},{}],160:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var fails = require('../internals/fails');
var isArray = require('../internals/is-array');
var isObject = require('../internals/is-object');
var toObject = require('../internals/to-object');
var toLength = require('../internals/to-length');
var createProperty = require('../internals/create-property');
var arraySpeciesCreate = require('../internals/array-species-create');
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');
var wellKnownSymbol = require('../internals/well-known-symbol');
var V8_VERSION = require('../internals/engine-v8-version');

var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

var isConcatSpreadable = function (O) {
  if (!isObject(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray(O);
};

var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

// `Array.prototype.concat` method
// https://tc39.github.io/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
$({ target: 'Array', proto: true, forced: FORCED }, {
  concat: function concat(arg) { // eslint-disable-line no-unused-vars
    var O = toObject(this);
    var A = arraySpeciesCreate(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = toLength(E.length);
        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
      } else {
        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        createProperty(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});

},{"../internals/array-method-has-species-support":45,"../internals/array-species-create":49,"../internals/create-property":62,"../internals/engine-v8-version":70,"../internals/export":72,"../internals/fails":73,"../internals/is-array":94,"../internals/is-object":96,"../internals/to-length":151,"../internals/to-object":152,"../internals/well-known-symbol":158}],161:[function(require,module,exports){
var $ = require('../internals/export');
var fill = require('../internals/array-fill');
var addToUnscopables = require('../internals/add-to-unscopables');

// `Array.prototype.fill` method
// https://tc39.github.io/ecma262/#sec-array.prototype.fill
$({ target: 'Array', proto: true }, {
  fill: fill
});

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('fill');

},{"../internals/add-to-unscopables":35,"../internals/array-fill":39,"../internals/export":72}],162:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $filter = require('../internals/array-iteration').filter;
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');
var arrayMethodUsesToLength = require('../internals/array-method-uses-to-length');

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter');
// Edge 14- issue
var USES_TO_LENGTH = arrayMethodUsesToLength('filter');

// `Array.prototype.filter` method
// https://tc39.github.io/ecma262/#sec-array.prototype.filter
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

},{"../internals/array-iteration":43,"../internals/array-method-has-species-support":45,"../internals/array-method-uses-to-length":47,"../internals/export":72}],163:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $findIndex = require('../internals/array-iteration').findIndex;
var addToUnscopables = require('../internals/add-to-unscopables');
var arrayMethodUsesToLength = require('../internals/array-method-uses-to-length');

var FIND_INDEX = 'findIndex';
var SKIPS_HOLES = true;

var USES_TO_LENGTH = arrayMethodUsesToLength(FIND_INDEX);

// Shouldn't skip holes
if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () { SKIPS_HOLES = false; });

// `Array.prototype.findIndex` method
// https://tc39.github.io/ecma262/#sec-array.prototype.findindex
$({ target: 'Array', proto: true, forced: SKIPS_HOLES || !USES_TO_LENGTH }, {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $findIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables(FIND_INDEX);

},{"../internals/add-to-unscopables":35,"../internals/array-iteration":43,"../internals/array-method-uses-to-length":47,"../internals/export":72}],164:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $find = require('../internals/array-iteration').find;
var addToUnscopables = require('../internals/add-to-unscopables');
var arrayMethodUsesToLength = require('../internals/array-method-uses-to-length');

var FIND = 'find';
var SKIPS_HOLES = true;

var USES_TO_LENGTH = arrayMethodUsesToLength(FIND);

// Shouldn't skip holes
if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES = false; });

// `Array.prototype.find` method
// https://tc39.github.io/ecma262/#sec-array.prototype.find
$({ target: 'Array', proto: true, forced: SKIPS_HOLES || !USES_TO_LENGTH }, {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables(FIND);

},{"../internals/add-to-unscopables":35,"../internals/array-iteration":43,"../internals/array-method-uses-to-length":47,"../internals/export":72}],165:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var flattenIntoArray = require('../internals/flatten-into-array');
var toObject = require('../internals/to-object');
var toLength = require('../internals/to-length');
var toInteger = require('../internals/to-integer');
var arraySpeciesCreate = require('../internals/array-species-create');

// `Array.prototype.flat` method
// https://github.com/tc39/proposal-flatMap
$({ target: 'Array', proto: true }, {
  flat: function flat(/* depthArg = 1 */) {
    var depthArg = arguments.length ? arguments[0] : undefined;
    var O = toObject(this);
    var sourceLen = toLength(O.length);
    var A = arraySpeciesCreate(O, 0);
    A.length = flattenIntoArray(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : toInteger(depthArg));
    return A;
  }
});

},{"../internals/array-species-create":49,"../internals/export":72,"../internals/flatten-into-array":75,"../internals/to-integer":150,"../internals/to-length":151,"../internals/to-object":152}],166:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var forEach = require('../internals/array-for-each');

// `Array.prototype.forEach` method
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
$({ target: 'Array', proto: true, forced: [].forEach != forEach }, {
  forEach: forEach
});

},{"../internals/array-for-each":40,"../internals/export":72}],167:[function(require,module,exports){
var $ = require('../internals/export');
var from = require('../internals/array-from');
var checkCorrectnessOfIteration = require('../internals/check-correctness-of-iteration');

var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.github.io/ecma262/#sec-array.from
$({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
  from: from
});

},{"../internals/array-from":41,"../internals/check-correctness-of-iteration":51,"../internals/export":72}],168:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $includes = require('../internals/array-includes').includes;
var addToUnscopables = require('../internals/add-to-unscopables');
var arrayMethodUsesToLength = require('../internals/array-method-uses-to-length');

var USES_TO_LENGTH = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });

// `Array.prototype.includes` method
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
$({ target: 'Array', proto: true, forced: !USES_TO_LENGTH }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('includes');

},{"../internals/add-to-unscopables":35,"../internals/array-includes":42,"../internals/array-method-uses-to-length":47,"../internals/export":72}],169:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $indexOf = require('../internals/array-includes').indexOf;
var arrayMethodIsStrict = require('../internals/array-method-is-strict');
var arrayMethodUsesToLength = require('../internals/array-method-uses-to-length');

var nativeIndexOf = [].indexOf;

var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
var STRICT_METHOD = arrayMethodIsStrict('indexOf');
var USES_TO_LENGTH = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });

// `Array.prototype.indexOf` method
// https://tc39.github.io/ecma262/#sec-array.prototype.indexof
$({ target: 'Array', proto: true, forced: NEGATIVE_ZERO || !STRICT_METHOD || !USES_TO_LENGTH }, {
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    return NEGATIVE_ZERO
      // convert -0 to +0
      ? nativeIndexOf.apply(this, arguments) || 0
      : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
  }
});

},{"../internals/array-includes":42,"../internals/array-method-is-strict":46,"../internals/array-method-uses-to-length":47,"../internals/export":72}],170:[function(require,module,exports){
var $ = require('../internals/export');
var isArray = require('../internals/is-array');

// `Array.isArray` method
// https://tc39.github.io/ecma262/#sec-array.isarray
$({ target: 'Array', stat: true }, {
  isArray: isArray
});

},{"../internals/export":72,"../internals/is-array":94}],171:[function(require,module,exports){
'use strict';
var toIndexedObject = require('../internals/to-indexed-object');
var addToUnscopables = require('../internals/add-to-unscopables');
var Iterators = require('../internals/iterators');
var InternalStateModule = require('../internals/internal-state');
var defineIterator = require('../internals/define-iterator');

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.github.io/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.github.io/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.github.io/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.github.io/ecma262/#sec-createarrayiterator
module.exports = defineIterator(Array, 'Array', function (iterated, kind) {
  setInternalState(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState(this);
  var target = state.target;
  var kind = state.kind;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return { value: undefined, done: true };
  }
  if (kind == 'keys') return { value: index, done: false };
  if (kind == 'values') return { value: target[index], done: false };
  return { value: [index, target[index]], done: false };
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
Iterators.Arguments = Iterators.Array;

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"../internals/add-to-unscopables":35,"../internals/define-iterator":63,"../internals/internal-state":92,"../internals/iterators":101,"../internals/to-indexed-object":149}],172:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var IndexedObject = require('../internals/indexed-object');
var toIndexedObject = require('../internals/to-indexed-object');
var arrayMethodIsStrict = require('../internals/array-method-is-strict');

var nativeJoin = [].join;

var ES3_STRINGS = IndexedObject != Object;
var STRICT_METHOD = arrayMethodIsStrict('join', ',');

// `Array.prototype.join` method
// https://tc39.github.io/ecma262/#sec-array.prototype.join
$({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD }, {
  join: function join(separator) {
    return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
  }
});

},{"../internals/array-method-is-strict":46,"../internals/export":72,"../internals/indexed-object":88,"../internals/to-indexed-object":149}],173:[function(require,module,exports){
var $ = require('../internals/export');
var lastIndexOf = require('../internals/array-last-index-of');

// `Array.prototype.lastIndexOf` method
// https://tc39.github.io/ecma262/#sec-array.prototype.lastindexof
$({ target: 'Array', proto: true, forced: lastIndexOf !== [].lastIndexOf }, {
  lastIndexOf: lastIndexOf
});

},{"../internals/array-last-index-of":44,"../internals/export":72}],174:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $map = require('../internals/array-iteration').map;
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');
var arrayMethodUsesToLength = require('../internals/array-method-uses-to-length');

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map');
// FF49- issue
var USES_TO_LENGTH = arrayMethodUsesToLength('map');

// `Array.prototype.map` method
// https://tc39.github.io/ecma262/#sec-array.prototype.map
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

},{"../internals/array-iteration":43,"../internals/array-method-has-species-support":45,"../internals/array-method-uses-to-length":47,"../internals/export":72}],175:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $reduce = require('../internals/array-reduce').left;
var arrayMethodIsStrict = require('../internals/array-method-is-strict');
var arrayMethodUsesToLength = require('../internals/array-method-uses-to-length');

var STRICT_METHOD = arrayMethodIsStrict('reduce');
var USES_TO_LENGTH = arrayMethodUsesToLength('reduce', { 1: 0 });

// `Array.prototype.reduce` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reduce
$({ target: 'Array', proto: true, forced: !STRICT_METHOD || !USES_TO_LENGTH }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    return $reduce(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});

},{"../internals/array-method-is-strict":46,"../internals/array-method-uses-to-length":47,"../internals/array-reduce":48,"../internals/export":72}],176:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var isArray = require('../internals/is-array');

var nativeReverse = [].reverse;
var test = [1, 2];

// `Array.prototype.reverse` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reverse
// fix for Safari 12.0 bug
// https://bugs.webkit.org/show_bug.cgi?id=188794
$({ target: 'Array', proto: true, forced: String(test) === String(test.reverse()) }, {
  reverse: function reverse() {
    // eslint-disable-next-line no-self-assign
    if (isArray(this)) this.length = this.length;
    return nativeReverse.call(this);
  }
});

},{"../internals/export":72,"../internals/is-array":94}],177:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var isObject = require('../internals/is-object');
var isArray = require('../internals/is-array');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var toLength = require('../internals/to-length');
var toIndexedObject = require('../internals/to-indexed-object');
var createProperty = require('../internals/create-property');
var wellKnownSymbol = require('../internals/well-known-symbol');
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');
var arrayMethodUsesToLength = require('../internals/array-method-uses-to-length');

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');
var USES_TO_LENGTH = arrayMethodUsesToLength('slice', { ACCESSORS: true, 0: 0, 1: 2 });

var SPECIES = wellKnownSymbol('species');
var nativeSlice = [].slice;
var max = Math.max;

// `Array.prototype.slice` method
// https://tc39.github.io/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
  slice: function slice(start, end) {
    var O = toIndexedObject(this);
    var length = toLength(O.length);
    var k = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject(Constructor)) {
        Constructor = Constructor[SPECIES];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === Array || Constructor === undefined) {
        return nativeSlice.call(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? Array : Constructor)(max(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
    result.length = n;
    return result;
  }
});

},{"../internals/array-method-has-species-support":45,"../internals/array-method-uses-to-length":47,"../internals/create-property":62,"../internals/export":72,"../internals/is-array":94,"../internals/is-object":96,"../internals/to-absolute-index":148,"../internals/to-indexed-object":149,"../internals/to-length":151,"../internals/well-known-symbol":158}],178:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var aFunction = require('../internals/a-function');
var toObject = require('../internals/to-object');
var fails = require('../internals/fails');
var arrayMethodIsStrict = require('../internals/array-method-is-strict');

var test = [];
var nativeSort = test.sort;

// IE8-
var FAILS_ON_UNDEFINED = fails(function () {
  test.sort(undefined);
});
// V8 bug
var FAILS_ON_NULL = fails(function () {
  test.sort(null);
});
// Old WebKit
var STRICT_METHOD = arrayMethodIsStrict('sort');

var FORCED = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD;

// `Array.prototype.sort` method
// https://tc39.github.io/ecma262/#sec-array.prototype.sort
$({ target: 'Array', proto: true, forced: FORCED }, {
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? nativeSort.call(toObject(this))
      : nativeSort.call(toObject(this), aFunction(comparefn));
  }
});

},{"../internals/a-function":33,"../internals/array-method-is-strict":46,"../internals/export":72,"../internals/fails":73,"../internals/to-object":152}],179:[function(require,module,exports){
// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module
var addToUnscopables = require('../internals/add-to-unscopables');

addToUnscopables('flat');

},{"../internals/add-to-unscopables":35}],180:[function(require,module,exports){
var redefine = require('../internals/redefine');

var DatePrototype = Date.prototype;
var INVALID_DATE = 'Invalid Date';
var TO_STRING = 'toString';
var nativeDateToString = DatePrototype[TO_STRING];
var getTime = DatePrototype.getTime;

// `Date.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-date.prototype.tostring
if (new Date(NaN) + '' != INVALID_DATE) {
  redefine(DatePrototype, TO_STRING, function toString() {
    var value = getTime.call(this);
    // eslint-disable-next-line no-self-compare
    return value === value ? nativeDateToString.call(this) : INVALID_DATE;
  });
}

},{"../internals/redefine":129}],181:[function(require,module,exports){
var $ = require('../internals/export');
var bind = require('../internals/function-bind');

// `Function.prototype.bind` method
// https://tc39.github.io/ecma262/#sec-function.prototype.bind
$({ target: 'Function', proto: true }, {
  bind: bind
});

},{"../internals/export":72,"../internals/function-bind":78}],182:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var defineProperty = require('../internals/object-define-property').f;

var FunctionPrototype = Function.prototype;
var FunctionPrototypeToString = FunctionPrototype.toString;
var nameRE = /^\s*function ([^ (]*)/;
var NAME = 'name';

// Function instances `.name` property
// https://tc39.github.io/ecma262/#sec-function-instances-name
if (DESCRIPTORS && !(NAME in FunctionPrototype)) {
  defineProperty(FunctionPrototype, NAME, {
    configurable: true,
    get: function () {
      try {
        return FunctionPrototypeToString.call(this).match(nameRE)[1];
      } catch (error) {
        return '';
      }
    }
  });
}

},{"../internals/descriptors":65,"../internals/object-define-property":112}],183:[function(require,module,exports){
'use strict';
var collection = require('../internals/collection');
var collectionStrong = require('../internals/collection-strong');

// `Map` constructor
// https://tc39.github.io/ecma262/#sec-map-objects
module.exports = collection('Map', function (init) {
  return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionStrong);

},{"../internals/collection":55,"../internals/collection-strong":54}],184:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var global = require('../internals/global');
var isForced = require('../internals/is-forced');
var redefine = require('../internals/redefine');
var has = require('../internals/has');
var classof = require('../internals/classof-raw');
var inheritIfRequired = require('../internals/inherit-if-required');
var toPrimitive = require('../internals/to-primitive');
var fails = require('../internals/fails');
var create = require('../internals/object-create');
var getOwnPropertyNames = require('../internals/object-get-own-property-names').f;
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var defineProperty = require('../internals/object-define-property').f;
var trim = require('../internals/string-trim').trim;

var NUMBER = 'Number';
var NativeNumber = global[NUMBER];
var NumberPrototype = NativeNumber.prototype;

// Opera ~12 has broken Object#toString
var BROKEN_CLASSOF = classof(create(NumberPrototype)) == NUMBER;

// `ToNumber` abstract operation
// https://tc39.github.io/ecma262/#sec-tonumber
var toNumber = function (argument) {
  var it = toPrimitive(argument, false);
  var first, third, radix, maxCode, digits, length, index, code;
  if (typeof it == 'string' && it.length > 2) {
    it = trim(it);
    first = it.charCodeAt(0);
    if (first === 43 || first === 45) {
      third = it.charCodeAt(2);
      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (it.charCodeAt(1)) {
        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal of /^0b[01]+$/i
        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal of /^0o[0-7]+$/i
        default: return +it;
      }
      digits = it.slice(2);
      length = digits.length;
      for (index = 0; index < length; index++) {
        code = digits.charCodeAt(index);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if (code < 48 || code > maxCode) return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

// `Number` constructor
// https://tc39.github.io/ecma262/#sec-number-constructor
if (isForced(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
  var NumberWrapper = function Number(value) {
    var it = arguments.length < 1 ? 0 : value;
    var dummy = this;
    return dummy instanceof NumberWrapper
      // check on 1..constructor(foo) case
      && (BROKEN_CLASSOF ? fails(function () { NumberPrototype.valueOf.call(dummy); }) : classof(dummy) != NUMBER)
        ? inheritIfRequired(new NativeNumber(toNumber(it)), dummy, NumberWrapper) : toNumber(it);
  };
  for (var keys = DESCRIPTORS ? getOwnPropertyNames(NativeNumber) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES2015 (in case, if modules with ES2015 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
  ).split(','), j = 0, key; keys.length > j; j++) {
    if (has(NativeNumber, key = keys[j]) && !has(NumberWrapper, key)) {
      defineProperty(NumberWrapper, key, getOwnPropertyDescriptor(NativeNumber, key));
    }
  }
  NumberWrapper.prototype = NumberPrototype;
  NumberPrototype.constructor = NumberWrapper;
  redefine(global, NUMBER, NumberWrapper);
}

},{"../internals/classof-raw":52,"../internals/descriptors":65,"../internals/fails":73,"../internals/global":82,"../internals/has":83,"../internals/inherit-if-required":89,"../internals/is-forced":95,"../internals/object-create":110,"../internals/object-define-property":112,"../internals/object-get-own-property-descriptor":113,"../internals/object-get-own-property-names":115,"../internals/redefine":129,"../internals/string-trim":146,"../internals/to-primitive":153}],185:[function(require,module,exports){
var $ = require('../internals/export');

// `Number.MAX_SAFE_INTEGER` constant
// https://tc39.github.io/ecma262/#sec-number.max_safe_integer
$({ target: 'Number', stat: true }, {
  MAX_SAFE_INTEGER: 0x1FFFFFFFFFFFFF
});

},{"../internals/export":72}],186:[function(require,module,exports){
var $ = require('../internals/export');
var assign = require('../internals/object-assign');

// `Object.assign` method
// https://tc39.github.io/ecma262/#sec-object.assign
$({ target: 'Object', stat: true, forced: Object.assign !== assign }, {
  assign: assign
});

},{"../internals/export":72,"../internals/object-assign":109}],187:[function(require,module,exports){
var $ = require('../internals/export');
var DESCRIPTORS = require('../internals/descriptors');
var create = require('../internals/object-create');

// `Object.create` method
// https://tc39.github.io/ecma262/#sec-object.create
$({ target: 'Object', stat: true, sham: !DESCRIPTORS }, {
  create: create
});

},{"../internals/descriptors":65,"../internals/export":72,"../internals/object-create":110}],188:[function(require,module,exports){
var $ = require('../internals/export');
var DESCRIPTORS = require('../internals/descriptors');
var defineProperties = require('../internals/object-define-properties');

// `Object.defineProperties` method
// https://tc39.github.io/ecma262/#sec-object.defineproperties
$({ target: 'Object', stat: true, forced: !DESCRIPTORS, sham: !DESCRIPTORS }, {
  defineProperties: defineProperties
});

},{"../internals/descriptors":65,"../internals/export":72,"../internals/object-define-properties":111}],189:[function(require,module,exports){
var $ = require('../internals/export');
var DESCRIPTORS = require('../internals/descriptors');
var objectDefinePropertyModile = require('../internals/object-define-property');

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
$({ target: 'Object', stat: true, forced: !DESCRIPTORS, sham: !DESCRIPTORS }, {
  defineProperty: objectDefinePropertyModile.f
});

},{"../internals/descriptors":65,"../internals/export":72,"../internals/object-define-property":112}],190:[function(require,module,exports){
var $ = require('../internals/export');
var $entries = require('../internals/object-to-array').entries;

// `Object.entries` method
// https://tc39.github.io/ecma262/#sec-object.entries
$({ target: 'Object', stat: true }, {
  entries: function entries(O) {
    return $entries(O);
  }
});

},{"../internals/export":72,"../internals/object-to-array":122}],191:[function(require,module,exports){
var $ = require('../internals/export');
var FREEZING = require('../internals/freezing');
var fails = require('../internals/fails');
var isObject = require('../internals/is-object');
var onFreeze = require('../internals/internal-metadata').onFreeze;

var nativeFreeze = Object.freeze;
var FAILS_ON_PRIMITIVES = fails(function () { nativeFreeze(1); });

// `Object.freeze` method
// https://tc39.github.io/ecma262/#sec-object.freeze
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !FREEZING }, {
  freeze: function freeze(it) {
    return nativeFreeze && isObject(it) ? nativeFreeze(onFreeze(it)) : it;
  }
});

},{"../internals/export":72,"../internals/fails":73,"../internals/freezing":76,"../internals/internal-metadata":91,"../internals/is-object":96}],192:[function(require,module,exports){
var $ = require('../internals/export');
var iterate = require('../internals/iterate');
var createProperty = require('../internals/create-property');

// `Object.fromEntries` method
// https://github.com/tc39/proposal-object-from-entries
$({ target: 'Object', stat: true }, {
  fromEntries: function fromEntries(iterable) {
    var obj = {};
    iterate(iterable, function (k, v) {
      createProperty(obj, k, v);
    }, undefined, true);
    return obj;
  }
});

},{"../internals/create-property":62,"../internals/export":72,"../internals/iterate":99}],193:[function(require,module,exports){
var $ = require('../internals/export');
var fails = require('../internals/fails');
var toIndexedObject = require('../internals/to-indexed-object');
var nativeGetOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var DESCRIPTORS = require('../internals/descriptors');

var FAILS_ON_PRIMITIVES = fails(function () { nativeGetOwnPropertyDescriptor(1); });
var FORCED = !DESCRIPTORS || FAILS_ON_PRIMITIVES;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
$({ target: 'Object', stat: true, forced: FORCED, sham: !DESCRIPTORS }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
    return nativeGetOwnPropertyDescriptor(toIndexedObject(it), key);
  }
});

},{"../internals/descriptors":65,"../internals/export":72,"../internals/fails":73,"../internals/object-get-own-property-descriptor":113,"../internals/to-indexed-object":149}],194:[function(require,module,exports){
var $ = require('../internals/export');
var DESCRIPTORS = require('../internals/descriptors');
var ownKeys = require('../internals/own-keys');
var toIndexedObject = require('../internals/to-indexed-object');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var createProperty = require('../internals/create-property');

// `Object.getOwnPropertyDescriptors` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
$({ target: 'Object', stat: true, sham: !DESCRIPTORS }, {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIndexedObject(object);
    var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
    var keys = ownKeys(O);
    var result = {};
    var index = 0;
    var key, descriptor;
    while (keys.length > index) {
      descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
      if (descriptor !== undefined) createProperty(result, key, descriptor);
    }
    return result;
  }
});

},{"../internals/create-property":62,"../internals/descriptors":65,"../internals/export":72,"../internals/object-get-own-property-descriptor":113,"../internals/own-keys":124,"../internals/to-indexed-object":149}],195:[function(require,module,exports){
var $ = require('../internals/export');
var fails = require('../internals/fails');
var nativeGetOwnPropertyNames = require('../internals/object-get-own-property-names-external').f;

var FAILS_ON_PRIMITIVES = fails(function () { return !Object.getOwnPropertyNames(1); });

// `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  getOwnPropertyNames: nativeGetOwnPropertyNames
});

},{"../internals/export":72,"../internals/fails":73,"../internals/object-get-own-property-names-external":114}],196:[function(require,module,exports){
var $ = require('../internals/export');
var fails = require('../internals/fails');
var toObject = require('../internals/to-object');
var nativeGetPrototypeOf = require('../internals/object-get-prototype-of');
var CORRECT_PROTOTYPE_GETTER = require('../internals/correct-prototype-getter');

var FAILS_ON_PRIMITIVES = fails(function () { nativeGetPrototypeOf(1); });

// `Object.getPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.getprototypeof
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !CORRECT_PROTOTYPE_GETTER }, {
  getPrototypeOf: function getPrototypeOf(it) {
    return nativeGetPrototypeOf(toObject(it));
  }
});


},{"../internals/correct-prototype-getter":58,"../internals/export":72,"../internals/fails":73,"../internals/object-get-prototype-of":117,"../internals/to-object":152}],197:[function(require,module,exports){
var $ = require('../internals/export');
var fails = require('../internals/fails');
var isObject = require('../internals/is-object');

var nativeIsFrozen = Object.isFrozen;
var FAILS_ON_PRIMITIVES = fails(function () { nativeIsFrozen(1); });

// `Object.isFrozen` method
// https://tc39.github.io/ecma262/#sec-object.isfrozen
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  isFrozen: function isFrozen(it) {
    return isObject(it) ? nativeIsFrozen ? nativeIsFrozen(it) : false : true;
  }
});

},{"../internals/export":72,"../internals/fails":73,"../internals/is-object":96}],198:[function(require,module,exports){
var $ = require('../internals/export');
var toObject = require('../internals/to-object');
var nativeKeys = require('../internals/object-keys');
var fails = require('../internals/fails');

var FAILS_ON_PRIMITIVES = fails(function () { nativeKeys(1); });

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  keys: function keys(it) {
    return nativeKeys(toObject(it));
  }
});

},{"../internals/export":72,"../internals/fails":73,"../internals/object-keys":119,"../internals/to-object":152}],199:[function(require,module,exports){
var $ = require('../internals/export');
var setPrototypeOf = require('../internals/object-set-prototype-of');

// `Object.setPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.setprototypeof
$({ target: 'Object', stat: true }, {
  setPrototypeOf: setPrototypeOf
});

},{"../internals/export":72,"../internals/object-set-prototype-of":121}],200:[function(require,module,exports){
var TO_STRING_TAG_SUPPORT = require('../internals/to-string-tag-support');
var redefine = require('../internals/redefine');
var toString = require('../internals/object-to-string');

// `Object.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
if (!TO_STRING_TAG_SUPPORT) {
  redefine(Object.prototype, 'toString', toString, { unsafe: true });
}

},{"../internals/object-to-string":123,"../internals/redefine":129,"../internals/to-string-tag-support":154}],201:[function(require,module,exports){
var $ = require('../internals/export');
var $values = require('../internals/object-to-array').values;

// `Object.values` method
// https://tc39.github.io/ecma262/#sec-object.values
$({ target: 'Object', stat: true }, {
  values: function values(O) {
    return $values(O);
  }
});

},{"../internals/export":72,"../internals/object-to-array":122}],202:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var NativePromise = require('../internals/native-promise-constructor');
var fails = require('../internals/fails');
var getBuiltIn = require('../internals/get-built-in');
var speciesConstructor = require('../internals/species-constructor');
var promiseResolve = require('../internals/promise-resolve');
var redefine = require('../internals/redefine');

// Safari bug https://bugs.webkit.org/show_bug.cgi?id=200829
var NON_GENERIC = !!NativePromise && fails(function () {
  NativePromise.prototype['finally'].call({ then: function () { /* empty */ } }, function () { /* empty */ });
});

// `Promise.prototype.finally` method
// https://tc39.github.io/ecma262/#sec-promise.prototype.finally
$({ target: 'Promise', proto: true, real: true, forced: NON_GENERIC }, {
  'finally': function (onFinally) {
    var C = speciesConstructor(this, getBuiltIn('Promise'));
    var isFunction = typeof onFinally == 'function';
    return this.then(
      isFunction ? function (x) {
        return promiseResolve(C, onFinally()).then(function () { return x; });
      } : onFinally,
      isFunction ? function (e) {
        return promiseResolve(C, onFinally()).then(function () { throw e; });
      } : onFinally
    );
  }
});

// patch native Promise.prototype for native async functions
if (!IS_PURE && typeof NativePromise == 'function' && !NativePromise.prototype['finally']) {
  redefine(NativePromise.prototype, 'finally', getBuiltIn('Promise').prototype['finally']);
}

},{"../internals/export":72,"../internals/fails":73,"../internals/get-built-in":79,"../internals/is-pure":97,"../internals/native-promise-constructor":103,"../internals/promise-resolve":127,"../internals/redefine":129,"../internals/species-constructor":142}],203:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var global = require('../internals/global');
var getBuiltIn = require('../internals/get-built-in');
var NativePromise = require('../internals/native-promise-constructor');
var redefine = require('../internals/redefine');
var redefineAll = require('../internals/redefine-all');
var setToStringTag = require('../internals/set-to-string-tag');
var setSpecies = require('../internals/set-species');
var isObject = require('../internals/is-object');
var aFunction = require('../internals/a-function');
var anInstance = require('../internals/an-instance');
var classof = require('../internals/classof-raw');
var inspectSource = require('../internals/inspect-source');
var iterate = require('../internals/iterate');
var checkCorrectnessOfIteration = require('../internals/check-correctness-of-iteration');
var speciesConstructor = require('../internals/species-constructor');
var task = require('../internals/task').set;
var microtask = require('../internals/microtask');
var promiseResolve = require('../internals/promise-resolve');
var hostReportErrors = require('../internals/host-report-errors');
var newPromiseCapabilityModule = require('../internals/new-promise-capability');
var perform = require('../internals/perform');
var InternalStateModule = require('../internals/internal-state');
var isForced = require('../internals/is-forced');
var wellKnownSymbol = require('../internals/well-known-symbol');
var V8_VERSION = require('../internals/engine-v8-version');

var SPECIES = wellKnownSymbol('species');
var PROMISE = 'Promise';
var getInternalState = InternalStateModule.get;
var setInternalState = InternalStateModule.set;
var getInternalPromiseState = InternalStateModule.getterFor(PROMISE);
var PromiseConstructor = NativePromise;
var TypeError = global.TypeError;
var document = global.document;
var process = global.process;
var $fetch = getBuiltIn('fetch');
var newPromiseCapability = newPromiseCapabilityModule.f;
var newGenericPromiseCapability = newPromiseCapability;
var IS_NODE = classof(process) == 'process';
var DISPATCH_EVENT = !!(document && document.createEvent && global.dispatchEvent);
var UNHANDLED_REJECTION = 'unhandledrejection';
var REJECTION_HANDLED = 'rejectionhandled';
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;
var HANDLED = 1;
var UNHANDLED = 2;
var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

var FORCED = isForced(PROMISE, function () {
  var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);
  if (!GLOBAL_CORE_JS_PROMISE) {
    // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
    // We can't detect it synchronously, so just check versions
    if (V8_VERSION === 66) return true;
    // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    if (!IS_NODE && typeof PromiseRejectionEvent != 'function') return true;
  }
  // We need Promise#finally in the pure version for preventing prototype pollution
  if (IS_PURE && !PromiseConstructor.prototype['finally']) return true;
  // We can't use @@species feature detection in V8 since it causes
  // deoptimization and performance degradation
  // https://github.com/zloirock/core-js/issues/679
  if (V8_VERSION >= 51 && /native code/.test(PromiseConstructor)) return false;
  // Detect correctness of subclassing with @@species support
  var promise = PromiseConstructor.resolve(1);
  var FakePromise = function (exec) {
    exec(function () { /* empty */ }, function () { /* empty */ });
  };
  var constructor = promise.constructor = {};
  constructor[SPECIES] = FakePromise;
  return !(promise.then(function () { /* empty */ }) instanceof FakePromise);
});

var INCORRECT_ITERATION = FORCED || !checkCorrectnessOfIteration(function (iterable) {
  PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
});

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};

var notify = function (promise, state, isReject) {
  if (state.notified) return;
  state.notified = true;
  var chain = state.reactions;
  microtask(function () {
    var value = state.value;
    var ok = state.state == FULFILLED;
    var index = 0;
    // variable length - can't use forEach
    while (chain.length > index) {
      var reaction = chain[index++];
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (state.rejection === UNHANDLED) onHandleUnhandled(promise, state);
            state.rejection = HANDLED;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // can throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (error) {
        if (domain && !exited) domain.exit();
        reject(error);
      }
    }
    state.reactions = [];
    state.notified = false;
    if (isReject && !state.rejection) onUnhandled(promise, state);
  });
};

var dispatchEvent = function (name, promise, reason) {
  var event, handler;
  if (DISPATCH_EVENT) {
    event = document.createEvent('Event');
    event.promise = promise;
    event.reason = reason;
    event.initEvent(name, false, true);
    global.dispatchEvent(event);
  } else event = { promise: promise, reason: reason };
  if (handler = global['on' + name]) handler(event);
  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
};

var onUnhandled = function (promise, state) {
  task.call(global, function () {
    var value = state.value;
    var IS_UNHANDLED = isUnhandled(state);
    var result;
    if (IS_UNHANDLED) {
      result = perform(function () {
        if (IS_NODE) {
          process.emit('unhandledRejection', value, promise);
        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      state.rejection = IS_NODE || isUnhandled(state) ? UNHANDLED : HANDLED;
      if (result.error) throw result.value;
    }
  });
};

var isUnhandled = function (state) {
  return state.rejection !== HANDLED && !state.parent;
};

var onHandleUnhandled = function (promise, state) {
  task.call(global, function () {
    if (IS_NODE) {
      process.emit('rejectionHandled', promise);
    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
  });
};

var bind = function (fn, promise, state, unwrap) {
  return function (value) {
    fn(promise, state, value, unwrap);
  };
};

var internalReject = function (promise, state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  state.value = value;
  state.state = REJECTED;
  notify(promise, state, true);
};

var internalResolve = function (promise, state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    var then = isThenable(value);
    if (then) {
      microtask(function () {
        var wrapper = { done: false };
        try {
          then.call(value,
            bind(internalResolve, promise, wrapper, state),
            bind(internalReject, promise, wrapper, state)
          );
        } catch (error) {
          internalReject(promise, wrapper, error, state);
        }
      });
    } else {
      state.value = value;
      state.state = FULFILLED;
      notify(promise, state, false);
    }
  } catch (error) {
    internalReject(promise, { done: false }, error, state);
  }
};

// constructor polyfill
if (FORCED) {
  // 25.4.3.1 Promise(executor)
  PromiseConstructor = function Promise(executor) {
    anInstance(this, PromiseConstructor, PROMISE);
    aFunction(executor);
    Internal.call(this);
    var state = getInternalState(this);
    try {
      executor(bind(internalResolve, this, state), bind(internalReject, this, state));
    } catch (error) {
      internalReject(this, state, error);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    setInternalState(this, {
      type: PROMISE,
      done: false,
      notified: false,
      parent: false,
      reactions: [],
      rejection: false,
      state: PENDING,
      value: undefined
    });
  };
  Internal.prototype = redefineAll(PromiseConstructor.prototype, {
    // `Promise.prototype.then` method
    // https://tc39.github.io/ecma262/#sec-promise.prototype.then
    then: function then(onFulfilled, onRejected) {
      var state = getInternalPromiseState(this);
      var reaction = newPromiseCapability(speciesConstructor(this, PromiseConstructor));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = IS_NODE ? process.domain : undefined;
      state.parent = true;
      state.reactions.push(reaction);
      if (state.state != PENDING) notify(this, state, false);
      return reaction.promise;
    },
    // `Promise.prototype.catch` method
    // https://tc39.github.io/ecma262/#sec-promise.prototype.catch
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    var state = getInternalState(promise);
    this.promise = promise;
    this.resolve = bind(internalResolve, promise, state);
    this.reject = bind(internalReject, promise, state);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === PromiseConstructor || C === PromiseWrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };

  if (!IS_PURE && typeof NativePromise == 'function') {
    nativeThen = NativePromise.prototype.then;

    // wrap native Promise#then for native async functions
    redefine(NativePromise.prototype, 'then', function then(onFulfilled, onRejected) {
      var that = this;
      return new PromiseConstructor(function (resolve, reject) {
        nativeThen.call(that, resolve, reject);
      }).then(onFulfilled, onRejected);
    // https://github.com/zloirock/core-js/issues/640
    }, { unsafe: true });

    // wrap fetch result
    if (typeof $fetch == 'function') $({ global: true, enumerable: true, forced: true }, {
      // eslint-disable-next-line no-unused-vars
      fetch: function fetch(input /* , init */) {
        return promiseResolve(PromiseConstructor, $fetch.apply(global, arguments));
      }
    });
  }
}

$({ global: true, wrap: true, forced: FORCED }, {
  Promise: PromiseConstructor
});

setToStringTag(PromiseConstructor, PROMISE, false, true);
setSpecies(PROMISE);

PromiseWrapper = getBuiltIn(PROMISE);

// statics
$({ target: PROMISE, stat: true, forced: FORCED }, {
  // `Promise.reject` method
  // https://tc39.github.io/ecma262/#sec-promise.reject
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    capability.reject.call(undefined, r);
    return capability.promise;
  }
});

$({ target: PROMISE, stat: true, forced: IS_PURE || FORCED }, {
  // `Promise.resolve` method
  // https://tc39.github.io/ecma262/#sec-promise.resolve
  resolve: function resolve(x) {
    return promiseResolve(IS_PURE && this === PromiseWrapper ? PromiseConstructor : this, x);
  }
});

$({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION }, {
  // `Promise.all` method
  // https://tc39.github.io/ecma262/#sec-promise.all
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aFunction(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        $promiseResolve.call(C, promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.error) reject(result.value);
    return capability.promise;
  },
  // `Promise.race` method
  // https://tc39.github.io/ecma262/#sec-promise.race
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aFunction(C.resolve);
      iterate(iterable, function (promise) {
        $promiseResolve.call(C, promise).then(capability.resolve, reject);
      });
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

},{"../internals/a-function":33,"../internals/an-instance":37,"../internals/check-correctness-of-iteration":51,"../internals/classof-raw":52,"../internals/engine-v8-version":70,"../internals/export":72,"../internals/get-built-in":79,"../internals/global":82,"../internals/host-report-errors":85,"../internals/inspect-source":90,"../internals/internal-state":92,"../internals/is-forced":95,"../internals/is-object":96,"../internals/is-pure":97,"../internals/iterate":99,"../internals/microtask":102,"../internals/native-promise-constructor":103,"../internals/new-promise-capability":107,"../internals/perform":126,"../internals/promise-resolve":127,"../internals/redefine":129,"../internals/redefine-all":128,"../internals/set-species":137,"../internals/set-to-string-tag":138,"../internals/species-constructor":142,"../internals/task":147,"../internals/well-known-symbol":158}],204:[function(require,module,exports){
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var aFunction = require('../internals/a-function');
var anObject = require('../internals/an-object');
var isObject = require('../internals/is-object');
var create = require('../internals/object-create');
var bind = require('../internals/function-bind');
var fails = require('../internals/fails');

var nativeConstruct = getBuiltIn('Reflect', 'construct');

// `Reflect.construct` method
// https://tc39.github.io/ecma262/#sec-reflect.construct
// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = fails(function () {
  function F() { /* empty */ }
  return !(nativeConstruct(function () { /* empty */ }, [], F) instanceof F);
});
var ARGS_BUG = !fails(function () {
  nativeConstruct(function () { /* empty */ });
});
var FORCED = NEW_TARGET_BUG || ARGS_BUG;

$({ target: 'Reflect', stat: true, forced: FORCED, sham: FORCED }, {
  construct: function construct(Target, args /* , newTarget */) {
    aFunction(Target);
    anObject(args);
    var newTarget = arguments.length < 3 ? Target : aFunction(arguments[2]);
    if (ARGS_BUG && !NEW_TARGET_BUG) return nativeConstruct(Target, args, newTarget);
    if (Target == newTarget) {
      // w/o altered newTarget, optimization for 0-4 arguments
      switch (args.length) {
        case 0: return new Target();
        case 1: return new Target(args[0]);
        case 2: return new Target(args[0], args[1]);
        case 3: return new Target(args[0], args[1], args[2]);
        case 4: return new Target(args[0], args[1], args[2], args[3]);
      }
      // w/o altered newTarget, lot of arguments case
      var $args = [null];
      $args.push.apply($args, args);
      return new (bind.apply(Target, $args))();
    }
    // with altered newTarget, not support built-in constructors
    var proto = newTarget.prototype;
    var instance = create(isObject(proto) ? proto : Object.prototype);
    var result = Function.apply.call(Target, instance, args);
    return isObject(result) ? result : instance;
  }
});

},{"../internals/a-function":33,"../internals/an-object":38,"../internals/export":72,"../internals/fails":73,"../internals/function-bind":78,"../internals/get-built-in":79,"../internals/is-object":96,"../internals/object-create":110}],205:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var exec = require('../internals/regexp-exec');

$({ target: 'RegExp', proto: true, forced: /./.exec !== exec }, {
  exec: exec
});

},{"../internals/export":72,"../internals/regexp-exec":131}],206:[function(require,module,exports){
'use strict';
var redefine = require('../internals/redefine');
var anObject = require('../internals/an-object');
var fails = require('../internals/fails');
var flags = require('../internals/regexp-flags');

var TO_STRING = 'toString';
var RegExpPrototype = RegExp.prototype;
var nativeToString = RegExpPrototype[TO_STRING];

var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = nativeToString.name != TO_STRING;

// `RegExp.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  redefine(RegExp.prototype, TO_STRING, function toString() {
    var R = anObject(this);
    var p = String(R.source);
    var rf = R.flags;
    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype) ? flags.call(R) : rf);
    return '/' + p + '/' + f;
  }, { unsafe: true });
}

},{"../internals/an-object":38,"../internals/fails":73,"../internals/redefine":129,"../internals/regexp-flags":132}],207:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var codeAt = require('../internals/string-multibyte').codeAt;

// `String.prototype.codePointAt` method
// https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
$({ target: 'String', proto: true }, {
  codePointAt: function codePointAt(pos) {
    return codeAt(this, pos);
  }
});

},{"../internals/export":72,"../internals/string-multibyte":143}],208:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var notARegExp = require('../internals/not-a-regexp');
var requireObjectCoercible = require('../internals/require-object-coercible');
var correctIsRegExpLogic = require('../internals/correct-is-regexp-logic');

// `String.prototype.includes` method
// https://tc39.github.io/ecma262/#sec-string.prototype.includes
$({ target: 'String', proto: true, forced: !correctIsRegExpLogic('includes') }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~String(requireObjectCoercible(this))
      .indexOf(notARegExp(searchString), arguments.length > 1 ? arguments[1] : undefined);
  }
});

},{"../internals/correct-is-regexp-logic":57,"../internals/export":72,"../internals/not-a-regexp":108,"../internals/require-object-coercible":134}],209:[function(require,module,exports){
'use strict';
var charAt = require('../internals/string-multibyte').charAt;
var InternalStateModule = require('../internals/internal-state');
var defineIterator = require('../internals/define-iterator');

var STRING_ITERATOR = 'String Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState(this, {
    type: STRING_ITERATOR,
    string: String(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt(string, index);
  state.index += point.length;
  return { value: point, done: false };
});

},{"../internals/define-iterator":63,"../internals/internal-state":92,"../internals/string-multibyte":143}],210:[function(require,module,exports){
'use strict';
var fixRegExpWellKnownSymbolLogic = require('../internals/fix-regexp-well-known-symbol-logic');
var anObject = require('../internals/an-object');
var toObject = require('../internals/to-object');
var toLength = require('../internals/to-length');
var toInteger = require('../internals/to-integer');
var requireObjectCoercible = require('../internals/require-object-coercible');
var advanceStringIndex = require('../internals/advance-string-index');
var regExpExec = require('../internals/regexp-exec-abstract');

var max = Math.max;
var min = Math.min;
var floor = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
fixRegExpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
  var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

  return [
    // `String.prototype.replace` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible(this);
      var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
      return replacer !== undefined
        ? replacer.call(searchValue, O, replaceValue)
        : nativeReplace.call(String(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      if (
        (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0) ||
        (typeof replaceValue === 'string' && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1)
      ) {
        var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
        if (res.done) return res.value;
      }

      var rx = anObject(regexp);
      var S = String(this);

      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);

      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regExpExec(rx, S);
        if (result === null) break;

        results.push(result);
        if (!global) break;

        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = String(result[0]);
        var position = max(min(toInteger(result.index), S.length), 0);
        var captures = [];
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + S.slice(nextSourcePosition);
    }
  ];

  // https://tc39.github.io/ecma262/#sec-getsubstitution
  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
    if (namedCaptures !== undefined) {
      namedCaptures = toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }
    return nativeReplace.call(replacement, symbols, function (match, ch) {
      var capture;
      switch (ch.charAt(0)) {
        case '$': return '$';
        case '&': return matched;
        case '`': return str.slice(0, position);
        case "'": return str.slice(tailPos);
        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;
        default: // \d\d?
          var n = +ch;
          if (n === 0) return match;
          if (n > m) {
            var f = floor(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }
          capture = captures[n - 1];
      }
      return capture === undefined ? '' : capture;
    });
  }
});

},{"../internals/advance-string-index":36,"../internals/an-object":38,"../internals/fix-regexp-well-known-symbol-logic":74,"../internals/regexp-exec-abstract":130,"../internals/require-object-coercible":134,"../internals/to-integer":150,"../internals/to-length":151,"../internals/to-object":152}],211:[function(require,module,exports){
'use strict';
var fixRegExpWellKnownSymbolLogic = require('../internals/fix-regexp-well-known-symbol-logic');
var anObject = require('../internals/an-object');
var requireObjectCoercible = require('../internals/require-object-coercible');
var sameValue = require('../internals/same-value');
var regExpExec = require('../internals/regexp-exec-abstract');

// @@search logic
fixRegExpWellKnownSymbolLogic('search', 1, function (SEARCH, nativeSearch, maybeCallNative) {
  return [
    // `String.prototype.search` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.search
    function search(regexp) {
      var O = requireObjectCoercible(this);
      var searcher = regexp == undefined ? undefined : regexp[SEARCH];
      return searcher !== undefined ? searcher.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
    },
    // `RegExp.prototype[@@search]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@search
    function (regexp) {
      var res = maybeCallNative(nativeSearch, regexp, this);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);

      var previousLastIndex = rx.lastIndex;
      if (!sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
      var result = regExpExec(rx, S);
      if (!sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
      return result === null ? -1 : result.index;
    }
  ];
});

},{"../internals/an-object":38,"../internals/fix-regexp-well-known-symbol-logic":74,"../internals/regexp-exec-abstract":130,"../internals/require-object-coercible":134,"../internals/same-value":135}],212:[function(require,module,exports){
'use strict';
var fixRegExpWellKnownSymbolLogic = require('../internals/fix-regexp-well-known-symbol-logic');
var isRegExp = require('../internals/is-regexp');
var anObject = require('../internals/an-object');
var requireObjectCoercible = require('../internals/require-object-coercible');
var speciesConstructor = require('../internals/species-constructor');
var advanceStringIndex = require('../internals/advance-string-index');
var toLength = require('../internals/to-length');
var callRegExpExec = require('../internals/regexp-exec-abstract');
var regexpExec = require('../internals/regexp-exec');
var fails = require('../internals/fails');

var arrayPush = [].push;
var min = Math.min;
var MAX_UINT32 = 0xFFFFFFFF;

// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
var SUPPORTS_Y = !fails(function () { return !RegExp(MAX_UINT32, 'y'); });

// @@split logic
fixRegExpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
  var internalSplit;
  if (
    'abbc'.split(/(b)*/)[1] == 'c' ||
    'test'.split(/(?:)/, -1).length != 4 ||
    'ab'.split(/(?:ab)*/).length != 2 ||
    '.'.split(/(.?)(.?)/).length != 4 ||
    '.'.split(/()()/).length > 1 ||
    ''.split(/.?/).length
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = String(requireObjectCoercible(this));
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (separator === undefined) return [string];
      // If `separator` is not a regex, use native split
      if (!isRegExp(separator)) {
        return nativeSplit.call(string, separator, lim);
      }
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;
      while (match = regexpExec.call(separatorCopy, string)) {
        lastIndex = separatorCopy.lastIndex;
        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
          lastLength = match[0].length;
          lastLastIndex = lastIndex;
          if (output.length >= lim) break;
        }
        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
      }
      if (lastLastIndex === string.length) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output.length > lim ? output.slice(0, lim) : output;
    };
  // Chakra, V8
  } else if ('0'.split(undefined, 0).length) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
    };
  } else internalSplit = nativeSplit;

  return [
    // `String.prototype.split` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = requireObjectCoercible(this);
      var splitter = separator == undefined ? undefined : separator[SPLIT];
      return splitter !== undefined
        ? splitter.call(separator, O, limit)
        : internalSplit.call(String(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (regexp, limit) {
      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var C = speciesConstructor(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                  (rx.multiline ? 'm' : '') +
                  (rx.unicode ? 'u' : '') +
                  (SUPPORTS_Y ? 'y' : 'g');

      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = SUPPORTS_Y ? q : 0;
        var z = callRegExpExec(splitter, SUPPORTS_Y ? S : S.slice(q));
        var e;
        if (
          z === null ||
          (e = min(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
        ) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          A.push(S.slice(p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            A.push(z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      A.push(S.slice(p));
      return A;
    }
  ];
}, !SUPPORTS_Y);

},{"../internals/advance-string-index":36,"../internals/an-object":38,"../internals/fails":73,"../internals/fix-regexp-well-known-symbol-logic":74,"../internals/is-regexp":98,"../internals/regexp-exec":131,"../internals/regexp-exec-abstract":130,"../internals/require-object-coercible":134,"../internals/species-constructor":142,"../internals/to-length":151}],213:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $trim = require('../internals/string-trim').trim;
var forcedStringTrimMethod = require('../internals/string-trim-forced');

// `String.prototype.trim` method
// https://tc39.github.io/ecma262/#sec-string.prototype.trim
$({ target: 'String', proto: true, forced: forcedStringTrimMethod('trim') }, {
  trim: function trim() {
    return $trim(this);
  }
});

},{"../internals/export":72,"../internals/string-trim":146,"../internals/string-trim-forced":145}],214:[function(require,module,exports){
// `Symbol.prototype.description` getter
// https://tc39.github.io/ecma262/#sec-symbol.prototype.description
'use strict';
var $ = require('../internals/export');
var DESCRIPTORS = require('../internals/descriptors');
var global = require('../internals/global');
var has = require('../internals/has');
var isObject = require('../internals/is-object');
var defineProperty = require('../internals/object-define-property').f;
var copyConstructorProperties = require('../internals/copy-constructor-properties');

var NativeSymbol = global.Symbol;

if (DESCRIPTORS && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) ||
  // Safari 12 bug
  NativeSymbol().description !== undefined
)) {
  var EmptyStringDescriptionStore = {};
  // wrap Symbol constructor for correct work with undefined description
  var SymbolWrapper = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
    var result = this instanceof SymbolWrapper
      ? new NativeSymbol(description)
      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      : description === undefined ? NativeSymbol() : NativeSymbol(description);
    if (description === '') EmptyStringDescriptionStore[result] = true;
    return result;
  };
  copyConstructorProperties(SymbolWrapper, NativeSymbol);
  var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
  symbolPrototype.constructor = SymbolWrapper;

  var symbolToString = symbolPrototype.toString;
  var native = String(NativeSymbol('test')) == 'Symbol(test)';
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  defineProperty(symbolPrototype, 'description', {
    configurable: true,
    get: function description() {
      var symbol = isObject(this) ? this.valueOf() : this;
      var string = symbolToString.call(symbol);
      if (has(EmptyStringDescriptionStore, symbol)) return '';
      var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  $({ global: true, forced: true }, {
    Symbol: SymbolWrapper
  });
}

},{"../internals/copy-constructor-properties":56,"../internals/descriptors":65,"../internals/export":72,"../internals/global":82,"../internals/has":83,"../internals/is-object":96,"../internals/object-define-property":112}],215:[function(require,module,exports){
var defineWellKnownSymbol = require('../internals/define-well-known-symbol');

// `Symbol.iterator` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.iterator
defineWellKnownSymbol('iterator');

},{"../internals/define-well-known-symbol":64}],216:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var global = require('../internals/global');
var getBuiltIn = require('../internals/get-built-in');
var IS_PURE = require('../internals/is-pure');
var DESCRIPTORS = require('../internals/descriptors');
var NATIVE_SYMBOL = require('../internals/native-symbol');
var USE_SYMBOL_AS_UID = require('../internals/use-symbol-as-uid');
var fails = require('../internals/fails');
var has = require('../internals/has');
var isArray = require('../internals/is-array');
var isObject = require('../internals/is-object');
var anObject = require('../internals/an-object');
var toObject = require('../internals/to-object');
var toIndexedObject = require('../internals/to-indexed-object');
var toPrimitive = require('../internals/to-primitive');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var nativeObjectCreate = require('../internals/object-create');
var objectKeys = require('../internals/object-keys');
var getOwnPropertyNamesModule = require('../internals/object-get-own-property-names');
var getOwnPropertyNamesExternal = require('../internals/object-get-own-property-names-external');
var getOwnPropertySymbolsModule = require('../internals/object-get-own-property-symbols');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var definePropertyModule = require('../internals/object-define-property');
var propertyIsEnumerableModule = require('../internals/object-property-is-enumerable');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var redefine = require('../internals/redefine');
var shared = require('../internals/shared');
var sharedKey = require('../internals/shared-key');
var hiddenKeys = require('../internals/hidden-keys');
var uid = require('../internals/uid');
var wellKnownSymbol = require('../internals/well-known-symbol');
var wrappedWellKnownSymbolModule = require('../internals/well-known-symbol-wrapped');
var defineWellKnownSymbol = require('../internals/define-well-known-symbol');
var setToStringTag = require('../internals/set-to-string-tag');
var InternalStateModule = require('../internals/internal-state');
var $forEach = require('../internals/array-iteration').forEach;

var HIDDEN = sharedKey('hidden');
var SYMBOL = 'Symbol';
var PROTOTYPE = 'prototype';
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(SYMBOL);
var ObjectPrototype = Object[PROTOTYPE];
var $Symbol = global.Symbol;
var $stringify = getBuiltIn('JSON', 'stringify');
var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
var nativeDefineProperty = definePropertyModule.f;
var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
var nativePropertyIsEnumerable = propertyIsEnumerableModule.f;
var AllSymbols = shared('symbols');
var ObjectPrototypeSymbols = shared('op-symbols');
var StringToSymbolRegistry = shared('string-to-symbol-registry');
var SymbolToStringRegistry = shared('symbol-to-string-registry');
var WellKnownSymbolsStore = shared('wks');
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var USE_SETTER = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDescriptor = DESCRIPTORS && fails(function () {
  return nativeObjectCreate(nativeDefineProperty({}, 'a', {
    get: function () { return nativeDefineProperty(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (O, P, Attributes) {
  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor(ObjectPrototype, P);
  if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
  nativeDefineProperty(O, P, Attributes);
  if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
    nativeDefineProperty(ObjectPrototype, P, ObjectPrototypeDescriptor);
  }
} : nativeDefineProperty;

var wrap = function (tag, description) {
  var symbol = AllSymbols[tag] = nativeObjectCreate($Symbol[PROTOTYPE]);
  setInternalState(symbol, {
    type: SYMBOL,
    tag: tag,
    description: description
  });
  if (!DESCRIPTORS) symbol.description = description;
  return symbol;
};

var isSymbol = USE_SYMBOL_AS_UID ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return Object(it) instanceof $Symbol;
};

var $defineProperty = function defineProperty(O, P, Attributes) {
  if (O === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
  anObject(O);
  var key = toPrimitive(P, true);
  anObject(Attributes);
  if (has(AllSymbols, key)) {
    if (!Attributes.enumerable) {
      if (!has(O, HIDDEN)) nativeDefineProperty(O, HIDDEN, createPropertyDescriptor(1, {}));
      O[HIDDEN][key] = true;
    } else {
      if (has(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
      Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
    } return setSymbolDescriptor(O, key, Attributes);
  } return nativeDefineProperty(O, key, Attributes);
};

var $defineProperties = function defineProperties(O, Properties) {
  anObject(O);
  var properties = toIndexedObject(Properties);
  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
  $forEach(keys, function (key) {
    if (!DESCRIPTORS || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
  });
  return O;
};

var $create = function create(O, Properties) {
  return Properties === undefined ? nativeObjectCreate(O) : $defineProperties(nativeObjectCreate(O), Properties);
};

var $propertyIsEnumerable = function propertyIsEnumerable(V) {
  var P = toPrimitive(V, true);
  var enumerable = nativePropertyIsEnumerable.call(this, P);
  if (this === ObjectPrototype && has(AllSymbols, P) && !has(ObjectPrototypeSymbols, P)) return false;
  return enumerable || !has(this, P) || !has(AllSymbols, P) || has(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
  var it = toIndexedObject(O);
  var key = toPrimitive(P, true);
  if (it === ObjectPrototype && has(AllSymbols, key) && !has(ObjectPrototypeSymbols, key)) return;
  var descriptor = nativeGetOwnPropertyDescriptor(it, key);
  if (descriptor && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) {
    descriptor.enumerable = true;
  }
  return descriptor;
};

var $getOwnPropertyNames = function getOwnPropertyNames(O) {
  var names = nativeGetOwnPropertyNames(toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (!has(AllSymbols, key) && !has(hiddenKeys, key)) result.push(key);
  });
  return result;
};

var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
  var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (has(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has(ObjectPrototype, key))) {
      result.push(AllSymbols[key]);
    }
  });
  return result;
};

// `Symbol` constructor
// https://tc39.github.io/ecma262/#sec-symbol-constructor
if (!NATIVE_SYMBOL) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
    var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
    var tag = uid(description);
    var setter = function (value) {
      if (this === ObjectPrototype) setter.call(ObjectPrototypeSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
    };
    if (DESCRIPTORS && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
    return wrap(tag, description);
  };

  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return getInternalState(this).tag;
  });

  redefine($Symbol, 'withoutSetter', function (description) {
    return wrap(uid(description), description);
  });

  propertyIsEnumerableModule.f = $propertyIsEnumerable;
  definePropertyModule.f = $defineProperty;
  getOwnPropertyDescriptorModule.f = $getOwnPropertyDescriptor;
  getOwnPropertyNamesModule.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
  getOwnPropertySymbolsModule.f = $getOwnPropertySymbols;

  wrappedWellKnownSymbolModule.f = function (name) {
    return wrap(wellKnownSymbol(name), name);
  };

  if (DESCRIPTORS) {
    // https://github.com/tc39/proposal-Symbol-description
    nativeDefineProperty($Symbol[PROTOTYPE], 'description', {
      configurable: true,
      get: function description() {
        return getInternalState(this).description;
      }
    });
    if (!IS_PURE) {
      redefine(ObjectPrototype, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
    }
  }
}

$({ global: true, wrap: true, forced: !NATIVE_SYMBOL, sham: !NATIVE_SYMBOL }, {
  Symbol: $Symbol
});

$forEach(objectKeys(WellKnownSymbolsStore), function (name) {
  defineWellKnownSymbol(name);
});

$({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL }, {
  // `Symbol.for` method
  // https://tc39.github.io/ecma262/#sec-symbol.for
  'for': function (key) {
    var string = String(key);
    if (has(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = $Symbol(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry[symbol] = string;
    return symbol;
  },
  // `Symbol.keyFor` method
  // https://tc39.github.io/ecma262/#sec-symbol.keyfor
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
    if (has(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
  },
  useSetter: function () { USE_SETTER = true; },
  useSimple: function () { USE_SETTER = false; }
});

$({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL, sham: !DESCRIPTORS }, {
  // `Object.create` method
  // https://tc39.github.io/ecma262/#sec-object.create
  create: $create,
  // `Object.defineProperty` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperty
  defineProperty: $defineProperty,
  // `Object.defineProperties` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperties
  defineProperties: $defineProperties,
  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor
});

$({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL }, {
  // `Object.getOwnPropertyNames` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
  getOwnPropertyNames: $getOwnPropertyNames,
  // `Object.getOwnPropertySymbols` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertysymbols
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
$({ target: 'Object', stat: true, forced: fails(function () { getOwnPropertySymbolsModule.f(1); }) }, {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return getOwnPropertySymbolsModule.f(toObject(it));
  }
});

// `JSON.stringify` method behavior with symbols
// https://tc39.github.io/ecma262/#sec-json.stringify
if ($stringify) {
  var FORCED_JSON_STRINGIFY = !NATIVE_SYMBOL || fails(function () {
    var symbol = $Symbol();
    // MS Edge converts symbol values to JSON as {}
    return $stringify([symbol]) != '[null]'
      // WebKit converts symbol values to JSON as null
      || $stringify({ a: symbol }) != '{}'
      // V8 throws on boxed symbols
      || $stringify(Object(symbol)) != '{}';
  });

  $({ target: 'JSON', stat: true, forced: FORCED_JSON_STRINGIFY }, {
    // eslint-disable-next-line no-unused-vars
    stringify: function stringify(it, replacer, space) {
      var args = [it];
      var index = 1;
      var $replacer;
      while (arguments.length > index) args.push(arguments[index++]);
      $replacer = replacer;
      if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
      if (!isArray(replacer)) replacer = function (key, value) {
        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
        if (!isSymbol(value)) return value;
      };
      args[1] = replacer;
      return $stringify.apply(null, args);
    }
  });
}

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.github.io/ecma262/#sec-symbol.prototype-@@toprimitive
if (!$Symbol[PROTOTYPE][TO_PRIMITIVE]) {
  createNonEnumerableProperty($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
}
// `Symbol.prototype[@@toStringTag]` property
// https://tc39.github.io/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag($Symbol, SYMBOL);

hiddenKeys[HIDDEN] = true;

},{"../internals/an-object":38,"../internals/array-iteration":43,"../internals/create-non-enumerable-property":60,"../internals/create-property-descriptor":61,"../internals/define-well-known-symbol":64,"../internals/descriptors":65,"../internals/export":72,"../internals/fails":73,"../internals/get-built-in":79,"../internals/global":82,"../internals/has":83,"../internals/hidden-keys":84,"../internals/internal-state":92,"../internals/is-array":94,"../internals/is-object":96,"../internals/is-pure":97,"../internals/native-symbol":104,"../internals/object-create":110,"../internals/object-define-property":112,"../internals/object-get-own-property-descriptor":113,"../internals/object-get-own-property-names":115,"../internals/object-get-own-property-names-external":114,"../internals/object-get-own-property-symbols":116,"../internals/object-keys":119,"../internals/object-property-is-enumerable":120,"../internals/redefine":129,"../internals/set-to-string-tag":138,"../internals/shared":141,"../internals/shared-key":139,"../internals/to-indexed-object":149,"../internals/to-object":152,"../internals/to-primitive":153,"../internals/uid":155,"../internals/use-symbol-as-uid":156,"../internals/well-known-symbol":158,"../internals/well-known-symbol-wrapped":157}],217:[function(require,module,exports){
var global = require('../internals/global');
var DOMIterables = require('../internals/dom-iterables');
var forEach = require('../internals/array-for-each');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');

for (var COLLECTION_NAME in DOMIterables) {
  var Collection = global[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype.forEach !== forEach) try {
    createNonEnumerableProperty(CollectionPrototype, 'forEach', forEach);
  } catch (error) {
    CollectionPrototype.forEach = forEach;
  }
}

},{"../internals/array-for-each":40,"../internals/create-non-enumerable-property":60,"../internals/dom-iterables":67,"../internals/global":82}],218:[function(require,module,exports){
var global = require('../internals/global');
var DOMIterables = require('../internals/dom-iterables');
var ArrayIteratorMethods = require('../modules/es.array.iterator');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var ArrayValues = ArrayIteratorMethods.values;

for (var COLLECTION_NAME in DOMIterables) {
  var Collection = global[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
      createNonEnumerableProperty(CollectionPrototype, ITERATOR, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR] = ArrayValues;
    }
    if (!CollectionPrototype[TO_STRING_TAG]) {
      createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
    }
    if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
        createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
      } catch (error) {
        CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
      }
    }
  }
}

},{"../internals/create-non-enumerable-property":60,"../internals/dom-iterables":67,"../internals/global":82,"../internals/well-known-symbol":158,"../modules/es.array.iterator":171}],219:[function(require,module,exports){
'use strict';
// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
require('../modules/es.array.iterator');
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var USE_NATIVE_URL = require('../internals/native-url');
var redefine = require('../internals/redefine');
var redefineAll = require('../internals/redefine-all');
var setToStringTag = require('../internals/set-to-string-tag');
var createIteratorConstructor = require('../internals/create-iterator-constructor');
var InternalStateModule = require('../internals/internal-state');
var anInstance = require('../internals/an-instance');
var hasOwn = require('../internals/has');
var bind = require('../internals/function-bind-context');
var classof = require('../internals/classof');
var anObject = require('../internals/an-object');
var isObject = require('../internals/is-object');
var create = require('../internals/object-create');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var getIterator = require('../internals/get-iterator');
var getIteratorMethod = require('../internals/get-iterator-method');
var wellKnownSymbol = require('../internals/well-known-symbol');

var $fetch = getBuiltIn('fetch');
var Headers = getBuiltIn('Headers');
var ITERATOR = wellKnownSymbol('iterator');
var URL_SEARCH_PARAMS = 'URLSearchParams';
var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
var setInternalState = InternalStateModule.set;
var getInternalParamsState = InternalStateModule.getterFor(URL_SEARCH_PARAMS);
var getInternalIteratorState = InternalStateModule.getterFor(URL_SEARCH_PARAMS_ITERATOR);

var plus = /\+/g;
var sequences = Array(4);

var percentSequence = function (bytes) {
  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
};

var percentDecode = function (sequence) {
  try {
    return decodeURIComponent(sequence);
  } catch (error) {
    return sequence;
  }
};

var deserialize = function (it) {
  var result = it.replace(plus, ' ');
  var bytes = 4;
  try {
    return decodeURIComponent(result);
  } catch (error) {
    while (bytes) {
      result = result.replace(percentSequence(bytes--), percentDecode);
    }
    return result;
  }
};

var find = /[!'()~]|%20/g;

var replace = {
  '!': '%21',
  "'": '%27',
  '(': '%28',
  ')': '%29',
  '~': '%7E',
  '%20': '+'
};

var replacer = function (match) {
  return replace[match];
};

var serialize = function (it) {
  return encodeURIComponent(it).replace(find, replacer);
};

var parseSearchParams = function (result, query) {
  if (query) {
    var attributes = query.split('&');
    var index = 0;
    var attribute, entry;
    while (index < attributes.length) {
      attribute = attributes[index++];
      if (attribute.length) {
        entry = attribute.split('=');
        result.push({
          key: deserialize(entry.shift()),
          value: deserialize(entry.join('='))
        });
      }
    }
  }
};

var updateSearchParams = function (query) {
  this.entries.length = 0;
  parseSearchParams(this.entries, query);
};

var validateArgumentsLength = function (passed, required) {
  if (passed < required) throw TypeError('Not enough arguments');
};

var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
  setInternalState(this, {
    type: URL_SEARCH_PARAMS_ITERATOR,
    iterator: getIterator(getInternalParamsState(params).entries),
    kind: kind
  });
}, 'Iterator', function next() {
  var state = getInternalIteratorState(this);
  var kind = state.kind;
  var step = state.iterator.next();
  var entry = step.value;
  if (!step.done) {
    step.value = kind === 'keys' ? entry.key : kind === 'values' ? entry.value : [entry.key, entry.value];
  } return step;
});

// `URLSearchParams` constructor
// https://url.spec.whatwg.org/#interface-urlsearchparams
var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
  anInstance(this, URLSearchParamsConstructor, URL_SEARCH_PARAMS);
  var init = arguments.length > 0 ? arguments[0] : undefined;
  var that = this;
  var entries = [];
  var iteratorMethod, iterator, next, step, entryIterator, entryNext, first, second, key;

  setInternalState(that, {
    type: URL_SEARCH_PARAMS,
    entries: entries,
    updateURL: function () { /* empty */ },
    updateSearchParams: updateSearchParams
  });

  if (init !== undefined) {
    if (isObject(init)) {
      iteratorMethod = getIteratorMethod(init);
      if (typeof iteratorMethod === 'function') {
        iterator = iteratorMethod.call(init);
        next = iterator.next;
        while (!(step = next.call(iterator)).done) {
          entryIterator = getIterator(anObject(step.value));
          entryNext = entryIterator.next;
          if (
            (first = entryNext.call(entryIterator)).done ||
            (second = entryNext.call(entryIterator)).done ||
            !entryNext.call(entryIterator).done
          ) throw TypeError('Expected sequence with length 2');
          entries.push({ key: first.value + '', value: second.value + '' });
        }
      } else for (key in init) if (hasOwn(init, key)) entries.push({ key: key, value: init[key] + '' });
    } else {
      parseSearchParams(entries, typeof init === 'string' ? init.charAt(0) === '?' ? init.slice(1) : init : init + '');
    }
  }
};

var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

redefineAll(URLSearchParamsPrototype, {
  // `URLSearchParams.prototype.appent` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
  append: function append(name, value) {
    validateArgumentsLength(arguments.length, 2);
    var state = getInternalParamsState(this);
    state.entries.push({ key: name + '', value: value + '' });
    state.updateURL();
  },
  // `URLSearchParams.prototype.delete` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
  'delete': function (name) {
    validateArgumentsLength(arguments.length, 1);
    var state = getInternalParamsState(this);
    var entries = state.entries;
    var key = name + '';
    var index = 0;
    while (index < entries.length) {
      if (entries[index].key === key) entries.splice(index, 1);
      else index++;
    }
    state.updateURL();
  },
  // `URLSearchParams.prototype.get` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
  get: function get(name) {
    validateArgumentsLength(arguments.length, 1);
    var entries = getInternalParamsState(this).entries;
    var key = name + '';
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) return entries[index].value;
    }
    return null;
  },
  // `URLSearchParams.prototype.getAll` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
  getAll: function getAll(name) {
    validateArgumentsLength(arguments.length, 1);
    var entries = getInternalParamsState(this).entries;
    var key = name + '';
    var result = [];
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) result.push(entries[index].value);
    }
    return result;
  },
  // `URLSearchParams.prototype.has` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
  has: function has(name) {
    validateArgumentsLength(arguments.length, 1);
    var entries = getInternalParamsState(this).entries;
    var key = name + '';
    var index = 0;
    while (index < entries.length) {
      if (entries[index++].key === key) return true;
    }
    return false;
  },
  // `URLSearchParams.prototype.set` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
  set: function set(name, value) {
    validateArgumentsLength(arguments.length, 1);
    var state = getInternalParamsState(this);
    var entries = state.entries;
    var found = false;
    var key = name + '';
    var val = value + '';
    var index = 0;
    var entry;
    for (; index < entries.length; index++) {
      entry = entries[index];
      if (entry.key === key) {
        if (found) entries.splice(index--, 1);
        else {
          found = true;
          entry.value = val;
        }
      }
    }
    if (!found) entries.push({ key: key, value: val });
    state.updateURL();
  },
  // `URLSearchParams.prototype.sort` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
  sort: function sort() {
    var state = getInternalParamsState(this);
    var entries = state.entries;
    // Array#sort is not stable in some engines
    var slice = entries.slice();
    var entry, entriesIndex, sliceIndex;
    entries.length = 0;
    for (sliceIndex = 0; sliceIndex < slice.length; sliceIndex++) {
      entry = slice[sliceIndex];
      for (entriesIndex = 0; entriesIndex < sliceIndex; entriesIndex++) {
        if (entries[entriesIndex].key > entry.key) {
          entries.splice(entriesIndex, 0, entry);
          break;
        }
      }
      if (entriesIndex === sliceIndex) entries.push(entry);
    }
    state.updateURL();
  },
  // `URLSearchParams.prototype.forEach` method
  forEach: function forEach(callback /* , thisArg */) {
    var entries = getInternalParamsState(this).entries;
    var boundFunction = bind(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
    var index = 0;
    var entry;
    while (index < entries.length) {
      entry = entries[index++];
      boundFunction(entry.value, entry.key, this);
    }
  },
  // `URLSearchParams.prototype.keys` method
  keys: function keys() {
    return new URLSearchParamsIterator(this, 'keys');
  },
  // `URLSearchParams.prototype.values` method
  values: function values() {
    return new URLSearchParamsIterator(this, 'values');
  },
  // `URLSearchParams.prototype.entries` method
  entries: function entries() {
    return new URLSearchParamsIterator(this, 'entries');
  }
}, { enumerable: true });

// `URLSearchParams.prototype[@@iterator]` method
redefine(URLSearchParamsPrototype, ITERATOR, URLSearchParamsPrototype.entries);

// `URLSearchParams.prototype.toString` method
// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
redefine(URLSearchParamsPrototype, 'toString', function toString() {
  var entries = getInternalParamsState(this).entries;
  var result = [];
  var index = 0;
  var entry;
  while (index < entries.length) {
    entry = entries[index++];
    result.push(serialize(entry.key) + '=' + serialize(entry.value));
  } return result.join('&');
}, { enumerable: true });

setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

$({ global: true, forced: !USE_NATIVE_URL }, {
  URLSearchParams: URLSearchParamsConstructor
});

// Wrap `fetch` for correct work with polyfilled `URLSearchParams`
// https://github.com/zloirock/core-js/issues/674
if (!USE_NATIVE_URL && typeof $fetch == 'function' && typeof Headers == 'function') {
  $({ global: true, enumerable: true, forced: true }, {
    fetch: function fetch(input /* , init */) {
      var args = [input];
      var init, body, headers;
      if (arguments.length > 1) {
        init = arguments[1];
        if (isObject(init)) {
          body = init.body;
          if (classof(body) === URL_SEARCH_PARAMS) {
            headers = init.headers ? new Headers(init.headers) : new Headers();
            if (!headers.has('content-type')) {
              headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
            }
            init = create(init, {
              body: createPropertyDescriptor(0, String(body)),
              headers: createPropertyDescriptor(0, headers)
            });
          }
        }
        args.push(init);
      } return $fetch.apply(this, args);
    }
  });
}

module.exports = {
  URLSearchParams: URLSearchParamsConstructor,
  getState: getInternalParamsState
};

},{"../internals/an-instance":37,"../internals/an-object":38,"../internals/classof":53,"../internals/create-iterator-constructor":59,"../internals/create-property-descriptor":61,"../internals/export":72,"../internals/function-bind-context":77,"../internals/get-built-in":79,"../internals/get-iterator":81,"../internals/get-iterator-method":80,"../internals/has":83,"../internals/internal-state":92,"../internals/is-object":96,"../internals/native-url":105,"../internals/object-create":110,"../internals/redefine":129,"../internals/redefine-all":128,"../internals/set-to-string-tag":138,"../internals/well-known-symbol":158,"../modules/es.array.iterator":171}],220:[function(require,module,exports){
'use strict';
// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
require('../modules/es.string.iterator');
var $ = require('../internals/export');
var DESCRIPTORS = require('../internals/descriptors');
var USE_NATIVE_URL = require('../internals/native-url');
var global = require('../internals/global');
var defineProperties = require('../internals/object-define-properties');
var redefine = require('../internals/redefine');
var anInstance = require('../internals/an-instance');
var has = require('../internals/has');
var assign = require('../internals/object-assign');
var arrayFrom = require('../internals/array-from');
var codeAt = require('../internals/string-multibyte').codeAt;
var toASCII = require('../internals/string-punycode-to-ascii');
var setToStringTag = require('../internals/set-to-string-tag');
var URLSearchParamsModule = require('../modules/web.url-search-params');
var InternalStateModule = require('../internals/internal-state');

var NativeURL = global.URL;
var URLSearchParams = URLSearchParamsModule.URLSearchParams;
var getInternalSearchParamsState = URLSearchParamsModule.getState;
var setInternalState = InternalStateModule.set;
var getInternalURLState = InternalStateModule.getterFor('URL');
var floor = Math.floor;
var pow = Math.pow;

var INVALID_AUTHORITY = 'Invalid authority';
var INVALID_SCHEME = 'Invalid scheme';
var INVALID_HOST = 'Invalid host';
var INVALID_PORT = 'Invalid port';

var ALPHA = /[A-Za-z]/;
var ALPHANUMERIC = /[\d+-.A-Za-z]/;
var DIGIT = /\d/;
var HEX_START = /^(0x|0X)/;
var OCT = /^[0-7]+$/;
var DEC = /^\d+$/;
var HEX = /^[\dA-Fa-f]+$/;
// eslint-disable-next-line no-control-regex
var FORBIDDEN_HOST_CODE_POINT = /[\u0000\u0009\u000A\u000D #%/:?@[\\]]/;
// eslint-disable-next-line no-control-regex
var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\u0000\u0009\u000A\u000D #/:?@[\\]]/;
// eslint-disable-next-line no-control-regex
var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u001F ]+|[\u0000-\u001F ]+$/g;
// eslint-disable-next-line no-control-regex
var TAB_AND_NEW_LINE = /[\u0009\u000A\u000D]/g;
var EOF;

var parseHost = function (url, input) {
  var result, codePoints, index;
  if (input.charAt(0) == '[') {
    if (input.charAt(input.length - 1) != ']') return INVALID_HOST;
    result = parseIPv6(input.slice(1, -1));
    if (!result) return INVALID_HOST;
    url.host = result;
  // opaque host
  } else if (!isSpecial(url)) {
    if (FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT.test(input)) return INVALID_HOST;
    result = '';
    codePoints = arrayFrom(input);
    for (index = 0; index < codePoints.length; index++) {
      result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
    }
    url.host = result;
  } else {
    input = toASCII(input);
    if (FORBIDDEN_HOST_CODE_POINT.test(input)) return INVALID_HOST;
    result = parseIPv4(input);
    if (result === null) return INVALID_HOST;
    url.host = result;
  }
};

var parseIPv4 = function (input) {
  var parts = input.split('.');
  var partsLength, numbers, index, part, radix, number, ipv4;
  if (parts.length && parts[parts.length - 1] == '') {
    parts.pop();
  }
  partsLength = parts.length;
  if (partsLength > 4) return input;
  numbers = [];
  for (index = 0; index < partsLength; index++) {
    part = parts[index];
    if (part == '') return input;
    radix = 10;
    if (part.length > 1 && part.charAt(0) == '0') {
      radix = HEX_START.test(part) ? 16 : 8;
      part = part.slice(radix == 8 ? 1 : 2);
    }
    if (part === '') {
      number = 0;
    } else {
      if (!(radix == 10 ? DEC : radix == 8 ? OCT : HEX).test(part)) return input;
      number = parseInt(part, radix);
    }
    numbers.push(number);
  }
  for (index = 0; index < partsLength; index++) {
    number = numbers[index];
    if (index == partsLength - 1) {
      if (number >= pow(256, 5 - partsLength)) return null;
    } else if (number > 255) return null;
  }
  ipv4 = numbers.pop();
  for (index = 0; index < numbers.length; index++) {
    ipv4 += numbers[index] * pow(256, 3 - index);
  }
  return ipv4;
};

// eslint-disable-next-line max-statements
var parseIPv6 = function (input) {
  var address = [0, 0, 0, 0, 0, 0, 0, 0];
  var pieceIndex = 0;
  var compress = null;
  var pointer = 0;
  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

  var char = function () {
    return input.charAt(pointer);
  };

  if (char() == ':') {
    if (input.charAt(1) != ':') return;
    pointer += 2;
    pieceIndex++;
    compress = pieceIndex;
  }
  while (char()) {
    if (pieceIndex == 8) return;
    if (char() == ':') {
      if (compress !== null) return;
      pointer++;
      pieceIndex++;
      compress = pieceIndex;
      continue;
    }
    value = length = 0;
    while (length < 4 && HEX.test(char())) {
      value = value * 16 + parseInt(char(), 16);
      pointer++;
      length++;
    }
    if (char() == '.') {
      if (length == 0) return;
      pointer -= length;
      if (pieceIndex > 6) return;
      numbersSeen = 0;
      while (char()) {
        ipv4Piece = null;
        if (numbersSeen > 0) {
          if (char() == '.' && numbersSeen < 4) pointer++;
          else return;
        }
        if (!DIGIT.test(char())) return;
        while (DIGIT.test(char())) {
          number = parseInt(char(), 10);
          if (ipv4Piece === null) ipv4Piece = number;
          else if (ipv4Piece == 0) return;
          else ipv4Piece = ipv4Piece * 10 + number;
          if (ipv4Piece > 255) return;
          pointer++;
        }
        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
        numbersSeen++;
        if (numbersSeen == 2 || numbersSeen == 4) pieceIndex++;
      }
      if (numbersSeen != 4) return;
      break;
    } else if (char() == ':') {
      pointer++;
      if (!char()) return;
    } else if (char()) return;
    address[pieceIndex++] = value;
  }
  if (compress !== null) {
    swaps = pieceIndex - compress;
    pieceIndex = 7;
    while (pieceIndex != 0 && swaps > 0) {
      swap = address[pieceIndex];
      address[pieceIndex--] = address[compress + swaps - 1];
      address[compress + --swaps] = swap;
    }
  } else if (pieceIndex != 8) return;
  return address;
};

var findLongestZeroSequence = function (ipv6) {
  var maxIndex = null;
  var maxLength = 1;
  var currStart = null;
  var currLength = 0;
  var index = 0;
  for (; index < 8; index++) {
    if (ipv6[index] !== 0) {
      if (currLength > maxLength) {
        maxIndex = currStart;
        maxLength = currLength;
      }
      currStart = null;
      currLength = 0;
    } else {
      if (currStart === null) currStart = index;
      ++currLength;
    }
  }
  if (currLength > maxLength) {
    maxIndex = currStart;
    maxLength = currLength;
  }
  return maxIndex;
};

var serializeHost = function (host) {
  var result, index, compress, ignore0;
  // ipv4
  if (typeof host == 'number') {
    result = [];
    for (index = 0; index < 4; index++) {
      result.unshift(host % 256);
      host = floor(host / 256);
    } return result.join('.');
  // ipv6
  } else if (typeof host == 'object') {
    result = '';
    compress = findLongestZeroSequence(host);
    for (index = 0; index < 8; index++) {
      if (ignore0 && host[index] === 0) continue;
      if (ignore0) ignore0 = false;
      if (compress === index) {
        result += index ? ':' : '::';
        ignore0 = true;
      } else {
        result += host[index].toString(16);
        if (index < 7) result += ':';
      }
    }
    return '[' + result + ']';
  } return host;
};

var C0ControlPercentEncodeSet = {};
var fragmentPercentEncodeSet = assign({}, C0ControlPercentEncodeSet, {
  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
});
var pathPercentEncodeSet = assign({}, fragmentPercentEncodeSet, {
  '#': 1, '?': 1, '{': 1, '}': 1
});
var userinfoPercentEncodeSet = assign({}, pathPercentEncodeSet, {
  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
});

var percentEncode = function (char, set) {
  var code = codeAt(char, 0);
  return code > 0x20 && code < 0x7F && !has(set, char) ? char : encodeURIComponent(char);
};

var specialSchemes = {
  ftp: 21,
  file: null,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};

var isSpecial = function (url) {
  return has(specialSchemes, url.scheme);
};

var includesCredentials = function (url) {
  return url.username != '' || url.password != '';
};

var cannotHaveUsernamePasswordPort = function (url) {
  return !url.host || url.cannotBeABaseURL || url.scheme == 'file';
};

var isWindowsDriveLetter = function (string, normalized) {
  var second;
  return string.length == 2 && ALPHA.test(string.charAt(0))
    && ((second = string.charAt(1)) == ':' || (!normalized && second == '|'));
};

var startsWithWindowsDriveLetter = function (string) {
  var third;
  return string.length > 1 && isWindowsDriveLetter(string.slice(0, 2)) && (
    string.length == 2 ||
    ((third = string.charAt(2)) === '/' || third === '\\' || third === '?' || third === '#')
  );
};

var shortenURLsPath = function (url) {
  var path = url.path;
  var pathSize = path.length;
  if (pathSize && (url.scheme != 'file' || pathSize != 1 || !isWindowsDriveLetter(path[0], true))) {
    path.pop();
  }
};

var isSingleDot = function (segment) {
  return segment === '.' || segment.toLowerCase() === '%2e';
};

var isDoubleDot = function (segment) {
  segment = segment.toLowerCase();
  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
};

// States:
var SCHEME_START = {};
var SCHEME = {};
var NO_SCHEME = {};
var SPECIAL_RELATIVE_OR_AUTHORITY = {};
var PATH_OR_AUTHORITY = {};
var RELATIVE = {};
var RELATIVE_SLASH = {};
var SPECIAL_AUTHORITY_SLASHES = {};
var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
var AUTHORITY = {};
var HOST = {};
var HOSTNAME = {};
var PORT = {};
var FILE = {};
var FILE_SLASH = {};
var FILE_HOST = {};
var PATH_START = {};
var PATH = {};
var CANNOT_BE_A_BASE_URL_PATH = {};
var QUERY = {};
var FRAGMENT = {};

// eslint-disable-next-line max-statements
var parseURL = function (url, input, stateOverride, base) {
  var state = stateOverride || SCHEME_START;
  var pointer = 0;
  var buffer = '';
  var seenAt = false;
  var seenBracket = false;
  var seenPasswordToken = false;
  var codePoints, char, bufferCodePoints, failure;

  if (!stateOverride) {
    url.scheme = '';
    url.username = '';
    url.password = '';
    url.host = null;
    url.port = null;
    url.path = [];
    url.query = null;
    url.fragment = null;
    url.cannotBeABaseURL = false;
    input = input.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, '');
  }

  input = input.replace(TAB_AND_NEW_LINE, '');

  codePoints = arrayFrom(input);

  while (pointer <= codePoints.length) {
    char = codePoints[pointer];
    switch (state) {
      case SCHEME_START:
        if (char && ALPHA.test(char)) {
          buffer += char.toLowerCase();
          state = SCHEME;
        } else if (!stateOverride) {
          state = NO_SCHEME;
          continue;
        } else return INVALID_SCHEME;
        break;

      case SCHEME:
        if (char && (ALPHANUMERIC.test(char) || char == '+' || char == '-' || char == '.')) {
          buffer += char.toLowerCase();
        } else if (char == ':') {
          if (stateOverride && (
            (isSpecial(url) != has(specialSchemes, buffer)) ||
            (buffer == 'file' && (includesCredentials(url) || url.port !== null)) ||
            (url.scheme == 'file' && !url.host)
          )) return;
          url.scheme = buffer;
          if (stateOverride) {
            if (isSpecial(url) && specialSchemes[url.scheme] == url.port) url.port = null;
            return;
          }
          buffer = '';
          if (url.scheme == 'file') {
            state = FILE;
          } else if (isSpecial(url) && base && base.scheme == url.scheme) {
            state = SPECIAL_RELATIVE_OR_AUTHORITY;
          } else if (isSpecial(url)) {
            state = SPECIAL_AUTHORITY_SLASHES;
          } else if (codePoints[pointer + 1] == '/') {
            state = PATH_OR_AUTHORITY;
            pointer++;
          } else {
            url.cannotBeABaseURL = true;
            url.path.push('');
            state = CANNOT_BE_A_BASE_URL_PATH;
          }
        } else if (!stateOverride) {
          buffer = '';
          state = NO_SCHEME;
          pointer = 0;
          continue;
        } else return INVALID_SCHEME;
        break;

      case NO_SCHEME:
        if (!base || (base.cannotBeABaseURL && char != '#')) return INVALID_SCHEME;
        if (base.cannotBeABaseURL && char == '#') {
          url.scheme = base.scheme;
          url.path = base.path.slice();
          url.query = base.query;
          url.fragment = '';
          url.cannotBeABaseURL = true;
          state = FRAGMENT;
          break;
        }
        state = base.scheme == 'file' ? FILE : RELATIVE;
        continue;

      case SPECIAL_RELATIVE_OR_AUTHORITY:
        if (char == '/' && codePoints[pointer + 1] == '/') {
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
          pointer++;
        } else {
          state = RELATIVE;
          continue;
        } break;

      case PATH_OR_AUTHORITY:
        if (char == '/') {
          state = AUTHORITY;
          break;
        } else {
          state = PATH;
          continue;
        }

      case RELATIVE:
        url.scheme = base.scheme;
        if (char == EOF) {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = base.query;
        } else if (char == '/' || (char == '\\' && isSpecial(url))) {
          state = RELATIVE_SLASH;
        } else if (char == '?') {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = '';
          state = QUERY;
        } else if (char == '#') {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = base.query;
          url.fragment = '';
          state = FRAGMENT;
        } else {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.path.pop();
          state = PATH;
          continue;
        } break;

      case RELATIVE_SLASH:
        if (isSpecial(url) && (char == '/' || char == '\\')) {
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
        } else if (char == '/') {
          state = AUTHORITY;
        } else {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          state = PATH;
          continue;
        } break;

      case SPECIAL_AUTHORITY_SLASHES:
        state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
        if (char != '/' || buffer.charAt(pointer + 1) != '/') continue;
        pointer++;
        break;

      case SPECIAL_AUTHORITY_IGNORE_SLASHES:
        if (char != '/' && char != '\\') {
          state = AUTHORITY;
          continue;
        } break;

      case AUTHORITY:
        if (char == '@') {
          if (seenAt) buffer = '%40' + buffer;
          seenAt = true;
          bufferCodePoints = arrayFrom(buffer);
          for (var i = 0; i < bufferCodePoints.length; i++) {
            var codePoint = bufferCodePoints[i];
            if (codePoint == ':' && !seenPasswordToken) {
              seenPasswordToken = true;
              continue;
            }
            var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
            if (seenPasswordToken) url.password += encodedCodePoints;
            else url.username += encodedCodePoints;
          }
          buffer = '';
        } else if (
          char == EOF || char == '/' || char == '?' || char == '#' ||
          (char == '\\' && isSpecial(url))
        ) {
          if (seenAt && buffer == '') return INVALID_AUTHORITY;
          pointer -= arrayFrom(buffer).length + 1;
          buffer = '';
          state = HOST;
        } else buffer += char;
        break;

      case HOST:
      case HOSTNAME:
        if (stateOverride && url.scheme == 'file') {
          state = FILE_HOST;
          continue;
        } else if (char == ':' && !seenBracket) {
          if (buffer == '') return INVALID_HOST;
          failure = parseHost(url, buffer);
          if (failure) return failure;
          buffer = '';
          state = PORT;
          if (stateOverride == HOSTNAME) return;
        } else if (
          char == EOF || char == '/' || char == '?' || char == '#' ||
          (char == '\\' && isSpecial(url))
        ) {
          if (isSpecial(url) && buffer == '') return INVALID_HOST;
          if (stateOverride && buffer == '' && (includesCredentials(url) || url.port !== null)) return;
          failure = parseHost(url, buffer);
          if (failure) return failure;
          buffer = '';
          state = PATH_START;
          if (stateOverride) return;
          continue;
        } else {
          if (char == '[') seenBracket = true;
          else if (char == ']') seenBracket = false;
          buffer += char;
        } break;

      case PORT:
        if (DIGIT.test(char)) {
          buffer += char;
        } else if (
          char == EOF || char == '/' || char == '?' || char == '#' ||
          (char == '\\' && isSpecial(url)) ||
          stateOverride
        ) {
          if (buffer != '') {
            var port = parseInt(buffer, 10);
            if (port > 0xFFFF) return INVALID_PORT;
            url.port = (isSpecial(url) && port === specialSchemes[url.scheme]) ? null : port;
            buffer = '';
          }
          if (stateOverride) return;
          state = PATH_START;
          continue;
        } else return INVALID_PORT;
        break;

      case FILE:
        url.scheme = 'file';
        if (char == '/' || char == '\\') state = FILE_SLASH;
        else if (base && base.scheme == 'file') {
          if (char == EOF) {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = base.query;
          } else if (char == '?') {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = '';
            state = QUERY;
          } else if (char == '#') {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = base.query;
            url.fragment = '';
            state = FRAGMENT;
          } else {
            if (!startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
              url.host = base.host;
              url.path = base.path.slice();
              shortenURLsPath(url);
            }
            state = PATH;
            continue;
          }
        } else {
          state = PATH;
          continue;
        } break;

      case FILE_SLASH:
        if (char == '/' || char == '\\') {
          state = FILE_HOST;
          break;
        }
        if (base && base.scheme == 'file' && !startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
          if (isWindowsDriveLetter(base.path[0], true)) url.path.push(base.path[0]);
          else url.host = base.host;
        }
        state = PATH;
        continue;

      case FILE_HOST:
        if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#') {
          if (!stateOverride && isWindowsDriveLetter(buffer)) {
            state = PATH;
          } else if (buffer == '') {
            url.host = '';
            if (stateOverride) return;
            state = PATH_START;
          } else {
            failure = parseHost(url, buffer);
            if (failure) return failure;
            if (url.host == 'localhost') url.host = '';
            if (stateOverride) return;
            buffer = '';
            state = PATH_START;
          } continue;
        } else buffer += char;
        break;

      case PATH_START:
        if (isSpecial(url)) {
          state = PATH;
          if (char != '/' && char != '\\') continue;
        } else if (!stateOverride && char == '?') {
          url.query = '';
          state = QUERY;
        } else if (!stateOverride && char == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (char != EOF) {
          state = PATH;
          if (char != '/') continue;
        } break;

      case PATH:
        if (
          char == EOF || char == '/' ||
          (char == '\\' && isSpecial(url)) ||
          (!stateOverride && (char == '?' || char == '#'))
        ) {
          if (isDoubleDot(buffer)) {
            shortenURLsPath(url);
            if (char != '/' && !(char == '\\' && isSpecial(url))) {
              url.path.push('');
            }
          } else if (isSingleDot(buffer)) {
            if (char != '/' && !(char == '\\' && isSpecial(url))) {
              url.path.push('');
            }
          } else {
            if (url.scheme == 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
              if (url.host) url.host = '';
              buffer = buffer.charAt(0) + ':'; // normalize windows drive letter
            }
            url.path.push(buffer);
          }
          buffer = '';
          if (url.scheme == 'file' && (char == EOF || char == '?' || char == '#')) {
            while (url.path.length > 1 && url.path[0] === '') {
              url.path.shift();
            }
          }
          if (char == '?') {
            url.query = '';
            state = QUERY;
          } else if (char == '#') {
            url.fragment = '';
            state = FRAGMENT;
          }
        } else {
          buffer += percentEncode(char, pathPercentEncodeSet);
        } break;

      case CANNOT_BE_A_BASE_URL_PATH:
        if (char == '?') {
          url.query = '';
          state = QUERY;
        } else if (char == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (char != EOF) {
          url.path[0] += percentEncode(char, C0ControlPercentEncodeSet);
        } break;

      case QUERY:
        if (!stateOverride && char == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (char != EOF) {
          if (char == "'" && isSpecial(url)) url.query += '%27';
          else if (char == '#') url.query += '%23';
          else url.query += percentEncode(char, C0ControlPercentEncodeSet);
        } break;

      case FRAGMENT:
        if (char != EOF) url.fragment += percentEncode(char, fragmentPercentEncodeSet);
        break;
    }

    pointer++;
  }
};

// `URL` constructor
// https://url.spec.whatwg.org/#url-class
var URLConstructor = function URL(url /* , base */) {
  var that = anInstance(this, URLConstructor, 'URL');
  var base = arguments.length > 1 ? arguments[1] : undefined;
  var urlString = String(url);
  var state = setInternalState(that, { type: 'URL' });
  var baseState, failure;
  if (base !== undefined) {
    if (base instanceof URLConstructor) baseState = getInternalURLState(base);
    else {
      failure = parseURL(baseState = {}, String(base));
      if (failure) throw TypeError(failure);
    }
  }
  failure = parseURL(state, urlString, null, baseState);
  if (failure) throw TypeError(failure);
  var searchParams = state.searchParams = new URLSearchParams();
  var searchParamsState = getInternalSearchParamsState(searchParams);
  searchParamsState.updateSearchParams(state.query);
  searchParamsState.updateURL = function () {
    state.query = String(searchParams) || null;
  };
  if (!DESCRIPTORS) {
    that.href = serializeURL.call(that);
    that.origin = getOrigin.call(that);
    that.protocol = getProtocol.call(that);
    that.username = getUsername.call(that);
    that.password = getPassword.call(that);
    that.host = getHost.call(that);
    that.hostname = getHostname.call(that);
    that.port = getPort.call(that);
    that.pathname = getPathname.call(that);
    that.search = getSearch.call(that);
    that.searchParams = getSearchParams.call(that);
    that.hash = getHash.call(that);
  }
};

var URLPrototype = URLConstructor.prototype;

var serializeURL = function () {
  var url = getInternalURLState(this);
  var scheme = url.scheme;
  var username = url.username;
  var password = url.password;
  var host = url.host;
  var port = url.port;
  var path = url.path;
  var query = url.query;
  var fragment = url.fragment;
  var output = scheme + ':';
  if (host !== null) {
    output += '//';
    if (includesCredentials(url)) {
      output += username + (password ? ':' + password : '') + '@';
    }
    output += serializeHost(host);
    if (port !== null) output += ':' + port;
  } else if (scheme == 'file') output += '//';
  output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
  if (query !== null) output += '?' + query;
  if (fragment !== null) output += '#' + fragment;
  return output;
};

var getOrigin = function () {
  var url = getInternalURLState(this);
  var scheme = url.scheme;
  var port = url.port;
  if (scheme == 'blob') try {
    return new URL(scheme.path[0]).origin;
  } catch (error) {
    return 'null';
  }
  if (scheme == 'file' || !isSpecial(url)) return 'null';
  return scheme + '://' + serializeHost(url.host) + (port !== null ? ':' + port : '');
};

var getProtocol = function () {
  return getInternalURLState(this).scheme + ':';
};

var getUsername = function () {
  return getInternalURLState(this).username;
};

var getPassword = function () {
  return getInternalURLState(this).password;
};

var getHost = function () {
  var url = getInternalURLState(this);
  var host = url.host;
  var port = url.port;
  return host === null ? ''
    : port === null ? serializeHost(host)
    : serializeHost(host) + ':' + port;
};

var getHostname = function () {
  var host = getInternalURLState(this).host;
  return host === null ? '' : serializeHost(host);
};

var getPort = function () {
  var port = getInternalURLState(this).port;
  return port === null ? '' : String(port);
};

var getPathname = function () {
  var url = getInternalURLState(this);
  var path = url.path;
  return url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
};

var getSearch = function () {
  var query = getInternalURLState(this).query;
  return query ? '?' + query : '';
};

var getSearchParams = function () {
  return getInternalURLState(this).searchParams;
};

var getHash = function () {
  var fragment = getInternalURLState(this).fragment;
  return fragment ? '#' + fragment : '';
};

var accessorDescriptor = function (getter, setter) {
  return { get: getter, set: setter, configurable: true, enumerable: true };
};

if (DESCRIPTORS) {
  defineProperties(URLPrototype, {
    // `URL.prototype.href` accessors pair
    // https://url.spec.whatwg.org/#dom-url-href
    href: accessorDescriptor(serializeURL, function (href) {
      var url = getInternalURLState(this);
      var urlString = String(href);
      var failure = parseURL(url, urlString);
      if (failure) throw TypeError(failure);
      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
    }),
    // `URL.prototype.origin` getter
    // https://url.spec.whatwg.org/#dom-url-origin
    origin: accessorDescriptor(getOrigin),
    // `URL.prototype.protocol` accessors pair
    // https://url.spec.whatwg.org/#dom-url-protocol
    protocol: accessorDescriptor(getProtocol, function (protocol) {
      var url = getInternalURLState(this);
      parseURL(url, String(protocol) + ':', SCHEME_START);
    }),
    // `URL.prototype.username` accessors pair
    // https://url.spec.whatwg.org/#dom-url-username
    username: accessorDescriptor(getUsername, function (username) {
      var url = getInternalURLState(this);
      var codePoints = arrayFrom(String(username));
      if (cannotHaveUsernamePasswordPort(url)) return;
      url.username = '';
      for (var i = 0; i < codePoints.length; i++) {
        url.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
      }
    }),
    // `URL.prototype.password` accessors pair
    // https://url.spec.whatwg.org/#dom-url-password
    password: accessorDescriptor(getPassword, function (password) {
      var url = getInternalURLState(this);
      var codePoints = arrayFrom(String(password));
      if (cannotHaveUsernamePasswordPort(url)) return;
      url.password = '';
      for (var i = 0; i < codePoints.length; i++) {
        url.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
      }
    }),
    // `URL.prototype.host` accessors pair
    // https://url.spec.whatwg.org/#dom-url-host
    host: accessorDescriptor(getHost, function (host) {
      var url = getInternalURLState(this);
      if (url.cannotBeABaseURL) return;
      parseURL(url, String(host), HOST);
    }),
    // `URL.prototype.hostname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hostname
    hostname: accessorDescriptor(getHostname, function (hostname) {
      var url = getInternalURLState(this);
      if (url.cannotBeABaseURL) return;
      parseURL(url, String(hostname), HOSTNAME);
    }),
    // `URL.prototype.port` accessors pair
    // https://url.spec.whatwg.org/#dom-url-port
    port: accessorDescriptor(getPort, function (port) {
      var url = getInternalURLState(this);
      if (cannotHaveUsernamePasswordPort(url)) return;
      port = String(port);
      if (port == '') url.port = null;
      else parseURL(url, port, PORT);
    }),
    // `URL.prototype.pathname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-pathname
    pathname: accessorDescriptor(getPathname, function (pathname) {
      var url = getInternalURLState(this);
      if (url.cannotBeABaseURL) return;
      url.path = [];
      parseURL(url, pathname + '', PATH_START);
    }),
    // `URL.prototype.search` accessors pair
    // https://url.spec.whatwg.org/#dom-url-search
    search: accessorDescriptor(getSearch, function (search) {
      var url = getInternalURLState(this);
      search = String(search);
      if (search == '') {
        url.query = null;
      } else {
        if ('?' == search.charAt(0)) search = search.slice(1);
        url.query = '';
        parseURL(url, search, QUERY);
      }
      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
    }),
    // `URL.prototype.searchParams` getter
    // https://url.spec.whatwg.org/#dom-url-searchparams
    searchParams: accessorDescriptor(getSearchParams),
    // `URL.prototype.hash` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hash
    hash: accessorDescriptor(getHash, function (hash) {
      var url = getInternalURLState(this);
      hash = String(hash);
      if (hash == '') {
        url.fragment = null;
        return;
      }
      if ('#' == hash.charAt(0)) hash = hash.slice(1);
      url.fragment = '';
      parseURL(url, hash, FRAGMENT);
    })
  });
}

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
redefine(URLPrototype, 'toJSON', function toJSON() {
  return serializeURL.call(this);
}, { enumerable: true });

// `URL.prototype.toString` method
// https://url.spec.whatwg.org/#URL-stringification-behavior
redefine(URLPrototype, 'toString', function toString() {
  return serializeURL.call(this);
}, { enumerable: true });

if (NativeURL) {
  var nativeCreateObjectURL = NativeURL.createObjectURL;
  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
  // `URL.createObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
  // eslint-disable-next-line no-unused-vars
  if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
    return nativeCreateObjectURL.apply(NativeURL, arguments);
  });
  // `URL.revokeObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
  // eslint-disable-next-line no-unused-vars
  if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
    return nativeRevokeObjectURL.apply(NativeURL, arguments);
  });
}

setToStringTag(URLConstructor, 'URL');

$({ global: true, forced: !USE_NATIVE_URL, sham: !DESCRIPTORS }, {
  URL: URLConstructor
});

},{"../internals/an-instance":37,"../internals/array-from":41,"../internals/descriptors":65,"../internals/export":72,"../internals/global":82,"../internals/has":83,"../internals/internal-state":92,"../internals/native-url":105,"../internals/object-assign":109,"../internals/object-define-properties":111,"../internals/redefine":129,"../internals/set-to-string-tag":138,"../internals/string-multibyte":143,"../internals/string-punycode-to-ascii":144,"../modules/es.string.iterator":209,"../modules/web.url-search-params":219}],221:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}]},{},[6])

