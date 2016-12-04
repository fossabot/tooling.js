"use strict";

const helpers = require(`./helpers`);

module.exports = function plugin({types: t}) {
  function addSh(path, state) {
    if (!state.sh) {
      state.sh = path.scope.generateUidIdentifier(`sh`);
      const helper = helpers.sh();
      path.scope.getProgramParent().path.unshiftContainer(`body`, helper);
    }
  }

  function addParallel(path, state) {
    if (!state.parallel) {
      state.parallel = path.scope.generateUidIdentifier(`parallel`);
      const helper = helpers.parallel();
      // Ideally, this would be done with via template, but I couldn't figure
      // out how to get the types to line up.
      const args = path.node.arguments.map((argument) => t.newExpression(
        t.identifier(`Promise`),
        [t.arrowFunctionExpression(
          [t.identifier(`resolve`)],
          t.callExpression(
            t.identifier(`resolve`),
            [argument]
          ),
          // make it async:
          true
        )]
      ));

      path.replaceWith(
        t.callExpression(
          t.identifier(`parallel`),
          args
        )
      );
      path.scope.getProgramParent().path.unshiftContainer(`body`, helper);
    }
  }

  function awaitWrap(path) {
    if (!t.isAwaitExpression(path.parentPath)) {
      path.replaceWith(t.awaitExpression(path.node));
    }
  }

  function replaceFunction(object, property, path) {
    path.replaceWith(t.callExpression(
      t.memberExpression(
        t.identifier(object), t.identifier(property)
      ),
      path.node.arguments
    ));
  }

  return {
    visitor: {
      CallExpression(path, state) {
        if (path.get(`callee`).isIdentifier({name: `echo`})) {
          replaceFunction(`console`, `log`, path);
        }
        else if (path.get(`callee`).isIdentifier({name: `sh`})) {
          addSh(path, state);
          awaitWrap(path);
        }
        else if (path.get(`callee`).isIdentifier({name: `parallel`})) {
          addParallel(path, state);
          awaitWrap(path);
        }
      }
    }
  };
};
