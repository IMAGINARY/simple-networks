import { cloneDeep, isEmpty, uniq } from 'lodash';
import IOps, { Interval } from 'interval-arithmetic';

import { Validator } from './validator';
import Model from '../neural-network/model';
import * as activationFunctions from '../neural-network/activation-functions';
import FeedForwardNetwork from '../neural-network/network';
import MathExpression from '../util/math-expression';
import generateLayout from '../util/generate-layout';
import transpose from '../util/transpose';

import { levelSchema } from './level-schema';
import { normalizeAndStripBCP47Tag } from '../util/language-utils';

const validate = Validator.createValidateFunction(levelSchema);

export default function load(levelObj, levelUrl) {
  const { valid, errors } = validate(levelObj);
  if (!valid) {
    console.error(errors);
    throw new Error(`Unable to validate level file ${levelUrl.href}. Please check the developer console for details.`);
  }

  const { nodeDefaults, edgeDefaults } = processDefaultProperties(levelObj.defaultProperties);

  levelObj.nodes = uniq(
    levelObj.edges.map(e => Object.values(FeedForwardNetwork.nodeIdsFromEdgeId(e))).flat()
  );

  const nodeProperties = processNodes(levelObj.nodes, levelObj.properties ?? {}, nodeDefaults);
  const edgeProperties = processEdges(levelObj.edges, levelObj.properties ?? {}, edgeDefaults);
  const allProperties = Object.assign({}, nodeProperties, edgeProperties);

  const edgeObjs = levelObj.edges.map(eId => FeedForwardNetwork.nodeIdsFromEdgeId(eId));
  const network = new FeedForwardNetwork(edgeObjs);
  const inputNodeIds = network.inputNodeIds;
  const inputs = Object.fromEntries(inputNodeIds.map(id => [id, nodeProperties?.[id]?.input ?? 0]));
  const training = processTraining(levelObj.training, network);

  widenInputRange(network, allProperties, levelObj.training.inputs);

  const model = new Model(network, allProperties);

  const layout = levelObj.layout ?? generateLayout(network);
  const strings = processStrings(
    levelObj.title,
    levelObj.description,
    levelObj.labels,
    "en",
    model.network
  );
  
  return { model, inputs, layout, training, strings };
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
  return Object.assign(
    {},
    ...nodeIds
      .map(nodeId => FeedForwardNetwork.canonicalizeNodeId(nodeId))
      .map(nodeId => {
        const nodeProperties = allProperties[nodeId];
        const processedProperties = processNodeProperties(nodeProperties, defaultProperties);
        return isEmpty(processedProperties) ? {} : { [nodeId]: processedProperties };
      })
  );
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
  return Object.assign(
    {},
    ...edgeIds
      .map(edgeId => FeedForwardNetwork.canonicalizeEdgeId(edgeId))
      .map(edgeId => {
        const edgeProperties = allProperties[edgeId];
        const processedProperties = processEdgeProperties(edgeProperties, defaults);
        return isEmpty(processedProperties) ? {} : { [edgeId]: processedProperties };
      })
  );
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

function widenInputRange(network, properties, trainingInputs) {
  const p = properties;
  const ensureInputProps = id => {
    p[id] = p[id] ?? {};
    p[id].inputProps = p[id].inputProps ?? {};
    return p[id].inputProps;
  };
  network.inputNodeIds.forEach(id => {
    if (typeof trainingInputs?.[id] !== 'undefined') {
      const inputProps = ensureInputProps(id);
      const inputsForId = trainingInputs[id];
      if (Array.isArray(inputProps.range)) {
        // Add training inputs to list of possible inputs
        inputProps.range = uniq(inputProps.range.concat(inputsForId));
      } else {
        // Use the hull of the current range and the training inputs range
        const minRange = new Interval(Math.min(...inputsForId), Math.max(...inputsForId));
        inputProps.range = IOps.hull(inputProps.range ?? minRange, minRange);
      }
    }
    if (typeof p?.[id]?.input !== 'undefined') {
      const inputProps = ensureInputProps(id);
      if (Array.isArray(inputProps.range)) {
        // Add initial inputs to list of possible inputs
        inputProps.range = uniq([...inputProps.range, p[id].input]);
      } else {
        // Use the hull of the current range and the initial inputs
        inputProps.range = IOps.hull(inputProps.range, new Interval(p[id].input));
      }
    }
  });
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
