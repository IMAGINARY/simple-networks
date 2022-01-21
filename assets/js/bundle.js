(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateDynamicVariables = updateDynamicVariables;
exports.getCurrentComputeTime = getCurrentComputeTime;
exports.DynamicVariable = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var currentcomputetime = 0;

function updateDynamicVariables() {
  currentcomputetime++;
}

function getCurrentComputeTime() {
  return currentcomputetime;
} //enables dynamic programming: values of variables are only recomputed if required.


var DynamicVariable = /*#__PURE__*/function () {
  function DynamicVariable() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    _classCallCheck(this, DynamicVariable);

    this.value = value;
    this.time = -1;
  }

  _createClass(DynamicVariable, [{
    key: "update",
    value: function update(fun) {
      if (this.time == currentcomputetime) return this.value;else {
        this.value = fun();
        this.time = currentcomputetime;
        return this.value;
      }
    }
  }]);

  return DynamicVariable;
}();

exports.DynamicVariable = DynamicVariable;

},{}],2:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Edge = void 0;

var d3 = _interopRequireWildcard(require("d3"));

var _constants = require("./constants.js");

var _DynamicVariable = require("./DynamicVariable.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

//one-dimensional De Casteljau to clip Bezier curves
var casteljau1d = function casteljau1d(p, alpha) {
  var q = [(1 - alpha) * p[0] + alpha * p[1], (1 - alpha) * p[1] + alpha * p[2], (1 - alpha) * p[2] + alpha * p[3]];
  var r = [(1 - alpha) * q[0] + alpha * q[1], (1 - alpha) * q[1] + alpha * q[2]];
  var s = [(1 - alpha) * r[0] + alpha * r[1]];
  return [[p[0], q[0], r[0], s[0]], [s[0], r[1], q[2], p[3]]];
};

var casteljau2d = function casteljau2d(p, alpha) {
  var x = casteljau1d(p.map(function (c) {
    return c[0];
  }), alpha);
  var y = casteljau1d(p.map(function (c) {
    return c[1];
  }), alpha);
  return [[[x[0][0], y[0][0]], [x[0][1], y[0][1]], [x[0][2], y[0][2]], [x[0][3], y[0][3]]], [[x[1][0], y[1][0]], [x[1][1], y[1][1]], [x[1][2], y[1][2]], [x[1][3], y[1][3]]]];
};

var Edge = /*#__PURE__*/function () {
  function Edge(from, to, weight) {
    _classCallCheck(this, Edge);

    this.from = from;
    this.to = to;
    this.weight = weight;
    this.dloss = 0;
    this.dweight = new _DynamicVariable.DynamicVariable();
    this.adjustable = true;
    this.multvis0 = 1 / 3;
    this.multvis1 = 2 / 3;
  }

  _createClass(Edge, [{
    key: "bezier",
    value: function bezier() {
      var edge = this;
      var x0 = edge.from.x + (edge.from.constructor.name == "InputNode" ? _constants.noderadius : 0);
      var x1 = edge.to.x - (edge.to.constructor.name == "OutputNode" ? _constants.noderadius : 0);
      return [[x0, edge.from.y], [(x0 + x1) / 2, edge.from.y], [(x0 + x1) / 2, edge.to.y - _constants.unit * edge.offset], [x1, edge.to.y - _constants.unit * edge.offset]];
    }
  }, {
    key: "generateActivatedCubicBezierSplines",
    value: function generateActivatedCubicBezierSplines(sactivation) {
      var b = this.bezier();
      var c0 = casteljau2d(b, this.multvis0);
      var c1 = casteljau2d(c0[1], (this.multvis1 - this.multvis0) / (1 - this.multvis0));
      return [c0[0], c1[0], c1[1]];
    }
  }, {
    key: "generateActivatedPath",
    value: function generateActivatedPath(sactivation, a1, a2) {
      var eactivation = sactivation * this.weight;
      var p1, p2, p3;

      var _this$generateActivat = this.generateActivatedCubicBezierSplines(sactivation);

      var _this$generateActivat2 = _slicedToArray(_this$generateActivat, 3);

      p1 = _this$generateActivat2[0];
      p2 = _this$generateActivat2[1];
      p3 = _this$generateActivat2[2];
      //p.lineTo(edge.to.x, edge.to.y);
      var p = d3.path();
      p.moveTo(p1[0][0], p1[0][1] - _constants.unit * sactivation);
      p.bezierCurveTo(p1[1][0], p1[1][1] - _constants.unit * sactivation, p1[2][0], p1[2][1] - _constants.unit * sactivation, p1[3][0], p1[3][1] - _constants.unit * sactivation);
      p.bezierCurveTo(p2[1][0], p2[1][1] - _constants.unit * sactivation, p2[2][0], p2[2][1] - _constants.unit * eactivation, p2[3][0], p2[3][1] - _constants.unit * eactivation);
      p.bezierCurveTo(p3[1][0], p3[1][1] - _constants.unit * eactivation, p3[2][0], p3[2][1] - _constants.unit * eactivation, p3[3][0], p3[3][1] - _constants.unit * eactivation);
      return p;
    }
  }, {
    key: "generateActivatedPathMiddle",
    value: function generateActivatedPathMiddle(sactivation) {
      var eactivation = sactivation * this.weight;
      var p2 = this.generateActivatedCubicBezierSplines(sactivation)[1]; //p.lineTo(edge.to.x, edge.to.y);

      var p = d3.path();
      p.moveTo(p2[0][0], p2[0][1] - _constants.unit * sactivation);
      p.bezierCurveTo(p2[1][0], p2[1][1] - _constants.unit * sactivation, p2[2][0], p2[2][1] - _constants.unit * eactivation, p2[3][0], p2[3][1] - _constants.unit * eactivation);
      return p;
    }
  }, {
    key: "normalizedParameterPosition",
    value: function normalizedParameterPosition() {
      var edge = this;
      return [(edge.from.x + edge.to.x) / 2, edge.firstHalfBezier()[3][1] - _constants.unit * edge.weight];
    }
  }, {
    key: "parameterPosition",
    value: function parameterPosition() {
      var sactivation = this.from.getActivation();
      if (Math.abs(sactivation) < _constants.parameterths) sactivation = (this.from.getActivation() < 0 ? -1 : 1) * _constants.parameterths;
      var p2 = this.generateActivatedCubicBezierSplines(sactivation)[1];
      var eactivation = sactivation * this.weight;
      return [p2[3][0], p2[3][1] - _constants.unit * eactivation];
    }
  }, {
    key: "getdWeight",
    value: function getdWeight() {
      var _this = this;

      return this.dweight.update(function () {
        return _this.to.active() ? _this.from.getActivation() * _this.to.getdActivation() : 0;
      });
    }
  }, {
    key: "backup",
    value: function backup() {
      this.backupWeight = this.weight;
    }
  }, {
    key: "restore",
    value: function restore() {
      this.weight = this.backupWeight;
    }
  }]);

  return Edge;
}();

exports.Edge = Edge;

},{"./DynamicVariable.js":1,"./constants.js":10,"d3":"d3"}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InputNode = void 0;

var _Node2 = require("./Node.js");

var _DynamicVariable = require("./DynamicVariable.js");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var InputNode = /*#__PURE__*/function (_Node) {
  _inherits(InputNode, _Node);

  var _super = _createSuper(InputNode);

  function InputNode() {
    var _this;

    var activationcb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
      return 0;
    };

    _classCallCheck(this, InputNode);

    _this = _super.call(this);
    _this.getActivation = activationcb;
    _this.adjustable = false;
    _this.allownegative = true;
    return _this;
  }

  _createClass(InputNode, [{
    key: "setUserParameter",
    value: function setUserParameter(val) {
      var _this2 = this;

      if (!this.hasOwnProperty("userparamter")) {
        this.getActivation = function () {
          return _this2.userparamter;
        };
      }

      if (!this.allownegative) {
        val = Math.max(0, val);
      }

      this.userparamter = val;
      (0, _DynamicVariable.updateDynamicVariables)();
    }
  }, {
    key: "temporarilyReplaceGetActivation",
    value: function temporarilyReplaceGetActivation(tempActivation) {
      this.getActivationBackup = this.getActivation;
      this.getActivation = tempActivation;
      (0, _DynamicVariable.updateDynamicVariables)();
    }
  }, {
    key: "restoreGetActivation",
    value: function restoreGetActivation() {
      this.getActivation = this.getActivationBackup;
      (0, _DynamicVariable.updateDynamicVariables)();
    }
  }, {
    key: "pauseInput",
    value: function pauseInput() {
      this.setUserParameter(this.getActivation());
    }
  }]);

  return InputNode;
}(_Node2.Node);

exports.InputNode = InputNode;

},{"./DynamicVariable.js":1,"./Node.js":8}],4:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Level = void 0;

var d3 = _interopRequireWildcard(require("d3"));

var _NetworkVisualization = require("./NetworkVisualization.js");

var _constants = require("./constants.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Level = /*#__PURE__*/function () {
  function Level(title, network, xlabels, trainXs, ylabels, trainYs, description) {
    _classCallCheck(this, Level);

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

  _createClass(Level, [{
    key: "show",
    value: function show() {
      var _this = this;

      this.createUI();
      this.t0 = Date.now();
      var nv = this.nv = new _NetworkVisualization.NetworkVisualization(this.network, function () {
        return _this.animatecallback();
      });
      nv.animate();
      nv.addInteraction();
      nv.resizeSVG(120);
      if (this.onenter) this.onenter();
    }
  }, {
    key: "hide",
    value: function hide() {
      if (this.nv) this.nv.stop();
      if (this.table) this.table.html('');
      if (this.onleave) this.onleave();
      d3.select("#levelinfo").html('');
    }
  }, {
    key: "createUI",
    value: function createUI() {
      var _this2 = this;

      document.querySelector(".helper").classList.remove("visible");
      document.querySelector(".mission").classList.add("visible");
      document.querySelector("#helpmebutton").classList.remove("selected");
      document.querySelector("#missionbutton").classList.add("selected");
      d3.select("#leveltitle").text(this.title);
      d3.select("#description").text(this.description);
      this.createTable();

      document.querySelector('.reset').onclick = function () {
        _this2.network.restore();
      };

      document.querySelector('.single-step').onclick = function () {
        _this2.gradientdescentactive = false;

        _this2.network.gradientstep(_this2.trainXs, _this2.trainYs, 0.01);
      };

      document.querySelector('.pause-resume').onclick = function () {
        _this2.gradientdescentactive = !_this2.gradientdescentactive;
      };
    }
  }, {
    key: "createTable",
    value: function createTable() {
      var _this3 = this;

      this.columns = this.xlabels.concat(this.ylabels).concat(this.ylabels.map(function (k) {
        return k + " (vorausgesagt)";
      }));
      this.table = d3.select('#trainingtable');
      this.thead = this.table.append('thead');
      this.tbody = this.table.append('tbody'); // append the header row

      this.thead.append('tr').selectAll('th').data(this.columns).enter().append('th').style("background-color", function (d, i) {
        return i >= _this3.xlabels.length ? "orange" : "yellow";
      }).text(function (column) {
        return column;
      });
    }
  }, {
    key: "animatecallback",
    value: function animatecallback() {
      if (this.animatestep) this.animatestep(); //This function might be suitably overwritten by inherited levels

      if (this.gradientdescentactive) {
        for (var k = 0; k < 10; k++) {
          this.network.gradientstep(this.trainXs, this.trainYs, 0.001);
        }
      }

      this.updateUI();
    }
  }, {
    key: "updateUI",
    value: function updateUI() {
      if (this.gradientdescentactive && d3.select('#gradientanimating')) {
        document.querySelector('.pause-resume').classList.add("pause");
        document.querySelector('.pause-resume').classList.remove("resume");
      } else {
        document.querySelector('.pause-resume').classList.remove("pause");
        document.querySelector('.pause-resume').classList.add("resume");
      }

      this.updatetable();
      var closs = this.network.loss(this.trainXs, this.trainYs);
      d3.select("#totalerror").text(closs.toFixed(2));
      d3.select("#nextbutton").classed("disable", closs > 0.02);
      d3.select(".tabbed").classed("successful", closs < 0.02);
      d3.select("#totalerrorterm").text(this.rows.map(function (r) {
        return "(".concat(r[r.length - 1], " - ").concat(r[r.length - 2], ")\xB2");
      }).join(" + "));

      if (document.querySelector("#showgradient").checked) {
        this.network.gradientLoss(this.trainXs, this.trainYs);
      } else {
        this.network.resetdloss();
      }
    }
  }, {
    key: "updatetable",
    value: function updatetable() {
      var _this4 = this;

      var tbody = this.tbody;
      var rows = [];
      this.rows = rows;

      for (var k in this.trainXs) {
        var row = this.trainXs[k].map(function (v, k) {
          return _this4.network.inputnodes[k].format(v);
        }).concat(this.trainYs[k].map(function (v, k) {
          return _this4.network.outputnodes[k].format(v);
        })).concat(this.network.predict(this.trainXs[k]).map(function (v, k) {
          return _this4.network.outputnodes[k].format(v);
        }));
        row.error = this.network.sqerror(this.trainXs[k], this.trainYs[k]);
        rows.push(row);
      }

      var errorcolor = d3.scaleSequential().domain([1, 0]).interpolator(d3.interpolateRdYlGn); // create a row for each object in the data

      var trs = tbody.selectAll('tr').data(rows).join('tr').on('click', function (row, i) {
        for (var _k in _this4.network.inputnodes) {
          _this4.network.inputnodes[_k].setUserParameter(_this4.trainXs[i][_k]);
        }

        for (var _k2 in _this4.network.outputnodes) {
          _this4.network.outputnodes[_k2].target = _this4.trainYs[i][_k2];
        }
      }); // create a cell in each row for each column

      var cells = trs.selectAll('td').data(function (d) {
        return d.map(function (v) {
          return {
            value: v,
            error: d.error
          };
        });
      }).join('td').text(function (d) {
        return d.value;
      }).style("background-color", function (d, i) {
        return i >= _this4.trainXs[0].length + _this4.trainYs[0].length ? errorcolor(d.error) : 'white';
      });
    }
  }]);

  return Level;
}();

exports.Level = Level;

},{"./NetworkVisualization.js":7,"./constants.js":10,"d3":"d3"}],5:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LevelController = void 0;

var d3 = _interopRequireWildcard(require("d3"));

var _levels = require("./levels.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var LevelController = /*#__PURE__*/function () {
  function LevelController() {
    _classCallCheck(this, LevelController);

    this.createEvents();
    this.levels = [//generators for levels
    function () {
      return new _levels.TutorialLevelA();
    }, function () {
      return new _levels.SumLevel();
    }, function () {
      return new _levels.AvgLevel();
    }, function () {
      return new _levels.TutorialLevelB();
    }, function () {
      return new _levels.TutorialLevelC();
    }, function () {
      return new _levels.FahrenheitLevel();
    }, function () {
      return new _levels.AndLevel();
    }, function () {
      return new _levels.MaxLevel();
    }, function () {
      return new _levels.WeatherLevel();
    }, function () {
      return new _levels.XorLevel();
    }];
    this.NUMBER_OF_LEVELS = this.levels.length;
    this.updateFooter(0);
  }

  _createClass(LevelController, [{
    key: "updateFooter",
    value: function updateFooter(lid) {
      d3.select('#navcircles').selectAll("a").data(this.levels).join("a").attr("href", function (d, i) {
        return "index.html#".concat(i + 1);
      }).classed("circ", true).classed("selected", function (d, i) {
        return i == lid;
      });
      d3.select('#backbutton').style("visibility", lid == 0 ? "hidden" : "visible");
      d3.select('#nextbutton').style("visibility", lid == this.NUMBER_OF_LEVELS - 1 ? "hidden" : "visible");
    }
  }, {
    key: "createEvents",
    value: function createEvents() {
      var _this = this;

      window.addEventListener('DOMContentLoaded', function (event) {
        document.querySelector("#backbutton").onclick = function () {
          return _this.goBack();
        };

        document.querySelector("#nextbutton").onclick = function () {
          if (!document.querySelector("#nextbutton").classList.contains("disable")) _this.goNext();
        };

        _this.showLevelByURL();
      });

      window.onhashchange = function (event) {
        _this.showLevelByURL();
      };

      window.addEventListener('keydown', function (event) {
        var key = event.key;

        switch (event.key) {
          case "ArrowLeft":
            _this.goBack();

            break;

          case "ArrowRight":
            _this.goNext();

            break;
        }
      });
    }
  }, {
    key: "goNext",
    value: function goNext() {
      this.setLevel((this.getCurrentLevel() + 1) % this.NUMBER_OF_LEVELS);
    }
  }, {
    key: "goBack",
    value: function goBack() {
      this.setLevel((this.getCurrentLevel() - 1 + this.NUMBER_OF_LEVELS) % this.NUMBER_OF_LEVELS);
    }
  }, {
    key: "getCurrentLevel",
    value: function getCurrentLevel() {
      var hash = window.location.hash.substring(1);

      if (hash === "") {
        hash = 1;
      } else {
        hash = hash | 0;
      }

      return hash - 1;
    }
  }, {
    key: "setLevel",
    value: function setLevel(id) {
      window.location.hash = id + 1;
    }
  }, {
    key: "showLevelByURL",
    value: function showLevelByURL() {
      this.showLevel(this.getCurrentLevel());
    }
  }, {
    key: "showLevel",
    value: function showLevel(lid) {
      this.updateFooter(lid);

      if (this.clevel) {
        this.clevel.hide();
      }

      d3.select("#leveltitleprefix").text("Level ".concat(lid + 1, ": ")); //regenerate level

      this.clevel = this.levels[lid]();
      this.clevel.show();
    }
  }]);

  return LevelController;
}();

exports.LevelController = LevelController;

},{"./levels.js":11,"d3":"d3"}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Network = void 0;

var _DynamicVariable = require("./DynamicVariable.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Network = /*#__PURE__*/function () {
  function Network(nodes, inputnodes, outputnodes) {
    _classCallCheck(this, Network);

    this.nodes = nodes;
    this.inputnodes = inputnodes;
    this.outputnodes = outputnodes;
    this.edges = [];

    for (var i in nodes) {
      for (var k in nodes[i].outedges) {
        this.edges.push(nodes[i].outedges[k]);
      }
    }
  }

  _createClass(Network, [{
    key: "predict",
    value: function predict(input) {
      var _this = this;

      if (this.inputnodes.length != input.length) {
        console.error("Input does not fit input size of Network");
      } //overwrite activation callbacks for input


      var _loop = function _loop(i) {
        _this.inputnodes[i].temporarilyReplaceGetActivation(function () {
          return input[i];
        });
      };

      for (var i in this.inputnodes) {
        _loop(i);
      } //get prediction in this 'modified network'


      (0, _DynamicVariable.updateDynamicVariables)();
      var predicted = this.outputnodes.map(function (o) {
        return o.getActivation();
      }); //restore input functions from backup

      for (var _i in this.inputnodes) {
        this.inputnodes[_i].restoreGetActivation();
      }

      return predicted;
    }
  }, {
    key: "sqerror",
    value: function sqerror(trainX, trainY) {
      var predicted = this.predict(trainX);
      var sqsum = 0;

      for (var k in predicted) {
        sqsum += (predicted[k] - trainY[k]) * (predicted[k] - trainY[k]);
      }

      return sqsum;
    }
  }, {
    key: "loss",
    value: function loss(trainXs, trainYs) {
      var sqsum = 0;

      for (var i in trainXs) {
        sqsum += this.sqerror(trainXs[i], trainYs[i]);
      }

      return sqsum;
    }
  }, {
    key: "resetdloss",
    value: function resetdloss() {
      for (var i in this.nodes) {
        this.nodes[i].dloss = 0;
      }

      for (var _i2 in this.edges) {
        this.edges[_i2].dloss = 0;
      }
    } //computes loss function and saves its gradient as parameters to objects in network

  }, {
    key: "gradientLoss",
    value: function gradientLoss(trainXs, trainYs) {
      var _this2 = this;

      var sqsum = 0;
      this.resetdloss();

      var _loop2 = function _loop2(k) {
        var input = trainXs[k];
        var target = trainYs[k]; //overwrite activation callbacks for input

        var _loop3 = function _loop3(i) {
          _this2.inputnodes[i].temporarilyReplaceGetActivation(function () {
            return input[i];
          });
        };

        for (var i in _this2.inputnodes) {
          _loop3(i);
        } //get prediction in this 'modified network'


        (0, _DynamicVariable.updateDynamicVariables)();

        var predicted = _this2.outputnodes.map(function (o) {
          return o.getActivation();
        });

        for (var _i3 in predicted) {
          sqsum += (predicted[_i3] - target[_i3]) * (predicted[_i3] - target[_i3]);
        }

        var _loop4 = function _loop4(_i4) {
          _this2.outputnodes[_i4].temporarilyReplaceGetdActivation(function () {
            return 2 * (predicted[_i4] - target[_i4]);
          });
        };

        for (var _i4 in _this2.outputnodes) {
          _loop4(_i4);
        }

        (0, _DynamicVariable.updateDynamicVariables)();

        for (var _i5 in _this2.nodes) {
          _this2.nodes[_i5].dloss += _this2.nodes[_i5].getdBias();
        }

        for (var _i6 in _this2.edges) {
          _this2.edges[_i6].dloss += _this2.edges[_i6].getdWeight();
        } //restore functions from backup


        for (var _i7 in _this2.inputnodes) {
          _this2.inputnodes[_i7].restoreGetActivation();
        }

        for (var _i8 in _this2.outputnodes) {
          _this2.outputnodes[_i8].restoreGetdActivation();
        }
      };

      for (var k in trainXs) {
        _loop2(k);
      }

      return sqsum;
    }
  }, {
    key: "gradientstep",
    value: function gradientstep(trainXs, trainYs, stepsize) {
      this.gradientLoss(trainXs, trainYs);

      for (var i in this.nodes) {
        if (this.nodes[i].constructor.name == "Node" && this.nodes[i].adjustable) {
          //only internal nodes
          this.nodes[i].bias -= stepsize * this.nodes[i].dloss;
        }
      }

      for (var _i9 in this.edges) {
        if (this.edges[_i9].adjustable) this.edges[_i9].weight -= stepsize * this.edges[_i9].dloss;
      }

      (0, _DynamicVariable.updateDynamicVariables)();
    }
  }, {
    key: "pauseAnimatedInput",
    value: function pauseAnimatedInput() {
      for (var i in this.inputnodes) {
        var node = this.inputnodes[i];
        node.pauseInput();
      }
    }
  }, {
    key: "backup",
    value: function backup() {
      for (var k in this.nodes) {
        this.nodes[k].backup();
      }

      for (var _k in this.edges) {
        this.edges[_k].backup();
      }
    }
  }, {
    key: "restore",
    value: function restore() {
      for (var k in this.nodes) {
        this.nodes[k].restore();
      }

      for (var _k2 in this.edges) {
        this.edges[_k2].restore();
      }
    }
  }]);

  return Network;
}();

exports.Network = Network;

},{"./DynamicVariable.js":1}],7:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NetworkVisualization = void 0;

var d3 = _interopRequireWildcard(require("d3"));

var _constants = require("./constants.js");

var _DynamicVariable = require("./DynamicVariable.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var clamp = function clamp(x, mi, ma) {
  return Math.min(ma, Math.max(mi, x));
};

var NetworkVisualization = /*#__PURE__*/function () {
  function NetworkVisualization(network, animatecallback) {
    _classCallCheck(this, NetworkVisualization);

    var nodes = this.nodes = network.nodes;
    this.network = network;
    this.inputnodes = network.inputnodes;
    this.outputnodes = network.outputnodes;
    this.animatecallback = animatecallback;
    this.edges = [];

    for (var i in nodes) {
      for (var k in nodes[i].outedges) {
        this.edges.push(nodes[i].outedges[k]);
      }
    } //sort based on y coordinates of incoming edges


    this.edges = this.edges.sort(function (a, b) {
      return b.from.y - a.from.y;
    }); //arrow from http://jsfiddle.net/igbatov/v0ekdzw1/

    d3.select("svg").append("svg:defs").append("svg:marker").attr("id", "triangle").attr("refX", 6).attr("refY", 6).attr("markerWidth", 30).attr("markerHeight", 30).attr("markerUnits", "userSpaceOnUse").attr("orient", "auto").append("path").attr("d", "M 0 0 12 6 0 12 3 6").style("fill", "orange");
  }

  _createClass(NetworkVisualization, [{
    key: "stop",
    value: function stop() {
      this.animating = false;
    }
  }, {
    key: "animate",
    value: function animate() {
      this.animating = true;
      this.animateloop();
    }
  }, {
    key: "resizeSVG",
    value: function resizeSVG() {
      var margin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var svg = document.querySelector("svg");
      var bbox = svg.getBBox();
      svg.setAttribute("viewBox", "".concat(bbox.x - margin, " ").concat(bbox.y - margin, " ").concat(Math.min(1000, bbox.width) + 2 * margin, " ").concat(Math.min(1000, bbox.height) + 2 * margin));
    }
  }, {
    key: "animateloop",
    value: function animateloop() {
      var _this = this;

      if (!this.animating) return;
      if (this.animatecallback) this.animatecallback();
      var nodes = this.nodes;
      var inputnodes = this.inputnodes;
      var outputnodes = this.outputnodes;
      var edges = this.edges;
      (0, _DynamicVariable.updateDynamicVariables)();

      for (var i in nodes) {
        nodes[i].offset = nodes[i].bias;
      }

      for (var _i in edges) {
        var edge = edges[_i];
        edge.offset = edge.to.offset;
        edge.to.offset += edge.from.getActivation() * edge.weight;
      }

      d3.select("#nodes").select(".nodes").selectAll("circle").data(nodes).join("circle").attr("cx", function (d) {
        return d.x;
      }).attr("cy", function (d) {
        return d.y;
      }).attr("r", _constants.noderadius).attr("fill", function (d) {
        return d.constructor.name == "InputNode" ? "yellow" : d.constructor.name == "OutputNode" ? "orange" : "black";
      }).attr("stroke", "black").attr("stroke-width", 3).attr("fill-opacity", function (n) {
        return n.constructor.name == "Node" ? 0.2 : 1;
      });
      d3.select("#parameters").select(".nodes").selectAll("circle").data(nodes.filter(function (node) {
        return node.adjustable;
      })).join("circle").attr("cx", function (n) {
        return n.x;
      }).attr("cy", function (n) {
        return n.y - _constants.unit * n.bias;
      }).attr("r", 15).attr("fill", "white").attr("fill-opacity", 0.5).attr("stroke", "black").attr("stroke-width", 2).attr("stroke-opacity", 0.5);
      var DLOSS_SCALE = 0.1;
      var DLOSS_CLAMP = 3;
      d3.select("#nodes").select(".gradient").selectAll("path").data(nodes.filter(function (node) {
        return node.dloss != 0 && node.adjustable;
      })).join("path").attr("d", function (node) {
        var p = d3.path();
        p.moveTo(node.x, node.y - _constants.unit * node.bias);
        p.lineTo(node.x, node.y - _constants.unit * (node.bias - clamp(node.dloss * DLOSS_SCALE, -DLOSS_CLAMP, DLOSS_CLAMP)));
        return p;
      }).attr("marker-end", "url(#triangle)").attr("stroke", "orange").attr("stroke-width", 2).attr("fill", "none");
      d3.select("#edges").select(".gradient").selectAll("path").data(edges.filter(function (edge) {
        return edge.dloss != 0 && edge.adjustable;
      })).join("path").attr("d", function (edge) {
        var p = d3.path();
        var x = edge.parameterPosition()[0];
        var y = edge.parameterPosition()[1];
        p.moveTo(x, y);
        p.lineTo(x, y + _constants.unit * clamp(edge.dloss / edge.from.getActivation() * DLOSS_SCALE, -DLOSS_CLAMP, DLOSS_CLAMP));
        return p;
      }).attr("marker-end", "url(#triangle)").attr("stroke", "orange").attr("stroke-width", 2).attr("fill", "none").style("opacity", function (edge) {
        return Math.min(0.5, Math.abs(edge.from.getActivation()));
      });
      d3.select("#parameters").select(".edges").selectAll("circle").data(edges.filter(function (edge) {
        return edge.adjustable;
      })).join("circle").attr("cx", function (edge) {
        return edge.parameterPosition()[0];
      }).attr("cy", function (edge) {
        return edge.parameterPosition()[1];
      }).attr("r", 15).attr("fill", function (edge) {
        return edge.weight > 0 ? "blue" : "red";
      }).attr("stroke", "black").attr("stroke-width", 2).attr("fill-opacity", 0.5).attr("stroke-opacity", 0.5);
      d3.select("#input").select(".activations").selectAll("rect").data(inputnodes).join("rect").attr("x", function (node) {
        return node.x;
      }).attr("y", function (node) {
        return node.y - Math.max(0, node.getActivation() * _constants.unit);
      }).attr("width", _constants.noderadius).attr("height", function (node) {
        return Math.abs(node.getActivation() * _constants.unit);
      }).attr("fill", "blue").attr("fill-opacity", 0.5);
      d3.select("#parameters").select(".input").selectAll("circle").data(inputnodes).join("circle").attr("cx", function (node) {
        return node.x + _constants.noderadius;
      }).attr("cy", function (node) {
        return node.y - _constants.unit * node.getActivation();
      }).attr("r", 15).attr("fill", "yellow").attr("fill-opacity", 0.6).attr("stroke", "black").attr("stroke-width", 2).attr("stroke-opacity", 0.6);
      d3.select("#outputs").select(".flow").selectAll("rect").data(outputnodes).join("rect").attr("x", function (node) {
        return node.x - _constants.noderadius;
      }).attr("y", function (node) {
        return node.y - Math.max(0, node.getActivation() * _constants.unit);
      }).attr("width", _constants.noderadius).attr("height", function (node) {
        return Math.abs(node.getActivation() * _constants.unit);
      }).attr("fill", "blue").attr("fill-opacity", 0.5);
      d3.select("#nodes").select(".target").selectAll("text").data(outputnodes.filter(function (n) {
        return typeof n.target == 'number';
      })).join("text").attr("font-size", 40).attr("text-anchor", "left").attr("pointer-events", "none").text(function (n) {
        return "Zielwert: " + n.format(n.target);
      }).attr("x", function (n) {
        return n.x - _constants.noderadius;
      }).attr("y", function (n) {
        return n.y - _constants.unit * n.target;
      }).attr("opacity", 1).attr("fill", function (n) {
        return n.errorcolor();
      }); //.attr("fill", "orange");

      d3.select("#nodes").select(".target").selectAll("path").data(outputnodes.filter(function (n) {
        return typeof n.target == 'number';
      })).join("path").attr("d", function (n) {
        var p = d3.path();
        p.moveTo(n.x - 10 - _constants.noderadius, n.y - _constants.unit * n.target);
        p.lineTo(n.x + _constants.noderadius, n.y - _constants.unit * n.target);
        return p;
      }) //.attr("stroke", "orange")
      .attr("stroke", function (n) {
        return n.errorcolor();
      }).attr("stroke-width", 4).attr("fill", "none");
      d3.select("#nodes").select(".values").selectAll("text").data(this.network.nodes).join("text").attr("font-size", 40).attr("text-anchor", "middle").attr("alignment-baseline", "hanging").attr("pointer-events", "none") //.attr("opacity", 0.8)
      .text(function (n) {
        return n.format(n.getActivation());
      }).attr("x", function (n) {
        return n.x;
      }).attr("y", function (n) {
        return n.y - clamp(_constants.unit * n.getActivation(), -70 + 40, 70);
      });
      d3.select("#edges").select(".edges").selectAll("path").data(edges).join("path").attr("d", function (edge) {
        var p = d3.path();
        var b = edge.bezier();

        if (edge.from.bias <= 0 || edge.from.constructor.name == "InputNode") {
          p.moveTo(b[0][0], b[0][1]);
        } else {
          //make "waterproof"
          p.moveTo(b[0][0], b[0][1] - _constants.unit * edge.from.bias);
          p.lineTo(b[0][0], b[0][1]);
        } //p.lineTo(edge.to.x, edge.to.y);


        p.bezierCurveTo(b[1][0], b[1][1], b[2][0], b[2][1], b[3][0], b[3][1]);
        if (edge.offset < 0) //make "waterproof"
          p.lineTo(b[3][0], b[3][1] + _constants.unit * edge.offset);
        return p;
      }).attr("stroke", "black").attr("stroke-width", 2).attr("fill", "none");
      d3.select("#edges").select(".activations").selectAll("path").data(edges).join("path").attr("d", function (edge) {
        var p = edge.generateActivatedPath(edge.from.getActivation());
        var b = edge.bezier();
        p.lineTo(b[3][0], b[3][1]);
        p.bezierCurveTo(b[2][0], b[2][1], b[1][0], b[1][1], b[0][0], b[0][1]);
        p.closePath();
        return p;
      }).attr("fill", function (edge) {
        return edge.weight >= 0 ? "blue" : "red";
      }).attr("fill-opacity", 0.5);
      var N = 1;
      d3.select("#edges").select(".factorlines").selectAll("g").data(edges.filter(function (e) {
        return e.adjustable;
      })).join("g").selectAll("path").data(function (edge) {
        return Array(Math.abs(edge.from.getActivation()) > _constants.parameterths ? 0 : N).fill(edge);
      }).join("path").attr("d", function (edge, k) {
        return edge.generateActivatedPathMiddle(_constants.parameterths * (edge.from.getActivation() < 0 ? -1 : 1) * (k + 1) / N);
      }).attr("stroke", function (edge) {
        return edge.weight >= 0 ? "blue" : "red";
      }).attr("stroke-width", 2).attr("stroke-opacity", 0.5).attr("fill", "none");
      requestAnimationFrame(function () {
        return _this.animateloop();
      });
    }
  }, {
    key: "addInteraction",
    value: function addInteraction() {
      var nodes = this.nodes;
      var that = this;
      var tooltip = d3.local();

      var addToolTip = function addToolTip() {
        tooltip.set(this, d3.select("#tooltip").append("text").style("display", "none"));
      };

      var nodedrag = d3.drag().on("start", function () {
        var current = d3.select(this);
        this.y0 = d3.event.y;
        var node = d3.select(this).data()[0];

        if (node.adjustable) {
          this.v0 = node.bias;
          that.network.pauseAnimatedInput();

          if (d3.event.active === 0) {
            var tooltipForThis = tooltip.get(this);
            tooltipForThis.style("display", "block");
          }
        }

        if (node.constructor.name == "InputNode") {
          this.v0 = node.getActivation();
          node.setUserParameter(this.v0);
        }
      }).on("drag", function () {
        var node = d3.select(this).data()[0];

        if (node.adjustable) {
          node.bias = clamp(this.v0 - (d3.event.y - this.y0) / _constants.unit, -4, 4); //node.y = d3.event.y + this.deltaX;

          var tooltipForThis = tooltip.get(this);
          tooltipForThis.attr("x", node.x).attr("y", node.y - _constants.unit * node.bias).text("+ ".concat(node.format(node.bias)));
        }

        if (node.constructor.name == "InputNode") {
          node.setUserParameter(clamp(this.v0 - (d3.event.y - this.y0) / _constants.unit, -4, 4));

          for (var k in that.network.outputnodes) {
            delete that.network.outputnodes[k].target;
          }
        }
      }).on("end", function () {
        if (d3.event.active === 0) {
          var tooltipForThis = tooltip.get(this);
          tooltipForThis.style("display", "none");
        }
      });
      var nodeDragSelections = [d3.select("#nodes").selectAll("circle"), d3.select("#parameters").select(".input").selectAll("circle"), d3.select("#parameters").select(".nodes").selectAll("circle"), d3.select("#input").selectAll("rect")];
      nodeDragSelections.forEach(function (s) {
        s.each(addToolTip);
        nodedrag(s);
      });
      var edgedrag = d3.drag().on("start", function () {
        var edge = d3.select(this).data()[0];

        if (edge.adjustable) {
          var current = d3.select(this);
          this.y0 = d3.event.y;
          this.weight0 = edge.weight;
          that.network.pauseAnimatedInput();

          if (d3.event.active === 0) {
            var tooltipForThis = tooltip.get(this);
            tooltipForThis.style("display", "block");
          }
        }
      }).on("drag", function () {
        var edge = d3.select(this).data()[0];

        if (edge.adjustable) {
          var sactivation = edge.from.getActivation();
          if (Math.abs(sactivation) < _constants.parameterths) sactivation = (edge.from.getActivation() < 0 ? -1 : 1) * _constants.parameterths; //if (Math.abs(edge.from.getActivation()) > 0.001) {

          edge.weight = clamp(this.weight0 - (d3.event.y - this.y0) / sactivation / _constants.unit, -4, 4); //}

          var tooltipForThis = tooltip.get(this);
          tooltipForThis.attr("x", edge.parameterPosition()[0]).attr("y", edge.parameterPosition()[1]).text("\xD7 ".concat(edge.weight.toFixed(2)));
        }
      }).on("end", function () {
        if (d3.event.active === 0) {
          var tooltipForThis = tooltip.get(this);
          tooltipForThis.style("display", "none");
        }
      });
      var edgeDragSelections = [d3.select("#edges").selectAll("path, circle"), d3.select("#parameters").select(".edges").selectAll("circle")];
      edgeDragSelections.forEach(function (s) {
        s.each(addToolTip);
        edgedrag(s);
      });
    }
  }]);

  return NetworkVisualization;
}();

exports.NetworkVisualization = NetworkVisualization;

},{"./DynamicVariable.js":1,"./constants.js":10,"d3":"d3"}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Node = void 0;

var _Edge = require("./Edge.js");

var _DynamicVariable = require("./DynamicVariable.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Node = /*#__PURE__*/function () {
  function Node() {
    _classCallCheck(this, Node);

    this.dactivation = new _DynamicVariable.DynamicVariable(0);
    this.sum = new _DynamicVariable.DynamicVariable(0);
    this.bias = 0;
    this.dloss = 0;
    this.outedges = [];
    this.inedges = [];
    this.adjustable = true;
  }

  _createClass(Node, [{
    key: "addChild",
    value: function addChild(other, weight) {
      var reverse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var edge = new _Edge.Edge(this, other, weight);
      this.outedges.push(edge);

      if (reverse) {
        other.inedges.push(edge);
      }
    }
  }, {
    key: "computeSum",
    value: function computeSum() {
      var _this = this;

      return this.sum.update(function () {
        var activation = _this.bias;

        for (var eid in _this.inedges) {
          var edge = _this.inedges[eid];
          activation += edge.weight * edge.from.getActivation();
        }

        return activation;
      });
    }
  }, {
    key: "getActivation",
    value: function getActivation() {
      return Math.max(0, this.computeSum()); //ReLu
    }
  }, {
    key: "active",
    value: function active() {
      return this.computeSum() >= 0;
    }
  }, {
    key: "getdActivation",
    value: function getdActivation() {
      var _this2 = this;

      return this.dactivation.update(function () {
        var dactivation = 0;

        for (var eid in _this2.outedges) {
          var edge = _this2.outedges[eid];

          if (edge.to.active()) {
            dactivation += edge.weight * edge.to.getdActivation();
          }
        }

        return dactivation;
      });
    }
  }, {
    key: "getdBias",
    value: function getdBias() {
      return this.active() ? this.getdActivation() : 0;
    }
  }, {
    key: "format",
    value: function format(v) {
      return v.toFixed(1);
    }
  }, {
    key: "backup",
    value: function backup() {
      this.backupBias = this.bias;
    }
  }, {
    key: "restore",
    value: function restore() {
      this.bias = this.backupBias;
    }
  }]);

  return Node;
}();

exports.Node = Node;

},{"./DynamicVariable.js":1,"./Edge.js":2}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OutputNode = void 0;

var d3 = _interopRequireWildcard(require("d3"));

var _Node2 = require("./Node.js");

var _DynamicVariable = require("./DynamicVariable.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

// a node that just sums up inputs (no ReLu to enable negative outputs)
var OutputNode = /*#__PURE__*/function (_Node) {
  _inherits(OutputNode, _Node);

  var _super = _createSuper(OutputNode);

  function OutputNode() {
    var _this;

    _classCallCheck(this, OutputNode);

    _this = _super.call(this);
    _this.bias = 0;
    _this.adjustable = false;
    return _this;
  }

  _createClass(OutputNode, [{
    key: "getActivation",
    value: function getActivation() {
      return this.computeSum(); // no bias, no ReLu
    } //this function might be overwriten, such that it is dependent on loss function

  }, {
    key: "getdActivation",
    value: function getdActivation() {
      return 1; //likely will be overwritten
    }
  }, {
    key: "active",
    value: function active() {
      return true;
    }
  }, {
    key: "temporarilyReplaceGetdActivation",
    value: function temporarilyReplaceGetdActivation(tempdActivation) {
      this.getdActivationBackup = this.getdActivation;
      this.getdActivation = tempdActivation;
      (0, _DynamicVariable.updateDynamicVariables)();
    }
  }, {
    key: "restoreGetdActivation",
    value: function restoreGetdActivation() {
      this.getdActivation = this.getdActivationBackup;
      (0, _DynamicVariable.updateDynamicVariables)();
    }
  }, {
    key: "errorcolor",
    value: function errorcolor() {
      var n = this;
      return d3.scaleSequential().domain([1, 0]).interpolator(d3.interpolateRdYlGn)(Math.abs(n.target - n.getActivation()));
    }
  }]);

  return OutputNode;
}(_Node2.Node);

exports.OutputNode = OutputNode;

},{"./DynamicVariable.js":1,"./Node.js":8,"d3":"d3"}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noderadius = exports.parameterths = exports.unit = void 0;
var unit = 35;
exports.unit = unit;
var parameterths = 0.3;
exports.parameterths = parameterths;
var noderadius = 80;
exports.noderadius = noderadius;

},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AvgLevel = exports.XorLevel = exports.MaxLevel = exports.AndLevel = exports.SumLevel = exports.FahrenheitLevel = exports.WeatherLevel = exports.TutorialLevelC = exports.TutorialLevelB = exports.TutorialLevelA = void 0;

var d3 = _interopRequireWildcard(require("d3"));

var _Node = require("./Node.js");

var _InputNode = require("./InputNode.js");

var _OutputNode = require("./OutputNode.js");

var _Network = require("./Network.js");

var _Level11 = require("./Level.js");

var _constants = require("./constants.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var addnodeinfo = function addnodeinfo(node, text) {
  var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _constants.noderadius + 30;
  d3.select("#levelinfo").append("text").text(text).attr("pointer-events", "none").attr("text-anchor", "middle").attr("font-size", 20).attr("x", node.x).attr("y", node.y + offset);
};

var TutorialLevelA = /*#__PURE__*/function (_Level) {
  _inherits(TutorialLevelA, _Level);

  var _super = _createSuper(TutorialLevelA);

  function TutorialLevelA() {
    var _this;

    _classCallCheck(this, TutorialLevelA);

    var omega1 = 1 + Math.random();
    var nodes = [new _InputNode.InputNode(function () {
      return 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.1 * (Date.now() - _this.t0) / 1000);
    }), new _OutputNode.OutputNode()];
    nodes[0].x = 200;
    nodes[0].y = 500;
    nodes[0].allownegative = true;
    nodes[1].x = 800;
    nodes[1].y = 550;
    nodes[0].addChild(nodes[1], 1);

    var f = function f(c) {
      return c * 2;
    };

    var trainXs = [1, 2, 3];
    var trainYs = trainXs.map(f);
    _this = _super.call(this, "Ein einfaches Netz: Verdopple den Input!", new _Network.Network(nodes, [nodes[0]], //input nodes
    [nodes[1]] //output nodes
    ), ["input"], trainXs.map(function (x) {
      return [x];
    }), //temperatures are internally divided by 10.
    ["desired output"], trainYs.map(function (x) {
      return [x];
    }), "Hier siehst du ein einfaches Neuronales Netz. Kannst du das Netz so einstellen, dass sich der Input verdoppelt, d.h. der Output soll den doppelten Input-Wert ergeben?");

    _this.animatestep = function () {
      nodes[1].target = f(nodes[0].getActivation());
    };

    _this.onenter = function () {
      addnodeinfo(nodes[0], "Hier kannst du den Inputwert verändern.");
      addnodeinfo(nodes[1], "Das Output des Neuronalen Netzes.");
      d3.select("#levelinfo").append("text").text("Stell hier den Multiplikationsfaktor (das “Gewicht”) ein.").attr("pointer-events", "none").attr("text-anchor", "middle").attr("font-size", 20).attr("x", (nodes[0].x + nodes[1].x) / 2).attr("y", (nodes[0].y + nodes[1].y) / 2 - 100);
      document.querySelector(".trainingdata").classList.remove("visible");
    };

    _this.onleave = function () {
      document.querySelector(".trainingdata").classList.add("visible");
    };

    return _this;
  }

  return TutorialLevelA;
}(_Level11.Level);

exports.TutorialLevelA = TutorialLevelA;

var TutorialLevelB = /*#__PURE__*/function (_Level2) {
  _inherits(TutorialLevelB, _Level2);

  var _super2 = _createSuper(TutorialLevelB);

  function TutorialLevelB() {
    var _this2;

    _classCallCheck(this, TutorialLevelB);

    var omega1 = 1 + Math.random();
    var nodes = [new _InputNode.InputNode(function () {
      return 0.5 + 2 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.1 * (Date.now() - _this2.t0) / 1000);
    }), new _Node.Node(), new _OutputNode.OutputNode()];
    nodes[0].allownegative = true;
    nodes[0].x = 200;
    nodes[0].y = 500;
    nodes[1].x = 500;
    nodes[1].y = 550;
    nodes[1].adjustable = false;
    nodes[2].x = 800;
    nodes[2].y = 500;
    nodes[0].addChild(nodes[1], -2);
    nodes[1].addChild(nodes[2], 1);
    nodes[1].outedges[0].adjustable = false;

    var f = function f(c) {
      return Math.max(0, c * 1);
    };

    var trainXs = [-2, -1, 0, 1, 2, 3];
    var trainYs = trainXs.map(f);
    _this2 = _super2.call(this, "Lass nur positive Werte durch das Netz!", new _Network.Network(nodes, [nodes[0]], //input nodes
    [nodes[2]] //output nodes
    ), ["Input"], trainXs.map(function (x) {
      return [x];
    }), //temperatures are internally divided by 10.
    ["Output"], trainYs.map(function (x) {
      return [x];
    }), "Kannst du das Netz so einstellen, dass es positive Inputs oder 0 ausgibt, wenn sein Input negativ ist? Es soll die Daten der Trainingstabelle unten voraussagen.");

    _this2.animatestep = function () {
      nodes[2].target = f(nodes[0].getActivation());
    };

    _this2.onenter = function () {
      addnodeinfo(nodes[1], "Die mittleren Neuronen ignoriert negative Inputs.");
    };

    return _this2;
  }

  return TutorialLevelB;
}(_Level11.Level);

exports.TutorialLevelB = TutorialLevelB;

var TutorialLevelC = /*#__PURE__*/function (_Level3) {
  _inherits(TutorialLevelC, _Level3);

  var _super3 = _createSuper(TutorialLevelC);

  function TutorialLevelC() {
    var _this3;

    _classCallCheck(this, TutorialLevelC);

    var omega1 = 1 + Math.random();
    var nodes = [new _InputNode.InputNode(function () {
      return -0.2 + 1 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.1 * (Date.now() - _this3.t0) / 1000);
    }), new _Node.Node(), new _OutputNode.OutputNode()];
    nodes[0].allownegative = true;
    nodes[0].x = 200;
    nodes[0].y = 500;
    nodes[1].x = 500;
    nodes[1].y = 550;
    nodes[1].adjustable = true;
    nodes[2].x = 800;
    nodes[2].y = 500;
    nodes[0].addChild(nodes[1], 1);
    nodes[1].addChild(nodes[2], 1);
    nodes[0].outedges[0].adjustable = false;
    nodes[1].outedges[0].adjustable = false;
    nodes[1].bias = 1;

    var f = function f(c) {
      return Math.max(0, c - 1);
    };

    var trainXs = [-2, -1, 0, 1, 2, 3];
    var trainYs = trainXs.map(f);
    _this3 = _super3.call(this, "Ein Neuron mit Bias!", new _Network.Network(nodes, [nodes[0]], //input nodes
    [nodes[2]] //output nodes
    ), ["Input"], trainXs.map(function (x) {
      return [x];
    }), //temperatures are internally divided by 10.
    ["Output"], trainYs.map(function (x) {
      return [x];
    }), "Kannst du die Parameter des Netzes so einstellen, dass der Output um 1.0 größer ist als der Input? Sollte der Input allerdings kleiner als 1 sein, soll der Output 0 ergeben.");

    _this3.animatestep = function () {
      nodes[2].target = f(nodes[0].getActivation());
    };

    _this3.onenter = function () {
      addnodeinfo(nodes[1], "Am Input des mittleren Neurons befindet sich nun ein einstellbarer Bias.");
    };

    return _this3;
  }

  return TutorialLevelC;
}(_Level11.Level);

exports.TutorialLevelC = TutorialLevelC;

var WeatherLevel = /*#__PURE__*/function (_Level4) {
  _inherits(WeatherLevel, _Level4);

  var _super4 = _createSuper(WeatherLevel);

  function WeatherLevel() {
    var _this4;

    _classCallCheck(this, WeatherLevel);

    var omega1 = 1 + Math.random();
    var nodes = [new _InputNode.InputNode(function () {
      return 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - _this4.t0) / 1000);
    }), new _InputNode.InputNode(function () {
      return 1;
    }), new _Node.Node(), new _Node.Node(), new _OutputNode.OutputNode()];

    for (var i in [2, 3]) {
      nodes[[2, 3][i]].bias = 2 * (Math.random() - 0.5);
    } //output from console


    nodes[0].x = 200;
    nodes[0].y = 400;
    nodes[1].x = 200;
    nodes[1].y = 600;
    nodes[2].x = 509;
    nodes[2].y = 300;
    nodes[3].x = 500;
    nodes[3].y = 700;
    nodes[4].x = 800;
    nodes[4].y = 500;
    nodes[0].addChild(nodes[2], 1);
    nodes[0].addChild(nodes[3], 1);
    nodes[1].addChild(nodes[2], 1);
    nodes[1].addChild(nodes[3], 1);
    nodes[2].addChild(nodes[4], 1);
    nodes[3].addChild(nodes[4], 1);
    var nw = new _Network.Network(nodes, [nodes[0], nodes[1]], //input nodes
    [nodes[4]] //output nodes
    );
    var trainingdata = [{
      cloudiness: 0,
      inside: 0
    }, {
      cloudiness: 0.5,
      inside: 0
    }, {
      cloudiness: 1,
      inside: 0
    }, {
      cloudiness: 1,
      inside: 1
    }, {
      cloudiness: 0.5,
      inside: 1
    }, {
      cloudiness: 0,
      inside: 1
    }];

    var formula = function formula(c, i) {
      return i == 1 ? 2.1 - 0.1 * c : 2.5 - 1.2 * c;
    }; //nodes[0].format = cls => `cloudiness: ${cls.toFixed(1)}`;
    //nodes[1].format = v => Math.round(v) == 1 ? '1 (inside)' : '0 (outside)';


    nodes[1].format = function (v) {
      return v.toFixed(0);
    };

    nodes[4].format = function (temp) {
      return "".concat((temp * 10).toFixed(0), "\xB0C");
    };

    _this4 = _super4.call(this, "Einfache Wettervorhersage im Innenraum und draußen!", nw, ["Bewölkung", "Innenraum"], trainingdata.map(function (td) {
      return [td.cloudiness, td.inside];
    }), ["Temperatur"], trainingdata.map(function (td) {
      return [formula(td.cloudiness, td.inside)];
    }), "Draußen (d.h. Innenraum-Wert = 0) hängt die Temperatur davon ab, wie bewölkt es ist: Je bewölkter der Himmel ist, desto niedriger die Temperatur. In Innenräumen (d.h. Innenraum-Wert = 1) ist die Temperatur fast immer 20°C.");

    _this4.animatestep = function () {
      //TODO add some nicer visualization for inside, cloudiness, and temperature.
      nodes[0].setUserParameter(Math.min(1, Math.max(0, nodes[0].getActivation()))); //round input

      nodes[1].setUserParameter(Math.min(1, Math.max(0, Math.round(nodes[1].getActivation()))));
      nodes[4].target = formula(nodes[0].getActivation(), nodes[1].getActivation());
    };

    _this4.onenter = function () {
      addnodeinfo(nodes[0], "Bew\xF6lkung", -_constants.noderadius - 20);
      addnodeinfo(nodes[1], "drinnen/drau\xDFen");
      addnodeinfo(nodes[4], "vorhergesagte Temperatur");
    };

    return _this4;
  }

  return WeatherLevel;
}(_Level11.Level);

exports.WeatherLevel = WeatherLevel;

var FahrenheitLevel = /*#__PURE__*/function (_Level5) {
  _inherits(FahrenheitLevel, _Level5);

  var _super5 = _createSuper(FahrenheitLevel);

  function FahrenheitLevel() {
    var _this5;

    _classCallCheck(this, FahrenheitLevel);

    var omega1 = 1 + Math.random();
    var nodes = [new _InputNode.InputNode(function () {
      return 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - _this5.t0) / 1000);
    }), new _Node.Node(), //TODO: No ReLu Nodes here!
    new _OutputNode.OutputNode()];

    for (var i in [1]) {
      nodes[[1][i]].bias = 1 + 2 * Math.random();
    }

    nodes[0].x = 200;
    nodes[0].y = 500;
    nodes[0].allownegative = false;
    nodes[1].x = 500;
    nodes[1].y = 550;
    nodes[2].x = 800;
    nodes[2].y = 500;
    nodes[0].addChild(nodes[1], 1);
    nodes[1].addChild(nodes[2], 1);
    nodes[1].outedges[0].adjustable = false;

    var c2f = function c2f(c) {
      return c * 1.8 + 32;
    };

    var trainXs = [0, 10, 20, 30];
    var trainYs = trainXs.map(c2f);

    nodes[0].format = function (temp) {
      return "".concat((temp * 10).toFixed(0), "\xB0C");
    };

    nodes[1].format = function (temp) {
      return "".concat((temp * 10).toFixed(0));
    };

    nodes[2].format = function (temp) {
      return "".concat((temp * 10).toFixed(0), "\xB0F");
    };

    _this5 = _super5.call(this, "Wandle Celsius in Fahrenheit um!", new _Network.Network(nodes, [nodes[0]], //input nodes
    [nodes[2]] //output nodes
    ), ["Celsius"], trainXs.map(function (v) {
      return [v / 10];
    }), //temperatures are internally divided by 10.
    ["Fahrenheit"], trainYs.map(function (v) {
      return [v / 10];
    }), "Ein positiver Temperatur-Wert in Grad Celsius (links, gelber Regler) soll in einen Wert in Grad Fahrenheit umgewandelt werden. Stell die Parameter (blaue und weiße Regler) des Netzes so ein, dass der Output dem Zielwert jeden Inputs entspricht. In der Tabelle unten kannst du die korrekten Werte ablesen.");

    _this5.animatestep = function () {
      nodes[2].target = c2f(nodes[0].getActivation() * 10) / 10;
    };

    return _this5;
  }

  return FahrenheitLevel;
}(_Level11.Level);

exports.FahrenheitLevel = FahrenheitLevel;

var SumLevel = /*#__PURE__*/function (_Level6) {
  _inherits(SumLevel, _Level6);

  var _super6 = _createSuper(SumLevel);

  function SumLevel() {
    var _this6;

    _classCallCheck(this, SumLevel);

    var omega1 = 1 + Math.random();
    var omega2 = 1 + Math.random();
    var nodes = [new _InputNode.InputNode(function () {
      return 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - _this6.t0) / 1000);
    }), new _InputNode.InputNode(function () {
      return 0.5 + 0.5 * Math.sin(omega2 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - _this6.t0) / 1000);
    }), new _OutputNode.OutputNode()];
    nodes[2].bias = 0;
    nodes[0].x = 200;
    nodes[0].y = 300;
    nodes[0].allownegative = true;
    nodes[1].x = 200;
    nodes[1].y = 700;
    nodes[1].allownegative = true;
    nodes[2].x = 800;
    nodes[2].y = 500;
    nodes[0].addChild(nodes[2], 1);
    nodes[1].addChild(nodes[2], -1);

    var c2f = function c2f(c) {
      return c * 1.8 + 32;
    };

    var trainXs = [[0, 0], [0, 1], [2, 1], [3, 1], [4, 2], [0, 2]];
    var trainYs = trainXs.map(function (p) {
      return [p[0] + p[1]];
    });
    _this6 = _super6.call(this, "Die beiden Input-Werte summieren!", new _Network.Network(nodes, [nodes[0], nodes[1]], //input nodes
    [nodes[2]] //output nodes
    ), ["Summand 1", "Summand 2"], trainXs, //temperatures are internally divided by 10.
    ["Summe"], trainYs, "Stell die Parameter des Netzes so ein, dass der Output (rechts) die Summe beider Inputs ergibt. Die Voraussagen des Netzes müssen möglichst den Werten der Trainingsdaten entsprechen, die du in der Tabelle unten siehst.");

    _this6.animatestep = function () {
      nodes[2].target = nodes[0].getActivation() + nodes[1].getActivation();
    };

    return _this6;
  }

  return SumLevel;
}(_Level11.Level);

exports.SumLevel = SumLevel;

var AndLevel = /*#__PURE__*/function (_Level7) {
  _inherits(AndLevel, _Level7);

  var _super7 = _createSuper(AndLevel);

  function AndLevel() {
    var _this7;

    _classCallCheck(this, AndLevel);

    var omega1 = 1 + Math.random();
    var omega2 = 1 + Math.random();
    var nodes = [new _InputNode.InputNode(function () {
      return 1;
    }), new _InputNode.InputNode(function () {
      return 1;
    }), new _Node.Node(), new _OutputNode.OutputNode()];

    for (var i in [2]) {
      nodes[[2][i]].bias = 2 * Math.random();
    }

    nodes[0].x = 200;
    nodes[0].y = 350;
    nodes[1].x = 200;
    nodes[1].y = 650;
    nodes[2].x = 500;
    nodes[2].y = 500;
    nodes[3].x = 800;
    nodes[3].y = 500;
    nodes[0].addChild(nodes[2], 1); //nodes[0].addChild(nodes[3], 1);

    nodes[1].addChild(nodes[2], -0.2);
    nodes[2].addChild(nodes[3], 1); //nodes[1].addChild(nodes[3], 1);

    var nw = new _Network.Network(nodes, [nodes[0], nodes[1]], //input nodes
    [nodes[3]] //output nodes
    );
    var trainXs = [[0, 0], [1, 0], [0, 1], [1, 1]];
    var trainYs = trainXs.map(function (p) {
      return [p[0] * p[1]];
    });
    _this7 = _super7.call(this, "Sind beide Inputs auf 1 gestellt?", nw, ["Bit 1", "Bit 2"], trainXs, //temperatures are internally divided by 10.
    ["AND"], trainYs, "Die Input-Werte des Netzes sind entweder 0 oder 1. Der Output-Wert rechts darf nur 1 sein, wenn beide Input-Werte 1 sind. Anderfalls muss er 0 sein.");

    _this7.animatestep = function () {
      nodes[0].format = function (v) {
        return Math.round(v);
      };

      nodes[1].format = function (v) {
        return Math.round(v);
      };

      nodes[0].setUserParameter(Math.min(1, Math.max(0, Math.round(nodes[0].getActivation()))));
      nodes[1].setUserParameter(Math.min(1, Math.max(0, Math.round(nodes[1].getActivation()))));
      nodes[3].target = nodes[0].getActivation() * nodes[1].getActivation();
    };

    return _this7;
  }

  return AndLevel;
}(_Level11.Level);

exports.AndLevel = AndLevel;

var MaxLevel = /*#__PURE__*/function (_Level8) {
  _inherits(MaxLevel, _Level8);

  var _super8 = _createSuper(MaxLevel);

  function MaxLevel() {
    var _this8;

    _classCallCheck(this, MaxLevel);

    var omega1 = 1 + Math.random();
    var omega2 = 1 + Math.random();
    var nodes = [new _InputNode.InputNode(function () {
      return 1.5 + 1 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - _this8.t0) / 1000);
    }), new _InputNode.InputNode(function () {
      return 1 + 1 * Math.sin(omega2 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - _this8.t0) / 1000);
    }), new _Node.Node(), new _OutputNode.OutputNode()];

    for (var i in [2]) {
      nodes[[2][i]].bias = 2 * (Math.random() - 0.5);
    }

    nodes[0].x = 200;
    nodes[0].y = 350;
    nodes[1].x = 200;
    nodes[1].y = 650;
    nodes[2].x = 500;
    nodes[2].y = 400;
    nodes[3].x = 800;
    nodes[3].y = 500;
    nodes[0].addChild(nodes[2], 1); //nodes[0].addChild(nodes[3], 1);

    nodes[1].addChild(nodes[2], -0.2);
    nodes[2].addChild(nodes[3], 1);
    nodes[1].addChild(nodes[3], 1);
    var nw = new _Network.Network(nodes, [nodes[0], nodes[1]], //input nodes
    [nodes[3]] //output nodes
    );
    var trainXs = [0, 0, 0, 0, 0, 0, 0].map(function (v) {
      return [Math.random(), Math.random()];
    });
    var trainYs = trainXs.map(function (p) {
      return [Math.max(p[0], p[1])];
    });
    _this8 = _super8.call(this, "Das Maximum der Input-Werte!", nw, ["Input 1", "Input 2"], trainXs, //temperatures are internally divided by 10.
    ["Maximum"], trainYs, "Der Output rechts soll dem Maximalwert des Inputs entsprechen. Tipp: max(a, b) = max(0, a-b)+b. Denk daran, dass das mittlere Neuron negative Werte ignoriert.");

    _this8.animatestep = function () {
      nodes[3].target = Math.max(nodes[0].getActivation(), nodes[1].getActivation());
    };

    return _this8;
  }

  return MaxLevel;
}(_Level11.Level);

exports.MaxLevel = MaxLevel;

var XorLevel = /*#__PURE__*/function (_Level9) {
  _inherits(XorLevel, _Level9);

  var _super9 = _createSuper(XorLevel);

  function XorLevel() {
    var _this9;

    _classCallCheck(this, XorLevel);

    var omega1 = 1 + Math.random();
    var omega2 = 1 + Math.random();
    var nodes = [new _InputNode.InputNode(function () {
      return 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - _this9.t0) / 1000);
    }), new _InputNode.InputNode(function () {
      return 0.5 + 0.5 * Math.sin(omega2 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - _this9.t0) / 1000);
    }), new _Node.Node(), new _Node.Node(), new _Node.Node(), new _OutputNode.OutputNode()];

    for (var i in [2, 3, 4]) {
      nodes[[2, 3, 4][i]].bias = 2 * (Math.random() - 0.5);
    }

    nodes[0].x = 200;
    nodes[0].y = 400;
    nodes[1].x = 200;
    nodes[1].y = 600;
    nodes[2].x = 500;
    nodes[2].y = 300;
    nodes[3].x = 500;
    nodes[3].y = 500;
    nodes[4].x = 500;
    nodes[4].y = 700;
    nodes[5].x = 800;
    nodes[5].y = 500;
    nodes[0].addChild(nodes[2], 1);
    nodes[0].addChild(nodes[3], 1);
    nodes[0].addChild(nodes[4], 1);
    nodes[1].addChild(nodes[2], 1);
    nodes[1].addChild(nodes[3], 1);
    nodes[1].addChild(nodes[4], 1);
    nodes[2].addChild(nodes[5], 1);
    nodes[3].addChild(nodes[5], 1);
    nodes[4].addChild(nodes[5], 1);
    var nw = new _Network.Network(nodes, [nodes[0], nodes[1]], //input nodes
    [nodes[5]] //output nodes
    );
    var trainXs = [[0, 0], [1, 0], [0, 1], [1, 1]];
    var trainYs = [[0], [1], [1], [0]];
    _this9 = _super9.call(this, "Berechne das XOR der Input-Werte!", nw, ["Bit 1", "Bit 2"], trainXs, //temperatures are internally divided by 10.
    ["XOR"], trainYs, "Nehmen wir an, dass das Netz nur 0 oder 1 als Input-Werte akzeptiert. Der Output-Wert des Netzes soll 1 sein, wenn nur ein einzelnes Input auf 1 gestellt ist. Andernfalls (wenn also beide Inputs 1 sind) muss der Output 0 sein.");

    _this9.animatestep = function () {
      //round input
      nodes[0].format = function (v) {
        return Math.round(v);
      };

      nodes[1].format = function (v) {
        return Math.round(v);
      };

      nodes[0].setUserParameter(Math.min(1, Math.max(0, Math.round(nodes[0].getActivation()))));
      nodes[1].setUserParameter(Math.min(1, Math.max(0, Math.round(nodes[1].getActivation()))));
      nodes[5].target = (nodes[0].getActivation() + nodes[1].getActivation() | 0) % 2;
    };

    return _this9;
  }

  return XorLevel;
}(_Level11.Level);

exports.XorLevel = XorLevel;

var AvgLevel = /*#__PURE__*/function (_Level10) {
  _inherits(AvgLevel, _Level10);

  var _super10 = _createSuper(AvgLevel);

  function AvgLevel() {
    var _this10;

    _classCallCheck(this, AvgLevel);

    var omega1 = 1 + Math.random();
    var omega2 = 1 + Math.random();
    var omega3 = 1 + Math.random();
    var nodes = [new _InputNode.InputNode(function () {
      return 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - _this10.t0) / 1000);
    }), new _InputNode.InputNode(function () {
      return 0.5 + 0.5 * Math.sin(omega2 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - _this10.t0) / 1000);
    }), new _InputNode.InputNode(function () {
      return 0.5 + 0.5 * Math.sin(omega2 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - _this10.t0) / 1000);
    }), //new Node(),
    new _OutputNode.OutputNode()]; //output from console

    nodes[0].x = 200;
    nodes[0].y = 300;
    nodes[0].allownegative = true;
    nodes[1].x = 200;
    nodes[1].y = 500;
    nodes[1].allownegative = true;
    nodes[2].x = 200;
    nodes[2].y = 700;
    nodes[2].allownegative = true;
    nodes[3].x = 800;
    nodes[3].y = 500; //nodes[4].x = 800;
    //nodes[4].y = 500;

    nodes[0].addChild(nodes[3], 1);
    nodes[1].addChild(nodes[3], 1);
    nodes[2].addChild(nodes[3], 1); //nodes[3].addChild(nodes[4], 1);

    var nw = new _Network.Network(nodes, [nodes[0], nodes[1], nodes[2]], //input nodes
    [nodes[3]] //output nodes
    );
    var trainXs = [0, 0, 0, 0, 0, 0, 0].map(function (v) {
      return [Math.random(), Math.random(), Math.random()];
    });
    var trainYs = trainXs.map(function (p) {
      return [(p[0] + p[1] + p[2]) / 3];
    });
    _this10 = _super10.call(this, "Berechne den Durchschnitt der Input-Werte!", nw, ["Nummer 1", "Nummer 2", "Nummer 3"], trainXs, //temperatures are internally divided by 10.
    ["Durchschnitt"], trainYs, "Es gibt drei Inputs. Kannst du die Gewichte so einstellen, dass der Output der Durchschnitt der Input-Werte ist? Insbesondere für die Werte in der Tabelle unten soll das Netz korrekte Outputs produzieren.");

    _this10.animatestep = function () {
      nodes[3].target = (nodes[0].getActivation() + nodes[1].getActivation() + nodes[2].getActivation()) / 3;
    };

    return _this10;
  }

  return AvgLevel;
}(_Level11.Level);

exports.AvgLevel = AvgLevel;

},{"./InputNode.js":3,"./Level.js":4,"./Network.js":6,"./Node.js":8,"./OutputNode.js":9,"./constants.js":10,"d3":"d3"}],12:[function(require,module,exports){
"use strict";

var _LevelController = require("./LevelController.js");

new _LevelController.LevelController();
window.addEventListener('DOMContentLoaded', function (event) {
  document.querySelector("#helpmebutton").onclick = function () {
    document.querySelector(".helper").classList.add("visible");
    document.querySelector(".mission").classList.remove("visible");
    document.querySelector("#helpmebutton").classList.add("selected");
    document.querySelector("#missionbutton").classList.remove("selected");
  };

  document.querySelector("#missionbutton").onclick = function () {
    document.querySelector(".helper").classList.remove("visible");
    document.querySelector(".mission").classList.add("visible");
    document.querySelector("#helpmebutton").classList.remove("selected");
    document.querySelector("#missionbutton").classList.add("selected");
  };
  /* FIXME: There is no #creditsbutton id, so why is this code here if it breaks anyway?
    document.querySelector("#creditsbutton").onclick = () => {
      document.querySelector(".credits").classList.toggle("visible");
      document.querySelector("#screenoverlay").classList.toggle("visible");
      document.querySelector("#creditsbutton").classList.toggle("selected");
    };
  */


  document.querySelector("#screenoverlay").onclick = function () {
    document.querySelector(".credits").classList.remove("visible");
    document.querySelector("#screenoverlay").classList.remove("visible");
    document.querySelector("#creditsbutton").classList.remove("selected");
  };
});

},{"./LevelController.js":5}]},{},[12])

