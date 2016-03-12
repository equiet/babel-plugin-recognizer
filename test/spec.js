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

    it('should instrument arrow functions', function() {
        let code = `
            var abc = () => { return true; };
        `
        let output = babel.transform(code, transformOptions)
        console.log(output.code)
    })

    it('should NOT instrument short-hand arrow functions', function() {
        let code = `
            var abc = () => true;
        `
        let output = babel.transform(code, transformOptions)
        console.log(output.code)
    })

    it('should instrument simple IfStatement', function() {
        let code = `
            if (true) {
                a = true;
            }
        `
        let output = babel.transform(code, transformOptions)
        console.log(output.code)
    })

    it('should instrument IfStatement', function() {
        let code = `
            if (true) {
                a = true;
            } else {
                b = false;
            }
        `
        let output = babel.transform(code, transformOptions)
        console.log(output.code)
    })

    it('should instrument TryStatement', function() {
        let code = `
            try {
                a = true;
            } catch (e) {
                b = false;
            }
        `
        let output = babel.transform(code, transformOptions)
        console.log(output.code)
    })

})