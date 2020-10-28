import * as ExpressionEval from 'expression-eval';

class _MathExpression {
  constructor(expr) {
    this.ast = ExpressionEval.parse(expr);
  }

  eval(variables) {
    // A proxy for querying variables from several scopes in order.
    const proxy = new Proxy(variables, {
      has: function (obj, prop) {
        return prop in _MathExpression.DEFAULT_SCOPE || prop in obj;
      },
      get: function (obj, prop) {
        if (prop === 'get') {
          // For querying variables that are shadowed by stuff in the DEFAULT_SCOPE
          return v => obj[v];
        } else if (prop in _MathExpression.DEFAULT_SCOPE) {
          return _MathExpression.DEFAULT_SCOPE[prop];
        } else {
          return obj[prop];
        }
      }
    });

    return ExpressionEval.eval(this.ast, proxy);
  }
}

_MathExpression.DEFAULT_SCOPE = Object.fromEntries(
  Object.getOwnPropertyNames(Math).map(n => [n, Math[n]])
);

export default function MathExpression(expr) {
  const mathExpr = new _MathExpression(expr);
  return mathExpr.eval.bind(mathExpr);
}

export { MathExpression };
