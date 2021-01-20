/***
 * layout: [[nodeIds]] Column major layout (first subarray contains first layer etc.)
 */
export default class NodeCoordinates {
  constructor(layout, options = {}) {
    this._options = Object.assign({}, { alignV: NodeCoordinates.alignVMiddle });
    this._layout = layout.map(layer => layer.map(nodeId => ({ id: nodeId })));
    this._width = this._layout.length;
    this._height = this._layout.map(layer => layer.length)
      .reduce((cur, acc) => Math.max(cur, acc), -1);
    this._absCoords = {};
    for (let l = 0; l < this._layout.length; ++l) {
      const layer = this._layout[l];
      for (let n = 0; n < layer.length; ++n) {
        const cell = layer[n];
        const absCoords = {
          x: l,
          y: this._options.alignV(n, layer.length, this._height),
        };
        cell.pos = absCoords;
        this._absCoords[cell.id] = absCoords;
      }
    }
    this._coordForUnknownId = { x: -1, y: -1 };
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  static alignVTop(layerIndex, layerHeight, maxHeight) {
    return layerIndex;
  }

  static alignVMiddle(layerIndex, layerHeight, maxHeight) {
    return (maxHeight - layerHeight) / 2 + layerIndex;
  }

  static alignVBottom(layerIndex, layerHeight, maxHeight) {
    return (maxHeight - layerHeight) + layerIndex;
  }

  has(nodeId) {
    return this._absCoords.hasOwnProperty(nodeId);
  }

  abs(nodeId) {
    return this.has(nodeId) ? this._absCoords[nodeId] : this._coordForUnknownId;
  }

  absX(nodeId) {
    return this.abs(nodeId).x;
  }

  absY(nodeId) {
    return this.abs(nodeId).y;
  }

  rel(nodeId) {
    const { x, y } = this.abs(nodeId);
    return { x: x / (this.width - 1), y: y / (this.height - 1) };
  }

  relX(nodeId) {
    return this.rel(nodeId).x;
  }

  relY(nodeId) {
    return this.rel(nodeId).y;
  }

  layout() {
    return this._layout.map(l => l.map(cell => cell.id));
  }

  layerOf(nodeId) {
    const layout = this.layout();
    for (let layer of layout) {
      if (layer.includes(nodeId)) {
        return layer;
      }
    }
  }

  list() {
    return this.layout().flat();
  }

  sortXY() {
    return this.layout().flat();
  }

  sortYX() {
    const compareYX = (cell1, cell2) => cell1.y === cell2.y ? cell1.x - cell2.x : cell1.y - cell2.y;
    return this._layout.flat().sort(compareYX).map(cell => cell.id);
  }

  mirrorH() {
    return new NodeCoordinates([...this.layout()].reverse(), this._options);
  }

  mirrorV() {
    let alignV;
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
    const options = Object.assign({}, this._options, { alignV });
    return new NodeCoordinates(this.layout().map(l => [...l].reverse()), options);
  }
}

export { NodeCoordinates };
