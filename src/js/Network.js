import {
  updateDynamicVariables
} from './DynamicVariable.js';

export class Network {
  constructor(nodes, inputnodes, outputnodes) {
    this.nodes = nodes;
    this.inputnodes = inputnodes;
    this.outputnodes = outputnodes;
    this.edges = [];

    for (let i in nodes) {
      for (let k in nodes[i].outedges) {
        this.edges.push(nodes[i].outedges[k]);
      }
    }
  }

  predict(input) {
    if (this.inputnodes.length != input.length) {
      console.error("Input does not fit input size of Network");
    }

    //overwrite activation callbacks for input
    for (let i in this.inputnodes) {
      this.inputnodes[i].temporarilyReplaceGetActivation(() => input[i]);
    }

    //get prediction in this 'modified network'
    updateDynamicVariables();
    const predicted = this.outputnodes.map(o => o.getActivation());

    //restore input functions from backup
    for (let i in this.inputnodes) {
      this.inputnodes[i].restoreGetActivation();
    }
    return predicted;
  }

  sqerror(trainX, trainY) {
    const predicted = this.predict(trainX);
    let sqsum = 0;
    for (let k in predicted)
      sqsum += (predicted[k] - trainY[k]) * (predicted[k] - trainY[k]);
    return sqsum;
  }

  loss(trainXs, trainYs) {
    let sqsum = 0;
    for (let i in trainXs) {
      sqsum += this.sqerror(trainXs[i], trainYs[i]);
    }
    return sqsum;
  }

  resetdloss() {
    for (let i in this.nodes) {
      this.nodes[i].dloss = 0;
    }

    for (let i in this.edges) {
      this.edges[i].dloss = 0;
    }
  }

  //computes loss function and saves its gradient as parameters to objects in network
  gradientLoss(trainXs, trainYs) {
    let sqsum = 0;
    this.resetdloss();
    for (let k in trainXs) {
      const input = trainXs[k];
      const target = trainYs[k];
      //overwrite activation callbacks for input
      for (let i in this.inputnodes) {
        this.inputnodes[i].temporarilyReplaceGetActivation(() => input[i]);
      }

      //get prediction in this 'modified network'
      updateDynamicVariables();
      const predicted = this.outputnodes.map(o => o.getActivation());
      for (let i in predicted)
        sqsum += (predicted[i] - target[i]) * (predicted[i] - target[i]);

      for (let i in this.outputnodes) {
        this.outputnodes[i].temporarilyReplaceGetdActivation(() => 2 * (predicted[i] - target[i]));
      }
      updateDynamicVariables();

      for (let i in this.nodes) {
        this.nodes[i].dloss += this.nodes[i].getdBias();
      }

      for (let i in this.edges) {
        this.edges[i].dloss += this.edges[i].getdWeight();
      }



      //restore functions from backup
      for (let i in this.inputnodes) {
        this.inputnodes[i].restoreGetActivation();
      }

      for (let i in this.outputnodes) {
        this.outputnodes[i].restoreGetdActivation();
      }
    }
    return sqsum;
  }

  gradientstep(trainXs, trainYs, stepsize) {
    this.gradientLoss(trainXs, trainYs);

    for (let i in this.nodes) {
      if (this.nodes[i].constructor.name == "Node" && this.nodes[i].adjustable) { //only internal nodes
        this.nodes[i].bias -= stepsize * this.nodes[i].dloss;
      }
    }

    for (let i in this.edges) {
      if(this.edges[i].adjustable)
        this.edges[i].weight -= stepsize * this.edges[i].dloss;
    }
    updateDynamicVariables();
  }

  pauseAnimatedInput() {
    for (let i in this.inputnodes) {
      const node = this.inputnodes[i];
      node.pauseInput();
    }
  }

  backup() {
    for (let k in this.nodes) {
      this.nodes[k].backup();
    }

    for (let k in this.edges) {
      this.edges[k].backup();
    }
  }

  restore() {
    for (let k in this.nodes) {
      this.nodes[k].restore();
    }

    for (let k in this.edges) {
      this.edges[k].restore();
    }
  }
}
