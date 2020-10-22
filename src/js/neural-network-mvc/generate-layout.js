export default function generateLayout(network) {
  const topSort = network.topSort;
  const layerIndices = {};
  const layers = [];
  let currentLayer = [];
  for (let node of topSort) {
    for (let edge of node.in) {
      if (layerIndices[edge.from.id] === layers.length) {
        layers.push(currentLayer);
        currentLayer = [];
        break;
      }
    }
    currentLayer.push(node.id);
    layerIndices[node.id] = layers.length;
  }
  layers.push(currentLayer);
  return layers;
}
