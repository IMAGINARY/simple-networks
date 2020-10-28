import jsYaml from 'js-yaml';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';

import { validate } from './validate';
import Model from '../neural-network/model';
import { Interval } from 'interval-arithmetic';
import * as activationFunctions from '../neural-network/activation-functions';
import FeedForwardNetwork from '../neural-network/network';
import MathExpression from '../util/math-expression';
import generateLayout from '../neural-network-mvc/generate-layout';

export default async function load(url) {
  const response = await fetch(url.href);
  const levelSrc = await response.text();
  const levelObj = jsYaml.safeLoad(levelSrc);
  const { valid, errors } = validate(levelObj);
  if (!valid) {
    console.log(errors);
    throw new Error(`Unable to validate level file ${url.href}. Please check the developer console for details.`);
  }

  console.log(levelObj.defaultProperties);
  const { nodeDefaults, edgeDefaults } = processDefaultProperties(levelObj.defaultProperties);

  const allProperties = levelObj.properties ?? {};
  const nodes = processNodes(levelObj.nodes, allProperties, nodeDefaults);
  const edges = processEdges(levelObj.edges, allProperties, edgeDefaults);

  console.log({ nodes, edges });
  const model = new Model(nodes, edges);
  const layout = levelObj.layout ?? generateLayout(model.network);
  const training = processTraining(levelObj.training, model.network);
  const strings = processStrings(
    levelObj.title,
    levelObj.description,
    levelObj.labels,
    "en",
    model.network
  );

  return { model, layout, training, strings };
}

function processDefaultProperties(defaultProperties) {
  if (typeof defaultProperties === 'undefined') {
    defaultProperties = {};
  }

  const nodeDefaults = {};
  if ('input' in defaultProperties) {
    const { value, props } = processValueOrRange(defaultProperties.input);
    assignIfDefined(nodeDefaults, 'input', value);
    assignIfDefined(nodeDefaults, 'inputProps', props);
  }
  if ('bias' in defaultProperties) {
    const { value, props } = processValueOrRange(defaultProperties.bias);
    assignIfDefined(nodeDefaults, 'bias', value);
    assignIfDefined(nodeDefaults, 'biasProps', props);
  }
  if ('activationFunc' in defaultProperties) {
    nodeDefaults.activationFunc = processActivationFunc(propsIn.activationFunc);
  }

  const edgeDefaults = {};
  if ('weight' in defaultProperties) {
    const { value, props } = processValueOrRange(defaultProperties.weight);
    assignIfDefined(edgeDefaults, 'weight', value);
    assignIfDefined(edgeDefaults, 'weightProps', props);
  }

  return { nodeDefaults, edgeDefaults };
}

function processNodes(nodeIds, allProperties, defaultProperties) {
  return nodeIds
    .map(nodeId => FeedForwardNetwork.canonicalizeNodeId(nodeId))
    .map(nodeId => {
      const result = { id: nodeId };
      const nodeProperties = allProperties[nodeId];
      const processedProperties = processNodeProperties(nodeProperties, defaultProperties);
      if (!isEmpty(processedProperties)) {
        result.properties = processedProperties;
      }
      return result;
    });
}

function processNodeProperties(propsIn, defaults) {
  const propsOut = cloneDeep(defaults);
  if (typeof propsIn !== 'undefined') {
    if (typeof propsIn.input !== 'undefined') {
      const { value, props } = processValueOrRange(propsIn.input);
      assignIfDefined(propsOut, 'input', value);
      assignIfDefined(propsOut, 'inputProps', props);
    }
    if (typeof propsIn.bias !== 'undefined') {
      const { value, props } = processValueOrRange(propsIn.bias);
      assignIfDefined(propsOut, 'bias', value);
      assignIfDefined(propsOut, 'biasProps', props);
    }
    if (typeof propsIn.activationFunc !== 'undefined') {
      propsOut.activationFunc = processActivationFunc(propsIn.activationFunc);
    }
  }
  return propsOut;
}

function processEdges(edgeIds, allProperties, defaults) {
  return edgeIds
    .map(edgeId => FeedForwardNetwork.canonicalizeEdgeId(edgeId))
    .map(edgeId => {
      const { from, to } = FeedForwardNetwork.nodeIdsFromEdgeId(edgeId);
      const result = { from, to };
      const edgeProperties = allProperties[edgeId];
      const processedProperties = processEdgeProperties(edgeProperties, defaults);
      if (!isEmpty(processedProperties)) {
        result.properties = processedProperties;
      }
      return result;
    });
}

function processEdgeProperties(propsIn, defaults) {
  const propsOut = cloneDeep(defaults);
  if (typeof propsIn !== 'undefined') {
    if (typeof propsIn.weight !== 'undefined') {
      const { value, props } = processValueOrRange(propsIn.weight);
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
    return { value: valueOrRange };
  } else {
    const result = {};
    if (typeof valueOrRange.value !== 'undefined') {
      result.value = valueOrRange.value;
    }
    if (typeof valueOrRange.train !== 'undefined') {
      result.props = result.props ?? {};
      result.props.train = valueOrRange.train;
    }
    if (typeof valueOrRange.range !== 'undefined') {
      result.props = result.props ?? {};
      result.props.range = processRange(valueOrRange.range);
    }
    return result;
  }
}

function processRange(range) {
  if (Array.isArray(range)) {
    return range;
  } else {
    return new Interval(range.min, range.max);
  }
}

function processActivationFunc(activationFuncName) {
  return activationFunctions[activationFuncName];
}

function processTraining({ inputs, outputs }, network) {
  const result = {};

  if (typeof inputs === 'undefined') {
    result.inputs = [];
  } else {
    // check if all input nodes are listed and have equal number of values
    inputs = canonicalizedNodeIdProperties(inputs);
    const inputsInOrder = network.inputNodes.map(({ id }) => inputs[id]);
    const firstMissingInput = inputsInOrder.findIndex(entry => typeof entry === 'undefined');
    if (firstMissingInput >= 0) {
      throw new Error(`Missing training inputs for node ${network.inputNodes[firstMissingInput].id}`);
    }
    const lengths = inputsInOrder.map(values => values.length);
    const minLength = Math.min(...lengths);
    const maxLength = Math.max(...lengths);
    if (minLength === maxLength) {
      result.inputs = transpose(inputsInOrder);
    } else {
      throw new Error(`All input nodes must have equal number of training samples (min: ${minLength}, max: ${maxLength})`);
    }
  }

  // check if all output nodes are listed
  outputs = canonicalizedNodeIdProperties(outputs);
  const targetActivationFuncsInOrder = network.outputNodes
    .map(({ id }) => id)
    .map(id => typeof outputs[id] === 'undefined' ?
      undefined :
      processExpression(outputs[id], network)
    );
  const firstMissingOutput = targetActivationFuncsInOrder
    .findIndex(entry => typeof entry === 'undefined');
  if (firstMissingOutput >= 0) {
    throw new Error(`Missing training outputs for node ${network.outputNodes[firstMissingOutput].id}`);
  }
  result.targetActivationFuncs = targetActivationFuncsInOrder;

  return result;
}

function transpose(arr2d) {
  if (arr2d.length === 0) {
    return [];
  } else {
    const result = new Array(arr2d[0].length).fill([]);
    for (let i = 0; i < arr2d.length; ++i) {
      for (let j = 0; j < arr2d[i].length; ++j) {
        result[j][i] = arr2d[i][j];
      }
    }
    return result;
  }
}

function canonicalizedNodeIdProperties(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([id, value]) => [FeedForwardNetwork.canonicalizeNodeId(id), value])
  );
}

function processExpression(expression, network) {
  const mathExpr = new MathExpression(expression);

  // Test if the expressions only references input nodes and throw exception if not.
  const varTestProxy = new Proxy({}, {
    has: function (target, property) {
      if (!network.hasNode(property)) {
        throw new ReferenceError(`Unknown input node ${property} in expression ${expression}`);
      } else {
        return true;
      }
    },
    get: function (target, property) {
      return this.has(target, property) ? Number.NaN : Number.NaN;
    },
  });
  mathExpr(varTestProxy);

  return mathExpr;
}

function processStrings(title, description, allLabels, defaultLanguage, network) {
  const result = {};
  if (typeof title !== 'undefined') {
    result.title = processStringOrI18N(title, defaultLanguage);
  }
  if (typeof description !== 'undefined') {
    result.description = processStringOrI18N(description, defaultLanguage);
  }
  if (typeof allLabels !== 'undefined') {
    console.log(allLabels)
    result.labels = Object.fromEntries(
      Object.entries(allLabels).map(
        ([id, labelsForId]) => processLabelsForId(id, labelsForId, defaultLanguage, network)
      )
    );
  }
  return result;
}

function processLabelsForId(id, labels, defaultLanguage, network) {
  const hasNode = network.hasNode(id);
  const hasEdge = (() => {
    try {
      const { from, to } = FeedForwardNetwork.nodeIdsFromEdgeId(id);
      return network.hasEdge(from, to);
    } catch (e) {
      return false;
    }
  })();

  // Check for errors
  if (!hasNode && !hasEdge) {
    throw new Error(`Network has no node or edge named '${id}'`);
  } else if (hasNode && hasEdge) {
    throw new Error(`Id '${id}' is ambiguous: both, node and edge, exist with this name`);
  }

  // Process either as node or edge label
  const canonicalId = hasNode ?
    FeedForwardNetwork.canonicalizeNodeId(id) :
    FeedForwardNetwork.canonicalizeEdgeId(id);

  return [
    canonicalId,
    Object.fromEntries(
      Object.entries(labels)
        .map(([prop, label]) => [prop, processLabel(label, defaultLanguage)])
    )
  ];
}

function processLabel(label, defaultLanguage) {
  if (typeof label === 'string') {
    return { text: processStringOrI18N(label, defaultLanguage) };
  } else {
    const result = {};
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
    const result = {};
    result[defaultLanguage] = text;
    return result;
  } else {
    return text;
  }
}

export { load };
