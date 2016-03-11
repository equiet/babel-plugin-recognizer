'use strict'

let babel = require('babel-core')
let babylon = require('babylon')
let babelPluginRecognizer = require('../lib/index.js')

describe('babel-plugin-recognizer', function() {

    let transformOptions = {
        plugins: [babelPluginRecognizer]
    }

    it('should instrument FunctionExpression', function() {
        let code = `
            var abc = function() {
                return true;
            }
        `
        let output = babel.transform(code, transformOptions)
        console.log(output.code)
    })

    it('should instrument FunctionDeclaration', function() {
        let code = `
            function abc() {
                return true;
            }
        `
        let output = babel.transform(code, transformOptions)
        console.log(output.code)
    })

    it('should instrument class methods', function() {
        let code = `
            class Abc {
                someMethod() {
                    return true;
                }
            }
        `
        let output = babel.transform(code, transformOptions)
        console.log(output.code)
    })

})