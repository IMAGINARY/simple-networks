export default class SVGPathBuilder {
  constructor() {
    this.path = "";
  }

  M(p) {
    this.path += `M ${p.x} ${p.y}\n`;
    return this;
  }

  m(v) {
    this.path += `m ${v.x} ${v.y}\n`;
    return this;
  }

  L(p) {
    this.path += `L ${p.x} ${p.y}\n`;
    return this;
  }

  l(v) {
    this.path += `l ${v.x} ${v.y}\n`;
    return this;
  }

  H(px) {
    this.path += `H ${px}\n`;
    return this;
  }

  h(vx) {
    this.path += `h ${vx}\n`;
    return this;
  }

  V(py) {
    this.path += `V ${py}\n`;
    return this;
  }

  v(vy) {
    this.path += `v ${vy}\n`;
    return this;
  }

  C(cp1, cp2, p) {
    this.path += `C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p.x} ${p.y}\n`;
    return this;
  }

  c(cv1, cv2, v) {
    this.path += `c ${cv1.x} ${cv1.y} ${cv2.x} ${cv2.y} ${v.x} ${v.y}\n`;
    return this;
  }

  S(cp2, p) {
    this.path += `S ${cp2.x} ${cp2.y} ${p.x} ${p.y}\n`;
    return this;
  }

  s(cv2, v) {
    this.path += `s ${cv2.x} ${cv2.y} ${v.x} ${v.y}\n`;
    return this;
  }

  Q(cp1, p) {
    this.path += `Q ${cp1.x} ${cp1.y} ${p.x} ${p.y}\n`;
    return this;
  }

  q(cv1, v) {
    this.path += `q ${cv1.x} ${cv1.y} ${v.x} ${v.y}\n`;
    return this;
  }

  T(p) {
    this.path += `T ${p.x} ${p.y}\n`;
    return this;
  }

  t(v) {
    this.path += `t ${v.x} ${v.y}\n`;
    return this;
  }

  A(r, angle, largeArcFlag, sweepFlag, p) {
    this.path += `A ${r.x} ${r.y} ${angle} ${largeArcFlag} ${sweepFlag} ${p.x} ${p.y}\n`;
    return this;
  }

  a(r, angle, largeArcFlag, sweepFlag, v) {
    this.path += `a ${r.x} ${r.y} ${angle} ${largeArcFlag} ${sweepFlag} ${v.x} ${v.y}\n`;
    return this;
  }

  Z() {
    this.path += 'Z\n';
    return this;
  }

  z() {
    this.path += 'z\n';
    return this;
  }

  MC(p1, cp1, cp2, p2) {
    return this.M(p1).C(cp1, cp2, p2);
  }

  LC(p1, cp1, cp2, p2) {
    return this.L(p1).C(cp1, cp2, p2);
  }

  MQ(p1, cp1, p2) {
    return this.M(p1).Q(cp1, p2);
  }

  LQ(p1, cp1, p2) {
    return this.L(p1).Q(cp1, p2);
  }

  build() {
    return this.path;
  }
}

export { SVGPathBuilder };
