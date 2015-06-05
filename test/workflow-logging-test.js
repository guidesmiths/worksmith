var assert = require('assert')
var workflow = require('../')

describe("WorkSmith logging", function() {

    it("should provide a log method for activities", function(done) {
        var flags = {};

        var def = {
            task: function(def) {
                flags.log = this.log;
                return function build(context) {
                    return function execute(done) {
                        done();
                    }
                }
            }
        };

        var wf = workflow(def)
        wf({},function(err, res) {
            assert.ok(flags.log, "log function must be there")
            done();
        })
    })
    
    it("should support reconfiguring logger", function(done) {
        var flags = {};
        var logs = [];
        workflow.configure(
            {
                logger: {
                    log: function() {
                        logs.push(Array.prototype.join.call(arguments,"|"))
                    }
                }
            }
        )
        var def = {
            task: "log",
            message:"hello"
        };

        var wf = workflow(def)
        wf({},function(err, res) {
            assert.equal(logs.join(),"hello", "log function must be configurable")
            done();
        })
    })
    
    //this test is left pending until logErrors config setting is implemented
    xit("should support reconfiguring logger for worksmith errors", function(done) {
        var flags = {};
        var logs = [];
        workflow.configure(
            {
                logger: {
                    error: function(message,error) {
                        flags.message = message;
                        flags.wf = wf;
                        flags.error = error;
                    }
                }
            }
        )
        var def = {
            task: function(def) {
                return function build(context) {
                    return function execute(done) {
                        done({"message":"error"});
                    }
                }
            }
        };

        var wf = workflow(def)
        wf({},function(err, res) {
            assert.ok(err, "Error must be set")
            assert.deepEqual(flags.error, {"message":"error"},"error must match")
            assert.ok(flags.message,"message must be set")
            assert.ok(flags.wf, "workflow must be set")
            done();
        })
    })    
});