import { EventEmitter } from 'events';
import { SVG } from '@svgdotjs/svg.js';
import Bezier from 'bezier-js';
import SVGPathBuilder from '../util/svg-path-builder';
import NodeCoordinates from './node-coordinates';
import IOps, { Interval } from 'interval-arithmetic';

export default class View extends EventEmitter {
  constructor(model, layout, parentElement) {
    super();
    this._model = model;
    this._parent = parentElement;

    this._coords = new NodeCoordinates(layout);

    this._flowScale = this._computeFlowScale();

    this._nodeProps = Object.fromEntries(model.network.nodes.map(n => [n.id, { i: {}, m: {} }]));
    this._edgeProps = Object.fromEntries(model.network.edges.map(e => [e.id, { i: {}, m: {} }]));

    this._addImmutableProps();
    this._updateMutableProps();

    this._viewUpdaters = this._createSubViews();
  }

  _computeFlowScale() {
    const hull = arr => arr.reduce((acc, cur) => IOps.hull(acc, cur), Interval.EMPTY);
    const arr2i = arr => hull(arr.map(x => new Interval(x)));
    const ensureInterval = arrOrI => IOps.isInterval(arrOrI) ? arrOrI : arr2i(arrOrI);

    const network = this._model.network;
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

    for (let node of network.inputNodes) {
      const layer = this._coords.layerOf(node.id);
      const activationRange = ensureInterval(node.p.inputProps.range);
      activationRanges[node.id] = activationRange;
      maxRelFlow.update(new Interval(0, Math.max(0, activationRange.hi)), layer);
      maxRelFlow.update(new Interval(Math.min(activationRange.lo, 0), 0), layer);
    }

    const edgeToActivation = e => IOps.mul(activationRanges[e.from.id], e.p.weightProps.range);
    for (let node of network.topSortNoInputs) {
      const layer = this._coords.layerOf(node.id);
      const getActivationRange = node.p.activationFunc.range.bind(node.p.activationFunc);
      const orderedInEdges = getOrderedInEdges(node, this._coords);
      const summands = [node.p.biasProps.range, ...orderedInEdges.map(edgeToActivation)];
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

    return View.NODE_MAX_INNER_HEIGHT / maxRelFlow.value;
  }

  _addImmutableProps() {
    this._model.network.nodes.forEach(node => {
      const props = this._nodeProps[node.id];
      props.i.orderedInEdges = getOrderedInEdges(node, this._coords);
      props.i.gridPos = grid(this._coords.abs(node.id));
    });
  }

  _updateMutableProps() {
    this._model.network.nodes.forEach(node => {
      // Compute props of node
      const { i: inp, m: mnp } = this._nodeProps[node.id];
      const partialSumRange = node.isInput() ?
        Interval.ZERO :
        getPartialSumRange(inp.orderedInEdges, node.p.bias);
      const range = IOps.hull(
        IOps.hull(partialSumRange, Interval.ZERO),
        new Interval(node.p.activation),
      );
      mnp.lowerHeight = range.lo * this._flowScale;
      mnp.upperHeight = range.hi * this._flowScale;
      mnp.innerHeight = IOps.width(range) * this._flowScale;
      mnp.zeroGridOffsetY = mnp.innerHeight / 2 - mnp.upperHeight;

      // Compute to-part of in-edges
      let lastTo = {
        pos: {
          x: inp.gridPos.x - 0.5 * View.NODE_SIZE.x,
          y: inp.gridPos.y - mnp.zeroGridOffsetY,
        },
        activation: node.p.bias * this._flowScale,
      };
      inp.orderedInEdges.forEach((edge, i) => {
        const { m: mep } = this._edgeProps[edge.id];

        mep.toPos = { x: lastTo.pos.x, y: lastTo.pos.y - lastTo.activation };
        mep.toActivation = edge.from.p.activation * edge.p.weight * this._flowScale;
        lastTo = { pos: mep.toPos, activation: mep.toActivation };

        mep.fromActivationColor = activationColor(edge.from.p.activation);
        mep.toActivationColor = activationColor(edge.from.p.activation * edge.p.weight);
      });

      // Compute from-part of out-edges
      node.out.forEach((edge, i) => {
        const { m: mep } = this._edgeProps[edge.id];
        mep.fromPos = {
          x: gridX(this._coords.absX(edge.from.id)) + 0.5 * View.NODE_SIZE.x,
          y: gridY(this._coords.absY(edge.from.id)) - mnp.zeroGridOffsetY,
        };
        mep.fromActivation = edge.from.p.activation * this._flowScale;
      });
    });

    // Compute edge geometries
    this._model.network.edges.forEach(edge => {
      const { m: mep } = this._edgeProps[edge.id];
      Object.assign(mep, View._buildEdgePaths(mep));
    });
  }

  _createSubViews() {
    const container = document.createElement('div');
    container.style.position = 'relative';

    const offset = {
      x: 0.5 * View.NODE_SIZE.x,
      y: 0.5 * (View.NODE_SIZE.y + View.NODE_MAX_INNER_HEIGHT),
    };

    this._overlay = document.createElement('div');
    this._overlay.style.position = 'absolute';
    this._overlay.style.top = `${offset.x}px`;
    this._overlay.style.left = `${offset.y}px`;

    this._parent.appendChild(this._overlay);

    this._svg = SVG().size(1000, 1000).addTo(this._parent);
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
      .css({ 'font-size': `${View.LABEL_FONT_SIZE}px` });
    this._handleLayer = this._svgOffsetContainer.group()
      .attr({ stroke: 'black', fill: 'transparent' })
      .css({ cursor: 'hand' });

    return [].concat(
      this._model.network.nodes.map(n => this._createNodeView(n)),
      this._model.network.edges.map(e => this._createEdgeView(e)),
    );
  }

  _createNodeView(node) {
    const nodeProps = this._nodeProps[node.id];
    const { i: inp, m: mnp } = nodeProps;

    // set up DOM elements and certain static/default properties
    const svgNodeGroup = this._nodeLayer.group();
    const svgNodeRect = svgNodeGroup.rect(View.NODE_SIZE.x, View.NODE_SIZE.y)
      .move(inp.gridPos.x - 0.5 * View.NODE_SIZE.x, inp.gridPos.y - 0.5 * View.NODE_SIZE.y)
      .attr({
        rx: View.NODE_RADIUS,
        ry: View.NODE_RADIUS,
        fill: fillColor(node),
        stroke: 'black',
      });

    const svgBiasHandle = this._handleLayer.circle(View.HANDLE_RADIUS)
      .cx(inp.gridPos.x - 0.5 * View.NODE_SIZE.x)
      .css({ 'visibility': node.isInput() ? 'hidden' : 'visible' });

    const biasDraggable = new VerticalDraggable(
      svgBiasHandle,
      this._coordAnchor,
      ({ y }) => this._biasChanged(node, this._biasFromY(y, nodeProps))
    );

    const svgSumHandle = this._handleLayer.circle(View.HANDLE_RADIUS)
      .cx(inp.gridPos.x)
      .css({ 'visibility': node.isInput() ? 'hidden' : 'visible' });

    const svgActivationHandle = this._handleLayer.circle(View.HANDLE_RADIUS)
      .cx(inp.gridPos.x + 0.5 * View.NODE_SIZE.x);

    if (node.isInput()) {
      const inputDraggable = new VerticalDraggable(
        svgActivationHandle,
        this._coordAnchor,
        ({ y }) => this._inputChanged(node, this._inputFromY(y, nodeProps))
      );
    }

    const debug = false;
    // can be enabled for UI debugging purposes
    const middleLinePathBuilder = () => new SVGPathBuilder()
      .M(inp.gridPos)
      .m({ x: -0.5 * View.NODE_SIZE.x, y: 0 })
      .l({ x: View.NODE_SIZE.x, y: 0 })
      .build();
    const svgNodeMiddleLine = !debug ? svgNodeGroup.group() : svgNodeGroup
      .path(middleLinePathBuilder())
      .attr({ stroke: 'gray', 'stroke-width': 1 });

    const zeroLinePathBuilder = () => new SVGPathBuilder()
      .M(inp.gridPos)
      .m({ x: -0.5 * View.NODE_SIZE.x, y: -mnp.zeroGridOffsetY })
      .l({ x: View.NODE_SIZE.x, y: 0 })
      .build();
    const svgNodeZeroLine = !debug ? svgNodeGroup.group() : svgNodeGroup.path(zeroLinePathBuilder())
      .attr({ stroke: 'orange' });

    const svgIdLabel = this._labelLayer.plain(node.id)
      .attr(inp.gridPos)
      .attr({
        'text-anchor': 'middle',
      });
    const svgBiasLabel = this._labelLayer.plain()
      .attr(inp.gridPos)
      .dmove(-View.NODE_SIZE.x / 2, mnp.lowerHeight)
      .dy(View.LABEL_FONT_SIZE)
      .dmove(-3, -3) // TODO: don't hardcode
      .attr({
        'text-anchor': 'end',
      })
      .css({ visibility: node.isInput() ? 'hidden' : 'visible' });
    const svgActivationLabel = this._labelLayer.plain()
      .x(inp.gridPos.x + View.NODE_SIZE.x / 2)
      .dx(3) // TODO: don't hardcode
      .attr({
        'text-anchor': 'start',
      });
    const svgTargetLabel = this._labelLayer.plain()
      .x(inp.gridPos.x + View.NODE_SIZE.x)
      .dx(3) // TODO: don't hardcode
      .attr({
        'text-anchor': 'start',
      })
      .css({ visibility: node.isOutput() ? 'visible' : 'hidden' });

    const biasLinePathBuilder = () => new SVGPathBuilder()
      .M(inp.gridPos)
      .m({ x: -View.NODE_SIZE.x / 2, y: -mnp.zeroGridOffsetY })
      .l({ x: 0, y: -node.p.bias * this._flowScale })
      .build();
    const svgBiasLine = node.isInput() ? this._edgeLayer.group() : this._edgeLayer
      .path(biasLinePathBuilder())
      .fill('none')
      .stroke('black');

    const sumAreaPathBuilder = () => new SVGPathBuilder()
      .M(inp.gridPos)
      .m({ x: 0, y: -mnp.zeroGridOffsetY })
      .h(-View.NODE_SIZE.x / 2)
      .v(-node.p.sum * this._flowScale)
      .h(View.NODE_SIZE.x / 2)
      .z()
      .build();
    const svgSumArea = node.isInput() ? this._edgeLayer.group() : this._edgeLayer
      .path(sumAreaPathBuilder())
      .stroke({ color: 'none' });

    const activationAreaPathBuilder = () => new SVGPathBuilder()
      .M(inp.gridPos)
      .m({ x: 0, y: -mnp.zeroGridOffsetY })
      .h(View.NODE_SIZE.x / 2)
      .v(-node.p.activation * this._flowScale)
      .h(-View.NODE_SIZE.x / 2)
      .z()
      .build();
    const svgActivationArea = node.isInput() ? this._edgeLayer.group() : this._edgeLayer
      .path(sumAreaPathBuilder())
      .stroke({ color: 'none' });

    const inOutConnectorPolyLinePathBuilder = () => new SVGPathBuilder()
      .M(inp.gridPos)
      .m({
        x: -View.NODE_SIZE.x / 2,
        y: -mnp.zeroGridOffsetY - Math.min(0, node.p.sum) * this._flowScale
      })
      .h(View.NODE_SIZE.x / 2)
      .V(inp.gridPos.y - mnp.zeroGridOffsetY)
      .h(View.NODE_SIZE.x / 2)
      .build();
    const svgInOutConnectorPolyLine = node.isInput() ? this._edgeLayer.group() : this._edgeLayer
      .path(inOutConnectorPolyLinePathBuilder())
      .stroke({ color: 'black' })
      .fill('none');

    const targetLineBuilder = () => new SVGPathBuilder()
      .M(inp.gridPos)
      .m({ x: View.NODE_SIZE.x / 2, y: -mnp.zeroGridOffsetY - node.p.target * this._flowScale })
      .h(View.NODE_SIZE.x / 2)
      .build();
    const svgTargetLine = !node.isOutput() ? this._edgeLayer.group() : this._edgeLayer
      .path(targetLineBuilder())
      .stroke({ color: 'cyan' })
      .fill('none');

    // set up update function
    const update = () => {
      svgNodeRect
        .attr({
          width: View.NODE_SIZE.x,
          height: View.NODE_SIZE.y + mnp.innerHeight
        })
        .transform({ translateY: -0.5 * mnp.innerHeight });
      svgIdLabel
        .attr(inp.gridPos)
        .dy(-mnp.innerHeight / 2 - View.NODE_SIZE.y / 8)
        .attr({
          'text-anchor': 'middle',
        });
      svgBiasHandle.cy(inp.gridPos.y - mnp.zeroGridOffsetY - node.p.bias * this._flowScale);
      svgBiasLabel.plain(formatNumber(node.p.bias));
      svgSumHandle.cy(inp.gridPos.y - mnp.zeroGridOffsetY - node.p.sum * this._flowScale);
      svgActivationHandle.cy(inp.gridPos.y - mnp.zeroGridOffsetY - node.p.activation
        * this._flowScale);
      svgActivationLabel
        .plain(formatNumber(node.p.activation))
        .y(inp.gridPos.y - mnp.zeroGridOffsetY)
        .dy(-node.p.activation * this._flowScale)
        .dy(-3); // TODO: don't hardcode
      if (debug) {
        svgNodeMiddleLine.plot(middleLinePathBuilder());
        svgNodeZeroLine.plot(zeroLinePathBuilder());
      }
      if (!node.isInput()) {
        svgBiasLine.plot(biasLinePathBuilder());
        svgSumArea.plot(sumAreaPathBuilder()).fill({
          color: activationColor(node.p.sum),
          opacity: 0.5
        });
        svgActivationArea.plot(activationAreaPathBuilder())
          .fill({ color: activationColor(node.p.activation), opacity: 0.5 });
        svgInOutConnectorPolyLine.plot(inOutConnectorPolyLinePathBuilder());
      }
      if (node.isOutput()) {
        svgTargetLine.plot(targetLineBuilder());
        svgTargetLabel.plain(formatNumber(node.p.target))
          .y(inp.gridPos.y - mnp.zeroGridOffsetY)
          .dy(-node.p.target * this._flowScale)
          .dy(-3); // TODO: don't hardcode
      }
    };

    update();

    return update;
  }

  _createEdgeView(edge) {
    const edgeProps = this._edgeProps[edge.id];
    const { i: iep, m: mep } = edgeProps;

    const svgEdgeGroup = this._edgeLayer.group()
      .attr({ 'fill-opacity': 0.5, stroke: 'none', });
    const svgEdge = svgEdgeGroup.path(mep.edgePath).attr({ stroke: 'black', fill: 'none' });
    /*
    const svgEdgeActivated = svgEdgeGroup.path(mep.edgeActivatedPath).attr({
      stroke: 'black',
      fill: 'none'
    });
     */
    const svgFromActivation = svgEdgeGroup.path(mep.fromActivationEdgePath);
    const svgToActivation = svgEdgeGroup.path(mep.toActivationEdgePath);
    const svgWeightLabel = this._labelLayer.plain('')
      .translate(0, -3)
      .attr({ 'text-anchor': 'middle' });

    const svgWeightHandle = this._handleLayer.circle(View.HANDLE_RADIUS);

    const weightDraggable = new VerticalDraggable(
      svgWeightHandle,
      this._coordAnchor,
      ({ y }) => this._weightChanged(edge, this._weightFromY(y, edgeProps))
    );

    const update = () => {
      svgEdge.plot(mep.edgePath);
      //svgEdgeActivated.plot(mep.edgeActivatedPath);
      svgFromActivation.plot(mep.fromActivationEdgePath).attr({ fill: mep.fromActivationColor });
      svgToActivation.plot(mep.toActivationEdgePath).attr({ fill: mep.toActivationColor });
      svgWeightLabel.plain(formatNumber(edge.p.weight)).attr(mep.labelPos);
      svgWeightHandle.center(mep.handlePos.x, mep.handlePos.y);
    };
    update();

    return update;
  }

  _inputFromY(y, { i: inp, m: mnp }) {
    return -(y - inp.gridPos.y + mnp.zeroGridOffsetY) / this._flowScale;
  }

  _inputChanged(node, newInput) {
    this.emit('input-changed', node, newInput);
  }

  _weightFromY(y, { i: iep, m: mep }) {
    return -(y - mep.intersectionPos.y) / mep.fromActivation;
  }

  _weightChanged(edge, newWeight) {
    this.emit('weight-changed', edge, newWeight);
  }

  _biasFromY(y, { i: inp, m: mnp }) {
    return -(y - inp.gridPos.y + mnp.zeroGridOffsetY) / this._flowScale;
  }

  _biasChanged(node, newBias) {
    this.emit('bias-changed', node, newBias);
  }

  /***
   * Update DOM based on model
   */
  update() {
    this._updateMutableProps();
    for (let updater of this._viewUpdaters) {
      updater();
    }
  }

  static _buildEdgePaths({ fromPos, fromActivation, toPos, toActivation }) {
    const flip = b => new Bezier([...b.points].reverse());

    const bezier = new Bezier(
      fromPos,
      { x: fromPos.x * 0.5 + toPos.x * 0.5, y: fromPos.y },
      { x: fromPos.x * 0.5 + toPos.x * 0.5, y: toPos.y },
      toPos
    );

    const bezierActivated = new Bezier(
      { x: fromPos.x, y: fromPos.y - fromActivation },
      { x: fromPos.x * 0.5 + toPos.x * 0.5, y: fromPos.y - fromActivation },
      { x: fromPos.x * 0.5 + toPos.x * 0.5, y: toPos.y - toActivation },
      { x: toPos.x, y: toPos.y - toActivation },
    );

    const { intersectionPos, handlePos, labelPos } = (() => {
      const bbox = bezier.bbox();
      const intersection = bezier.intersects({
        p1: { x: bbox.x.min + bbox.x.size * (1 - 0.33), y: bbox.y.min - 1 },
        p2: { x: bbox.x.min + bbox.x.size * (1 - 0.33), y: bbox.y.max + 1 },
      })[0];

      const intersectionPos = bezier.get(intersection);
      const handlePos = { x: intersectionPos.x, y: intersectionPos.y - toActivation };
      const labelPos = handlePos;

      return { intersectionPos, handlePos, labelPos };
    })();

    const { bezierFrom, bezierFromActivated, bezierTo, bezierToActivated } = (() => {
      const bezierSub = new Bezier(
        { x: 0, y: -fromActivation },
        { x: 0.5, y: -fromActivation },
        { x: 0.5, y: -toActivation },
        { x: 1, y: -toActivation },
      );
      const line = { p1: { x: -1, y: 0 }, p2: { x: 2, y: 0 } };
      // bezierSub and line intersect at the same t as bezier and bezierActivated,
      // but the intersection is much easier to compute (intersecting two cubic bezier curves was
      // too slow for realtime processing, but intersecting a cubic bezier curve and a line works
      // just fine).
      const t = bezierSub.intersects(line)[0] ?? 1;
      const { left: bezierFrom, right: bezierTo } = bezier.split(t);
      const { left: bezierFromActivated, right: bezierToActivated } = bezierActivated.split(t);
      return { bezierFrom, bezierFromActivated, bezierTo, bezierToActivated };
    })();

    const edgePath = new SVGPathBuilder().MC(...bezier.points).build();
    const edgeActivatedPath = new SVGPathBuilder().MC(...bezierActivated.points).build();
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
}

View.GRID_SCALE = { x: 300, y: 300 };
View.NODE_SIZE = {
  x: Math.min(View.GRID_SCALE.x, View.GRID_SCALE.y) / 4,
  y: Math.min(View.GRID_SCALE.x, View.GRID_SCALE.y) / 4,
};
View.NODE_MAX_INNER_HEIGHT = (View.GRID_SCALE.y - View.NODE_SIZE.y) * 0.9;
View.NODE_RADIUS = View.NODE_SIZE.y * 0.5 * 0.7;
View.LABEL_FONT_SIZE = 16; // TODO: Move to CSS if possible // px
View.HANDLE_RADIUS = 10;

function getOrderedInEdges(node, coords) {
  // sort incoming edges by connected node (node.from) in descending y order
  const compare = (edgeA, edgeB) => -(coords.absY(edgeA.from.id) - coords.absY(edgeB.from.id));
  return [...node.in].sort(compare);
}

function getPartialSumRange(edges, bias) {
  const partials = edges.reduce(
    (acc, cur) => {
      acc.push(acc[acc.length - 1] + cur.from.p.activation * cur.p.weight);
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
const formatNumber = n => (n >= 0 ? " " : "") + Number(n).toFixed(2);

const gridX = x => View.GRID_SCALE.x * x;
const gridY = y => View.GRID_SCALE.y * y;
const grid = ({ x, y }) => ({ x: gridX(x), y: gridY(y) });

class VerticalDraggable {
  constructor(svgElem, anchorElem, dragHandler) {
    this._svgElem = svgElem;
    this._anchorElem = anchorElem;
    this._dragHandler = dragHandler;
    this._moveHandler = ev => this._move(ev);
    this._upHandler = ev => this._up(ev);

    svgElem.on('pointerdown', ev => this._down(ev));
  }

  _down(event) {
    window.addEventListener('pointermove', this._moveHandler);
    window.addEventListener('pointerup', this._upHandler);
  }

  _move(event) {
    const anchorTop = this._anchorElem.node.getBoundingClientRect().y;
    this._dragHandler({ y: event.clientY - anchorTop });
  }

  _up(event) {
    window.removeEventListener('pointermove', this._moveHandler);
    window.removeEventListener('pointerup', this._upHandler);
  }
}

export { View };
