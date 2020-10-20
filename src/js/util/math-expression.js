import * as ExpressionEval from 'expression-eval';

class _MathExpression {
  constructor(model, expr) {
    this.ast = ExpressionEval.parse(expr);
  }

  eval(variables) {
    const get = id => variables[id];
    const scope = Object.assign(
      {},
      variables,
      { get },
      _MathExpression.DEFAULT_SCOPE
    );
    return ExpressionEval.eval(this.ast, scope);
  }
}

_MathExpression.DEFAULT_SCOPE = Object.fromEntries(
  Object.getOwnPropertyNames(Math).map(n => [n, Math[n]])
);

export default function MathExpression(network, expr) {
  const ate = new _MathExpression(network, expr);
  return ate.eval.bind(ate);
}
