import * as THREE from 'three';
import { BufferAttribute } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EventEmitter } from 'events';
import { cloneDeep, defaultsDeep } from 'lodash';

import EventManager from '../../util/event-manager';
import NodeCoordinates from './node-coordinates';
import { level as levelDefaults } from '../defaults';
import IOps, { Interval } from 'interval-arithmetic';
import $ from 'jquery';
import FeedForwardNetwork from '../../neural-network/network';

const DEBUG = false;
const NODE_RADIUS = 0.2;
const EDGE_WIDTH = 2 * 0.8 * NODE_RADIUS;

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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;

    const aspectRatio = this._coords.width / this._coords.height;
    const [maxWidth, maxHeight] = [1080, 1080];
    const width = maxWidth, height = maxHeight;
    /*
    let width, height;
    if (aspectRatio * maxHeight > maxWidth) {
      width = maxWidth;
      height = maxWidth / aspectRatio;
    } else {
      width = maxHeight * aspectRatio;
      height = maxHeight;
    }
    */
    console.log(this._levelName, this._coords.width, this._coords.height, width, height);

    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff, 1.0);
    const $container = $(this._options.networkContainer).empty();
    $container.append(renderer.domElement);
    if (DEBUG) {
      renderer.domElement.style.outline = '1px red solid';
    }
    /*
        const camera = new THREE.OrthographicCamera(
          -this._coords.width / 2,
          +this._coords.width / 2,
          -this._coords.height / 2,
          +this._coords.height / 2,
          -1000,
          1000
        );

     */
    const fov = 20;
    const distance = 1 / Math.sin((fov / 2) * (Math.PI / 180));
    const near = 0.1;
    const far = 1000.0;
    const camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

    {
      const isometricAngle = Math.atan(1 / Math.sqrt(2));
      const cameraRotation = new THREE.Matrix4().makeRotationX(isometricAngle);
      const cameraTranslation = new THREE.Matrix4().makeTranslation(0, 0, distance);
      const cameraMatrix = new THREE.Matrix4().multiplyMatrices(cameraRotation, cameraTranslation);
      cameraMatrix.decompose(camera.position, camera.quaternion, camera.scale);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', () => renderer.render(this._scene, camera));
    controls.update();

    this._scene = new THREE.Scene();
    this._debug = new THREE.Group();
    this._debug.visible = DEBUG;
    this._scene.add(this._debug);

    const sphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry(1, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xAAAAAA, wireframe: true }),
    );
    this._debug.add(sphere);

    const axesHelper = new THREE.AxesHelper(1);
    this._debug.add(axesHelper);

    const lights = new THREE.Group();
    this._scene.add(lights);

    const hemisphericLight = new THREE.HemisphereLight(0xffffff, 0x777777, 0.5);
    hemisphericLight.position.set(0, 0, 1);
    lights.add(hemisphericLight);

    const shadowCastingLights = new THREE.Group();
    lights.add(shadowCastingLights);

    const spotLight0 = new THREE.SpotLight(0xffffff, 0.75);
    const spotLightDistance0 = 1.5;
    const lightPosition0 = new THREE.Vector3(0, -1, 1)
      .normalize()
      .multiplyScalar(spotLightDistance0);
    spotLight0.position.copy(lightPosition0);
    shadowCastingLights.add(spotLight0);

    for (let light of shadowCastingLights.children) {
      light.castShadow = true;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      light.shadow.camera.fov = (Math.asin(1 / spotLightDistance0) * 2) * 180 / Math.PI;
      light.shadow.camera.near = spotLightDistance0 - 1;
      light.shadow.camera.far = light.shadow.camera.near + 2;
      light.shadow.bias = -0.002;
    }

    this._debug.add(new THREE.HemisphereLightHelper(hemisphericLight, 0.05, 0x777777));
    for (let light of shadowCastingLights.children) {
      this._debug.add(new THREE.CameraHelper(light.shadow.camera));
    }

    const networkRadius = new THREE.Vector3(
      (this._coords.width - 1) / 2 + NODE_RADIUS,
      (this._coords.height - 1) / 2 + NODE_RADIUS,
      1 // max flow
    ).length();
    const networkScaler = new THREE.Group();
    networkScaler.scale.setScalar(1 / networkRadius);
    this._scene.add(networkScaler);

    const networkPositioner = new THREE.Group();
    networkPositioner.translateX(-(this._coords.width - 1) / 2);
    networkPositioner.translateY((this._coords.height - 1) / 2);
    networkScaler.add(networkPositioner);

    const networkGroup = new THREE.Group();
    networkPositioner.add(networkGroup);

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

    const predictionExt = this._predictionModel.computePredictions();
    console.log(predictionExt);
    const {
      sceneObject: nodeObjs,
      update: nodeUpdater
    } = this._createNodeGeometries(predictionExt);
    const {
      sceneObject: edgeObjs,
      update: edgeUpdater
    } = this._createEdgeGeometries(predictionExt);
    networkGroup.add(nodeObjs);
    networkGroup.add(edgeObjs);
    const updateObjs = (predictionExt) => {
      nodeUpdater(predictionExt);
      edgeUpdater(predictionExt);
    };

    const animate = (ts) => {
      requestAnimationFrame(animate);

      animators.forEach(animator => animator.update(ts));

      const predictionExt = this._predictionModel.computePredictions();
      updateObjs(predictionExt);

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
      NODE_RADIUS,
      NODE_RADIUS,
      1,
      40
    );
    const edgeGeometry = new THREE.EdgesGeometry(meshGeometry);

    const group = new THREE.Group();
    const updaters = [];
    for (let nodeId of nodeIds) {
      const meshMaterial = new THREE.MeshStandardMaterial({
        color: activationColor(predictionExt[nodeId].activation),
        metalness: 0.0,
        roughness: 0.5,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      edges.visible = false;

      const orient = new THREE.Group();
      orient.translateZ(0.5);
      orient.rotateX(Math.PI * 90 / 180);
      orient.add(mesh);
      orient.add(edges);

      const scale = new THREE.Group();
      scale.scale.set(1, 1, predictionExt[nodeId].activation * this._flowScale);
      scale.add(orient);

      console.log(nodeId);
      const nodeGroup = new THREE.Group();
      const { x, y } = this._coords.abs(nodeId);
      console.log(nodeId, x, -y);
      nodeGroup.position.set(x, -y, 0);
      nodeGroup.add(scale);
      group.add(nodeGroup);

      const update = (predictionExt) => {
        const epsilon = 0.001;
        const clampedActivation = Math.abs(predictionExt[nodeId].activation) > epsilon ?
          predictionExt[nodeId].activation :
          (predictionExt[nodeId].activation >= 0.0 ? 1 : -1) * epsilon;
        scale.scale.set(1, 1, clampedActivation * this._flowScale);
        meshMaterial.color.set(activationColor(predictionExt[nodeId].activation));
      };
      updaters.push(update);
    }

    const update = (predictionExt) => updaters.forEach(update => update(predictionExt));
    return {
      sceneObject: group,
      update,
    };
  }

  _computePartialSums(predictionExt) {
    predictionExt = cloneDeep(predictionExt);
    const nodeIds = this._network.nodeIds;
    const edgeIds = this._network.edgeIds;
    const partialSums = Object.fromEntries(nodeIds.map((id) => [id, predictionExt[id].bias]));
    for (const edgeId of edgeIds) {
      const { to: toId } = FeedForwardNetwork.nodeIdsFromEdgeId(edgeId);
      predictionExt[edgeId].partialSum = partialSums[toId];
      partialSums[toId] += predictionExt[edgeId].toActivation;
    }
    return predictionExt;
  }

  _createEdgeGeometries(predictionExt) {
    const predictionExtPartialSums = this._computePartialSums(predictionExt);
    const edgeIds = this._network.edgeIds;
    const group = new THREE.Group();
    const updaters = [];
    for (const edgeId of edgeIds) {
      const { sceneObject, update } = this._createEdgeGeometry(predictionExtPartialSums, edgeId);
      group.add(sceneObject);
      updaters.push(update);
    }
    const update = (predictionExt) => {
      const predictionExtPartialSums = this._computePartialSums(predictionExt);
      updaters.forEach(updater => updater(predictionExtPartialSums));
    };
    return {
      sceneObject: group,
      update,
    };
  }

  _createEdgeBezierCurves(predictionExt, edgeId) {
    const r = EDGE_WIDTH / 2;
    const d = Math.sqrt(NODE_RADIUS * NODE_RADIUS - r * r);

    const { from: fromId, to: toId } = FeedForwardNetwork.nodeIdsFromEdgeId(edgeId);

    const negY = ({ x, y }) => ({ x, y: -y });
    const add = ({ x: x0, y: y0 }, { x: x1, y: y1 }) => ({ x: x0 + x1, y: y0 + y1 });

    const { x: fromX, y: fromY } = add((negY(this._coords.abs(fromId))), { x: d, y: 0 });
    const { x: toX, y: toY } = add((negY(this._coords.abs(toId))), { x: -d, y: 0 });

    const { fromActivation, toActivation } = predictionExt[edgeId];
    const fromActivationScaled = fromActivation * this._flowScale;
    const toActivationScaled = toActivation * this._flowScale;
    const toPartialSum = predictionExt[edgeId].partialSum;
    const toPartialSumScaled = toPartialSum * this._flowScale;

    const curveFront = new THREE.CubicBezierCurve3(
      new THREE.Vector3(fromX, fromY + r, 0),
      new THREE.Vector3((fromX + toX) * 0.5, fromY + r, 0),
      new THREE.Vector3((fromX + toX) * 0.5, toY + r, toPartialSumScaled),
      new THREE.Vector3(toX, toY + r, toPartialSumScaled)
    );
    const curveFrontActivated = new THREE.CubicBezierCurve3(
      new THREE.Vector3(fromX, fromY + r, fromActivationScaled),
      new THREE.Vector3((fromX + toX) * 0.5, fromY + r, fromActivationScaled),
      new THREE.Vector3((fromX + toX) * 0.5,
        toY + r,
        toPartialSumScaled + toActivationScaled),
      new THREE.Vector3(toX, toY + r, toPartialSumScaled + toActivationScaled)
    );
    const curveBack = new THREE.CubicBezierCurve3(
      new THREE.Vector3(fromX, fromY - r, 0),
      new THREE.Vector3((fromX + toX) * 0.5, fromY - r, 0),
      new THREE.Vector3((fromX + toX) * 0.5, toY - r, toPartialSumScaled),
      new THREE.Vector3(toX, toY - r, toPartialSumScaled)
    );
    const curveBackActivated = new THREE.CubicBezierCurve3(
      new THREE.Vector3(fromX, fromY - r, fromActivationScaled),
      new THREE.Vector3((fromX + toX) * 0.5, fromY - r, fromActivationScaled),
      new THREE.Vector3((fromX + toX) * 0.5,
        toY - r,
        toPartialSumScaled + toActivationScaled),
      new THREE.Vector3(toX, toY - r, toPartialSumScaled + toActivationScaled)
    );

    return {
      curveFront,
      curveFrontActivated,
      curveBack,
      curveBackActivated,
    };
  }

  _createEdgeGeometry(predictionExt, edgeId) {
    const meshMaterial = new THREE.MeshStandardMaterial({
      color: activationColor(predictionExt[edgeId].toActivation),
      metalness: 0.0,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x555555 });

    const {
      curveFront,
      curveFrontActivated,
      curveBack,
      curveBackActivated
    } = this._createEdgeBezierCurves(predictionExt, edgeId);

    const NUM_SEGMENTS = 50;

    /*
        const pointsFront = [
          ...curveFront.getPoints(NUM_SEGMENTS),
          ...curveFrontActivated.getPoints(NUM_SEGMENTS).reverse(),
          curveFront.getPoint(0)
        ];
        const frontEdgeGeometry = new THREE.BufferGeometry().setFromPoints(pointsFront);
        //  const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
        const frontEdges = new THREE.Line(frontEdgeGeometry, edgeMaterial);
        const pointsBack = [
          ...curveBack.getPoints(NUM_SEGMENTS),
          ...curveBackActivated.getPoints(NUM_SEGMENTS).reverse(),
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
    */
    const {
      geometry: meshGeometry,
      update: updateMeshGeometry
    } = meshFromBezierCurves(
      NUM_SEGMENTS,
      curveFront,
      curveFrontActivated,
      curveBackActivated,
      curveBack
    );
    const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const update = (predictionExt) => {
      const {
        curveFront,
        curveFrontActivated,
        curveBack,
        curveBackActivated
      } = this._createEdgeBezierCurves(predictionExt, edgeId);
      updateMeshGeometry(curveFront, curveFrontActivated, curveBackActivated, curveBack);
      meshMaterial.color.set(activationColor(predictionExt[edgeId].toActivation));
    };

    const group = new THREE.Group();
    group.add(mesh);
    /*
        group.add(frontEdges);
        group.add(backEdges);
        group.add(frontBackConnectorEdges);
    */
    return {
      sceneObject: group,
      update,
    };
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

const activationColor = activation => activation >= 0 ? 0x346ee0 : 0xbf2b2b;

function meshFromBezierCurves(numSegments, ...bezierCurves) {
  const numSamples = numSegments + 1;
  const numCurves = bezierCurves.length;

  const geometry = new THREE.BufferGeometry();

  // Faces
  const faces = [];
  for (let i = 0; i < numCurves; i = i + 1) {
    const offset0 = numSamples * (2 * i + 0);
    const offset1 = numSamples * (2 * i + 1);
    for (let j = 0; j < numSegments; j = j + 1) {
      faces.push(offset0 + j, offset1 + j, offset0 + j + 1);
      faces.push(offset0 + j + 1, offset1 + j, offset1 + j + 1);
    }
  }

  const frontOffset = 2 * numCurves * numSamples;
  const backOffset = 2 * numCurves * numSamples + numCurves;
  for (let i = 1; i < numCurves - 1; i = i + 1) {
    faces.push(frontOffset, frontOffset + i + 1, frontOffset + i);
    faces.push(backOffset, backOffset + i, backOffset + i + 1);
  }

  geometry.setIndex(faces);

  // Positions
  const numVertices = 2 * numSamples * numCurves + 2 * numCurves;
  const positionAttribute = new BufferAttribute(new Float32Array(3 * numVertices), 3)
  geometry.setAttribute('position', positionAttribute);
  const updateVertices = (...newBezierCurves) => {
    const vertices = positionAttribute.array;
    const points = newBezierCurves.map(curve => curve.getSpacedPoints(numSegments));
    for (let i = 0; i < numCurves; i = i + 1) {
      const c0 = points[i];
      const c1 = points[(i + 1) % numCurves];
      for (let j = 0; j < numSamples; j = j + 1) {
        c0[j].toArray(vertices, 3 * (numSamples * (2 * i + 0) + j));
        c1[j].toArray(vertices, 3 * (numSamples * (2 * i + 1) + j));
      }
    }
    for (let i = 0; i < numCurves; i = i + 1) {
      points[i][0].toArray(vertices, 3 * (frontOffset + i));
      points[i][numSegments].toArray(vertices, 3 * (backOffset + i));
    }
  };
  updateVertices(...bezierCurves);
  positionAttribute.needsUpdate = true;
  geometry.getIndex().needsUpdate = true;

  const update = (...newBezierCurves) => {
    updateVertices(...newBezierCurves);
    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
  };

  return {
    geometry,
    update: update,
  };
}

export { View };
