//jshint: "esversion": 8

import {
  NetworkVisualization
} from './NetworkVisualization.js';


import {
  unit
} from './constants.js';


export class Level {
  constructor(title, network, xlabels, trainXs, ylabels, trainYs, description) {
    this.title = title || "";

    this.network = network;
    this.trainXs = trainXs;
    this.trainYs = trainYs;
    this.xlabels = xlabels;
    this.ylabels = ylabels;

    this.description = description || "";
    this.gradientdescentactive = false;

    this.network.backup();
  }

  show() {
    this.createUI();
    this.t0 = Date.now();
    const nv = this.nv = new NetworkVisualization(this.network, () => this.animatecallback());
    nv.animate();
    nv.addInteraction();
  }

  hide() {
    if (this.nv)
      this.nv.stop();
    if (this.table)
      this.table.html('');
  }

  createUI() {
    d3.select("#leveltitle").text(this.title);
    d3.select("#description").text(this.description);

    this.createTable();

    document.querySelector('.reset').onclick = (() => {
      this.network.restore();
    });

    document.querySelector('.single-step').onclick = (() => {
      this.gradientdescentactive = false;
      this.network.gradientstep(this.trainXs, this.trainYs, 0.01);
    });

    document.querySelector('.pause-resume').onclick = (() => {
      this.gradientdescentactive = !this.gradientdescentactive;
    });
  }

  createTable() {
    this.columns = this.xlabels.concat(this.ylabels).concat(this.ylabels.map(k => "predicted " + k));
    this.table = d3.select('#trainingtable');
    this.thead = this.table.append('thead');
    this.tbody = this.table.append('tbody');

    // append the header row
    this.thead.append('tr')
      .selectAll('th')
      .data(this.columns).enter()
      .append('th')
      .text(function(column) {
        return column;
      });
  }

  animatecallback() {
    if (this.animatestep) this.animatestep(); //This function might be suitably overwritten by inherited levels
    if (this.gradientdescentactive) {
      for (let k = 0; k < 10; k++)
        this.network.gradientstep(this.trainXs, this.trainYs, 0.001);
    }
    this.updateUI();
  }

  updateUI() {
    if (this.gradientdescentactive && d3.select('#gradientanimating')) {
      document.querySelector('.pause-resume').classList.add("pause");
      document.querySelector('.pause-resume').classList.remove("resume");
    } else {
      document.querySelector('.pause-resume').classList.remove("pause");
      document.querySelector('.pause-resume').classList.add("resume");
    }

    this.updatetable();

    const closs = this.network.loss(this.trainXs, this.trainYs);
    d3.select("#totalerror")
      .text(closs.toFixed(2));

    d3.select("#nextbutton").classed("selected", closs < .02);

    d3.select("#totalerrorterm")
      .text(this.rows.map(r => `(${r[r.length-1]} - ${r[r.length-2]})²`).join(" + "));



    d3.select("#outputs").select(".values").selectAll("text")
      .data(this.network.outputnodes)
      .join("text")
      .text(n => n.format(n.getActivation()))
      .attr("x", n => n.x)
      .attr("y", n => n.y - unit * n.getActivation());

    d3.select("#input").select(".values").selectAll("text")
      .data(this.network.inputnodes)
      .join("text")
      .text(n => n.format(n.getActivation()))
      .attr("x", n => n.x - 25)
      .attr("y", n => n.y - unit * n.getActivation());


    if (document.querySelector("#showgradient").checked) {
      this.network.gradientLoss(this.trainXs, this.trainYs);
    } else {
      this.network.resetdloss();
    }
  }

  updatetable() {
    const tbody = this.tbody;

    let rows = [];
    this.rows = rows;
    for (let k in this.trainXs) {
      const row = this.trainXs[k].map((v, k) => this.network.inputnodes[k].format(v))
        .concat(this.trainYs[k].map((v, k) => this.network.outputnodes[k].format(v)))
        .concat(this.network.predict(this.trainXs[k]).map((v, k) => this.network.outputnodes[k].format(v)));
      row.error = this.network.sqerror(this.trainXs[k], this.trainYs[k]);
      rows.push(row);
    }

    var errorcolor = d3.scaleSequential().domain([1, 0])
      .interpolator(d3.interpolateRdYlGn);

    // create a row for each object in the data
    var trs = tbody.selectAll('tr')
      .data(rows)
      .join('tr')
      .on('click', (row, i) => {
        for (let k in this.network.inputnodes) {
          this.network.inputnodes[k].setUserParameter(this.trainXs[i][k]);
        }
        for (let k in this.network.outputnodes) {
          this.network.outputnodes[k].target = (this.trainYs[i][k]);
        }
      });

    // create a cell in each row for each column
    var cells = trs
      .selectAll('td')
      .data(d => d.map(v => {
        return {
          value: v,
          error: d.error
        };
      }))
      .join('td')
      .text(d => d.value)
      .style("background-color", (d, i) => (i >= this.trainXs[0].length + this.trainYs[0].length) ? errorcolor(d.error) : 'white');


  }
}
