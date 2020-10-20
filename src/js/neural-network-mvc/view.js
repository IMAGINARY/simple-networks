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
    this._flowScale = View.NODE_MAX_INNER_HEIGHT / IOps.width(this._model.flowRange);
    this._coords = new NodeCoordinates(layout);

    this._nodeProps = Object.fromEntries(model.network.nodes.map(n => [n.id, { i: {}, m: {} }]));
    this._edgeProps = Object.fromEntries(model.network.edges.map(e => [e.id, { i: {}, m: {} }]));

    this._addImmutableProps();
    this._updateMutableProps();

    // TODO: set up <svg> and overlay <div> and store all important DOM nodes (in node/edge maps?)
    this._viewUpdaters = null;
    this._createSubViews();
    // TODO: expose all elements that need interaction through the controller
    // TODO: Register events handlers and emit 'bias', 'weight' and 'input'
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

    this._viewUpdaters = [].concat(
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
    const shift = (b, v) => new Bezier(b.points.map(p => ({ x: p.x + v.x, y: p.y + v.y })));
    const flip = b => new Bezier([...b.points].reverse());

    const bezier = new Bezier(
      fromPos,
      { x: fromPos.x * 0.5 + toPos.x * 0.5, y: fromPos.y },
      { x: fromPos.x * 0.5 + toPos.x * 0.5, y: toPos.y },
      toPos
    );

    const bbox = bezier.bbox();
    const intersection = bezier.intersects({
      p1: { x: bbox.x.min + bbox.x.size * (1 - 0.33), y: bbox.y.min - 1 },
      p2: { x: bbox.x.min + bbox.x.size * (1 - 0.33), y: bbox.y.max + 1 },
    })[0];

    const { left: bezierFrom, right: bezierTo } = bezier.split(intersection);
    const bezierFromActivated = shift(bezierFrom, { x: 0, y: -fromActivation });
    const bezierToActivated = shift(bezierTo, { x: 0, y: -toActivation });

    if (bezierFromActivated.order !== 3 || bezierToActivated.order !== 3) {
      console.log(
        `Sometimes, NaNs occur in Bezier paths, but it's hardly reproducible.
        I suspect it's because of non-cubic Bezier curves being created during the split.
        Please check the following curves for their "order" property.`,
        { bezierFromActivated, bezierToActivated },
      );
    }

    const edgePath = new SVGPathBuilder().M(bezierFrom.points[0])
      .C(...bezier.points.slice(1))
      .build();

    const fromActivationEdgePath = new SVGPathBuilder()
      .M(bezierFrom.points[0])
      .C(...bezierFrom.points.slice(1))
      .L(bezierFromActivated.points[3])
      .C(...flip(bezierFromActivated).points.slice(1))
      .L(bezierFromActivated.points[0], bezierFrom.points[0])
      .Z()
      .build();

    const toActivationEdgePath = new SVGPathBuilder()
      .M(bezierTo.points[0])
      .C(...bezierTo.points.slice(1))
      .L(bezierToActivated.points[3])
      .C(...flip(bezierToActivated).points.slice(1))
      .L(bezierToActivated.points[0], bezierTo.points[0])
      .Z()
      .build();

    const intersectionPos = bezier.get(intersection);
    const handlePos = { x: intersectionPos.x, y: intersectionPos.y - toActivation };
    const labelPos = handlePos;

    return {
      edgePath,
      fromActivationEdgePath,
      toActivationEdgePath,
      intersectionPos,
      labelPos,
      handlePos
    };
  }
}

View.GRID_SCALE = { x: 300, y: 300 };
View.NODE_SIZE = {
  x: Math.min(View.GRID_SCALE.x, View.GRID_SCALE.y) / 4,
  y: Math.min(View.GRID_SCALE.x, View.GRID_SCALE.y) / 4,
};
View.NODE_MAX_INNER_HEIGHT = (View.GRID_SCALE.x - View.NODE_SIZE.y) * 0.9; // TODO: compute better range to determine max inner height
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
