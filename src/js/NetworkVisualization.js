import {
  unit
} from './constants.js';

import {
  DynamicVariable,
  updateDynamicVariables
} from './DynamicVariable.js';

export class NetworkVisualization {
  constructor(network, animatecallback) {
    const nodes = this.nodes = network.nodes;
    this.network = network;
    this.inputnodes = network.inputnodes;
    this.outputnodes = network.outputnodes;
    this.animatecallback = animatecallback;

    this.edges = [];

    for (let i in nodes) {
      for (let k in nodes[i].outedges) {
        this.edges.push(nodes[i].outedges[k]);
      }
    }
    //sort based on y coordinates of incoming edges
    this.edges = this.edges.sort((a, b) => (b.from.y - a.from.y));

    //arrow from http://jsfiddle.net/igbatov/v0ekdzw1/
    d3.select("svg").append("svg:defs").append("svg:marker")
      .attr("id", "triangle")
      .attr("refX", 6)
      .attr("refY", 6)
      .attr("markerWidth", 30)
      .attr("markerHeight", 30)
      .attr("markerUnits", "userSpaceOnUse")
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 12 6 0 12 3 6")
      .style("fill", "orange");
  }

  stop() {
    this.animating = false;
  }

  animate() {
    this.animating = true;
    this.animateloop();
  }

  animateloop() {
    if (!this.animating) return;

    if (this.animatecallback)
      this.animatecallback();
    const nodes = this.nodes;
    const inputnodes = this.inputnodes;
    const outputnodes = this.outputnodes;
    const edges = this.edges;

    updateDynamicVariables();
    for (let i in nodes) {
      nodes[i].offset = nodes[i].bias;
    }
    for (let i in edges) {
      const edge = edges[i];
      edge.offset = edge.to.offset;
      edge.to.offset += edge.from.getActivation() * edge.weight;
    }

    d3.select("#nodes").select(".nodes").selectAll("circle").data(nodes)
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 95)
      .attr("fill", d => d.constructor.name == "InputNode" ? "orange" : (d.constructor.name == "OutputNode" ? d.errorcolor() : "black"))
      .attr("stroke", "black")
      .attr("stroke-width", 3)
      .attr("fill-opacity", 0.2)
      .attr("pointer-events", "none");


    d3.select("#nodes").select(".parameters").selectAll("circle").data(nodes.filter(node => node.adjustable))
      .join("circle")
      .attr("cx", n => n.x)
      .attr("cy", n => n.y - unit * n.bias)
      .attr("r", 15)
      .attr("fill", "white")
      .attr("fill-opacity", 0.5)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.5);


    const DLOSS_SCALE = 0.1;
    const DLOSS_CLAMP = 3;
    const clamp = (x, mi, ma) => Math.min(ma, Math.max(mi, x));
    d3.select("#nodes").select(".gradient").selectAll("path").data(nodes.filter(node => node.dloss != 0 && node.adjustable))
      .join("path")
      .attr("d", (node) => {
        const p = d3.path();
        p.moveTo(node.x, node.y - unit * node.bias);
        p.lineTo(node.x, node.y - unit * (node.bias - clamp(node.dloss * DLOSS_SCALE, -DLOSS_CLAMP, DLOSS_CLAMP)));
        return p;
      })
      .attr("marker-end", "url(#triangle)")
      .attr("stroke", "orange")
      .attr("stroke-width", 2)
      .attr("fill", "none");

    d3.select("#edges").select(".normalized-gradient").selectAll("path").data(edges.filter(edge => edge.dloss != 0))
      .join("path")
      .attr("d", (edge) => {
        const p = d3.path();
        const x = edge.normalizedParameterPosition()[0];
        const y = edge.normalizedParameterPosition()[1];
        p.moveTo(x, y);
        p.lineTo(x, y + unit * clamp(edge.dloss * DLOSS_SCALE, -DLOSS_CLAMP, DLOSS_CLAMP));
        return p;
      })
      .attr("marker-end", "url(#triangle)")
      .attr("stroke", "orange")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .style("opacity", edge => 0.5 - Math.abs(edge.from.getActivation()));


    d3.select("#edges").select(".gradient").selectAll("path").data(edges.filter(edge => edge.dloss != 0))
      .join("path")
      .attr("d", (edge) => {
        const p = d3.path();
        const x = edge.parameterPosition()[0];
        const y = edge.parameterPosition()[1];
        p.moveTo(x, y);
        p.lineTo(x, y + unit * clamp(edge.dloss / edge.from.getActivation() * DLOSS_SCALE, -DLOSS_CLAMP, DLOSS_CLAMP));
        return p;
      })
      .attr("marker-end", "url(#triangle)")
      .attr("stroke", "orange")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .style("opacity", edge => Math.min(0.5, Math.abs(edge.from.getActivation())));


    d3.select("#edges").select(".parameters").selectAll("circle").data(edges)
      .join("circle")
      .attr("cx", edge => edge.parameterPosition()[0])
      .attr("cy", edge => edge.parameterPosition()[1])
      .attr("r", 15)
      .attr("fill", "blue")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill-opacity", edge => Math.min(0.5, Math.abs(edge.from.getActivation())))
      .attr("stroke-opacity", edge => Math.min(0.5, Math.abs(edge.from.getActivation())));


    d3.select("#edges").select(".normalized-parameters").selectAll("circle").data(edges)
      .join("circle")
      .attr("cx", edge => edge.normalizedParameterPosition()[0])
      .attr("cy", edge => edge.normalizedParameterPosition()[1])
      .attr("r", 15)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill-opacity", edge => 0.5 - Math.abs(edge.from.getActivation()))
      .attr("stroke-opacity", edge => 0.5 - Math.abs(edge.from.getActivation()));

    const inputwidth = 60;

    d3.select("#input").select(".activations").selectAll("rect").data(inputnodes).join("rect")
      .attr("x", node => node.x - inputwidth)
      .attr("y", node => node.y - Math.max(0, node.getActivation() * unit))
      .attr("width", inputwidth)
      .attr("height", node => Math.abs(node.getActivation() * unit))
      .attr("fill", "blue")
      .attr("fill-opacity", 0.5);

    d3.select("#input").select(".parameters").selectAll("circle").data(inputnodes)
      .join("circle")
      .attr("cx", node => (node.x - inputwidth))
      .attr("cy", node => node.y - unit * node.getActivation())
      .attr("r", 15)
      .attr("fill", "orange")
      .attr("fill-opacity", 0.6)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);

    const outputwidth = inputwidth;

    d3.select("#outputs").select(".flow").selectAll("rect").data(outputnodes).join("rect")
      .attr("x", node => node.x)
      .attr("y", node => node.y - Math.max(0, node.getActivation() * unit))
      .attr("width", outputwidth)
      .attr("height", node => Math.abs(node.getActivation() * unit))
      .attr("fill", "blue")
      .attr("fill-opacity", 0.5);

    d3.select("#outputs").select(".target").selectAll("text")
      .data(outputnodes.filter(n => typeof n.target == 'number'))
      .join("text")
      .text(n => "target: " + n.format(n.target))
      .attr("x", n => n.x + 50)
      .attr("y", n => n.y - unit * n.target)
      .attr("opacity", 1)
      .attr("fill", n => n.errorcolor());

    d3.select("#edges").select(".edges").selectAll("path").data(edges).join("path")
      .attr("d", edge => {
        const p = d3.path();
        if (edge.from.bias <= 0 || edge.from.constructor.name == "InputNode") {
          p.moveTo(edge.from.x, edge.from.y);
        } else {
          //make "waterproof"
          p.moveTo(edge.from.x, edge.from.y - unit * edge.from.bias);
          p.lineTo(edge.from.x, edge.from.y);
        }

        //p.lineTo(edge.to.x, edge.to.y);
        const b = edge.bezier();
        p.bezierCurveTo(b[1][0], b[1][1], b[2][0], b[2][1], b[3][0], b[3][1]);
        if (edge.offset < 0) //make "waterproof"
          p.lineTo(edge.to.x, edge.to.y);
        return p;
      })
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill", "none");


    d3.select("#edges").select(".activations").selectAll("path").data(edges).join("path")
      .attr("d", edge => {
        const sactivation = edge.from.getActivation();
        const eactivation = sactivation * edge.weight;
        const p = d3.path();

        const b = edge.bezier();
        p.moveTo(b[0][0], b[0][1]);
        p.bezierCurveTo(b[1][0], b[1][1], b[2][0], b[2][1], b[3][0], b[3][1]);

        p.lineTo(b[3][0], b[3][1] - unit * eactivation);

        const b1 = edge.firstHalfBezier();
        const b2 = edge.secondHalfBezier();

        p.bezierCurveTo(b2[2][0], b2[2][1] - unit * eactivation, b2[1][0], b2[1][1] - unit * eactivation, b2[0][0], b2[0][1] - unit * eactivation);
        p.lineTo(b1[3][0], b1[3][1] - unit * sactivation);
        p.bezierCurveTo(b1[2][0], b1[2][1] - unit * sactivation, b1[1][0], b1[1][1] - unit * sactivation, b1[0][0], b1[0][1] - unit * sactivation);

        return p;
      })
      .attr("fill", e => e.weight > 0 ? "blue" : "red")
      .attr("fill-opacity", 0.5);

    requestAnimationFrame(() => this.animateloop());
  }


  addInteraction() {
    const nodes = this.nodes;

    /*
    d3.drag()
      .on("start", function() {
        var current = d3.select(this);
        this.deltaX = current.attr("cx") - d3.event.x;
        this.deltaY = current.attr("cy") - d3.event.y;
      })
      .on("drag", function() {
        const node = d3.select(this).data()[0];
        node.x = d3.event.x + this.deltaX;
        node.y = d3.event.y + this.deltaX;

        for (let i in nodes) {
          console.log(
            `nodes[${i}].x = ${nodes[i].x}; nodes[${i}].y = ${nodes[i].y};`
          );
        }
      })(d3.select("#nodes").selectAll("circle"));
      */
    const that = this;
    var tooltip;
    d3.drag()
      .on("start", function() {
        var current = d3.select(this);
        this.y0 = d3.event.y;
        const node = d3.select(this).data()[0];
        if (node.adjustable) {
          this.v0 = node.bias;
          that.network.pauseAnimatedInput();
          tooltip = d3.select("#tooltip").append("text");
        }

      })
      .on("drag", function() {
        const node = d3.select(this).data()[0];
        if (node.adjustable) {
          node.bias = this.v0 - (d3.event.y - this.y0) / unit;
          //node.y = d3.event.y + this.deltaX;
          tooltip
            .attr("x", node.x)
            .attr("y", node.y - unit * node.bias)
            .text(`add bias ${node.bias.toFixed(2)}`);
        }
      })
      .on("end", () => {
        const node = d3.select(this).data()[0];
        tooltip.remove();

      })(d3.select("#nodes").selectAll("circle"));

    d3.drag()
      .on("start", function() {
        const edge = d3.select(this).data()[0];
        var current = d3.select(this);
        this.y0 = d3.event.y;
        this.weight0 = edge.weight;
        that.network.pauseAnimatedInput();
        tooltip = d3.select("#tooltip").append("text");
      })
      .on("drag", function() {
        const edge = d3.select(this).data()[0];
        if (Math.abs(edge.from.getActivation()) > 0.001) {
          edge.weight = this.weight0 - (d3.event.y - this.y0) / edge.from.getActivation() / unit;
        }
        tooltip
          .attr("x", edge.parameterPosition()[0])
          .attr("y", edge.parameterPosition()[1])
          .text(`multiply by ${edge.weight.toFixed(2)}`);
      })
      .on("end", () => {
        tooltip.remove();
      })(d3.select("#edges").selectAll("path, circle"));

    d3.drag()
      .on("start", function() {
        const edge = d3.select(this).data()[0];
        var current = d3.select(this);
        this.y0 = d3.event.y;
        this.weight0 = edge.weight;
        that.network.pauseAnimatedInput();
        tooltip = d3.select("#tooltip").append("text");
      })
      .on("drag", function() {
        const edge = d3.select(this).data()[0];
        edge.weight = this.weight0 - (d3.event.y - this.y0) / unit;
        tooltip
          .attr("x", edge.normalizedParameterPosition()[0])
          .attr("y", edge.normalizedParameterPosition()[1])
          .text(`multiply by ${edge.weight.toFixed(2)}`);
      }).on("end", () => {
        tooltip.remove();
      })(d3.select("#edges").select(".normalized-parameters").selectAll("circle"));

    d3.drag()
      .on("start", function() {
        this.y0 = d3.event.y;
        const node = d3.select(this).data()[0];
        this.v0 = node.getActivation();
        node.setUserParameter(this.v0);
      })
      .on("drag", function() {
        const node = d3.select(this).data()[0];
        node.setUserParameter(this.v0 - (d3.event.y - this.y0) / unit);

        for (let k in that.network.outputnodes) {
          delete that.network.outputnodes[k].target;
        }
        //node.y = d3.event.y + this.deltaX;
      })(d3.select("#input").selectAll("circle, rect"));

  }
}
