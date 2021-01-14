import { EventEmitter } from 'events';
import { SVG } from '@svgdotjs/svg.js';
import Bezier from 'bezier-js';
import IOps, { Interval } from 'interval-arithmetic';
import tippy from 'tippy.js';
import $ from 'jquery';

import EventManager from '../../util/event-manager';
import SVGPathBuilder from '../../util/svg-path-builder';
import NodeCoordinates from './node-coordinates';
import * as I18N from '../../util/i18n';
import { level as levelDefaults } from '../defaults';
import { defaultsDeep } from 'lodash';

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
    const immutableProps = this._computeImmutableProps();
    this._props = Object.assign({}, ...ids.map(id => ({ [id]: immutableProps[id] ?? {} })));
    this._updateProps(predictionExt);

    this._localizables = [];
    this._tippies = [];

    this._viewUpdaters = this._createSubViews();
    this.localize();

    if (!new URLSearchParams(location.search).has('tooltip')) {
      this._tippies.forEach(t => t.hide());
    }
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

  static _buildEdgePaths({ fromPos, fromActivation, toPos, toActivation }) {
    const flip = b => new Bezier([...b.points].reverse());

    const bezier = new Bezier(
      fromPos,
      {
        x: fromPos.x * 0.5 + toPos.x * 0.5,
        y: fromPos.y
      },
      {
        x: fromPos.x * 0.5 + toPos.x * 0.5,
        y: toPos.y
      },
      toPos
    );

    const bezierActivated = new Bezier(
      {
        x: fromPos.x,
        y: fromPos.y - fromActivation
      },
      {
        x: fromPos.x * 0.5 + toPos.x * 0.5,
        y: fromPos.y - fromActivation
      },
      {
        x: fromPos.x * 0.5 + toPos.x * 0.5,
        y: toPos.y - toActivation
      },
      {
        x: toPos.x,
        y: toPos.y - toActivation
      },
    );

    const { intersectionPos, handlePos, labelPos } = (() => {
      const bbox = bezier.bbox();
      const bboxActivated = bezierActivated.bbox();
      const intersection = bezier.intersects({
        p1: {
          x: bbox.x.min + bbox.x.size * (1 - 0.33),
          y: bbox.y.min - bbox.x.size - 1
        },
        p2: {
          x: bbox.x.min + bbox.x.size * (1 - 0.33),
          y: bbox.y.max + bbox.x.size + 1
        },
      })[0];

      const intersectionActivated = bezierActivated.intersects({
        p1: {
          x: bboxActivated.x.min + bboxActivated.x.size * (1 - 0.33),
          y: bboxActivated.y.min - bboxActivated.y.size - 1
        },
        p2: {
          x: bboxActivated.x.min + bboxActivated.x.size * (1 - 0.33),
          y: bboxActivated.y.min + bboxActivated.y.size + 1
        },
      })[0];

      const intersectionPos = bezier.get(intersection);
      const intersectionActivatedPos = bezierActivated.get(intersectionActivated);
      const handlePos = intersectionActivatedPos;
      const labelPos = {
        x: (intersectionPos.x + intersectionActivatedPos.x) / 2,
        y: (intersectionPos.y + intersectionActivatedPos.y) / 2
      };

      return {
        intersectionPos,
        handlePos,
        labelPos
      };
    })();

    const { bezierFrom, bezierFromActivated, bezierTo, bezierToActivated } = (() => {
      const bezierSub = new Bezier(
        {
          x: 0,
          y: -fromActivation
        },
        {
          x: 0.5,
          y: -fromActivation
        },
        {
          x: 0.5,
          y: -toActivation
        },
        {
          x: 1,
          y: -toActivation
        },
      );
      const line = {
        p1: {
          x: -1,
          y: 0
        },
        p2: {
          x: 2,
          y: 0
        }
      };
      // bezierSub and line intersect at the same t as bezier and bezierActivated,
      // but the intersection is much easier to compute (intersecting two cubic bezier curves was
      // too slow for realtime processing, but intersecting a cubic bezier curve and a line works
      // just fine).
      const t = bezierSub.intersects(line)[0] ?? 1;
      const { left: bezierFrom, right: bezierTo } = bezier.split(t);
      const { left: bezierFromActivated, right: bezierToActivated } = bezierActivated.split(t);
      return {
        bezierFrom,
        bezierFromActivated,
        bezierTo,
        bezierToActivated
      };
    })();

    const edgePath = new SVGPathBuilder().MC(...bezier.points)
      .build();
    const edgeActivatedPath = new SVGPathBuilder().MC(...bezierActivated.points)
      .build();
    const fromActivationEdgePath = new SVGPathBuilder()
      .MC(...bezierFrom.points)
      .LC(...flip(bezierFromActivated).points)
      .Z()
      .build();
    const toActivationEdgePath = new SVGPathBuilder()
      .MC(...bezierTo.points)
      .LC(...flip(bezierToActivated).points)
      .Z()
      .build();

    return {
      edgePath,
      edgeActivatedPath,
      fromActivationEdgePath,
      toActivationEdgePath,
      intersectionPos,
      labelPos,
      handlePos,
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

    return this._nodeMaxInnerHeight / maxRelFlow.value;
  }

  _computeImmutableProps() {
    const computeNodeProp = node => ({
      [node.id]: {
        orderedInEdges: getOrderedInEdges(node, this._coords),
        gridPos: this._grid(this._coords.abs(node.id)),
      }
    });
    return Object.assign({}, ...this._network.nodes.map(computeNodeProp));
  }

  _updateProps(predictionExt) {
    const p = this._props;
    // First copy current node and edge properties to view's mutable properties
    this._network.ids.forEach(id => Object.assign(p[id], predictionExt[id]));

    // Compute relevant properties for visualization
    this._network.nodes.forEach(node => {
      // Compute props of node
      const np = p[node.id];
      const partialSumRange = node.isInput() ?
        Interval.ZERO :
        getPartialSumRange(np.orderedInEdges, p, np.bias);
      const range = IOps.hull(
        IOps.hull(partialSumRange, Interval.ZERO),
        new Interval(np.activation),
      );
      np.lowerHeight = range.lo * this._flowScale;
      np.upperHeight = range.hi * this._flowScale;
      np.innerHeight = IOps.width(range) * this._flowScale;
      np.zeroGridOffsetY = np.innerHeight / 2 - np.upperHeight;

      // Compute to-part of in-edges
      let lastTo = {
        pos: {
          x: np.gridPos.x - 0.5 * this._nodeSize.x,
          y: np.gridPos.y - np.zeroGridOffsetY,
        },
        activation: np.bias * this._flowScale,
      };
      np.orderedInEdges.forEach((edge, i) => {
        const ep = p[edge.id];

        ep.toPos = {
          x: lastTo.pos.x,
          y: lastTo.pos.y - lastTo.activation
        };
        ep.toActivation = p[edge.from.id].activation * p[edge.id].weight * this._flowScale;
        lastTo = {
          pos: ep.toPos,
          activation: ep.toActivation
        };

        ep.fromActivationColor = activationColor(p[edge.from.id].activation);
        ep.toActivationColor = activationColor(p[edge.from.id].activation * p[edge.id].weight);
      });

      // Compute from-part of out-edges
      node.out.forEach((edge, i) => {
        const ep = p[edge.id];
        ep.fromPos = {
          x: this._gridX(this._coords.absX(edge.from.id)) + 0.5 * this._nodeSize.x,
          y: this._gridY(this._coords.absY(edge.from.id)) - np.zeroGridOffsetY,
        };
        ep.fromActivation = p[edge.from.id].activation * this._flowScale;
      });
    });

    // Compute edge geometries
    this._network.edges.forEach(edge => {
      const ep = p[edge.id];
      Object.assign(ep, View._buildEdgePaths(ep));
    });
  }

  _createSubViews() {
    const $container = $(this._options.networkContainer).empty();

    const titleKey = this._levelI18NKey('title');
    const titleFallbackKey = I18N.key('main', 'levelDefaults', 'title');
    const $levelTitleEl = $(this._options.title)
      .attr('data-i18n', `${titleFallbackKey};${titleKey}`);
    this._localizables.push(...$levelTitleEl.toArray());

    const descKey = this._levelI18NKey('description');
    const descFallbackKey = I18N.key('main', 'levelDefaults', 'description');
    const $levelDescriptionEl = $(this._options.description)
      .attr('data-i18n', `${descFallbackKey};${descKey}`);
    this._localizables.push($levelDescriptionEl);

    const offset = {
      x: 0.5 * this._nodeSize.x,
      y: 0.5 * (this._nodeSize.y + this._nodeMaxInnerHeight),
    };

    this._$overlay = $('<div>')
      .css({ position: 'absolute', top: `${offset.x}px`, left: `${offset.y}px` })
      .appendTo($container);

    this._svg = SVG()
      .size(1000, 1000)
      .addTo($container.get(0));
    this._svg.css({
      'overflow': 'visible',
      'stroke-width': 2,
      'stroke-color': 'black',
    });

    this._svgOffsetContainer = this._svg.group()
      .translate(offset.x, offset.y);

    this._coordAnchor = this._svgOffsetContainer.group();
    this._nodeLayer = this._svgOffsetContainer.group();
    this._edgeLayer = this._svgOffsetContainer.group();
    this._labelLayer = this._svgOffsetContainer.group()
      .css({ 'font-size': `${this._labelFontSize}px` });
    this._handleLayer = this._svgOffsetContainer.group()
      .attr({
        stroke: 'black',
        fill: 'transparent'
      })
      .css({ cursor: 'hand' });

    return [].concat(
      this._network.nodes.map(n => this._createNodeView(n)),
      this._network.edges.map(e => this._createEdgeView(e)),
    );
  }

  _createNodeView(node) {
    const np = this._props[node.id];

    const tippies = [];

    // set up DOM elements and certain static/default properties
    const svgNodeGroup = this._nodeLayer.group();
    const svgNodeRect = svgNodeGroup.rect(this._nodeSize.x, this._nodeSize.y)
      .move(np.gridPos.x - 0.5 * this._nodeSize.x, np.gridPos.y - 0.5 * this._nodeSize.y)
      .attr({
        rx: this._nodeRadius,
        ry: this._nodeRadius,
        fill: fillColor(node),
        stroke: 'black',
      });

    const svgBiasHandle = this._handleLayer.circle(this._handleRadius)
      .cx(np.gridPos.x - 0.5 * this._nodeSize.x)
      .css({ 'visibility': node.isInput() ? 'hidden' : 'visible' });

    const biasDraggable = new VerticalDraggable(
      svgBiasHandle,
      this._coordAnchor,
      ({ y }) => this._biasChanged(node, this._biasFromY(y, np)),
      this._eventManager,
    );

    const svgSumHandle = this._handleLayer.circle(this._handleRadius)
      .cx(np.gridPos.x)
      .css({ 'visibility': 'hidden' });

    const svgActivationHandle = this._handleLayer.circle(this._handleRadius)
      .cx(np.gridPos.x + 0.5 * this._nodeSize.x)
      .css({ 'visibility': node.isInput() ? 'visible' : 'hidden' });

    if (node.isInput()) {
      const inputDraggable = new VerticalDraggable(
        svgActivationHandle,
        this._coordAnchor,
        ({ y }) => this._inputChanged(node, this._inputFromY(y, np)),
        this._eventManager,
      );

      const inputDescriptionElem = document.createElement('div');
      const inputDescriptionKey = this._levelI18NKey('labels', node.id, 'input');
      const inputDescriptionFallbackKey = I18N.key('main',
        'levelDefaults',
        'labels',
        'node',
        'input');
      inputDescriptionElem.setAttribute('data-i18n',
        `${inputDescriptionFallbackKey};${inputDescriptionKey}`);
      const inputDescriptionTippy = tippy(svgActivationHandle.node, {
        content: inputDescriptionElem,
        showOnCreate: true,
        trigger: 'manual',
        hideOnClick: false,
        placement: 'right',
      });
      this._localizables.push(inputDescriptionElem);
      tippies.push(inputDescriptionTippy);
    } else {
      const biasDescriptionElem = document.createElement('div');
      const biasDescriptionKey = this._levelI18NKey('labels', node.id, 'bias');
      const biasDescriptionFallbackKey = I18N.key('main',
        'levelDefaults',
        'labels',
        'node',
        'bias');
      biasDescriptionElem.setAttribute('data-i18n',
        `${biasDescriptionFallbackKey};${biasDescriptionKey}`);
      const biasDescriptionTippy = tippy(svgBiasHandle.node, {
        content: biasDescriptionElem,
        showOnCreate: true,
        trigger: 'manual',
        hideOnClick: false,
        placement: 'left',
      });
      this._localizables.push(biasDescriptionElem);
      tippies.push(biasDescriptionTippy);

      const sumDescriptionElem = document.createElement('div');
      const sumDescriptionKey = this._levelI18NKey('labels', node.id, 'sum');
      const sumDescriptionFallbackKey = I18N.key('main', 'levelDefaults', 'labels', 'node', 'sum');
      sumDescriptionElem.setAttribute('data-i18n',
        `${sumDescriptionFallbackKey};${sumDescriptionKey}`);
      const sumDescriptionTippy = tippy(svgSumHandle.node, {
        content: sumDescriptionElem,
        showOnCreate: true,
        trigger: 'manual',
        hideOnClick: false,
        placement: 'bottom',
      });
      this._localizables.push(sumDescriptionElem);
      tippies.push(sumDescriptionTippy);

      const activationDescriptionElem = document.createElement('div');
      const activationDescriptionKey = this._levelI18NKey('labels', node.id, 'activation');
      const activationDescriptionFallbackKey = I18N.key('main',
        'levelDefaults',
        'labels',
        'node',
        'activation');
      activationDescriptionElem.setAttribute('data-i18n',
        `${activationDescriptionFallbackKey};${activationDescriptionKey}`);
      const activationDescriptionTippy = tippy(svgActivationHandle.node, {
        content: activationDescriptionElem,
        showOnCreate: true,
        trigger: 'manual',
        hideOnClick: false,
        placement: 'right',
      });
      this._localizables.push(activationDescriptionElem);
      tippies.push(activationDescriptionTippy);
    }

    const debug = false;
    // can be enabled for UI debugging purposes
    const middleLinePathBuilder = () => new SVGPathBuilder()
      .M(np.gridPos)
      .m({
        x: -0.5 * this._nodeSize.x,
        y: 0
      })
      .l({
        x: this._nodeSize.x,
        y: 0
      })
      .build();
    const svgNodeMiddleLine = !debug ? svgNodeGroup.group() : svgNodeGroup
      .path(middleLinePathBuilder())
      .attr({
        stroke: 'gray',
        'stroke-width': 1
      });

    const zeroLinePathBuilder = () => new SVGPathBuilder()
      .M(np.gridPos)
      .m({
        x: -0.5 * this._nodeSize.x,
        y: -np.zeroGridOffsetY
      })
      .l({
        x: this._nodeSize.x,
        y: 0
      })
      .build();
    const svgNodeZeroLine = !debug ? svgNodeGroup.group() : svgNodeGroup.path(zeroLinePathBuilder())
      .attr({ stroke: 'orange' });

    const svgIdLabel = this._labelLayer.plain(node.isInput() || node.isOutput() ? node.id : '')
      .attr(np.gridPos)
      .attr({
        'text-anchor': 'middle',
        'data-i18n': this._levelI18NKey('labels', node.id, 'name'),
      });
    const svgBiasLabel = this._labelLayer.plain()
      .attr({
        'text-anchor': 'end',
        'dominant-baseline': 'central',
        x: np.gridPos.x - this._nodeSize.x / 2,
      })
      .css({ visibility: node.isInput() ? 'hidden' : 'visible' });
    const svgActivationLabel = this._labelLayer.plain()
      .x(np.gridPos.x + this._nodeSize.x / 2)
      .attr({
        'text-anchor': 'start',
        'dominant-baseline': 'central',
      });
    const svgTargetLabel = this._labelLayer.plain()
      .x(np.gridPos.x + this._nodeSize.x)
      .attr({
        'text-anchor': 'start',
        'dominant-baseline': 'central',
        y: 0,
      })
      .css({ visibility: node.isOutput() ? 'visible' : 'hidden' });

    const biasLinePathBuilder = () => new SVGPathBuilder()
      .M(np.gridPos)
      .m({
        x: -this._nodeSize.x / 2,
        y: -np.zeroGridOffsetY
      })
      .l({
        x: 0,
        y: -np.bias * this._flowScale
      })
      .build();
    const svgBiasLine = node.isInput() ? this._edgeLayer.group() : this._edgeLayer
      .path(biasLinePathBuilder())
      .fill('none')
      .stroke('black');

    const sumAreaPathBuilder = () => new SVGPathBuilder()
      .M(np.gridPos)
      .m({
        x: 0,
        y: -np.zeroGridOffsetY
      })
      .h(-this._nodeSize.x / 2)
      .v(-np.sum * this._flowScale)
      .h(this._nodeSize.x / 2)
      .z()
      .build();
    const svgSumArea = node.isInput() ? this._edgeLayer.group() : this._edgeLayer
      .path(sumAreaPathBuilder())
      .stroke({ color: 'none' });

    const activationAreaPathBuilder = () => new SVGPathBuilder()
      .M(np.gridPos)
      .m({
        x: 0,
        y: -np.zeroGridOffsetY
      })
      .h(this._nodeSize.x / 2)
      .v(-np.activation * this._flowScale)
      .h(-this._nodeSize.x / 2)
      .z()
      .build();
    const svgActivationArea = node.isInput() ? this._edgeLayer.group() : this._edgeLayer
      .path(sumAreaPathBuilder())
      .stroke({ color: 'none' });

    const inOutConnectorPolyLinePathBuilder = () => new SVGPathBuilder()
      .M(np.gridPos)
      .m({
        x: -this._nodeSize.x / 2,
        y: -np.zeroGridOffsetY - Math.min(0, np.sum) * this._flowScale
      })
      .h(this._nodeSize.x / 2)
      .V(np.gridPos.y - np.zeroGridOffsetY)
      .h(this._nodeSize.x / 2)
      .build();
    const svgInOutConnectorPolyLine = node.isInput() ? this._edgeLayer.group() : this._edgeLayer
      .path(inOutConnectorPolyLinePathBuilder())
      .stroke({ color: 'black' })
      .fill('none');

    const targetLineBuilder = () => new SVGPathBuilder()
      .M(np.gridPos)
      .m({
        x: this._nodeSize.x / 2,
        y: -np.zeroGridOffsetY - np.target * this._flowScale
      })
      .h(this._nodeSize.x / 2)
      .build();
    const svgTargetLine = !node.isOutput() ? this._edgeLayer.group() : this._edgeLayer
      .path(targetLineBuilder())
      .stroke({ color: 'cyan' })
      .fill('none');

    // set up update function
    const update = () => {
      svgNodeRect
        .attr({
          width: this._nodeSize.x,
          height: this._nodeSize.y + np.innerHeight
        })
        .transform({ translateY: -0.5 * np.innerHeight });

      svgIdLabel
        .attr(np.gridPos)
        .dy(-np.innerHeight / 2 - this._nodeSize.y / 8)
        .attr({
          'text-anchor': 'middle',
        });
      svgBiasHandle.cy(np.gridPos.y - np.zeroGridOffsetY - np.bias * this._flowScale);
      svgBiasLabel.plain(`${this._formatNumber(np.bias)}\u00A0`)
        .attr({ y: np.gridPos.y - np.zeroGridOffsetY - np.bias * this._flowScale / 2 });
      svgSumHandle.cy(np.gridPos.y - np.zeroGridOffsetY - np.sum * this._flowScale);
      svgActivationHandle.cy(np.gridPos.y - np.zeroGridOffsetY - np.activation
        * this._flowScale);
      svgActivationLabel
        .plain(`\u00A0${this._formatNumber(np.activation)}`)
        .attr({ y: np.gridPos.y - np.zeroGridOffsetY - np.activation * this._flowScale / 2 });
      if (debug) {
        svgNodeMiddleLine.plot(middleLinePathBuilder());
        svgNodeZeroLine.plot(zeroLinePathBuilder());
      }
      if (!node.isInput()) {
        svgBiasLine.plot(biasLinePathBuilder());
        svgSumArea.plot(sumAreaPathBuilder())
          .fill({
            color: activationColor(np.sum),
            opacity: 0.5
          });
        svgActivationArea.plot(activationAreaPathBuilder())
          .fill({
            color: activationColor(np.activation),
            opacity: 0.5
          });
        svgInOutConnectorPolyLine.plot(inOutConnectorPolyLinePathBuilder());
      }
      if (node.isOutput()) {
        svgTargetLine.plot(targetLineBuilder());
        svgTargetLabel.plain(`\u00A0${this._formatNumber(np.target)}`)
          .attr({ y: np.gridPos.y - np.zeroGridOffsetY - np.target * this._flowScale });
      }

      tippies.forEach(t => t.popperInstance !== null ? t.popperInstance.update() : true);
    };

    update();

    this._tippies.push(...tippies);

    return update;
  }

  _createEdgeView(edge) {
    const ep = this._props[edge.id];

    const tippies = [];

    const svgEdgeGroup = this._edgeLayer.group()
      .attr({
        'fill-opacity': 0.5,
        stroke: 'none',
      });
    const svgEdge = svgEdgeGroup.path(ep.edgePath)
      .attr({
        stroke: 'black',
        fill: 'none'
      });
    /*
    const svgEdgeActivated = svgEdgeGroup.path(mep.edgeActivatedPath).attr({
      stroke: 'black',
      fill: 'none'
    });
     */
    const svgFromActivation = svgEdgeGroup.path(ep.fromActivationEdgePath);
    const svgToActivation = svgEdgeGroup.path(ep.toActivationEdgePath);
    const svgWeightLabel = this._labelLayer.plain('')
      .attr({
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
      });

    const svgWeightHandle = this._handleLayer.circle(this._handleRadius)
      .css({ 'opacity': '0.25' });

    const weightDraggable = new VerticalDraggable(
      svgWeightHandle,
      this._coordAnchor,
      ({ y }) => this._weightChanged(edge, this._weightFromY(y, ep)),
      this._eventManager,
    );

    const weightDescriptionElem = document.createElement('div');
    const weightDescriptionKey = this._levelI18NKey('labels', edge.id, 'weight');
    const weightDescriptionFallbackKey = I18N.key('main',
      'levelDefaults',
      'labels',
      'edge',
      'weight');
    weightDescriptionElem.setAttribute('data-i18n',
      `${weightDescriptionFallbackKey};${weightDescriptionKey}`);
    this._localizables.push(weightDescriptionElem);

    const weightDescriptionTippy = tippy(svgWeightHandle.node, {
      content: weightDescriptionElem,
      placement: 'top',
      ...this._tippyOptionsForLabel(this._strings?.labels?.[edge.id]?.weight),
    });
    tippies.push(weightDescriptionTippy);

    const update = () => {
      svgEdge.plot(ep.edgePath);
      //svgEdgeActivated.plot(mep.edgeActivatedPath);
      svgFromActivation.plot(ep.fromActivationEdgePath)
        .attr({ fill: ep.fromActivationColor });
      svgToActivation.plot(ep.toActivationEdgePath)
        .attr({ fill: ep.toActivationColor });
      svgWeightLabel.plain(`×${this._formatNumber(ep.weight)}`)
        .attr(ep.labelPos);
      svgWeightHandle.center(ep.handlePos.x, ep.handlePos.y);

      tippies.forEach(t => t.popperInstance !== null ? t.popperInstance.update() : true);
    };
    update();

    this._tippies.push(...tippies);

    return update;
  }

  _gridX(x) {
    return this._gridScale.x * x;
  }

  _gridY(y) {
    return this._gridScale.y * y;
  }

  _grid({ x, y }) {
    return {
      x: this._gridX(x),
      y: this._gridY(y),
    };
  }

  _inputFromY(y, np) {
    return -(y - np.gridPos.y + np.zeroGridOffsetY) / this._flowScale;
  }

  _inputChanged(node, newInput) {
    this.emit('input-changed', node, newInput);
  }

  _weightFromY(y, ep) {
    return -(y - ep.intersectionPos.y) / ep.fromActivation;
  }

  _weightChanged(edge, newWeight) {
    this.emit('weight-changed', edge, newWeight);
  }

  _biasFromY(y, np) {
    return -(y - np.gridPos.y + np.zeroGridOffsetY) / this._flowScale;
  }

  _biasChanged(node, newBias) {
    this.emit('bias-changed', node, newBias);
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
    this._tippies.forEach(t => t.destroy());
    this.removeAllListeners();
    return this;
  }

  _levelI18NKey(...keyParts) {
    return I18N.levelKey(this._levelName, ...keyParts);
  }

  _tippyOptionsForLabel({ alwaysOn = false } = {}) {
    return {
      showOnCreate: alwaysOn,
      trigger: alwaysOn ? 'manual' : 'mouseenter touchstart',
      hideOnClick: false,
    };
  }

  localize() {
    this._formatNumber = this._i18n.getNumberFormatter();
    this.update();
    this._i18n.localize(...this._localizables);
    this._tippies.forEach(t => (t?.popperInstance?.update ?? (() => true))());
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

const activationColor = activation => activation >= 0 ? 'blue' : 'red';

class VerticalDraggable {
  constructor(svgElem, anchorElem, dragHandler, domEventManager) {
    this._svgElem = svgElem;
    this._anchorElem = anchorElem;
    this._dragHandler = dragHandler;
    this._eventManager = domEventManager;
    this._moveHandler = ev => this._move(ev);
    this._upHandler = ev => this._up(ev);

    const ael = this._eventManager.ael;
    const rel = this._eventManager.rel;
    ael(svgElem.node, 'pointerdown', ev => this._down(ev));
    this._emMoveHandler = rel(window, 'pointermove', this._moveHandler.bind(this));
    this._emUpHandler = rel(window, 'pointerup', this._upHandler.bind(this));
  }

  _down(event) {
    // TODO: register animation frame callback to trigger dragHandler in every frame when pressed to account for external changes to svgElem
    this._emMoveHandler.attach();
    this._emUpHandler.attach();
  }

  _move(event) {
    const anchorTop = this._anchorElem.node.getBoundingClientRect().y;
    this._dragHandler({ y: event.clientY - anchorTop });
  }

  _up(event) {
    this._emMoveHandler.detach();
    this._emUpHandler.detach();
  }
}

export { View };

/***
 const showGradientCheckbox = document.querySelector('#showgradient');
 showGradientCheckbox.addEventListener('change',
 () => this.emit('show-gradient', showGradientCheckbox.checked)
 );
 */
