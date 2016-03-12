'use strict'

let babylon = require('babylon')
let traverse = require('babel-traverse').default

var getHeaderAst = function() {
  var ast = babylon.parse(`
    window._recognizer = window._recognizer || {
      reportingInterval: null,
      hitCounts: {},
      ws: (function() {
        var ws = new WebSocket('ws://localhost:4747/');
        ws.onopen = function() {
          window._recognizer.reportingInterval = setInterval(function() {
            var arr = Object.keys(window._recognizer.hitCounts).map(function(key) { return window._recognizer.hitCounts[key]; });
            ws.send(JSON.stringify(arr));
          }, 200);
          console.log('[recognizer] Connected to a code editor');
        };
        ws.onerror = function(err) {
          console.log('[recognizer] Error connecting to a code editor on port 4747', err);
        };
        ws.onclose = function(err) {
          clearInterval(window._recognizer.reportingInterval);
          console.log('[recognizer] Disconnected from a code editor', err);
        };
      })(),
      increaseHitCount: function(filename, location) {
        var key = [filename, location.start.line, location.start.column, location.end.line, location.end.column].join('-');
        window._recognizer.hitCounts[key] = window._recognizer.hitCounts[key] || { filename: filename, location: location, hitCount: 0 };
        window._recognizer.hitCounts[key].hitCount++;
      }
    };
  `)
  annotate(ast)
  traverse.removeProperties(ast) // No idea. https://github.com/istarkov/babel-plugin-webpack-loaders/commit/56f02efaaf837fb6f23edf51e902384d257e3ae2
  return ast.program.body
}

var getProbeAst = function(filename, location) {
  var ast = babylon.parse(`
    window._recognizer.increaseHitCount(
      '${filename}',
      {
        start: {line: ${location.start.line}, column: ${location.start.column}},
        end: {line: ${location.end.line}, column: ${location.end.column}}
      }
    )
  `)
  annotate(ast)
  traverse.removeProperties(ast)
  return ast.program.body
}

function annotate(ast) {
  return traverse(ast, {
    enter(path) {
      path.node._generatedByRecognizer = true
    }
  })
}

function shouldSkipNode(path) {
  return path.node._generatedByRecognizer || !path.node.loc || path.hub.file.opts.filename.indexOf('node_modules') !== -1
}

module.exports = function(babel) {
  var types = babel.types

  return {
    visitor: {
      // BlockStatement(path) {
      //   if (shouldSkipNode(path)) {
      //     return
      //   }
      //   path.unshiftContainer('body', getProbeAst(path.hub.file.opts.filename, path.node.loc))
      // }
      Program(path) {
        path.unshiftContainer('body', getHeaderAst())
      },
      FunctionDeclaration(path) {
        if (shouldSkipNode(path)) {
          return
        }
        path.get('body').unshiftContainer('body', getProbeAst(path.hub.file.opts.filename, path.node.loc))
      },
      FunctionExpression(path) {
        if (shouldSkipNode(path)) {
          return
        }
        path.get('body').unshiftContainer('body', getProbeAst(path.hub.file.opts.filename, path.node.loc))
      },
      ClassMethod(path) {
        if (shouldSkipNode(path)) {
          return
        }
        path.get('body').unshiftContainer('body', getProbeAst(path.hub.file.opts.filename, path.node.loc))
      },
      ArrowFunctionExpression(path) {
        if (shouldSkipNode(path)) {
          return
        }
        if (path.get('body').type !== 'BlockStatement') {
          return
        }
        path.get('body').unshiftContainer('body', getProbeAst(path.hub.file.opts.filename, path.node.loc))
      },
      IfStatement(path) {
        if (shouldSkipNode(path)) {
          return
        }
        if (path.consequent) {
          path.get('consequent').unshiftContainer('body', getProbeAst(path.hub.file.opts.filename, path.node.loc))
        }
        if (path.alternate) {
          path.get('alternate').unshiftContainer('body', getProbeAst(path.hub.file.opts.filename, path.node.loc))
        }
      },
      TryStatement(path) {
        if (shouldSkipNode(path)) {
          return
        }
        if (path.get('block')) {
          path.get('block').unshiftContainer('body', getProbeAst(path.hub.file.opts.filename, path.node.loc))
        }
        if (path.get('handler')) {
          path.get('handler').get('body').unshiftContainer('body', getProbeAst(path.hub.file.opts.filename, path.node.loc))
        }
      }
    }
  }
}
