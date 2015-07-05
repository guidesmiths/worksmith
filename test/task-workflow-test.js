var assert = require('assert')
var worksmith  = require('../')

describe("workflowActivity", function () {
    
    
    it("should execute the workflow specified by path", function (done) {
        var context = {};
        var flag;
        var innerContext = {};
        worksmith({
            "task": "workflow",
            "source":"./test/workflow1.js",
            "context": { _np_: innerContext }
        })({}, function (err, result) {
            assert.equal(innerContext.result, "hello", "inner context field must match")
            done();
        })
    })
    
   it("should execute the workflow specified by instance", function (done) {
    var context = {};
    var flag = {};
    var innerContext = {};
    worksmith({
        "task": "workflow",
        "source": {
            task:function(define) {
                return function build(context) {
                    return function execute(_d){ 
                        flag.inner = true;
                        _d();
                    }
                }
            },
        },
        "context": innerContext
    })({}, function (err, result) {
        assert.equal(flag.inner, true, "inner workflow must run")
        done();
    })}) 
    
   it("should provide outer context if context is not specified", function (done) {
    var outerContext = { field:"value"};
    var flag = {};
    worksmith({
        "task": "workflow",
        "source": {
            task:function(define) {
                return function build(context) {
                    return function execute(_d){ 
                        flag.result = context.field;
                        _d();
                    }
                }
            },
        }
    })(outerContext, function (err, result) {
        assert.equal(flag.result, outerContext.field, "inner workflow must run")
        done();
    })}) 
    
    it("should support channelling workflow result into resultTo", function (done) {
    var outerContext = { field:"value"};
    var wfresult = {some:"result"};
    var flag = {};
    worksmith({
        "resultTo":"wfresult",
        "task": "workflow",
        "source": {
            task:function(define) {
                return function build(context) {
                    return function execute(_d){ 
                        _d(null, wfresult);
                    }
                }
            },
        }
    })(outerContext, function (err, result) {
        assert.equal(outerContext.wfresult, wfresult, "inner workflow result must match")
        done();
    })})
    
});
