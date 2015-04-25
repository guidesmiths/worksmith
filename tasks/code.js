var debug = require('debug')('workflow:activities:sql:pg')
var pg = require('pg')
var _ = require('lodash')
var workflow = require('../')

codeActivity.annotations = {inject: ["execute","inject"]}
function codeActivity(definition) {
    return function(context) {
        return function(execute, inject, done) {
            var args = [];
            if (Array.isArray(inject)) {
                inject.forEach(function(name) {
                    args.push(context.get("@" + name))
                })
            }
            args.push(done)
            execute.apply(this, args)
        }
    }
}

module.exports = codeActivity