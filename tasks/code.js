var debug = require('debug')('workflow:activities:sql:pg')
var pg = require('pg')
var _ = require('lodash')
var workflow = require('../')


function codeActivity(definition) {

    return function(context) {
        execute.annotations = {inject: ["execute","inject"]}
        function execute(execute, inject, done) {
            var args = [];
            if (execute.length > 1 && Array.isArray(inject)) {
                inject.forEach(function(name) {
                    args.push(context.get(name))
                })
            }
            args.push(done)
            execute.apply(this, args)
        }
        return execute;
    }
}



module.exports = codeActivity