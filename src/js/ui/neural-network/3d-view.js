import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EventEmitter } from 'events';
import { defaultsDeep } from 'lodash';

import EventManager from '../../util/event-manager';
import NodeCoordinates from './node-coordinates';
import { level as levelDefaults } from '../defaults';
import IOps, { Interval } from 'interval-arithmetic';
import $ from 'jquery';
import FeedForwardNetwork from '../../neural-network/network';

export default class View extends EventEmitter {
  constructor({ levelName, predictionModel, layout, strings, i18n, options = levelDefaults }) {
    super();
    this._levelName = levelName;
    this._predictionModel = predictionModel;
    this._network = predictionModel.getNetwork();
    this._strings = strings;
    this._i18n = i18n;
    this._formatNumber = i18n.getNumberFormatter();

    this._options = defaultsDeep({ ...options }, levelDefaults);

    this._eventManager = new EventManager();

    this._computeGeometricParameters();

    this._coords = new NodeCoordinates(layout);

    const predictionExt = predictionModel.computePredictions();
    this._flowScale = this._computeFlowScale(predictionExt);

    const ids = this._network.ids;
    /*
        const immutableProps = this._computeImmutableProps();
        this._props = Object.assign({}, ...ids.map(id => ({ [id]: immutableProps[id] ?? {} })));
        this._updateProps(predictionExt);
    */

    this._localizables = [];
    this._tippies = [];

    this._viewUpdaters = this._setupScene();
    this.localize();

    if (!new URLSearchParams(location.search).has('tooltip')) {
      this._tippies.forEach(t => t.hide());
    }
  }

  _setupScene() {
    console.log('============================');

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const aspectRatio = this._coords.width / this._coords.height;
    const [maxWidth, maxHeight] = [800, 600];
    let width, height;
    if (aspectRatio * maxHeight > maxWidth) {
      width = maxWidth;
      height = maxWidth / aspectRatio;
    } else {
      width = maxHeight * aspectRatio;
      height = maxHeight;
    }
    console.log(this._levelName, this._coords.width, this._coords.height, width, height);

    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff, 1.0);
    const $container = $(this._options.networkContainer).empty();
    $container.append(renderer.domElement);
    renderer.domElement.style.outline = '1px red solid';

    const camera = new THREE.OrthographicCamera(
      -this._coords.width / 2,
      +this._coords.width / 2,
      -this._coords.height / 2,
      +this._coords.height / 2,
      -1000,
      1000
    );
    {
      const isometricAngle = Math.atan(1 / Math.sqrt(2));
      const cameraRotation = new THREE.Matrix4().makeRotationX(isometricAngle);
      const cameraTranslation = new THREE.Matrix4().makeTranslation(0, 0, 1);
      const cameraMatrix = new THREE.Matrix4().multiplyMatrices(cameraRotation, cameraTranslation);
      cameraMatrix.decompose(camera.position, camera.quaternion, camera.scale);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', () => renderer.render(this._scene, camera));
    controls.update();

    this._scene = new THREE.Scene();
    this._scene.position.set(-(this._coords.width - 1) / 2, -(this._coords.height - 1) / 2, 0);
    const axesHelper = new THREE.AxesHelper(0.5);
    axesHelper.position.set((this._coords.width - 1) / 2, (this._coords.height - 1) / 2, 0);
    this._scene.add(axesHelper);

    const networkGroup = new THREE.Group();
    this._scene.add(networkGroup);

    const animators = [];
    this._network.inputNodeIds.forEach((nodeId) => {
      animators.push(this._createAnimator(
        (value) => this._predictionModel.setInput(nodeId, value),
        this._predictionModel._networkModel.properties[nodeId].inputProps.range
      ));
    });
    this._network.innerNodeIds.forEach((nodeId) => {
      animators.push(this._createAnimator(
        (value) => this._predictionModel._networkModel.setBias(nodeId, value),
        this._predictionModel._networkModel.properties[nodeId].biasProps.range
      ));
    });
    this._network.outputNodeIds.forEach((nodeId) => {
      animators.push(this._createAnimator(
        (value) => this._predictionModel._networkModel.setBias(nodeId, value),
        this._predictionModel._networkModel.properties[nodeId].biasProps.range
      ));
    });
    this._network.edgeIds.forEach((edgeId) => {
      animators.push(this._createAnimator(
        (value) => this._predictionModel._networkModel.setWeight(edgeId, value),
        this._predictionModel._networkModel.properties[edgeId].weightProps.range
      ));
    });

    const animate = (ts) => {
      requestAnimationFrame(animate);

      animators.forEach(animator => animator.update(ts));

      const predictionExt = this._predictionModel.computePredictions();
      console.log(predictionExt);
      const nodeObjs = this._createNodeGeometries(predictionExt);
      const edgeObjs = this._createEdgeGeometries(predictionExt);

      networkGroup.clear();
      networkGroup.add(...nodeObjs);
      networkGroup.add(...edgeObjs);

      renderer.render(this._scene, camera);
    };
    requestAnimationFrame(animate);

    return [];
  }

  _createAnimator(setter, range) {
    let startTimestamp = null;
    let duration = 5000;
    let start = null;
    let current = null;
    let target = null;

    const animator = {};
    animator.reset = () => {
      const r = Math.random() > 0.5 ? Math.random() : 1 - Math.random();
      target = range.lo * (1 - r) + range.hi * r;
      start = current === null ? (range.lo + range.hi) / 2 : current;
      startTimestamp = performance.now();
    };
    animator.update = (timestamp) => {
      const t = (timestamp - startTimestamp) / duration;
      current = start * (1 - t) + target * t;
      setter(current);
      if (t >= 1.0) {
        animator.reset();
      }
    };
    animator.reset();
    return animator;
  }

  _createNodeGeometries(predictionExt) {
    const nodeIds = this._coords.sortXY().filter((id) => this._network.hasNode(id));
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x555555 });
    const meshGeometry = new THREE.CylinderBufferGeometry(
      0.1,
      0.1,
      1,
      40
    );
    const edgeGeometry = new THREE.EdgesGeometry(meshGeometry);

    const sceneObjects = [];
    for (let nodeId of nodeIds) {
      const meshMaterial = new THREE.MeshBasicMaterial({
        color: activationColor(predictionExt[nodeId].activation),
        opacity: 0.5,
        transparent: true,
      });
      const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
      const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);

      const orient = new THREE.Group();
      orient.translateZ(0.5);
      orient.rotateX(Math.PI * 90 / 180);
      orient.add(mesh);
      orient.add(edges);

      const scale = new THREE.Group();
      scale.scale.set(1, 1, predictionExt[nodeId].activation * this._flowScale);
      scale.add(orient);

      console.log(nodeId);
      const group = new THREE.Group();
      const { x, y } = this._coords.abs(nodeId);
      console.log(nodeId, x, y);
      group.position.set(x, y, 0);
      group.add(scale);
      sceneObjects.push(group);
    }
    return sceneObjects;
  }

  _createEdgeGeometries(predictionExt) {
    const nodeIds = this._network.nodeIds;
    const edgeIds = this._network.edgeIds;
    const partialSums = Object.fromEntries(nodeIds.map((id) => [id, predictionExt[id].bias]));
    const sceneObjects = [];
    for (const edgeId of edgeIds) {
      const { to: toId } = FeedForwardNetwork.nodeIdsFromEdgeId(edgeId);
      const obj = this._createEdgeGeometry(predictionExt, edgeId, partialSums[toId]);
      sceneObjects.push(obj);
      partialSums[toId] += predictionExt[edgeId].toActivation;
    }
    return sceneObjects;
  }

  _createEdgeGeometry(predictionExt, edgeId, toPartialSum) {
    const meshMaterial = new THREE.MeshBasicMaterial({
      color: activationColor(predictionExt[edgeId].toActivation),
      opacity: 0.5,
      transparent: true,
    });
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x555555 });

    const { from: fromId, to: toId } = FeedForwardNetwork.nodeIdsFromEdgeId(edgeId);

    const { x: fromX, y: fromY } = this._coords.abs(fromId);
    const { x: toX, y: toY } = this._coords.abs(toId);

    const NUM_POINTS = 50;
    const NODE_RADIUS = 0.1;
    const { fromActivation, toActivation } = predictionExt[edgeId];
    const fromActivationScaled = fromActivation * this._flowScale;
    const toActivationScaled = toActivation * this._flowScale;
    const toPartialSumScaled = toPartialSum * this._flowScale;

    const curveFront = new THREE.CubicBezierCurve3(
      new THREE.Vector3(fromX, fromY + NODE_RADIUS, 0),
      new THREE.Vector3((fromX + toX) * 0.5, fromY + NODE_RADIUS, 0),
      new THREE.Vector3((fromX + toX) * 0.5, toY + NODE_RADIUS, toPartialSumScaled),
      new THREE.Vector3(toX, toY + NODE_RADIUS, toPartialSumScaled)
    );
    const curveFrontActivated = new THREE.CubicBezierCurve3(
      new THREE.Vector3(fromX, fromY + NODE_RADIUS, fromActivationScaled),
      new THREE.Vector3((fromX + toX) * 0.5, fromY + NODE_RADIUS, fromActivationScaled),
      new THREE.Vector3((fromX + toX) * 0.5,
        toY + NODE_RADIUS,
        toPartialSumScaled + toActivationScaled),
      new THREE.Vector3(toX, toY + NODE_RADIUS, toPartialSumScaled + toActivationScaled)
    );
    const curveBack = new THREE.CubicBezierCurve3(
      new THREE.Vector3(fromX, fromY - NODE_RADIUS, 0),
      new THREE.Vector3((fromX + toX) * 0.5, fromY - NODE_RADIUS, 0),
      new THREE.Vector3((fromX + toX) * 0.5, toY - NODE_RADIUS, toPartialSumScaled),
      new THREE.Vector3(toX, toY - NODE_RADIUS, toPartialSumScaled)
    );
    const curveBackActivated = new THREE.CubicBezierCurve3(
      new THREE.Vector3(fromX, fromY - NODE_RADIUS, fromActivationScaled),
      new THREE.Vector3((fromX + toX) * 0.5, fromY - NODE_RADIUS, fromActivationScaled),
      new THREE.Vector3((fromX + toX) * 0.5,
        toY - NODE_RADIUS,
        toPartialSumScaled + toActivationScaled),
      new THREE.Vector3(toX, toY - NODE_RADIUS, toPartialSumScaled + toActivationScaled)
    );
    const pointsFront = [
      ...curveFront.getPoints(NUM_POINTS),
      ...curveFrontActivated.getPoints(NUM_POINTS).reverse(),
      curveFront.getPoint(0)
    ];
    const frontEdgeGeometry = new THREE.BufferGeometry().setFromPoints(pointsFront);
    //  const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
    const frontEdges = new THREE.Line(frontEdgeGeometry, edgeMaterial);
    const pointsBack = [
      ...curveBack.getPoints(NUM_POINTS),
      ...curveBackActivated.getPoints(NUM_POINTS).reverse(),
      curveBack.getPoint(0)
    ];
    const backEdgeGeometry = new THREE.BufferGeometry().setFromPoints(pointsBack);
    //  const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
    const backEdges = new THREE.Line(backEdgeGeometry, edgeMaterial);

    const frontBackConnectorGeometry = new THREE.Geometry();
    frontBackConnectorGeometry.vertices.push(
      curveFront.getPoint(0), curveBack.getPoint(0),
      curveFrontActivated.getPoint(0), curveBackActivated.getPoint(0),
      curveFront.getPoint(1), curveBack.getPoint(1),
      curveFrontActivated.getPoint(1), curveBackActivated.getPoint(1),
    );
    const frontBackConnectorEdges = new THREE.LineSegments(frontBackConnectorGeometry,
      edgeMaterial);

    const meshGeometry = meshFromBezierCurves(
      NUM_POINTS,
      curveFront,
      curveFrontActivated,
      curveBackActivated,
      curveBack
    );
    const mesh = new THREE.Mesh(meshGeometry, meshMaterial);

    const group = new THREE.Group();
    group.add(mesh);
    group.add(frontEdges);
    group.add(backEdges);
    group.add(frontBackConnectorEdges);

    return group;
  }

  _computeGeometricParameters() {
    // TODO: Avoid constants in favor of per-network parameters
    this._gridScale = {
      x: 400,
      y: 400
    };
    this._nodeSize = {
      x: Math.min(this._gridScale.x, this._gridScale.y) / 4,
      y: Math.min(this._gridScale.x, this._gridScale.y) / 4,
    };
    this._nodeMaxInnerHeight = (this._gridScale.y - this._nodeSize.y) * 0.9;
    this._nodeRadius = this._nodeSize.y * 0.5;
    this._labelFontSize = 16; // TODO: Move to CSS if possible // px
    this._handleRadius = 10;
  }

  _computeFlowScale(p) {
    const hull = arr => arr.reduce((acc, cur) => IOps.hull(acc, cur), Interval.EMPTY);
    const arr2i = arr => hull(arr.map(x => new Interval(x)));
    const ensureInterval = arrOrI => IOps.isInterval(arrOrI) ? arrOrI : arr2i(arrOrI);

    const network = this._network;
    const activationRanges = {};

    /***
     * The relative flow is higher if there are fewer nodes in a layer. This is to account for the
     * fact that nodes that have free vertical space in a layer can grow larger than nodes with
     * less vertical space.
     */
    const maxLength = this._coords.height + 1;
    let maxRelFlow = {
      value: 0,
      update: function (range, layer) {
        const weight = layer.length / maxLength;
        const relFlow = IOps.width(range) * weight;
        this.value = Math.max(this.value, relFlow);
      },
    };

    // This checks all partial sum and activation hulls and returns the largest one.
    // Traversing the tree takes 2^(summands.length) time.
    // I ran out of time thinking of a better way to compute this. :-(
    const traverseNodeHullTree = (summands, partialSum, partialSumHull, activationRangeFunc) => {
      if (summands.length === 0) {
        return IOps.hull(partialSumHull, activationRangeFunc(partialSum));
      } else {
        const summand = summands[0];
        const otherSummands = summands.slice(1);

        const partialSumLo = IOps.add(partialSum, new Interval(summand.lo));
        const hullLo = traverseNodeHullTree(
          otherSummands,
          partialSumLo,
          IOps.hull(partialSumHull, partialSumLo),
          activationRangeFunc,
        );

        const partialSumHi = IOps.add(partialSum, new Interval(summand.hi));
        const hullHi = traverseNodeHullTree(
          otherSummands,
          partialSumHi,
          IOps.hull(partialSumHull, partialSumHi),
          activationRangeFunc,
        );

        return IOps.width(hullLo) > IOps.width(hullHi) ? hullLo : hullHi;
      }
    };

    for (let nodeId of network.inputNodeIds) {
      const layer = this._coords.layerOf(nodeId);
      const activationRange = ensureInterval(p[nodeId].inputProps.range);
      activationRanges[nodeId] = activationRange;
      maxRelFlow.update(new Interval(0, Math.max(0, activationRange.hi)), layer);
      maxRelFlow.update(new Interval(Math.min(activationRange.lo, 0), 0), layer);
    }

    const edgeToActivation = e => IOps.mul(activationRanges[e.from.id], p[e.id].weightProps.range);
    for (let node of network.topSortNoInputs) {
      const np = p[node.id];
      const layer = this._coords.layerOf(node.id);
      const getActivationRange = np.activationFunc.range.bind(np.activationFunc);
      const orderedInEdges = getOrderedInEdges(node, this._coords);
      const summands = [np.biasProps.range, ...orderedInEdges.map(edgeToActivation)];
      const sumRange = summands.reduce((acc, cur) => IOps.add(acc, cur), Interval.ZERO);
      const activationRange = getActivationRange(sumRange);
      activationRanges[node.id] = activationRange;

      /***
       * FIXME: This is quite expensive since it needs 2^(#inEdges+1) steps to compute the maximum
       *        hull of the node. For simple networks, it shouldn't be an issue, but for everything
       *        with more than couple of nodes, this can become a bottleneck quite easily.
       */
      const nodeHull = traverseNodeHullTree(
        summands,
        Interval.ZERO,
        Interval.ZERO,
        getActivationRange
      );

      maxRelFlow.update(nodeHull, layer);
    }

    return 1 / maxRelFlow.value;
  }

  _updateProps(predictionExt) {
  }

  /***
   * Update DOM based on model
   */
  update(predictionExt) {
    if (typeof predictionExt !== 'undefined') {
      this._updateProps(predictionExt);
    }
    for (let updater of this._viewUpdaters) {
      updater();
    }
    return this;
  }

  dispose() {
    this._eventManager.dispose();
    // TODO: this._tippies.forEach(t => t.destroy());
    this.removeAllListeners();
    return this;
  }

  localize() {
    this._formatNumber = this._i18n.getNumberFormatter();
    this.update();
    this._i18n.localize(...this._localizables);
    // TODO: this._tippies.forEach(t => (t?.popperInstance?.update ?? (() => true))());
  }
}

function getOrderedInEdges(node, coords) {
  // sort incoming edges by connected node (node.from) in descending y order
  const compare = (edgeA, edgeB) => -(coords.absY(edgeA.from.id) - coords.absY(edgeB.from.id));
  return [...node.in].sort(compare);
}

function getPartialSumRange(edges, properties, bias) {
  const p = properties;
  const partials = edges.reduce(
    (acc, cur) => {
      acc.push(acc[acc.length - 1] + p[cur.from.id].activation * p[cur.id].weight);
      return acc;
    },
    [bias]
  );

  return new Interval(
    partials.reduce((acc, cur) => Math.min(acc, cur), bias),
    partials.reduce((acc, cur) => Math.max(acc, cur), bias)
  );
}

const fillColor = node => {
  if (node.isInput()) {
    return 'red';
  } else if (node.isOutput()) {
    return 'green';
  } else {
    return 'yellow';
  }
};

const activationColor = activation => activation >= 0 ? 0x0000FF : 0xFF0000;

function meshFromBezierCurves(numSegments, ...bezierCurves) {
  const pointsTransposed = bezierCurves.map(curve => curve.getSpacedPoints(numSegments));
  const numSamples = numSegments + 1;
  const geometry = new THREE.Geometry();
  for (let i = 0; i < numSamples; i = i + 1) {
    for (let j = 0; j < bezierCurves.length; j = j + 1) {
      geometry.vertices[i * bezierCurves.length + j] = pointsTransposed[j][i];
    }
  }

  const step = bezierCurves.length;
  console.log(pointsTransposed[0].length, step);

  for (let i = 0; i < numSamples - 1; i = i + 1) {
    let offset = i * step;
    for (let j = 0; j < step - 1; j = j + 1) {
      const faceLo = new THREE.Face3(offset + j, offset + step + j, offset + j + 1);
      const faceHi = new THREE.Face3(offset + j + 1, offset + step + j, offset + step + j + 1);
      geometry.faces.push(faceLo, faceHi);
    }
    const faceLo = new THREE.Face3(offset + step - 1, offset + step + step - 1, offset);
    const faceHi = new THREE.Face3(offset, offset + step + step - 1, offset + step);
    geometry.faces.push(faceLo, faceHi);
  }

  const backOffset = numSegments * step;
  for (let i = 1; i < step - 1; i = i + 1) {
    const frontCoverFace = new THREE.Face3(0, i, i + 1);
    const backCoverFace = new THREE.Face3(backOffset, backOffset + i + 1, backOffset + i);
    geometry.faces.push(frontCoverFace, backCoverFace);
  }

  geometry.verticesNeedUpdate = true;
  geometry.elementsNeedUpdate = true;

  return geometry;
}

export { View };
