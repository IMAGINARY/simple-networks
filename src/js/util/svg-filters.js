function outlineFilter(svg, width, color, opacity) {
  const filter = svg.filter();
  const dilate = filter.morphology('dilate', width).in(filter.$sourceAlpha);
  const flood = filter.flood(color, opacity);
  const outline = filter.composite(flood, dilate, 'in');
  filter.merge([outline, filter.$source]);
  return filter;
}

export { outlineFilter };
